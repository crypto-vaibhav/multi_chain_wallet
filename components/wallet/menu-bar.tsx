"use client"

import { useWallet } from "./wallet-context"

export function MenuBar() {
  const { tab, setTab, chain, setChain, solNetwork, setSolNetwork, ethNetwork, setEthNetwork, lock } = useWallet()

  return (
    <header className="w-full sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-b">
      <div className="mx-auto max-w-md px-4 py-3 flex items-center justify-between">
        <div className="font-semibold">Wallet</div>
        <nav className="flex items-center gap-2">
          <button
            className={`px-3 py-1 rounded ${tab === "home" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            onClick={() => setTab("home")}
          >
            Home
          </button>
          <button
            className={`px-3 py-1 rounded ${tab === "activity" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            onClick={() => setTab("activity")}
          >
            Activity
          </button>
          <button
            className={`px-3 py-1 rounded ${tab === "settings" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            onClick={() => setTab("settings")}
          >
            Settings
          </button>
        </nav>
        <div className="flex items-center gap-2">
          <select
            value={chain}
            onChange={(e) => setChain(e.target.value as any)}
            className="bg-transparent border rounded px-2 py-1"
            aria-label="Select chain"
          >
            <option value="solana">Solana</option>
            <option value="ethereum">Ethereum</option>
          </select>
          {chain === "solana" ? (
            <select
              value={solNetwork}
              onChange={(e) => setSolNetwork(e.target.value as any)}
              className="bg-transparent border rounded px-2 py-1"
              aria-label="Select Solana network"
            >
              <option value="devnet">Devnet</option>
              <option value="testnet">Testnet</option>
              <option value="mainnet-beta">Mainnet</option>
            </select>
          ) : (
            <select
              value={ethNetwork}
              onChange={(e) => setEthNetwork(e.target.value as any)}
              className="bg-transparent border rounded px-2 py-1"
              aria-label="Select Ethereum network"
            >
              <option value="mainnet">Mainnet</option>
              <option value="sepolia">Sepolia</option>
            </select>
          )}
          <button className="px-3 py-1 rounded hover:bg-muted" onClick={() => lock()} aria-label="Lock wallet">
            Lock
          </button>
        </div>
      </div>
    </header>
  )
}
