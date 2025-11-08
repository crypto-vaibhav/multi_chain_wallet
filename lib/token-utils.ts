import { Connection, PublicKey } from "@solana/web3.js"
import { ethers } from "ethers"

// Solana SPL Token interface
export interface SolanaToken {
  mint: string
  symbol: string
  name: string
  decimals: number
  balance: number
  usdValue: number
}

// EVM Token interface
export interface EVMToken {
  address: string
  symbol: string
  name: string
  decimals: number
  balance: number
  usdValue: number
}

// Get Solana SPL tokens for an address
export async function getSolanaTokens(address: string, rpcUrl: string): Promise<SolanaToken[]> {
  try {
    const connection = new Connection(rpcUrl)
    const pubkey = new PublicKey(address)

    // Fetch token accounts
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(pubkey, {
      programId: new PublicKey("TokenkegQfeZyiNwAJsyFbPVwwQQfփ"),
    })

    const tokens: SolanaToken[] = []

    for (const account of tokenAccounts.value) {
      const parsed = account.account.data.parsed
      if (parsed.type === "account") {
        const tokenInfo = parsed.info
        tokens.push({
          mint: tokenInfo.mint,
          symbol: "SPL", // Default, would need metadata for real symbol
          name: "SPL Token",
          decimals: tokenInfo.tokenAmount.decimals,
          balance: Number(tokenInfo.tokenAmount.amount) / Math.pow(10, tokenInfo.tokenAmount.decimals),
          usdValue: 0, // Would need price feed
        })
      }
    }

    return tokens
  } catch (error) {
    console.error("[v0] Error fetching Solana tokens:", error)
    return []
  }
}

// Get ERC20 token balance (requires contract address)
export async function getERC20Balance(tokenAddress: string, walletAddress: string, rpcUrl: string): Promise<number> {
  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl)

    // ERC20 ABI for balanceOf
    const abi = ["function balanceOf(address owner) view returns (uint256)", "function decimals() view returns (uint8)"]

    const contract = new ethers.Contract(tokenAddress, abi, provider)
    const decimals = await contract.decimals()
    const balance = await contract.balanceOf(walletAddress)

    return Number.parseFloat(ethers.formatUnits(balance, decimals))
  } catch (error) {
    console.error("[v0] Error fetching ERC20 balance:", error)
    return 0
  }
}

// Get token price from CoinGecko
export async function getTokenPrice(tokenId: string): Promise<number> {
  try {
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=usd`)
    const data = await response.json()
    return data[tokenId]?.usd || 0
  } catch (error) {
    console.error("[v0] Error fetching token price:", error)
    return 0
  }
}

// Common token prices mapping
export const TOKEN_PRICE_IDS: Record<string, string> = {
  solana: "solana",
  ethereum: "ethereum",
  binancecoin: "binancecoin",
  wrapped_bitcoin: "wrapped-bitcoin",
  usd_coin: "usd-coin",
  tether: "tether",
}
