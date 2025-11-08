"use client"

import type React from "react"
import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { Keypair } from "@solana/web3.js"
import bs58 from "bs58"
import { decryptSecretKey, encryptSecretKey } from "@/lib/crypto"
import type { Network } from "@/lib/solana"

type WalletState =
  | { status: "empty" }
  | { status: "locked"; address: string }
  | { status: "unlocked"; address: string; secretKey: Uint8Array }

type StoredWalletV1 = {
  version: 1
  address: string
  pubkey: string
  enc: {
    salt: string
    iv: string
    cipherText: string
    verifier: string
  }
}

const LS_KEY = "wallet_v1"
const NET_KEY = "wallet_network"

type Ctx = {
  state: WalletState
  network: Network
  setNetwork: (n: Network) => void
  createWallet: (password: string) => Promise<void>
  importFromSecretKey: (base58Secret: string, password: string) => Promise<void>
  unlock: (password: string) => Promise<void>
  lock: () => void
  exportSecretBase58: () => string | null
}

const WalletContext = createContext<Ctx | null>(null)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WalletState>({ status: "empty" })
  const [network, setNetworkState] = useState<Network>(() => {
    if (typeof window === "undefined") return "devnet"
    return (localStorage.getItem(NET_KEY) as Network) || "devnet"
  })

  useEffect(() => {
    if (typeof window === "undefined") return
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) {
      setState({ status: "empty" })
      return
    }
    try {
      const stored = JSON.parse(raw) as StoredWalletV1
      setState({ status: "locked", address: stored.address })
    } catch {
      setState({ status: "empty" })
    }
  }, [])

  const setNetwork = (n: Network) => {
    setNetworkState(n)
    if (typeof window !== "undefined") localStorage.setItem(NET_KEY, n)
  }

  async function createWallet(password: string) {
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
    const enc = await encryptSecretKey(kp.secretKey, password)
    const address = kp.publicKey.toBase58()
    const stored: StoredWalletV1 = {
      version: 1,
      address,
      pubkey: address,
      enc,
    }
    localStorage.setItem(LS_KEY, JSON.stringify(stored))
    setState({ status: "locked", address })
  }

  async function importFromSecretKey(base58Secret: string, password: string) {
    const sk = bs58.decode(base58Secret.trim())
    if (sk.length !== 64) throw new Error("Invalid secret key length. Expect 64-byte base58-encoded secret.")
    const kp = Keypair.fromSecretKey(sk)
    // Verify the keypair is valid by checking public key derivation
    const verifiedKp = Keypair.fromSecretKey(sk)
    if (verifiedKp.publicKey.toBase58() !== kp.publicKey.toBase58()) {
      throw new Error("Solana keypair verification failed")
    }
    const address = kp.publicKey.toBase58()
    const enc = await encryptSecretKey(sk, password)
    const stored: StoredWalletV1 = {
      version: 1,
      address,
      pubkey: address,
      enc,
    }
    localStorage.setItem(LS_KEY, JSON.stringify(stored))
    setState({ status: "locked", address })
  }

  async function unlock(password: string) {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) throw new Error("No wallet found")
    const stored = JSON.parse(raw) as StoredWalletV1
    const sk = await decryptSecretKey(stored.enc, password)
    if (sk.length !== 64) throw new Error("Decryption failed")
    const addr = stored.address
    setState({ status: "unlocked", address: addr, secretKey: sk })
  }

  function lock() {
    const addr = state.status !== "empty" ? state.address : ""
    if (addr) setState({ status: "locked", address: addr })
    else setState({ status: "empty" })
  }

  function exportSecretBase58() {
    if (state.status !== "unlocked") return null
    return bs58.encode(state.secretKey)
  }

  const value = useMemo<Ctx>(
    () => ({ state, network, setNetwork, createWallet, importFromSecretKey, unlock, lock, exportSecretBase58 }),
    [state, network],
  )

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet() {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error("useWallet must be used within WalletProvider")
  return ctx
}
