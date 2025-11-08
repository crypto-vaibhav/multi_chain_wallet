"use client"

import { useState } from "react"
import { useWallet } from "./wallet-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

export default function LockScreen() {
  const { state, createWallet, importFromSecretKey, unlock } = useWallet()
  const { toast } = useToast()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [secret, setSecret] = useState("")
  const [isBusy, setIsBusy] = useState(false)

  const hasWallet = state.status !== "empty"

  async function handleCreate() {
    if (password.length < 8 || password !== confirm) {
      toast({
        title: "Invalid password",
        description: "Use 8+ characters and confirm exactly.",
        variant: "destructive",
      })
      return
    }
    setIsBusy(true)
    try {
      await createWallet(password)
      toast({ title: "Wallet created", description: "Your wallet is ready. Use your password to unlock." })
    } catch (e: any) {
      toast({ title: "Create failed", description: e?.message ?? "Unknown error", variant: "destructive" })
    } finally {
      setIsBusy(false)
    }
  }

  async function handleImport() {
    if (password.length < 8 || password !== confirm) {
      toast({
        title: "Invalid password",
        description: "Use 8+ characters and confirm exactly.",
        variant: "destructive",
      })
      return
    }
    setIsBusy(true)
    try {
      await importFromSecretKey(secret, password)
      toast({ title: "Wallet imported", description: "Use your password to unlock." })
    } catch (e: any) {
      toast({ title: "Import failed", description: e?.message ?? "Unknown error", variant: "destructive" })
    } finally {
      setIsBusy(false)
    }
  }

  async function handleUnlock() {
    setIsBusy(true)
    try {
      await unlock(password)
      toast({ title: "Unlocked", description: "Welcome back!" })
    } catch (e: any) {
      toast({ title: "Unlock failed", description: e?.message ?? "Wrong password?", variant: "destructive" })
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 shadow-2xl">
        <h1 className="text-3xl text-white mb-6">{hasWallet ? "Unlock Wallet" : "Create or Import"}</h1>

        {hasWallet ? (
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Enter password"
              className="bg-black/20 border-white/10 text-white h-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              disabled={isBusy}
              onClick={handleUnlock}
              className="w-full bg-white/20 text-white hover:bg-white/30 h-12"
            >
              {isBusy ? "Unlocking..." : "Unlock"}
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid grid-cols-2 bg-white/10">
              <TabsTrigger
                value="create"
                className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
              >
                Create
              </TabsTrigger>
              <TabsTrigger
                value="import"
                className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
              >
                Import
              </TabsTrigger>
            </TabsList>
            <TabsContent value="create" className="space-y-4 mt-4">
              <Input
                type="password"
                placeholder="Set password (8+ chars)"
                className="bg-black/20 border-white/10 text-white h-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Confirm password"
                className="bg-black/20 border-white/10 text-white h-12"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
              <Button
                disabled={isBusy}
                onClick={handleCreate}
                className="w-full bg-white/20 text-white hover:bg-white/30 h-12"
              >
                {isBusy ? "Creating..." : "Create Wallet"}
              </Button>
              <p className="text-xs text-white/50">
                This demo stores your encrypted key locally. Save your secret export after unlocking.
              </p>
            </TabsContent>
            <TabsContent value="import" className="space-y-4 mt-4">
              <Input
                type="text"
                placeholder="Paste base58 secret key (64-byte)"
                className="bg-black/20 border-white/10 text-white h-12"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Set password (8+ chars)"
                className="bg-black/20 border-white/10 text-white h-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Confirm password"
                className="bg-black/20 border-white/10 text-white h-12"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
              <Button
                disabled={isBusy}
                onClick={handleImport}
                className="w-full bg-white/20 text-white hover:bg-white/30 h-12"
              >
                {isBusy ? "Importing..." : "Import Wallet"}
              </Button>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}

export { LockScreen }
