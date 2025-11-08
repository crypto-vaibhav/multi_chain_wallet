import {
  Keypair,
  PublicKey,
  Connection,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js"
import { ethers } from "ethers"
import bs58 from "bs58"
import { SUPPORTED_CHAINS, type Chain } from "./chains"

// Solana utilities
export function generateSolanaKeypair() {
  const keypair = Keypair.generate()
  // Verify the keypair is valid - secret key must be 64 bytes
  if (keypair.secretKey.length !== 64) {
    throw new Error("Invalid Solana keypair: secret key must be 64 bytes")
  }
  // Verify public key derivation
  const verified = Keypair.fromSecretKey(keypair.secretKey)
  if (verified.publicKey.toBase58() !== keypair.publicKey.toBase58()) {
    throw new Error("Solana keypair verification failed")
  }
  return keypair
}

export function getSolanaPublicKey(keypair: Keypair): string {
  return keypair.publicKey.toString()
}

export async function getSolanaBalance(address: string, rpcUrl?: string): Promise<number> {
  // Validate address first
  try {
    new PublicKey(address)
  } catch (error) {
    console.error(`[Solana] Invalid address: ${address}`)
    return 0
  }

  const configuredRpc = rpcUrl || process.env.NEXT_PUBLIC_SOLANA_RPC_URL
  
  // Determine if this is a devnet/testnet URL
  const isDevnet = configuredRpc?.includes('devnet') || false
  const isTestnet = configuredRpc?.includes('testnet') || false
  
  // Use appropriate RPC endpoints based on network - updated with more reliable endpoints
  let rpcUrls: string[] = []
  
  if (isDevnet) {
    rpcUrls = [
      "https://api.devnet.solana.com",
      "https://devnet.sonic.game",
      "https://rpc.ankr.com/solana_devnet",
      "https://solana-devnet.g.alchemy.com/v2/demo",
      configuredRpc,
    ].filter((url): url is string => !!url)
  } else if (isTestnet) {
    rpcUrls = [
      "https://api.testnet.solana.com",
      configuredRpc,
    ].filter((url): url is string => !!url)
  } else {
    // Mainnet RPCs - prioritize more reliable endpoints
    rpcUrls = [
      "https://api.mainnet-beta.solana.com",
      "https://solana-mainnet.g.alchemy.com/v2/demo",
      "https://mainnet.helius-rpc.com/?api-key=public",
      "https://rpc.ankr.com/solana",
      "https://solana.public-rpc.com",
      configuredRpc,
    ].filter((url): url is string => !!url)
  }

  const errors: string[] = []

  for (const url of rpcUrls) {
    try {
      const connection = new Connection(url, { 
        commitment: "confirmed",
        confirmTransactionInitialTimeout: 60000 
      })
      const pubkey = new PublicKey(address)
      const balance = await connection.getBalance(pubkey)
      console.log(`[Solana] ✅ Successfully fetched balance from ${url}: ${balance / LAMPORTS_PER_SOL} SOL`)
      return balance / LAMPORTS_PER_SOL
    } catch (error: any) {
      const errorMsg = `${url}: ${error.message || error}`
      errors.push(errorMsg)
      console.warn(`[Solana] ❌ Failed to fetch balance from ${url}:`, error.message)
      continue
    }
  }

  console.error(`[Solana] All RPC endpoints failed for address: ${address}`)
  console.error(`[Solana] Errors:`, errors)
  return 0
}

// Address validation utilities
export function isValidSolanaAddress(address: string): boolean {
  try {
    const pubkey = new PublicKey(address)
    // Verify the address is valid by converting back to string
    return pubkey.toBase58() === address
  } catch {
    return false
  }
}

export function isValidEVMAddress(address: string): boolean {
  try {
    return ethers.isAddress(address)
  } catch {
    return false
  }
}

export async function sendSolanaTransaction(
  privateKey: string,
  toAddress: string,
  amount: string,
  rpcUrl: string,
): Promise<string> {
  try {
    // Validate recipient address
    if (!isValidSolanaAddress(toAddress)) {
      throw new Error("Invalid Solana address format")
    }
    
    const connection = new Connection(rpcUrl, "confirmed")
    
    // Validate and decode private key
    let fromKeypair: Keypair
    try {
      // Try to decode as base64 first (from wallet creation)
      const secretKeyBytes = Uint8Array.from(atob(privateKey), (c) => c.charCodeAt(0))
      if (secretKeyBytes.length === 64) {
        fromKeypair = Keypair.fromSecretKey(secretKeyBytes)
      } else {
        // Try base58 decode
        fromKeypair = Keypair.fromSecretKey(bs58.decode(privateKey))
      }
    } catch (e) {
      // Try base58 decode if base64 fails
      fromKeypair = Keypair.fromSecretKey(bs58.decode(privateKey))
    }
    
    // Verify the keypair is valid
    const verified = Keypair.fromSecretKey(fromKeypair.secretKey)
    if (verified.publicKey.toBase58() !== fromKeypair.publicKey.toBase58()) {
      throw new Error("Invalid sender keypair")
    }
    
    const toPubkey = new PublicKey(toAddress)
    
    // Validate amount
    const amt = parseFloat(amount)
    if (!Number.isFinite(amt) || amt <= 0) {
      throw new Error("Invalid amount")
    }
    
    const lamports = Math.round(amt * LAMPORTS_PER_SOL)
    if (lamports <= 0) {
      throw new Error("Amount too small")
    }

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromKeypair.publicKey,
        toPubkey,
        lamports,
      }),
    )

    const signature = await sendAndConfirmTransaction(connection, transaction, [fromKeypair])
    return signature
  } catch (error: any) {
    console.error("[v0] Error sending Solana transaction:", error)
    throw new Error(error.message || "Failed to send Solana transaction")
  }
}

