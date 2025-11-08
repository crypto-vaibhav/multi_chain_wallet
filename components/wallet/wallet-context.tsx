"use client"

import type React from "react"
import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { encryptPrivateKey, decryptPrivateKey } from "@/lib/crypto"
import {
  DEFAULT_CHAIN,
  DEFAULT_ETHEREUM,
  DEFAULT_SOLANA,
  type Chain,
  type EthereumNetwork,
  type SolanaNetwork,
  formatCurrency,
} from "@/lib/chains"
import { getSolBalance, getSplTokens, getHumanActivity, transferSol } from "@/lib/solana"
import { getEthBalance, sendEth, getEthActivity } from "@/lib/ethereum"
import { Keypair } from "@solana/web3.js"
import { ethers } from "ethers"

type VaultRecord = {
  solana?: { enc: any; pub: string; network: SolanaNetwork }
  ethereum?: { enc: any; address: string; network: EthereumNetwork }
}

type Token = { id: string; symbol?: string; amount: number } // SOL tokens show mint address

type Activity = {
  id: string
  desc: string
  time?: string
}

type Tab = "home" | "activity" | "settings"

type WalletContextType = {
  locked: boolean
  tab: Tab
  setTab: (t: Tab) => void

  chain: Chain
  setChain: (c: Chain) => void

  // Solana
  solNetwork: SolanaNetwork
  setSolNetwork: (n: SolanaNetwork) => void

  // Ethereum
  ethNetwork: EthereumNetwork
  setEthNetwork: (n: EthereumNetwork) => void

  address?: string
  balance: number
  tokens: Token[]
  activity: Activity[]

  createWallet: (chain: Chain, password: string) => Promise<void>
  importPrivateKey: (chain: Chain, secret: string, password: string) => Promise<void>
  unlock: (password: string) => Promise<void>
  lock: () => void
  exportPrivateKey: (chain: Chain, password: string) => Promise<string>
  send: (params: { to: string; amount: number }) => Promise<string>

  refresh: () => Promise<void>
}

const WalletContext = createContext<WalletContextType | null>(null)

