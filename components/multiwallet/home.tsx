"use client"
import { useMemo, useState } from "react"
import { useMultiWallet } from "./wallet-context"

export function HomeView() {
  const { balances, tokens, prices, selectedTab, setSelectedTab, chain, getReceiveAddress } = useMultiWallet()
  const [showSend, setShowSend] = useState(false)
  const [showReceive, setShowReceive] = useState(false)

  // approximate USD totals for native coins
  const nativeUsd = useMemo(() => {
    const sol = (balances.solana || 0) * (prices.solana || 0)
    const eth = (balances.ethereum || 0) * (prices.ethereum || 0)
    const bnb = (balances.bsc || 0) * (prices.binancecoin || 0)
    return sol + eth + bnb
  }, [balances, prices])

  const tokenUsd = useMemo(() => tokens.reduce((sum, t) => sum + (t.usd || 0), 0), [tokens])
  const totalUsd = useMemo(() => nativeUsd + tokenUsd, [nativeUsd, tokenUsd])

  return (
    <main className="max-w-3xl mx-auto px-4 py-6">
      <section className="rounded-xl border bg-card p-6 flex flex-col items-center text-center">
        <p className="text-sm text-muted-foreground">Total Portfolio</p>
        <h1 className="text-4xl font-semibold mt-1">${totalUsd.toFixed(2)}</h1>
        <div className="mt-4 flex gap-3">
          <button className="px-4 py-2 rounded bg-primary text-primary-foreground" onClick={() => setShowReceive(true)}>
            Receive
          </button>
          <button
            className="px-4 py-2 rounded bg-secondary text-secondary-foreground"
            onClick={() => setShowSend(true)}
          >
            Send
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Receiving on {chain}: {getReceiveAddress(chain)}
        </p>
      </section>

      <section className="mt-6">
        <h3 className="text-sm text-muted-foreground mb-2">Your Tokens</h3>
        <div className="rounded-xl border bg-card divide-y">
          {/* Native coins */}
          <div className="flex items-center justify-between p-4">
            <div>
              <div className="font-medium">SOL</div>
              <div className="text-xs text-muted-foreground">Solana</div>
            </div>
            <div className="text-right">
              <div className="font-medium">{(balances.solana || 0).toFixed(6)} SOL</div>
              <div className="text-xs text-muted-foreground">
                ${((balances.solana || 0) * (prices.solana || 0)).toFixed(2)}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between p-4">
            <div>
              <div className="font-medium">ETH</div>
              <div className="text-xs text-muted-foreground">Ethereum</div>
            </div>
            <div className="text-right">
              <div className="font-medium">{(balances.ethereum || 0).toFixed(6)} ETH</div>
              <div className="text-xs text-muted-foreground">
                ${((balances.ethereum || 0) * (prices.ethereum || 0)).toFixed(2)}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between p-4">
            <div>
              <div className="font-medium">BNB</div>
              <div className="text-xs text-muted-foreground">BSC</div>
            </div>
            <div className="text-right">
              <div className="font-medium">{(balances.bsc || 0).toFixed(6)} BNB</div>
              <div className="text-xs text-muted-foreground">
                ${((balances.bsc || 0) * (prices.binancecoin || 0)).toFixed(2)}
              </div>
            </div>
          </div>

          {/* ERC20 tokens */}
          {tokens.map((t, idx) => (
            <div key={idx} className="flex items-center justify-between p-4">
              <div>
                <div className="font-medium">{t.symbol}</div>
                <div className="text-xs text-muted-foreground">{t.chain.toUpperCase()}</div>
              </div>
              <div className="text-right">
                <div className="font-medium">{t.balance}</div>
                {t.usd !== undefined && <div className="text-xs text-muted-foreground">${t.usd.toFixed(2)}</div>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {showSend && <SendSheet onClose={() => setShowSend(false)} />}
      {showReceive && <ReceiveSheet onClose={() => setShowReceive(false)} />}
    </main>
  )
}

function SendSheet({ onClose }: { onClose: () => void }) {
  const { chain, tokens, send } = useMultiWallet()
  const [asset, setAsset] = useState<"native" | string>("native")
  const [to, setTo] = useState("")
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const erc20List = tokens.filter((t) => t.address && (t.chain === "ethereum" || t.chain === "bsc"))

  const onSubmit = async () => {
    setLoading(true)
    try {
      if (asset === "native") {
        await send({ chain, asset: "native", to, amount })
      } else {
        await send({ chain, asset: { erc20: asset as any }, to, amount })
      }
      onClose()
    } catch (e: any) {
      alert(e?.message || "Failed to send")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center p-4 z-50">
      <div className="w-full max-w-md rounded-xl border bg-background p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Send</h3>
          <button className="text-sm text-muted-foreground" onClick={onClose}>
            Close
          </button>
        </div>
        <label className="text-sm">Asset</label>
        <select
          className="w-full border rounded p-2 mb-3 bg-background"
          value={asset}
          onChange={(e) => setAsset(e.target.value)}
        >
          <option value="native">Native ({chain === "solana" ? "SOL" : chain === "ethereum" ? "ETH" : "BNB"})</option>
          {erc20List.map((t) => (
            <option key={t.address} value={t.address}>
              {t.symbol} ({t.chain.toUpperCase()})
            </option>
          ))}
        </select>

        <label className="text-sm">To</label>
        <input
          className="w-full border rounded p-2 mb-3 bg-background"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder={chain === "solana" ? "Solana address" : "0x..."}
        />

        <label className="text-sm">Amount</label>
        <input
          className="w-full border rounded p-2 mb-4 bg-background"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
        />

        <button
          className="w-full px-4 py-2 rounded bg-primary text-primary-foreground disabled:opacity-50"
          disabled={loading}
          onClick={onSubmit}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  )
}

function ReceiveSheet({ onClose }: { onClose: () => void }) {
  const { chain, setChain, getReceiveAddress, network } = useMultiWallet()
  const addr = getReceiveAddress(chain)
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center p-4 z-50">
      <div className="w-full max-w-md rounded-xl border bg-background p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Receive</h3>
          <button className="text-sm text-muted-foreground" onClick={onClose}>
            Close
          </button>
        </div>
        <label className="text-sm">Network</label>
        <select
          className="w-full border rounded p-2 mb-3 bg-background"
          value={chain}
          onChange={(e) => setChain(e.target.value as any)}
        >
          <option value="solana">Solana ({network.solana})</option>
          <option value="ethereum">Ethereum ({network.ethereum})</option>
          <option value="bsc">BSC ({network.bsc})</option>
        </select>

        <div className="rounded border p-3 bg-muted/30">
          <div className="text-xs text-muted-foreground mb-1">Your address</div>
          <div className="font-mono break-all">{addr}</div>
        </div>

        <button
          className="mt-3 w-full px-4 py-2 rounded bg-secondary text-secondary-foreground"
          onClick={() => {
            navigator.clipboard.writeText(addr || "")
          }}
        >
          Copy address
        </button>
      </div>
    </div>
  )
}
