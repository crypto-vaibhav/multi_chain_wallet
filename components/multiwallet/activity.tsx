"use client"
import Link from "next/link"
import { useMultiWallet } from "./wallet-context"

export function ActivityView() {
  const { activity } = useMultiWallet()
  if (!activity.length) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="rounded-xl border bg-card p-6 text-center text-muted-foreground">No recent activity</div>
      </main>
    )
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-6">
      <div className="rounded-xl border bg-card divide-y">
        {activity.map((a, i) => (
          <div key={i} className="p-4 flex items-center justify-between">
            <div className="text-sm">
              <div className="font-medium">{a.chain.toUpperCase()}</div>
              <div className="text-xs text-muted-foreground">{a.time}</div>
            </div>
            <div className="text-right">
              {"signature" in a ? (
                <Link
                  className="text-primary text-sm underline"
                  target="_blank"
                  href={`https://explorer.solana.com/tx/${a.signature}?cluster=${"mainnet"}`}
                >
                  View on Explorer
                </Link>
              ) : (
                <span className="text-xs font-mono break-all">
                  {a.hash.slice(0, 10)}...{a.hash.slice(-8)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
