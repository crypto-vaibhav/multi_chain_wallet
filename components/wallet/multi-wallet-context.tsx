"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { Keypair } from "@solana/web3.js"
import { ethers } from "ethers"
import bs58 from "bs58"
import {
  generateSolanaKeypair,
  getSolanaPublicKey,
  getSolanaBalance,
  generateEVMKeypair,
  getEVMBalance,
  getTokenPrices,
} from "@/lib/wallet-utils"
import { encryptData, decryptData } from "@/lib/encryption"
import { generateHDWallet, deriveFromMnemonic } from "@/lib/hd-wallet"

export type Chain = "solana" | "ethereum" | "bsc"
export type Network = "mainnet" | "devnet" | "testnet"

interface WalletAccount {
  chain: Chain
  address: string
  privateKey: string
  balance: number
  tokens: Array<{ symbol: string; balance: number; usdValue: number }>
}

interface WalletVault {
  mnemonic?: string // Encrypted mnemonic for HD wallets
  accounts: WalletAccount[]
}

export type ActivityType = "sent" | "received"

export interface Activity {
  type: ActivityType
  chain: Chain
  symbol: string
  amount: number
  txHash: string
  timestamp: number
  from: string
  to: string
}

interface WalletContextType {
  isLocked: boolean
  accounts: WalletAccount[]
  activities: Activity[]
  selectedChain: Chain
  selectedNetwork: Network
  isTestnetMode: boolean // Global testnet toggle
  totalBalance: number
  allAssets: Array<{ chain: Chain; symbol: string; balance: number; usdValue: number }>
  lock: () => void
  unlock: (password: string) => Promise<boolean>
  createWallet: (password: string, chain: Chain) => Promise<void>
  importWallet: (privateKey: string, password: string, chain: Chain) => Promise<void>
  switchChain: (chain: Chain) => void
  switchNetwork: (network: Network) => void
  toggleTestnetMode: () => void // Toggle between mainnet/testnet for ALL chains
  getAddress: () => string
  refreshBalances: () => Promise<void>
  exportPrivateKey: (password: string, chain?: string) => Promise<string>
  getPassword: () => string
  addActivity: (activity: Omit<Activity, "timestamp">) => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function MultiWalletProvider({ children }: { children: React.ReactNode }) {
  const [isLocked, setIsLocked] = useState(true)
  const [accounts, setAccounts] = useState<WalletAccount[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [selectedChain, setSelectedChain] = useState<Chain>("solana")
  const [selectedNetwork, setSelectedNetwork] = useState<Network>("devnet")
  const [isTestnetMode, setIsTestnetMode] = useState(false) // Global testnet toggle - default to testnet for development
  const [password, setPassword] = useState<string>("")
  const [totalBalance, setTotalBalance] = useState(0)
  const [allAssets, setAllAssets] = useState<
    Array<{ chain: Chain; symbol: string; balance: number; usdValue: number }>
  >([])

  // Load wallet, activities, and testnet mode from localStorage on mount
  useEffect(() => {
    const savedWallet = localStorage.getItem("wallet_encrypted")
    if (savedWallet) {
      setIsLocked(true)
    }
    const savedActivities = localStorage.getItem("wallet_activities")
    if (savedActivities) {
      setActivities(JSON.parse(savedActivities))
    }
    const savedTestnetMode = localStorage.getItem("wallet_testnet_mode")
    if (savedTestnetMode) {
      setIsTestnetMode(savedTestnetMode === "true")
    }
  }, [])

  // Refresh balances periodically and when chain/network changes
  useEffect(() => {
    if (!isLocked && accounts.length > 0) {
      refreshBalances()
      const interval = setInterval(refreshBalances, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [isLocked, selectedChain, selectedNetwork, accounts.length, isTestnetMode]) // Add isTestnetMode to dependencies

  const getRpcUrl = (chain: Chain, useTestnet: boolean): string => {
    if (chain === "solana") {
      if (useTestnet) return "https://api.devnet.solana.com"
      return "https://api.mainnet-beta.solana.com"
    }
    if (chain === "ethereum") {
      if (useTestnet) return "https://ethereum-sepolia-rpc.publicnode.com"
      return "https://eth.llamarpc.com"
    }
    if (chain === "bsc") {
      if (useTestnet) return "https://bsc-testnet.publicnode.com"
      return "https://bsc-dataseed.binance.org"
    }
    return ""
  }

  const toggleTestnetMode = () => {
    const newMode = !isTestnetMode
    setIsTestnetMode(newMode)
    localStorage.setItem("wallet_testnet_mode", String(newMode))
    // Refresh balances immediately after toggling
    setTimeout(() => refreshBalances(), 100)
  }

  const addActivity = (activity: Omit<Activity, "timestamp">) => {
    const newActivity: Activity = { ...activity, timestamp: Date.now() }
    const updatedActivities = [newActivity, ...activities]
    setActivities(updatedActivities)
    localStorage.setItem("wallet_activities", JSON.stringify(updatedActivities))
  }

  const createWallet = async (pwd: string, chain: Chain) => {
    try {
      // Check if wallet already exists for this chain
      const existingAccount = accounts.find((a) => a.chain === chain)
      if (existingAccount) {
        throw new Error(`${chain.charAt(0).toUpperCase() + chain.slice(1)} wallet already exists. Please import or use existing wallet.`)
      }

      // Check if we already have a wallet (any chain)
      // If yes, we should create all chains from the same mnemonic
      // If no, create a new HD wallet with all chains
      if (accounts.length === 0) {
        // Create new HD wallet with all chains at once
        const hdWallet = await generateHDWallet()
        
        const newAccounts: WalletAccount[] = [
          {
            chain: "solana",
            address: hdWallet.solana.address,
            privateKey: hdWallet.solana.privateKey,
            balance: 0,
            tokens: [],
          },
          {
            chain: "ethereum",
            address: hdWallet.ethereum.address,
            privateKey: hdWallet.ethereum.privateKey,
            balance: 0,
            tokens: [],
          },
          {
            chain: "bsc",
            address: hdWallet.bsc.address,
            privateKey: hdWallet.bsc.privateKey,
            balance: 0,
            tokens: [],
          },
        ]

        const vault: WalletVault = {
          mnemonic: hdWallet.mnemonic, // Store mnemonic (will be encrypted)
          accounts: newAccounts,
        }

        const encrypted = await encryptData(JSON.stringify(vault), pwd)
        localStorage.setItem("wallet_encrypted", encrypted)
        setAccounts(newAccounts)
        setPassword(pwd)
        setIsLocked(false)
        // Clear activities for a new wallet
        setActivities([])
        localStorage.removeItem("wallet_activities")
      } else {
        // Wallet already exists, can't create another one
        throw new Error("Wallet already exists. Please unlock your existing wallet.")
      }
    } catch (error: any) {
      console.error("[v0] Error creating wallet:", error)
      throw error
    }
  }

  const importWallet = async (privateKey: string, pwd: string, chain: Chain) => {
    try {
      let newAccount: WalletAccount

      if (chain === "solana") {
        let secretKey: Uint8Array

        // Try decoding from various formats
        try {
          // Try parsing as a JSON array of numbers
          const parsedArray = JSON.parse(privateKey)
          if (Array.isArray(parsedArray) && parsedArray.every(n => typeof n === 'number')) {
            secretKey = new Uint8Array(parsedArray)
          } else {
            throw new Error("Not a JSON array of numbers")
          }
        } catch (e1) {
          try {
            // Try decoding from Base58
            secretKey = bs58.decode(privateKey)
          } catch (e2) {
            try {
                // Try decoding from a comma-separated string of numbers
                const byteStrings = privateKey.split(',');
                if (byteStrings.length > 1) {
                    secretKey = new Uint8Array(byteStrings.map(s => parseInt(s.trim(), 10)));
                } else {
                    throw new Error("Not a comma-separated byte string");
                }
            } catch (e3) {
                console.error("Failed to decode private key from all supported formats.");
                throw new Error("Invalid private key format. Please provide a Base58 string or a byte array.")
            }
          }
        }

        if (secretKey.length !== 64) {
            throw new Error(`Invalid secret key length: ${secretKey.length}. Expected 64 bytes.`);
        }

        const keypair = Keypair.fromSecretKey(secretKey)
        // Verify the keypair is valid
        const verified = Keypair.fromSecretKey(secretKey)
        if (verified.publicKey.toBase58() !== keypair.publicKey.toBase58()) {
          throw new Error("Solana keypair verification failed")
        }
        const address = getSolanaPublicKey(keypair)
        newAccount = {
          chain,
          address,
          privateKey: bs58.encode(keypair.secretKey), // Store consistently as Base58
          balance: 0,
          tokens: [],
        }
      } else {
        // EVM wallet import - validate private key format
        const privateKeyHex = privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`
        if (!/^0x[a-fA-F0-9]{64}$/.test(privateKeyHex)) {
          throw new Error("Invalid EVM private key: must be 64 hex characters (32 bytes)")
        }
        const wallet = new ethers.Wallet(privateKeyHex)
        // Verify address derivation
        const verified = new ethers.Wallet(privateKeyHex)
        if (verified.address !== wallet.address) {
          throw new Error("EVM address derivation verification failed")
        }
        newAccount = {
          chain,
          address: wallet.address,
          privateKey: wallet.privateKey, // This will be the properly formatted hex key
          balance: 0,
          tokens: [],
        }
      }

      // Check if wallet already exists for this chain
      const existingAccount = accounts.find((a) => a.chain === chain)
      if (existingAccount) {
        throw new Error(`${chain.charAt(0).toUpperCase() + chain.slice(1)} wallet already exists for this account.`)
      }

      const newAccounts = [...accounts, newAccount]
      
      // Maintain vault format if we have mnemonic, otherwise use array format
      const saved = localStorage.getItem("wallet_encrypted")
      let vault: WalletVault | WalletAccount[] = newAccounts
      
      if (saved) {
        try {
          // Try to get existing vault structure (for future mnemonic support)
          const tempDecrypted = await decryptData(saved, pwd)
          const existingVault = JSON.parse(tempDecrypted)
          if (existingVault && !Array.isArray(existingVault) && existingVault.mnemonic) {
            vault = { mnemonic: existingVault.mnemonic, accounts: newAccounts } as WalletVault
          }
        } catch {
          // If decryption fails, just use array format
        }
      }
      
      const encrypted = await encryptData(JSON.stringify(vault), pwd)
      localStorage.setItem("wallet_encrypted", encrypted)
      setAccounts(newAccounts)
      setPassword(pwd)
      setIsLocked(false)
    } catch (error: any) {
      console.error("[v0] Error importing wallet:", error)
      throw error
    }
  }

  const unlock = async (pwd: string): Promise<boolean> => {
    try {
      const encrypted = localStorage.getItem("wallet_encrypted")
      if (!encrypted) return false

      const decrypted = await decryptData(encrypted, pwd)
      const vault: WalletVault | WalletAccount[] = JSON.parse(decrypted)
      
      // Support both old format (array) and new format (vault with mnemonic)
      if (Array.isArray(vault)) {
        // Old format - just accounts array
        setAccounts(vault as WalletAccount[])
      } else {
        // New format - vault with mnemonic and accounts
        setAccounts((vault as WalletVault).accounts || [])
      }
      
      setPassword(pwd)
      setIsLocked(false)
      // Load activities on unlock
      const savedActivities = localStorage.getItem("wallet_activities")
      if (savedActivities) {
        try {
          setActivities(JSON.parse(savedActivities))
        } catch {
          setActivities([])
        }
      }
      return true
    } catch (error) {
      console.error("[v0] Error unlocking wallet:", error)
      return false
    }
  }

  const lock = () => {
    setIsLocked(true)
    setPassword("")
  }

  const switchChain = (chain: Chain) => {
    setSelectedChain(chain)
  }

  const switchNetwork = (network: Network) => {
    setSelectedNetwork(network)
  }

  const getAddress = (): string => {
    const account = accounts.find((a) => a.chain === selectedChain)
    return account?.address || ""
  }

  const getPassword = (): string => {
    return password
  }

  const refreshBalances = async () => {
    try {
      console.log('[MultiWallet] Starting balance refresh for accounts:', accounts.map(a => ({ chain: a.chain, address: a.address })))
      console.log('[MultiWallet] Testnet mode:', isTestnetMode)
      
      // Fetch balances for each account using the GLOBAL testnet toggle
      // ALL chains use the same network mode (mainnet OR testnet)
      const updated = await Promise.all(
        accounts.map(async (account) => {
          let balance = 0

          console.log(`[MultiWallet] Fetching balance for ${account.chain} on ${isTestnetMode ? 'TESTNET' : 'MAINNET'}:`, account.address)

          try {
            if (account.chain === "solana") {
              const rpcUrl = getRpcUrl(account.chain, isTestnetMode)
              console.log(`[MultiWallet] Using Solana RPC:`, rpcUrl)
              balance = await getSolanaBalance(account.address, rpcUrl)
              console.log(`[MultiWallet] Solana balance fetched:`, balance)
            } else {
              const rpcUrl = getRpcUrl(account.chain, isTestnetMode)
              const evmNetwork = isTestnetMode ? "testnet" : "mainnet"
              console.log(`[MultiWallet] Using ${account.chain} RPC (${evmNetwork}):`, rpcUrl)
              balance = await getEVMBalance(account.address, account.chain, rpcUrl, evmNetwork)
              console.log(`[MultiWallet] ${account.chain} balance fetched:`, balance)
            }
          } catch (error) {
            console.error(`[v0] Error fetching balance for ${account.chain}:`, error)
            balance = 0
          }

          return { ...account, balance, tokens: [] }
        }),
      )

      console.log('[MultiWallet] All balances updated:', updated)
      setAccounts(updated)

      console.log('[MultiWallet] Fetching token prices...')
      const prices = await getTokenPrices(["solana", "ethereum", "binancecoin"])
      console.log('[MultiWallet] Prices fetched:', prices)
      const solPrice = prices.solana ?? 0
      const ethPrice = prices.ethereum ?? 0
      const bnbPrice = prices.binancecoin ?? 0

      const assets: Array<{ chain: Chain; symbol: string; balance: number; usdValue: number }> = []

      // Always show SOL, ETH, and BNB even if balance is 0
      const solAccount = updated.find((a) => a.chain === "solana")
      assets.push({
        chain: "solana",
        symbol: "SOL",
        balance: solAccount?.balance ?? 0,
        usdValue: (solAccount?.balance ?? 0) * solPrice,
      })

      const ethAccount = updated.find((a) => a.chain === "ethereum")
      assets.push({
        chain: "ethereum",
        symbol: "ETH",
        balance: ethAccount?.balance ?? 0,
        usdValue: (ethAccount?.balance ?? 0) * ethPrice,
      })

      const bscAccount = updated.find((a) => a.chain === "bsc")
      assets.push({
        chain: "bsc",
        symbol: "BNB",
        balance: bscAccount?.balance ?? 0,
        usdValue: (bscAccount?.balance ?? 0) * bnbPrice,
      })

      setAllAssets(assets)

      const total = assets.reduce((sum, asset) => sum + asset.usdValue, 0)
      setTotalBalance(total)
      
      console.log('[MultiWallet] Final state - Assets:', assets, 'Total balance:', total)
    } catch (error) {
      console.error("[v0] Error refreshing balances:", error)
    }
  }

  const exportPrivateKey = async (pwd: string, chain?: string): Promise<string> => {
    if (pwd !== password) throw new Error("Invalid password")
    const targetChain = chain || selectedChain
    const account = accounts.find((a) => a.chain === targetChain)
    return account?.privateKey || ""
  }

  return (
    <WalletContext.Provider
      value={{
        isLocked,
        accounts,
        activities,
        selectedChain,
        selectedNetwork,
        isTestnetMode,
        totalBalance,
        allAssets,
        lock,
        unlock,
        createWallet,
        importWallet,
        switchChain,
        switchNetwork,
        toggleTestnetMode,
        getAddress,
        refreshBalances,
        exportPrivateKey,
        getPassword,
        addActivity,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (!context) throw new Error("useWallet must be used within MultiWalletProvider")
  return context
}
