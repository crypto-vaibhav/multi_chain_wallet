"use client"

import { useWallet, Activity as ActivityType } from "./wallet-context"
import { ExternalLink } from "lucide-react"
import { getExplorerUrl } from "@/lib/wallet-utils"

export function Activity() {
  const { activities, selectedChain, selectedNetwork } = useWallet()

  const filteredActivities = activities.filter(
    (a: ActivityType) => a.chain === selectedChain
  )

  return (
    <div className="mx-auto w-full max-w-md p-4">
      <div className="rounded-2xl border bg-card text-card-foreground shadow">
        <div className="p-4 border-b font-semibold">Activity</div>
        <ul className="divide-y">
          {filteredActivities.length === 0 ? (
            <li className="p-4 text-sm text-center text-muted-foreground">
              No transactions for this chain.
            </li>
          ) : (
            filteredActivities.map((activity: ActivityType) => (
              <li key={activity.txHash} className="p-4 hover:bg-muted/50">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium capitalize">
                      {activity.type} {activity.symbol}
                    </div>
                    <div className="text-sm text-muted-foreground">
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
                        selectedNetwork
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline flex items-center gap-1 justify-end"
                    >
                      View on Explorer <ExternalLink size={12} />
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
