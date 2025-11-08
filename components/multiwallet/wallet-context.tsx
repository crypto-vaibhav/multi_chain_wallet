"use client"

import type React from "react"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { encryptJSON, decryptJSON } from "@/lib/multi-crypto"
import { getSolBalance } from "@/lib/solana-multi"
import { getEvmNativeBalance, getErc20Balance, sendEvmNative, sendErc20 } from "@/lib/evm"
import { ethers } from "ethers"
import { Keypair } from "@solana/web3.js"

type Chain = "solana" | "ethereum" | "bsc"
type NetworkMap = {
  solana: "devnet" | "mainnet-beta"
  ethereum: "mainnet" | "testnet"
  bsc: "mainnet" | "testnet"
}

type Vault = {
  // store private keys (hex for EVM, base64 for Solana)
  solana?: { secretB64: string }
  ethereum?: { privateKeyHex: string }
  bsc?: { privateKeyHex: string }
  // user-tracked tokens (for ERC20 discovery)
  tokens?: Array<{
    chain: Exclude<Chain, "solana"> // ERC20 on EVM
    address: `0x${string}`
    name?: string
    symbol?: string
    decimals?: number
  }>
}

type Account = {
  chain: Chain
  address: string
}

type ActivityItem =
  | { chain: "solana"; signature: string; time: string; err: boolean | null }
  | { chain: "ethereum" | "bsc"; hash: string; time: string }

type Prices = Record<string, number>

const MultiWalletCtx = createContext<{
  isLocked: boolean
  selectedTab: "home" | "activity" | "settings"
  setSelectedTab: (t: "home" | "activity" | "settings") => void
  chain: Chain
  setChain: (c: Chain) => void
  network: NetworkMap
  setNetwork: (n: Partial<NetworkMap>) => void
  accounts: Partial<Record<Chain, Account>>
  balances: Partial<Record<Chain, number>>
  tokens: Array<{ chain: Chain; name: string; symbol: string; balance: number; usd?: number; address?: string }>
  activity: ActivityItem[]
  prices: Prices

  // auth
  createVault: (password: string) => Promise<void>
  importPrivateKey: (chain: Chain, pk: string, password: string) => Promise<void>
  unlock: (password: string) => Promise<void>
  lock: () => void
  exportPrivateKey: (chain: Chain, password: string) => Promise<string | null>

  // receive + send
  getReceiveAddress: (chain?: Chain) => string | null
  send: (params: {
    chain: Chain
    asset: "native" | { erc20: `0x${string}` }
    to: string
    amount: string
  }) => Promise<string>

  // token management
  addErc20Token: (chain: Exclude<Chain, "solana">, address: `0x${string}`) => Promise<void>
} | null>(null)

const VAULT_KEY = "mw_vault"
const LOG_KEY = "mw_activity"

