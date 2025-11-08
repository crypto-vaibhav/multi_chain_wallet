"use client"

import { useState } from "react"
import { useWallet, formatBalance } from "./wallet-context"
import { ReceiveSheet } from "./receive-sheet"
import { SendSheet } from "./send-sheet"

export function Home() {
  const { chain, address, balance, tokens, refresh } = useWallet()
  const [openReceive, setOpenReceive] = useState(false)
  const [openSend, setOpenSend] = useState(false)

  return (
    <div className="mx-auto max-w-md p-4">
      <div className="rounded-2xl border bg-card text-card-foreground shadow p-4 mb-4">
        <div className="text-sm text-muted-foreground">Total Balance</div>
        <div className="text-3xl font-semibold mt-1">{formatBalance(chain, balance)}</div>
        <div className="mt-2 text-xs break-all text-muted-foreground">Address: {address}</div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button className="rounded-lg bg-primary text-primary-foreground py-2" onClick={() => setOpenReceive(true)}>
            Receive
          </button>
          <button className="rounded-lg bg-secondary text-secondary-foreground py-2" onClick={() => setOpenSend(true)}>
            Send
          </button>
        </div>
      </div>

      <div className="rounded-2xl border bg-card text-card-foreground shadow">
        <div className="p-4 border-b">Tokens</div>
        <ul className="divide-y">
          {tokens.length === 0 ? (
            <li className="p-4 text-sm text-muted-foreground">No tokens found</li>
          ) : (
            tokens.map((t) => (
              <li key={t.id} className="p-4 flex items-center justify-between">
                <span className="text-sm">{t.symbol || t.id.slice(0, 6) + "…"}</span>
                <span className="text-sm">{t.amount}</span>
              </li>
            ))
          )}
        </ul>
        <div className="p-4">
          <button className="text-xs underline text-muted-foreground" onClick={() => refresh()}>
            Refresh
          </button>
        </div>
      </div>

      <ReceiveSheet open={openReceive} onOpenChange={setOpenReceive} />
      <SendSheet open={openSend} onOpenChange={setOpenSend} />
    </div>
  )
}