// EVM utilities (Ethereum, BSC)
export function generateEVMKeypair() {
  // Use ethers.Wallet.createRandom() which generates cryptographically secure random private keys
  const wallet = ethers.Wallet.createRandom()
  // Verify the address is correctly derived from the private key
  const verifiedWallet = new ethers.Wallet(wallet.privateKey)
  if (verifiedWallet.address !== wallet.address) {
    throw new Error("EVM address derivation verification failed")
  }
  // Verify private key format (must be 64 hex chars = 32 bytes)
  if (!/^0x[a-fA-F0-9]{64}$/.test(wallet.privateKey)) {
    throw new Error("Invalid EVM private key format")
  }
  return {
    privateKey: wallet.privateKey,
    address: wallet.address,
  }
}

export async function getEVMBalance(address: string, chain: Chain, rpcUrl?: string, network: "mainnet" | "testnet" = "mainnet"): Promise<number> {
  // Validate address first
  if (!isValidEVMAddress(address)) {
    console.error(`[${chain.toUpperCase()}] Invalid address: ${address}`)
    return 0
  }

  // Get RPC URLs from chain configuration
  const chainInfo = SUPPORTED_CHAINS[chain]
  if (!chainInfo || chainInfo.type !== "evm") {
    console.error(`[${chain.toUpperCase()}] Not an EVM chain`)
    return 0
  }

  const rpcUrls = [
    ...(network === "mainnet" ? chainInfo.rpcUrls.mainnet : (chainInfo.rpcUrls.testnet || [])),
    rpcUrl
  ].filter(Boolean) as string[]

  const errors: string[] = []

  for (const url of rpcUrls) {
    try {
      const provider = new ethers.JsonRpcProvider(url)
      const balance = await provider.getBalance(address)
      const balanceEth = Number.parseFloat(ethers.formatEther(balance))
      console.log(`[${chain.toUpperCase()}] ✅ Successfully fetched balance from ${url}: ${balanceEth} ${chain === 'ethereum' ? 'ETH' : 'BNB'}`)
      return balanceEth
    } catch (error: any) {
      const errorMsg = `${url}: ${error.message || error}`
      errors.push(errorMsg)
      console.warn(`[${chain.toUpperCase()}] ❌ Failed to fetch balance from ${url}:`, error.message)
      continue
    }
  }
  
  console.error(`[${chain.toUpperCase()}] All RPC endpoints failed for address: ${address}`)
  console.error(`[${chain.toUpperCase()}] Errors:`, errors)
  return 0
}

