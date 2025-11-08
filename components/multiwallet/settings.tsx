"use client"
import { useState } from "react"
import { useMultiWallet } from "./wallet-context"

export function SettingsView() {
  const { exportPrivateKey, lock } = useMultiWallet()
  const [chain, setChain] = useState<"solana" | "ethereum" | "bsc">("solana")
  const [password, setPassword] = useState("")
  const [pk, setPk] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleExport = async () => {
    try {
      const res = await exportPrivateKey(chain, password)
      setPk(res)
    } catch (e: any) {
      alert(e?.message || "Failed to export")
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-6">
      <div className="rounded-xl border bg-card p-6">
        <h3 className="font-semibold mb-4">Settings</h3>

        <label className="text-sm">Chain</label>
        <select
          className="w-full border rounded p-2 mb-3 bg-background"
          value={chain}
          onChange={(e) => setChain(e.target.value as any)}
        >
          <option value="solana">Solana</option>
          <option value="ethereum">Ethereum</option>
          <option value="bsc">BSC</option>
        </select>

        <label className="text-sm">Password</label>
        <input
          type="password"
          className="w-full border rounded p-2 mb-3 bg-background"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Confirm password to export"
        />

        <button className="px-4 py-2 rounded bg-primary text-primary-foreground" onClick={handleExport}>
          Export Private Key
        </button>

        {pk && (
          <div className="mt-4 rounded border p-3 bg-muted/30">
            <div className="text-xs text-muted-foreground mb-1">Private Key</div>
            <div className="font-mono break-all">{pk}</div>
            <button
              className="mt-2 px-3 py-1 rounded bg-secondary text-secondary-foreground text-sm"
              onClick={async () => {
                await navigator.clipboard.writeText(pk)
                setCopied(true)
                setTimeout(() => setCopied(false), 1000)
              }}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        )}

        <div className="mt-6 border-t pt-4">
          <button className="px-4 py-2 rounded bg-destructive text-destructive-foreground" onClick={lock}>
            Sign Out (Lock)
          </button>
        </div>
      </div>
    </main>
  )
}
