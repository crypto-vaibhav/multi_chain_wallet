"use client"

import { WalletProvider, useWallet } from "./wallet-context"
import { MenuBar } from "./menu-bar"
import { Home } from "./home"
import { Activity } from "./activity"
import { Settings } from "./settings"
import { LockScreen } from "./lock-screen"

function Inner() {
  const { locked, tab } = useWallet()
  if (locked) return <LockScreen />
  return (
    <div className="min-h-[100dvh]">
      <MenuBar />
      <main>
        {tab === "home" && <Home />}
        {tab === "activity" && <Activity />}
        {tab === "settings" && <Settings />}
      </main>
    </div>
  )
}

export function WalletApp() {
  return (
    <WalletProvider>
      <Inner />
    </WalletProvider>
  )
}
