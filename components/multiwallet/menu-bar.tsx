"use client"
import { useMultiWallet } from "./wallet-context"

export function MenuBar() {
  const { selectedTab, setSelectedTab, chain, setChain, network, setNetwork, accounts } = useMultiWallet()
  return (
    <header className="w-full sticky top-0 z-20 backdrop-blur bg-background/60 border-b">
      <div className="max-w-3xl mx-auto flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-3">
          <span className="font-semibold">Multi Wallet</span>
          <nav className="flex items-center gap-2 text-sm">
            <button
              className={`px-3 py-1 rounded ${selectedTab === "home" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              onClick={() => setSelectedTab("home")}
            >
              Home
            </button>
            <button
              className={`px-3 py-1 rounded ${selectedTab === "activity" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              onClick={() => setSelectedTab("activity")}
            >
              Activity
            </button>
            <button
              className={`px-3 py-1 rounded ${selectedTab === "settings" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              onClick={() => setSelectedTab("settings")}
            >
              Settings
            </button>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="px-2 py-1 rounded border bg-background"
            value={chain}
            onChange={(e) => setChain(e.target.value as any)}
          >
            <option value="solana">Solana</option>
            <option value="ethereum">Ethereum</option>
            <option value="bsc">BSC</option>
          </select>
          <select
            className="px-2 py-1 rounded border bg-background"
            value={chain === "solana" ? network.solana : chain === "ethereum" ? network.ethereum : network.bsc}
            onChange={(e) =>
              setNetwork(
                chain === "solana"
                  ? { solana: e.target.value as any }
                  : chain === "ethereum"
                    ? { ethereum: e.target.value as any }
                    : { bsc: e.target.value as any },
              )
            }
          >
            {chain === "solana" ? (
              <>
                <option value="devnet">Devnet</option>
                <option value="mainnet-beta">Mainnet</option>
              </>
            ) : (
              <>
                <option value="testnet">Testnet</option>
                <option value="mainnet">Mainnet</option>
              </>
            )}
          </select>
          <span className="text-xs text-muted-foreground">
            {accounts[chain]?.address?.slice(0, 6)}...{accounts[chain]?.address?.slice(-4)}
          </span>
        </div>
      </div>
    </header>
  )
}
