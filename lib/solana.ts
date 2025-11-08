"use client"

import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
} from "@solana/web3.js"

export type SolanaNetwork = "mainnet-beta" | "devnet" | "testnet"

function getConnection(network: SolanaNetwork) {
  // Use public RPC endpoints
  const endpoint = clusterApiUrl(network)
  return new Connection(endpoint, "confirmed")
}

export async function getSolBalance(address: string, network: SolanaNetwork): Promise<number> {
  try {
    const connection = getConnection(network)
    const publicKey = new PublicKey(address)
    const balance = await connection.getBalance(publicKey)
    return balance / LAMPORTS_PER_SOL
  } catch (error) {
    console.error("Error fetching SOL balance:", error)
    return 0
  }
}

export async function getSplTokens(address: string, network: SolanaNetwork) {
  try {
    const connection = getConnection(network)
    const publicKey = new PublicKey(address)

    // Get all token accounts owned by the address
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
      programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
    })

    return tokenAccounts.value.map((accountInfo) => {
      const parsedInfo = accountInfo.account.data.parsed.info
      return {
        mint: parsedInfo.mint,
        amount: parsedInfo.tokenAmount.uiAmount || 0,
        symbol: parsedInfo.tokenAmount.symbol || "UNKNOWN",
      }
    })
  } catch (error) {
    console.error("Error fetching SPL tokens:", error)
    return []
  }
}

export async function getHumanActivity(address: string, network: SolanaNetwork) {
  try {
    const connection = getConnection(network)
    const publicKey = new PublicKey(address)

    // Get recent transaction signatures
    const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 10 })

    const activities = await Promise.all(
      signatures.map(async (sig) => {
        try {
          const tx = await connection.getParsedTransaction(sig.signature, {
            maxSupportedTransactionVersion: 0,
          })

          if (!tx) return null

          // Extract transaction details
          const blockTime = tx.blockTime ? new Date(tx.blockTime * 1000) : new Date()

          // Determine if it's a send or receive
          const preBalance = tx.meta?.preBalances?.[0] || 0
          const postBalance = tx.meta?.postBalances?.[0] || 0
          const balanceChange = (postBalance - preBalance) / LAMPORTS_PER_SOL

          const kind = balanceChange > 0 ? "receive" : balanceChange < 0 ? "send" : "other"

          // Try to find counterparty (simplified)
          const accounts = tx.transaction.message.accountKeys
          const counterparty = accounts.length > 1 ? accounts[1].pubkey.toBase58() : "Unknown"

          return {
            signature: sig.signature,
            kind,
            amountSol: Math.abs(balanceChange),
            counterparty,
            time: blockTime,
          }
        } catch (error) {
          console.error("Error parsing transaction:", error)
          return null
        }
      }),
    )

    return activities.filter((a): a is NonNullable<typeof a> => a !== null)
  } catch (error) {
    console.error("Error fetching activity:", error)
    return []
  }
}
