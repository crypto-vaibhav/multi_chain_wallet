"use client"

import { useEffect, useMemo, useState } from "react"
import { useWallet } from "./multi-wallet-context"
import { Card } from "@/components/ui/card"
import { getSolActivity, type SolNetwork } from "@/lib/solana-multi"

type UiActivity = {
  id: string
  when?: string
  summary: string
  link?: string
  chain?: string
}

export function WalletActivity() {
  const { selectedChain, selectedNetwork, getAddress, activities, accounts, isTestnetMode } = useWallet()
  const [remote, setRemote] = useState<UiActivity[] | null>(null)
  const address = getAddress()

  // Get all wallet addresses for filtering
  const walletAddresses = useMemo(() => {
    return new Set(accounts.map(a => a.address.toLowerCase()))
  }, [accounts])

  // Filter activities to only show transactions from THIS wallet's addresses
  const local = useMemo<UiActivity[]>(() => {
    return activities
      .filter(activity => {
        // Only show activities where the "from" address is one of our wallet addresses
        const fromAddress = activity.from.toLowerCase()
        const toAddress = activity.to.toLowerCase()
        // Show if we sent it OR received it
        return walletAddresses.has(fromAddress) || walletAddresses.has(toAddress)
      })
      .slice(0, 50)
      .map((a) => ({
        id: a.txHash,
        when: new Date(a.timestamp).toLocaleString(),
        summary: `[${a.chain.toUpperCase()}] ${a.type === "sent" ? "Sent" : "Received"} ${a.amount.toFixed(4)} ${a.symbol} ${a.type === "sent" ? "to" : "from"} ${(a.type === "sent" ? a.to : a.from).slice(0, 8)}...`,
        chain: a.chain,
      }))
  }, [activities, walletAddresses])

  useEffect(() => {
    let ignore = false
    async function fetchRemote() {
      try {
        // Fetch Solana activity ONLY for our Solana account
        const solanaAccount = accounts.find(a => a.chain === "solana")
        if (solanaAccount) {
          const net: SolNetwork = isTestnetMode ? "devnet" : "mainnet-beta"
          const acts = await getSolActivity(solanaAccount.address, net)
          if (ignore) return
          
          // Filter to only show transactions for this specific wallet address
          const filteredActs = acts.filter(a => {
            // Check if this transaction involves our Solana address
            // This ensures we don't show random transactions
            return true // The getSolActivity already filters by address
          })
          
          setRemote(
            filteredActs.map((a) => ({
              id: a.signature,
              when: a.time,
              summary: `[SOLANA] Transaction ${a.signature.slice(0, 8)}...`,
              link:
                net === "mainnet-beta"
                  ? `https://explorer.solana.com/tx/${a.signature}`
                  : `https://explorer.solana.com/tx/${a.signature}?cluster=devnet`,
              chain: "solana" as const,
            })),
          )
        } else {
          setRemote([])
        }
      } catch {
        setRemote([])
      }
    }
    fetchRemote()
    return () => {
      ignore = true
    }
  }, [accounts, isTestnetMode])

  const items: UiActivity[] = useMemo(() => {
    const merged = [...(remote || []), ...local]
    const seen = new Set<string>()
    // Sort by timestamp (newest first)
    return merged
      .filter((i) => (seen.has(i.id) ? false : (seen.add(i.id), true)))
      .sort((a, b) => {
        if (!a.when) return 1
        if (!b.when) return -1
        return new Date(b.when).getTime() - new Date(a.when).getTime()
      })
  }, [remote, local])

  return (
    <div className="space-y-4">
      <div className="bg-white border border-zinc-200 rounded-xl p-5">
        <h3 className="text-black font-semibold text-base mb-4">All Transactions</h3>
        <p className="text-zinc-500 text-xs mb-4">Showing activity from all chains (Solana, Ethereum, BSC)</p>
        <div className="space-y-2">
          {items.length === 0 ? (
            <div className="p-4 bg-zinc-50 rounded-lg">
              <p className="text-zinc-600 text-sm">No transactions yet</p>
              <p className="text-zinc-400 text-xs mt-1">Your transactions from all chains will appear here</p>
            </div>
          ) : (
            items.map((a) => (
              <div key={a.id} className="p-3 bg-zinc-50 border border-zinc-100 rounded-lg flex items-center justify-between hover:bg-zinc-100 transition-colors">
                <div className="flex-1 pr-2">
                  <p className="text-black text-sm font-medium">{a.summary}</p>
                  {a.when && <p className="text-zinc-500 text-xs mt-1">{a.when}</p>}
                </div>
                {a.link && (
                  <a
                    href={a.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-black text-xs font-medium hover:underline flex-shrink-0"
                  >
                    View
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4">
        <p className="text-zinc-600 text-sm">
          💡 Combined view: All transactions from Solana, Ethereum, and BSC in one place. Chain labels show which network each transaction is on.
        </p>
      </div>
    </div>
  )
}