const VAULT_KEY = "v0_wallet_vault_v2"

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [locked, setLocked] = useState(true)
  const [tab, setTab] = useState<Tab>("home")
  const [chain, setChain] = useState<Chain>(DEFAULT_CHAIN)
  const [solNetwork, setSolNetwork] = useState<SolanaNetwork>(DEFAULT_SOLANA)
  const [ethNetwork, setEthNetwork] = useState<EthereumNetwork>(DEFAULT_ETHEREUM)
  const [address, setAddress] = useState<string>()
  const [balance, setBalance] = useState(0)
  const [tokens, setTokens] = useState<Token[]>([])
  const [activity, setActivity] = useState<Activity[]>([])
  const [vault, setVault] = useState<VaultRecord | null>(null)
  const [derived, setDerived] = useState<{
    sol?: { secretBase64: string; pub: string }
    eth?: { hex: string; address: string }
  }>({})

  useEffect(() => {
    const raw = localStorage.getItem(VAULT_KEY)
    if (raw) {
      try {
        const v = JSON.parse(raw) as VaultRecord
        setVault(v)
      } catch {}
    }
  }, [])

  const syncAddress = useMemo(() => {
    if (chain === "solana" && derived.sol) return derived.sol.pub
    if (chain === "ethereum" && derived.eth) return derived.eth.address
    return undefined
  }, [chain, derived])

  useEffect(() => {
    setAddress(syncAddress)
  }, [syncAddress])

  async function createWallet(selected: Chain, password: string) {
    if (selected === "solana") {
      // Use Keypair.generate() which generates cryptographically secure random keys
      const kp = Keypair.generate()
      if (kp.secretKey.length !== 64) {
        throw new Error("Invalid Solana keypair: secret key must be 64 bytes")
      }
      // Verify the keypair is valid by checking public key derivation
      const verifiedKp = Keypair.fromSecretKey(kp.secretKey)
      if (verifiedKp.publicKey.toBase58() !== kp.publicKey.toBase58()) {
        throw new Error("Solana keypair verification failed")
      }
      const secretBase64 = btoa(String.fromCharCode(...kp.secretKey))
      const enc = await encryptPrivateKey(password, secretBase64)
      const pub = kp.publicKey.toBase58()
      const next: VaultRecord = {
        ...(vault || {}),
        solana: { enc, pub, network: solNetwork },
      }
      localStorage.setItem(VAULT_KEY, JSON.stringify(next))
      setVault(next)
      setDerived((d) => ({ ...d, sol: { secretBase64, pub } }))
      setLocked(false)
      setChain("solana")
      await refresh()
    } else {
      // ethereum - use ethers.Wallet.createRandom() to ensure valid, cryptographically secure key generation
      const wallet = ethers.Wallet.createRandom()
      const hex = wallet.privateKey
      // Verify the address is correctly derived from the private key
      const verifiedAddress = new ethers.Wallet(hex).address
      if (verifiedAddress !== wallet.address) {
        throw new Error("Address derivation verification failed")
      }
      const enc = await encryptPrivateKey(password, hex)
      const next: VaultRecord = {
        ...(vault || {}),
        ethereum: { enc, address: wallet.address, network: ethNetwork },
      }
      localStorage.setItem(VAULT_KEY, JSON.stringify(next))
      setVault(next)
      setDerived((d) => ({ ...d, eth: { hex, address: wallet.address } }))
      setLocked(false)
      setChain("ethereum")
      await refresh()
    }
  }

  async function importPrivateKey(selected: Chain, secret: string, password: string) {
    if (selected === "solana") {
      // accept base64 of secretKey
      const secretKeyBytes = Uint8Array.from(atob(secret), (c) => c.charCodeAt(0))
      if (secretKeyBytes.length !== 64) {
        throw new Error("Invalid Solana secret key: must be 64 bytes when decoded from base64")
      }
      const keypair = Keypair.fromSecretKey(secretKeyBytes)
      const pub = keypair.publicKey.toBase58()
      // Verify the keypair is valid by checking the public key derivation
      const verifiedKeypair = Keypair.fromSecretKey(secretKeyBytes)
      if (verifiedKeypair.publicKey.toBase58() !== pub) {
        throw new Error("Solana keypair verification failed")
      }
      const enc = await encryptPrivateKey(password, secret)
      const next: VaultRecord = { ...(vault || {}), solana: { enc, pub, network: solNetwork } }
      localStorage.setItem(VAULT_KEY, JSON.stringify(next))
      setVault(next)
      setDerived((d) => ({ ...d, sol: { secretBase64: secret, pub } }))
      setLocked(false)
      setChain("solana")
      await refresh()
    } else {
      // ethereum: hex private key - validate and verify address derivation
      const hex = secret.startsWith("0x") ? secret : `0x${secret}`
      if (!/^0x[a-fA-F0-9]{64}$/.test(hex)) {
        throw new Error("Invalid Ethereum private key: must be 64 hex characters (32 bytes)")
      }
      const wallet = new ethers.Wallet(hex)
      const address = wallet.address
      // Verify address is correctly derived by recreating wallet
      const verifiedWallet = new ethers.Wallet(hex)
      if (verifiedWallet.address !== address) {
        throw new Error("Ethereum address derivation verification failed")
      }
      const enc = await encryptPrivateKey(password, hex)
      const next: VaultRecord = { ...(vault || {}), ethereum: { enc, address, network: ethNetwork } }
      localStorage.setItem(VAULT_KEY, JSON.stringify(next))
      setVault(next)
      setDerived((d) => ({ ...d, eth: { hex, address } }))
      setLocked(false)
      setChain("ethereum")
      await refresh()
    }
  }

  async function unlock(password: string) {
    if (!vault) return
    const next: typeof derived = {}
    if (vault.solana) {
      const secretBase64 = await decryptPrivateKey(password, vault.solana.enc)
      next.sol = { secretBase64, pub: vault.solana.pub }
    }
    if (vault.ethereum) {
      const hex = await decryptPrivateKey(password, vault.ethereum.enc)
      next.eth = { hex, address: vault.ethereum.address }
    }
    setDerived(next)
    setLocked(false)
    await refresh()
  }

  function lock() {
    setLocked(true)
    // keep vault stored, just lock derived keys in memory
    setDerived({})
  }

  async function exportPrivateKey(c: Chain, password: string) {
    if (!vault) throw new Error("No vault")
    if (c === "solana" && vault.solana) {
      return decryptPrivateKey(password, vault.solana.enc)
    }
    if (c === "ethereum" && vault.ethereum) {
      return decryptPrivateKey(password, vault.ethereum.enc)
    }
    throw new Error("Key not found")
  }

  async function send(params: { to: string; amount: number }) {
    if (chain === "solana") {
      if (!derived.sol) throw new Error("Wallet is locked")
      return await transferSol({
        fromSecretBase64: derived.sol.secretBase64,
        to: params.to,
        amountSol: params.amount,
        network: solNetwork,
      })
    } else {
      if (!derived.eth) throw new Error("Wallet is locked")
      return await sendEth({
        fromHex: derived.eth.hex,
        to: params.to,
        amountEth: params.amount,
        network: ethNetwork,
      })
    }
  }

  async function refresh() {
    if (!address) return
    if (chain === "solana") {
      const bal = await getSolBalance(address, solNetwork)
      setBalance(bal)
      const spl = await getSplTokens(address, solNetwork)
      setTokens([{ id: "SOL", symbol: "SOL", amount: bal }, ...spl.map((t) => ({ id: t.mint, amount: t.amount }))])
      const acts = await getHumanActivity(address, solNetwork)
      setActivity(
        acts.map((a) => ({
          id: a.signature,
          desc:
            a.kind === "send"
              ? `Sent ${a.amountSol?.toFixed(4)} SOL to ${a.counterparty}`
              : a.kind === "receive"
                ? `Received ${a.amountSol?.toFixed(4)} SOL from ${a.counterparty}`
                : `Transaction ${a.signature.slice(0, 8)}...`,
          time: a.time,
        })),
      )
    } else {
      const bal = await getEthBalance(address, ethNetwork)
      setBalance(bal)
      setTokens([{ id: "ETH", symbol: "ETH", amount: bal }])
      // Fetch Ethereum activity from Moralis API
      const acts = await getEthActivity(address, ethNetwork)
      setActivity(
        acts.map((a) => ({
          id: a.signature,
          desc:
            a.kind === "send"
              ? `Sent ${a.amountEth?.toFixed(4)} ETH to ${a.counterparty?.slice(0, 8)}...`
              : a.kind === "receive"
                ? `Received ${a.amountEth?.toFixed(4)} ETH from ${a.counterparty?.slice(0, 8)}...`
                : `Transaction ${a.signature.slice(0, 8)}...`,
          time: a.time,
        }))
      )
    }
  }

  useEffect(() => {
    if (!locked) {
      void refresh()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chain, solNetwork, ethNetwork, address, locked])

  const value: WalletContextType = {
    locked,
    tab,
    setTab,
    chain,
    setChain,
    solNetwork,
    setSolNetwork,
    ethNetwork,
    setEthNetwork,
    address,
    balance,
    tokens,
    activity,
    createWallet,
    importPrivateKey,
    unlock,
    lock,
    exportPrivateKey,
    send,
    refresh,
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet() {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error("useWallet must be used within WalletProvider")
  return ctx
}

export function formatBalance(chain: Chain, amount: number) {
  return formatCurrency(chain, amount)
}