export async function sendEVMTransaction(
  privateKey: string,
  toAddress: string,
  amount: string,
  rpcUrl: string,
): Promise<string> {
  try {
    // Validate recipient address
    if (!isValidEVMAddress(toAddress)) {
      throw new Error("Invalid EVM address format")
    }
    
    // Validate and format private key
    const privateKeyHex = privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`
    if (!/^0x[a-fA-F0-9]{64}$/.test(privateKeyHex)) {
      throw new Error("Invalid private key format")
    }
    
    // Verify the wallet is valid
    const testWallet = new ethers.Wallet(privateKeyHex)
    const verified = new ethers.Wallet(privateKeyHex)
    if (verified.address !== testWallet.address) {
      throw new Error("Invalid sender wallet")
    }
    
    // Validate amount
    const amt = parseFloat(amount)
    if (!Number.isFinite(amt) || amt <= 0) {
      throw new Error("Invalid amount")
    }
    
    const provider = new ethers.JsonRpcProvider(rpcUrl)
    const wallet = new ethers.Wallet(privateKeyHex, provider)
    
    // Verify recipient address one more time
    if (!ethers.isAddress(toAddress)) {
      throw new Error("Invalid recipient address")
    }
    
    const tx = await wallet.sendTransaction({
      to: toAddress,
      value: ethers.parseEther(amount),
    })
    const receipt = await tx.wait()
    return receipt?.hash || tx.hash
  } catch (error: any) {
    console.error("[v0] Error sending EVM transaction:", error)
    throw new Error(error.message || "Failed to send EVM transaction")
  }
}

// Price fetching
export async function getTokenPrices(tokenIds: string[]): Promise<Record<string, number>> {
  try {
    const response = await fetch(`/api/prices`)
    if (response.ok) {
      const data = await response.json()
      return data
    }
    // Fall back to Coingecko if the internal API route is unavailable (e.g., dev or static export)
    const ids = ["solana", "ethereum", "binancecoin"].join(",")
    const cg = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(ids)}&vs_currencies=usd`,
      { headers: { accept: "application/json" } },
    )
    if (cg.ok) {
      const data = await cg.json()
      return {
        solana: data.solana?.usd ?? 0,
        ethereum: data.ethereum?.usd ?? 0,
        binancecoin: data.binancecoin?.usd ?? 0,
      }
    }
    throw new Error(`Price fetch failed: route ${response.status}, coingecko ${cg.status}`)
  } catch (error) {
    console.warn(`[v0] Failed to fetch prices, returning zeros:`, error)
    // Return a zero-filled record as a fallback
    return tokenIds.reduce((acc, id) => ({ ...acc, [id]: 0 }), {})
  }
}

// Explorer URL utility
export function getExplorerUrl(chain: "solana" | "ethereum" | "bsc", txHash: string, network: "mainnet" | "devnet" | "testnet" = "mainnet"): string {
  switch (chain) {
    case "solana":
      const solCluster = network === "devnet" ? "?cluster=devnet" : ""
      return `https://explorer.solana.com/tx/${txHash}${solCluster}`
    case "ethereum":
      const ethPrefix = network === "mainnet" ? "" : `${network}.`
      return `https://${ethPrefix}etherscan.io/tx/${txHash}`
    case "bsc":
      const bscPrefix = network === "mainnet" ? "" : "testnet."
      return `https://${bscPrefix}bscscan.com/tx/${txHash}`
    default:
      return ""
  }
}
