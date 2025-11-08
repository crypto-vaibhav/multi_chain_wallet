"use client"

import { useState } from "react"
import { useWallet } from "./multi-wallet-context"

export function Settings() {
  const { selectedChain, exportPrivateKey, lock } = useWallet()
  const [password, setPassword] = useState("")
  const [revealed, setRevealed] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleReveal() {
    setError(null)
    try {
      const key = await exportPrivateKey(password, selectedChain)
      setRevealed(key)
    } catch (e: any) {
      setError(e?.message || "Failed to export private key")
    }
  }

  function handleSignOut() {
    lock()
  }

  return (
    <div className="mx-auto max-w-md p-4">
      <div className="rounded-2xl border bg-card text-card-foreground shadow p-4">
        <div className="text-lg font-medium mb-2">Security</div>
        <label className="text-sm">Confirm Password</label>
        <input
          type="password"
          className="mt-1 w-full rounded border bg-background px-3 py-2"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="mt-3 rounded bg-primary text-primary-foreground px-3 py-2" onClick={handleReveal}>
          Reveal Private Key
        </button>
        {error && <div className="mt-2 text-sm text-destructive">{error}</div>}
        {revealed && (
          <div className="mt-3">
            <div className="text-xs text-muted-foreground mb-1">Private Key ({selectedChain})</div>
            <div className="text-xs break-all rounded border bg-muted/50 p-2">{revealed}</div>
          </div>
        )}
        <div className="mt-6 border-t pt-4">
          <button className="rounded bg-secondary text-secondary-foreground px-3 py-2" onClick={handleSignOut}>
            Sign Out (Lock)
          </button>
          <div className="mt-2 text-xs text-muted-foreground">This locks your wallet and clears keys from memory.</div>
        </div>
      </div>
    </div>
  )
}
