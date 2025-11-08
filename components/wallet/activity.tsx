"use client"

import { useWallet, type Activity } from "./multi-wallet-context"
import { ExternalLink } from "lucide-react"
import { getExplorerUrl } from "@/lib/wallet-utils"

export function WalletActivity() {
  const { activities, selectedChain, isTestnetMode } = useWallet()

  // Show all activities from all chains
  const allActivities = activities

  return (
    <div className="mx-auto w-full max-w-md p-4">
      <div className="rounded-2xl border bg-white text-black shadow">
        <div className="p-4 border-b border-zinc-200 font-semibold text-black">
          All Transactions
        </div>
        <ul className="divide-y divide-zinc-200">
          {allActivities.length === 0 ? (
            <li className="p-4 text-sm text-center text-zinc-500">
              No transactions yet.
            </li>
          ) : (
            allActivities.map((activity: Activity) => (
              <li key={activity.txHash} className="p-4 hover:bg-zinc-50 transition-colors">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-black">
                      <span className="text-xs bg-zinc-100 px-2 py-0.5 rounded mr-2">
                        [{activity.chain.toUpperCase()}]
                      </span>
                      <span className="capitalize">{activity.type}</span> {activity.symbol}
                    </div>
                    <div className="text-sm text-zinc-500 mt-1">
                      {new Date(activity.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`font-semibold ${
                        activity.type === "sent"
                          ? "text-red-500"
                          : "text-green-500"
                      }`}
                    >
                      {activity.type === "sent" ? "-" : "+"}
                      {activity.amount.toFixed(4)} {activity.symbol}
                    </div>
                    <a
                      href={getExplorerUrl(
                        activity.chain,
                        activity.txHash,
                        isTestnetMode ? "testnet" : "mainnet"
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline flex items-center gap-1 justify-end mt-1"
                    >
                      View <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}