export function MultiWalletProvider({ children }: { children: React.ReactNode }) {
  const [isLocked, setIsLocked] = useState(true)
  const [vault, setVault] = useState<Vault | null>(null)
  const [chain, setChain] = useState<Chain>("solana")
  const [network, setNetworkState] = useState<NetworkMap>({
    solana: "devnet",
    ethereum: "testnet",
    bsc: "testnet",
  })
  const [selectedTab, setSelectedTab] = useState<"home" | "activity" | "settings">("home")
  const [accounts, setAccounts] = useState<Partial<Record<Chain, Account>>>({})
  const [balances, setBalances] = useState<Partial<Record<Chain, number>>>({})
  const [tokens, setTokens] = useState<
    Array<{ chain: Chain; name: string; symbol: string; balance: number; usd?: number; address?: string }>
  >([])
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [prices, setPrices] = useState<Prices>({})

  // init from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(VAULT_KEY)
    if (stored) setIsLocked(true)
    else setIsLocked(true)
  }, [])

  const persistVaultEncrypted = async (v: Vault, password: string) => {
    const payload = await encryptJSON(v, password)
    localStorage.setItem(VAULT_KEY, JSON.stringify(payload))
  }

  const deriveAccounts = useCallback((v: Vault | null) => {
    const acc: Partial<Record<Chain, Account>> = {}
    if (v?.solana?.secretB64) {
      const kp = Keypair.fromSecretKey(Uint8Array.from(Buffer.from(v.solana.secretB64, "base64")))
      acc.solana = { chain: "solana", address: kp.publicKey.toBase58() }
    }
    if (v?.ethereum?.privateKeyHex) {
      const w = new ethers.Wallet(v.ethereum.privateKeyHex)
      acc.ethereum = { chain: "ethereum", address: w.address }
    }
    if (v?.bsc?.privateKeyHex) {
      const w = new ethers.Wallet(v.bsc.privateKeyHex)
      acc.bsc = { chain: "bsc", address: w.address }
    }
    setAccounts(acc)
  }, [])

  const refreshBalancesAndTokens = useCallback(
    async (v: Vault, acc: Partial<Record<Chain, Account>>) => {
      const nextBalances: Partial<Record<Chain, number>> = { ...balances }
      const nextTokens: typeof tokens = []

      // Solana native
      if (acc.solana) {
        nextBalances.solana = await getSolBalance(acc.solana.address, network.solana)
        // SPL tokens would require indexer or token discovery; skipping auto-discovery to keep client-only.
      }

      // EVM chains native
      if (acc.ethereum) {
        nextBalances.ethereum = await getEvmNativeBalance(acc.ethereum.address as any, "ethereum", network.ethereum)
      }
      if (acc.bsc) {
        nextBalances.bsc = await getEvmNativeBalance(acc.bsc.address as any, "bsc", network.bsc)
      }

      // EVM user-tracked ERC20 tokens
      for (const t of v.tokens || []) {
        const owner = t.chain === "ethereum" ? acc.ethereum?.address : t.chain === "bsc" ? acc.bsc?.address : undefined
        if (!owner) continue
        const res = await getErc20Balance(t.address as any, owner as any, t.chain, network[t.chain])
        nextTokens.push({
          chain: t.chain,
          name: res.name,
          symbol: res.symbol,
          balance: res.balance,
          address: t.address,
        })
      }

      setBalances(nextBalances)
      setTokens(nextTokens)
    },
    [network],
  )

  const fetchPrices = useCallback(async (symbols: string[]) => {
    try {
      const q = symbols.map((s) => `ids=${encodeURIComponent(s)}`).join("&") // ids=<coingeckoId> but we’ll use fixed set below
      // We'll map: solana -> solana, ethereum -> ethereum, bnb -> binancecoin
      const res = await fetch("/api/prices?base=default")
      if (!res.ok) return
      const data = await res.json()
      setPrices(data || {})
    } catch (e) {
      // ignore pricing errors
    }
  }, [])

  const refresh = useCallback(
    async (v: Vault) => {
      deriveAccounts(v)
    },
    [deriveAccounts],
  )

  // public API
  const createVault = useCallback(
    async (password: string) => {
      // Generate Solana keypair with validation
      const sol = Keypair.generate()
      if (sol.secretKey.length !== 64) {
        throw new Error("Invalid Solana keypair: secret key must be 64 bytes")
      }
      const verifiedSol = Keypair.fromSecretKey(sol.secretKey)
      if (verifiedSol.publicKey.toBase58() !== sol.publicKey.toBase58()) {
        throw new Error("Solana keypair verification failed")
      }
      
      // Generate Ethereum wallet with validation
      const evm1 = ethers.Wallet.createRandom()
      const verifiedEvm1 = new ethers.Wallet(evm1.privateKey)
      if (verifiedEvm1.address !== evm1.address || !/^0x[a-fA-F0-9]{64}$/.test(evm1.privateKey)) {
        throw new Error("Ethereum wallet verification failed")
      }
      
      // Generate BSC wallet with validation
      const evm2 = ethers.Wallet.createRandom()
      const verifiedEvm2 = new ethers.Wallet(evm2.privateKey)
      if (verifiedEvm2.address !== evm2.address || !/^0x[a-fA-F0-9]{64}$/.test(evm2.privateKey)) {
        throw new Error("BSC wallet verification failed")
      }
      
      const v: Vault = {
        solana: { secretB64: Buffer.from(sol.secretKey).toString("base64") },
        ethereum: { privateKeyHex: evm1.privateKey },
        bsc: { privateKeyHex: evm2.privateKey },
        tokens: [],
      }
      await persistVaultEncrypted(v, password)
      setVault(v)
      setIsLocked(false)
      deriveAccounts(v)
      await refreshBalancesAndTokens(v, {
        solana: { chain: "solana", address: sol.publicKey.toBase58() },
        ethereum: { chain: "ethereum", address: evm1.address },
        bsc: { chain: "bsc", address: evm2.address },
      })
      fetchPrices([])
    },
    [deriveAccounts, refreshBalancesAndTokens, fetchPrices],
  )

  const importPrivateKey = useCallback(
    async (c: Chain, pk: string, password: string) => {
      const current: Vault = vault || {}
      if (c === "solana") {
        // Validate Solana secret key (base64 encoded 64-byte secret)
        const secretKeyBytes = Buffer.from(pk, "base64")
        if (secretKeyBytes.length !== 64) {
          throw new Error("Invalid Solana secret key: must be 64 bytes when decoded from base64")
        }
        const keypair = Keypair.fromSecretKey(Uint8Array.from(secretKeyBytes))
        const verified = Keypair.fromSecretKey(Uint8Array.from(secretKeyBytes))
        if (verified.publicKey.toBase58() !== keypair.publicKey.toBase58()) {
          throw new Error("Solana keypair verification failed")
        }
        current.solana = { secretB64: pk }
      } else {
        // Validate EVM private key
        const privateKeyHex = pk.startsWith("0x") ? pk : (("0x" + pk) as `0x${string}`)
        if (!/^0x[a-fA-F0-9]{64}$/.test(privateKeyHex)) {
          throw new Error("Invalid EVM private key: must be 64 hex characters (32 bytes)")
        }
        const wallet = new ethers.Wallet(privateKeyHex)
        const verified = new ethers.Wallet(privateKeyHex)
        if (verified.address !== wallet.address) {
          throw new Error("EVM address derivation verification failed")
        }
        current[c] = { privateKeyHex }
      }
      await persistVaultEncrypted(current, password)
      setVault(current)
      setIsLocked(false)
      deriveAccounts(current)
      await refreshBalancesAndTokens(current, accounts)
    },
    [vault, deriveAccounts, refreshBalancesAndTokens, accounts],
  )

  const unlock = useCallback(
    async (password: string) => {
      const stored = localStorage.getItem(VAULT_KEY)
      if (!stored) throw new Error("No vault found")
      const bundle = JSON.parse(stored)
      const v = await decryptJSON<Vault>(bundle, password)
      setVault(v)
      setIsLocked(false)
      deriveAccounts(v)
      await refreshBalancesAndTokens(v, accounts)
      fetchPrices([])
    },
    [deriveAccounts, refreshBalancesAndTokens, fetchPrices, accounts],
  )

  const lock = useCallback(() => {
    setIsLocked(true)
    // keep encrypted vault; drop from memory
    setVault(null)
  }, [])

  const exportPrivateKey = useCallback(async (c: Chain, password: string) => {
    const stored = localStorage.getItem(VAULT_KEY)
    if (!stored) return null
    const v = await decryptJSON<Vault>(JSON.parse(stored), password)
    if (c === "solana") return v.solana?.secretB64 || null
    if (c === "ethereum") return v.ethereum?.privateKeyHex || null
    if (c === "bsc") return v.bsc?.privateKeyHex || null
    return null
  }, [])

  const setNetwork = (partial: Partial<NetworkMap>) => {
    setNetworkState((prev) => ({ ...prev, ...partial }))
  }

  const getReceiveAddress = useCallback(
    (c?: Chain) => {
      const cc = c || chain
      return accounts[cc]?.address || null
    },
    [accounts, chain],
  )

  const logActivity = (item: ActivityItem) => {
    setActivity((prev) => [item, ...prev].slice(0, 50))
    try {
      const raw = localStorage.getItem(LOG_KEY)
      const arr: ActivityItem[] = raw ? JSON.parse(raw) : []
      arr.unshift(item)
      localStorage.setItem(LOG_KEY, JSON.stringify(arr.slice(0, 100)))
    } catch {}
  }

  const send = useCallback(
    async (params: { chain: Chain; asset: "native" | { erc20: `0x${string}` }; to: string; amount: string }) => {
      if (!vault) throw new Error("Locked")
      let hash = ""
      if (params.chain === "solana") {
        const { sendSol } = await import("@/lib/solana-multi")
        const sig = await sendSol(vault.solana!.secretB64, params.to, Number(params.amount), network.solana)
        logActivity({ chain: "solana", signature: sig, time: new Date().toLocaleString(), err: null })
        await refreshBalancesAndTokens(vault, accounts)
        return sig
      } else {
        const chain = params.chain as Exclude<Chain, "solana">
        const pk = vault[chain]!.privateKeyHex as string
        if (params.asset === "native") {
          const receipt = await sendEvmNative(pk, params.to as any, params.amount, chain, network[chain])
          hash = receipt.hash
        } else {
          const receipt = await sendErc20(
            pk,
            params.asset.erc20 as any,
            params.to as any,
            params.amount,
            chain,
            network[chain],
          )
          hash = receipt.hash
        }
        logActivity({ chain, hash, time: new Date().toLocaleString() })
        await refreshBalancesAndTokens(vault, accounts)
        return hash
      }
    },
    [vault, network, accounts, refreshBalancesAndTokens],
  )

  const addErc20Token = useCallback(
    async (c: Exclude<Chain, "solana">, address: `0x${string}`) => {
      if (!vault) throw new Error("Locked")
      const v: Vault = { ...vault, tokens: [...(vault.tokens || []), { chain: c, address }] }
      // keep encrypted persisted vault as-is until user changes password; tokens list can be kept plaintext in memory only
      setVault(v)
      // refresh token balances
      await refreshBalancesAndTokens(v, accounts)
    },
    [vault, refreshBalancesAndTokens, accounts],
  )

  // refresh price data on balances/tokens change
  useEffect(() => {
    const syms = ["solana", "ethereum", "binancecoin"]
    fetchPrices(syms)
  }, [balances, tokens, fetchPrices])

  const value = useMemo(
    () => ({
      isLocked,
      selectedTab,
      setSelectedTab,
      chain,
      setChain,
      network,
      setNetwork,
      accounts,
      balances,
      tokens,
      activity,
      prices,
      createVault,
      importPrivateKey,
      unlock,
      lock,
      exportPrivateKey,
      getReceiveAddress,
      send,
      addErc20Token,
    }),
    [
      isLocked,
      selectedTab,
      chain,
      network,
      accounts,
      balances,
      tokens,
      activity,
      prices,
      createVault,
      importPrivateKey,
      unlock,
      lock,
      exportPrivateKey,
      getReceiveAddress,
      send,
      addErc20Token,
    ],
  )

  return <MultiWalletCtx.Provider value={value}>{children}</MultiWalletCtx.Provider>
}

export function useMultiWallet() {
  const ctx = useContext(MultiWalletCtx)
  if (!ctx) throw new Error("useMultiWallet must be used within MultiWalletProvider")
  return ctx
}
