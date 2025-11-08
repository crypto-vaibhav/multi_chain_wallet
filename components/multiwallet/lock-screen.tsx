"use client"
import { useState } from "react"
import { useMultiWallet } from "./wallet-context"

export function LockScreen() {
  const { isLocked, unlock, createVault, importPrivateKey, setSelectedTab } = useMultiWallet()
  const [mode, setMode] = useState<"unlock" | "create" | "import">("unlock")
  const [password, setPassword] = useState("")
  const [chain, setChain] = useState<"solana" | "ethereum" | "bsc">("solana")
  const [pk, setPk] = useState("") // base64 for solana, 0x... for EVM
  const [loading, setLoading] = useState(false)

  const onSubmit = async () => {
    setLoading(true)
    try {
      if (mode === "unlock") {
        await unlock(password)
        setSelectedTab("home")
      } else if (mode === "create") {
        await createVault(password)
        setSelectedTab("home")
      } else {
        await importPrivateKey(chain, pk, password)
        setSelectedTab("home")
      }
    } catch (e: any) {
      alert(e?.message || "Action failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[60vh] max-w-md mx-auto mt-10 rounded-xl border bg-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <button
          className={`px-3 py-1 rounded ${mode === "unlock" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
          onClick={() => setMode("unlock")}
        >
          Unlock
        </button>
        <button
          className={`px-3 py-1 rounded ${mode === "create" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
          onClick={() => setMode("create")}
        >
          Create
        </button>
        <button
          className={`px-3 py-1 rounded ${mode === "import" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
          onClick={() => setMode("import")}
        >
          Import
        </button>
      </div>

      {mode === "import" && (
        <>
          <label className="text-sm">Chain</label>
          <select
            className="w-full border rounded p-2 mb-3 bg-background"
            value={chain}
            onChange={(e) => setChain(e.target.value as any)}
          >
            <option value="solana">Solana (base64 secret key)</option>
            <option value="ethereum">Ethereum (0x private key)</option>
            <option value="bsc">BSC (0x private key)</option>
          </select>

          <label className="text-sm">Private Key</label>
          <input
            className="w-full border rounded p-2 mb-3 bg-background"
            placeholder={chain === "solana" ? "base64 secret key" : "0x..."}
            value={pk}
            onChange={(e) => setPk(e.target.value)}
          />
        </>
      )}

      <label className="text-sm">Password</label>
      <input
        className="w-full border rounded p-2 mb-4 bg-background"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Vault password"
      />

      <button
        className="w-full px-4 py-2 rounded bg-primary text-primary-foreground disabled:opacity-50"
        disabled={loading}
        onClick={onSubmit}
      >
        {loading ? "Processing..." : mode === "unlock" ? "Unlock" : mode === "create" ? "Create Vault" : "Import Key"}
      </button>

      <p className="text-xs text-muted-foreground mt-3">
        - Solana expects a base64-encoded secret key (Uint8Array).{"\n"}- Ethereum/BSC expect a 0x-prefixed private key.
        {"\n"}- Your vault is encrypted locally with your password (AES-GCM).
      </p>
    </div>
  )
}
