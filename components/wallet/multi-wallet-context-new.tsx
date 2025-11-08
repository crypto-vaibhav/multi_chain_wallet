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
import { SUPPORTED_CHAINS, type Chain } from "@/lib/chains"

export type { Chain } from "@/lib/chains"
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
  isTestnetMode: boolean
  totalBalance: number
  allAssets: Array<{ chain: Chain; symbol: string; balance: number; usdValue: number }>
  lock: () => void
  unlock: (password: string) => Promise<boolean>
  createWallet: (password: string, chain: Chain) => Promise<void>
  importWallet: (privateKey: string, password: string, chain: Chain) => Promise<void>
  addChain: (chain: Chain) => Promise<void>
  switchChain: (chain: Chain) => void
  switchNetwork: (network: Network) => void
  toggleTestnetMode: () => void
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
  const [isTestnetMode, setIsTestnetMode] = useState(false)
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

  // Save activities to localStorage whenever they change
  useEffect(() => {
    if (activities.length > 0) {
      localStorage.setItem("wallet_activities", JSON.stringify(activities))
    }
  }, [activities])

  // Save testnet mode to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("wallet_testnet_mode", isTestnetMode.toString())
  }, [isTestnetMode])

  const createWallet = async (pwd: string, chain: Chain) => {
    try {
      // Check if wallet already exists for this chain
      const existingAccount = accounts.find(acc => acc.chain === chain)
      if (existingAccount) {
        throw new Error(`Wallet for ${chain} already exists`)
      }

      let newAccount: WalletAccount
      const chainInfo = SUPPORTED_CHAINS[chain]

      if (chainInfo.type === "solana") {
        const keypair = Keypair.generate()
        const address = getSolanaPublicKey(keypair)
        newAccount = {
          chain,
          address,
          privateKey: bs58.encode(keypair.secretKey),
          balance: 0,
          tokens: [],
        }
      } else {
        // EVM chains
        const wallet = ethers.Wallet.createRandom()
        newAccount = {
          chain,
          address: wallet.address,
          privateKey: wallet.privateKey,
          balance: 0,
          tokens: [],
        }
      }

      // If this is the first account, create all default chains (SOL, ETH, BNB)
      let newAccounts: WalletAccount[] = []
      if (accounts.length === 0) {
        // Create default chains
        const defaultChains: Chain[] = ["solana", "ethereum", "bsc"]
        for (const defaultChain of defaultChains) {
          const defaultChainInfo = SUPPORTED_CHAINS[defaultChain]
          if (defaultChainInfo.type === "solana") {
            const keypair = Keypair.generate()
            newAccounts.push({
              chain: defaultChain,
              address: getSolanaPublicKey(keypair),
              privateKey: bs58.encode(keypair.secretKey),
              balance: 0,
              tokens: [],
            })
          } else {
            const wallet = ethers.Wallet.createRandom()
            newAccounts.push({
              chain: defaultChain,
              address: wallet.address,
              privateKey: wallet.privateKey,
              balance: 0,
              tokens: [],
            })
          }
        }
      } else {
        newAccounts = [...accounts, newAccount]
      }

      const vault: WalletVault = { accounts: newAccounts }
      const encrypted = await encryptData(JSON.stringify(vault), pwd)
      localStorage.setItem("wallet_encrypted", encrypted)
      setAccounts(newAccounts)
      setPassword(pwd)
      setIsLocked(false)
      setSelectedChain(newAccounts[0].chain)
      await refreshBalances()
    } catch (error: any) {
      console.error("[Wallet] Error creating wallet:", error)
      throw error
    }
  }

  const importWallet = async (privateKey: string, pwd: string, chain: Chain) => {
    try {
      let newAccount: WalletAccount
      const chainInfo = SUPPORTED_CHAINS[chain]

      if (chainInfo.type === "solana") {
        let secretKey: Uint8Array

        // Try decoding from various formats
        try {
          const parsedArray = JSON.parse(privateKey)
          if (Array.isArray(parsedArray) && parsedArray.every(n => typeof n === 'number')) {
            secretKey = new Uint8Array(parsedArray)
          } else {
            throw new Error("Not a JSON array")
          }
        } catch {
          try {
            secretKey = bs58.decode(privateKey)
          } catch {
            try {
              const byteStrings = privateKey.split(',')
              if (byteStrings.length > 1) {
                secretKey = new Uint8Array(byteStrings.map(s => parseInt(s.trim(), 10)))
              } else {
                throw new Error("Not a comma-separated byte string")
              }
            } catch {
              throw new Error("Invalid private key format. Please provide a Base58 string or byte array.")
            }
          }
        }

        if (secretKey.length !== 64) {
          throw new Error(`Invalid secret key length: ${secretKey.length}. Expected 64 bytes.`)
        }

        const keypair = Keypair.fromSecretKey(secretKey)
        const address = getSolanaPublicKey(keypair)
        newAccount = {
          chain,
          address,
          privateKey: bs58.encode(keypair.secretKey),
          balance: 0,
          tokens: [],
        }
      } else {
        // EVM wallet import
        const privateKeyHex = privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`
        if (!/^0x[a-fA-F0-9]{64}$/.test(privateKeyHex)) {
          throw new Error("Invalid EVM private key: must be 64 hex characters (32 bytes)")
        }
        const wallet = new ethers.Wallet(privateKeyHex)
        newAccount = {
          chain,
          address: wallet.address,
          privateKey: wallet.privateKey,
          balance: 0,
          tokens: [],
        }
      }

      const newAccounts = [...accounts, newAccount]
      const vault: WalletVault = { accounts: newAccounts }
      const encrypted = await encryptData(JSON.stringify(vault), pwd)
      localStorage.setItem("wallet_encrypted", encrypted)
      setAccounts(newAccounts)
      setPassword(pwd)
      setIsLocked(false)
    } catch (error: any) {
      console.error("[Wallet] Error importing wallet:", error)
      throw error
    }
  }

  const addChain = async (chain: Chain) => {
    try {
      if (!password) {
        throw new Error("Wallet is locked. Please unlock first.")
      }

      // Check if chain already exists
      const existingAccount = accounts.find(acc => acc.chain === chain)
      if (existingAccount) {
        throw new Error(`${SUPPORTED_CHAINS[chain].name} network already added`)
      }

      let newAccount: WalletAccount
      const chainInfo = SUPPORTED_CHAINS[chain]

      if (chainInfo.type === "solana") {
        const keypair = Keypair.generate()
        const address = getSolanaPublicKey(keypair)
        newAccount = {
          chain,
          address,
          privateKey: bs58.encode(keypair.secretKey),
          balance: 0,
          tokens: [],
        }
      } else {
        const wallet = ethers.Wallet.createRandom()
        newAccount = {
          chain,
          address: wallet.address,
          privateKey: wallet.privateKey,
          balance: 0,
          tokens: [],
        }
      }

      const newAccounts = [...accounts, newAccount]
      const vault: WalletVault = { accounts: newAccounts }
      const encrypted = await encryptData(JSON.stringify(vault), password)
      localStorage.setItem("wallet_encrypted", encrypted)
      setAccounts(newAccounts)
      setSelectedChain(chain)
      await refreshBalances()
    } catch (error: any) {
      console.error("[Wallet] Error adding chain:", error)
      throw error
    }
  }

  const unlock = async (pwd: string): Promise<boolean> => {
    try {
      const encrypted = localStorage.getItem("wallet_encrypted")
      if (!encrypted) return false

      const decrypted = await decryptData(encrypted, pwd)
      const vault: WalletVault | WalletAccount[] = JSON.parse(decrypted)
      
      const vaultAccounts = Array.isArray(vault) ? vault : vault.accounts
      setAccounts(vaultAccounts)
      setPassword(pwd)
      setIsLocked(false)
      
      if (vaultAccounts.length > 0) {
        setSelectedChain(vaultAccounts[0].chain)
      }
      
      await refreshBalances()
      return true
    } catch (error) {
      console.error("[Wallet] Failed to unlock:", error)
      return false
    }
  }

  const lock = () => {
    setIsLocked(true)
    setPassword("")
    setAccounts([])
    setAllAssets([])
    setTotalBalance(0)
  }

  const switchChain = (chain: Chain) => {
    setSelectedChain(chain)
  }

  const switchNetwork = (network: Network) => {
    setSelectedNetwork(network)
  }

  const toggleTestnetMode = () => {
    setIsTestnetMode(prev => !prev)
  }

  const getAddress = (): string => {
    const account = accounts.find(acc => acc.chain === selectedChain)
    return account?.address || ""
  }

  const refreshBalances = async () => {
    if (accounts.length === 0) return

    try {
      const network = isTestnetMode ? "testnet" : "mainnet"
      
      // Get unique coingecko IDs from all accounts
      const tokenIds = Array.from(new Set(
        accounts.map(acc => SUPPORTED_CHAINS[acc.chain].coingeckoId)
      ))
      const prices = await getTokenPrices(tokenIds)
      
      let updatedAccounts = [...accounts]
      const assets: Array<{ chain: Chain; symbol: string; balance: number; usdValue: number }> = []
      
      for (let i = 0; i < updatedAccounts.length; i++) {
        const account = updatedAccounts[i]
        const chainInfo = SUPPORTED_CHAINS[account.chain]
        
        try {
          if (chainInfo.type === "solana") {
            const balance = await getSolanaBalance(account.address, network as any)
            updatedAccounts[i].balance = balance
            
            const priceKey = chainInfo.coingeckoId as keyof typeof prices
            const usdValue = balance * (prices[priceKey] || 0)
            
            if (balance > 0) {
              assets.push({
                chain: account.chain,
                symbol: chainInfo.symbol,
                balance,
                usdValue,
              })
            }
          } else {
            const balance = await getEVMBalance(account.address, account.chain, undefined, network as any)
            updatedAccounts[i].balance = balance
            
            const priceKey = chainInfo.coingeckoId as keyof typeof prices
            const usdValue = balance * (prices[priceKey] || 0)
            
            if (balance > 0) {
              assets.push({
                chain: account.chain,
                symbol: chainInfo.symbol,
                balance,
                usdValue,
              })
            }
          }
        } catch (error) {
          console.error(`[Wallet] Error fetching balance for ${account.chain}:`, error)
        }
      }
      
      setAccounts(updatedAccounts)
      setAllAssets(assets)
      
      const total = assets.reduce((sum, asset) => sum + asset.usdValue, 0)
      setTotalBalance(total)
    } catch (error) {
      console.error("[Wallet] Error refreshing balances:", error)
    }
  }

  const exportPrivateKey = async (pwd: string, chain?: string): Promise<string> => {
    try {
      if (pwd !== password) {
        throw new Error("Invalid password")
      }

      const targetChain = chain || selectedChain
      const account = accounts.find(acc => acc.chain === targetChain)
      
      if (!account) {
        throw new Error(`No account found for ${targetChain}`)
      }

      return account.privateKey
    } catch (error: any) {
      console.error("[Wallet] Error exporting private key:", error)
      throw error
    }
  }

  const getPassword = (): string => {
    return password
  }

  const addActivity = (activity: Omit<Activity, "timestamp">) => {
    const newActivity: Activity = {
      ...activity,
      timestamp: Date.now(),
    }
    setActivities(prev => [newActivity, ...prev].slice(0, 100)) // Keep last 100
  }

  // Refresh balances when network or testnet mode changes
  useEffect(() => {
    if (!isLocked && accounts.length > 0) {
      refreshBalances()
    }
  }, [selectedNetwork, isTestnetMode])

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
        addChain,
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
  if (!context) {
    throw new Error("useWallet must be used within MultiWalletProvider")
  }
  return context
}
