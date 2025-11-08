import { ethers } from "ethers"

export function getEthProvider(network: "mainnet" | "sepolia") {
  const envUrl = (process as any).env?.NEXT_PUBLIC_ETHEREUM_RPC_URL as string | undefined
  if (envUrl) return new ethers.JsonRpcProvider(envUrl)
  // fallback to Cloudflare for mainnet; sepolia requires custom RPC
  return new ethers.JsonRpcProvider("https://cloudflare-eth.com")
}

export function walletFromHexPrivateKey(hex: string, network: "mainnet" | "sepolia") {
  const provider = getEthProvider(network)
  const wallet = new ethers.Wallet(hex, provider)
  return wallet
}

export async function getEthBalance(address: string, network: "mainnet" | "sepolia") {
  let rpcUrls: string[] = []
  
  if (network === "mainnet") {
    rpcUrls = [
      process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL,
      "https://cloudflare-eth.com",
      "https://eth.llamarpc.com",
      "https://rpc.ankr.com/eth",
      "https://eth-mainnet.public.blastapi.io",
    ].filter(Boolean) as string[]
  } else {
    // Sepolia testnet fallbacks
    rpcUrls = [
      "https://rpc.sepolia.org",
      "https://rpc2.sepolia.org",
      "https://ethereum-sepolia.publicnode.com",
      "https://rpc-sepolia.rockx.com",
    ].filter(Boolean) as string[]
  }

  for (const url of rpcUrls) {
    try {
      const provider = new ethers.JsonRpcProvider(url)
      const bal = await provider.getBalance(address)
      return Number(ethers.formatEther(bal))
    } catch (error: any) {
      console.warn(`[ETH Balance] Failed to fetch from ${url}:`, error.message)
      continue
    }
  }
  
  console.error(`[ETH Balance] All RPC endpoints failed for address: ${address}`)
  return 0
}

export async function sendEth(params: {
  fromHex: string
  to: string
  amountEth: number
  network: "mainnet" | "sepolia"
}) {
  const { fromHex, to, amountEth, network } = params
  const wallet = walletFromHexPrivateKey(fromHex, network)
  const tx = await wallet.sendTransaction({ to, value: ethers.parseEther(String(amountEth)) })
  await tx.wait()
  return tx.hash
}

export type EthActivity = {
  signature: string
  kind: "send" | "receive" | "other"
  amountEth?: number
  counterparty?: string
  time?: string
}

export async function getEthActivity(address: string, network: "mainnet" | "sepolia"): Promise<EthActivity[]> {
  try {
    // Use Moralis API to fetch transaction history
    const chainId = network === "mainnet" ? "0x1" : "0xaa36a7" // mainnet or sepolia
    const apiKey = process.env.NEXT_PUBLIC_MORALIS_API_KEY
    
    if (!apiKey) {
      console.error("[ETH Activity] NEXT_PUBLIC_MORALIS_API_KEY is not set")
      return []
    }
    
    const url = `https://deep-index.moralis.io/api/v2.2/wallets/${address}/history?chain=${chainId}&limit=20`
    console.log("[ETH Activity] Fetching from:", url)
    
    const response = await fetch(url, {
      headers: {
        accept: "application/json",
        "X-API-Key": apiKey,
      },
    })

    if (!response.ok) {
      console.warn(`[ETH Activity] Moralis API error: ${response.status} - ${response.statusText}`)
      const errorText = await response.text()
      console.warn(`[ETH Activity] Error details:`, errorText)
      return []
    }

    const data = await response.json()
    console.log("[ETH Activity] Received data:", data)
    const activities: EthActivity[] = []

    if (data.result && Array.isArray(data.result)) {
      for (const tx of data.result) {
        const fromAddress = tx.from_address?.toLowerCase()
        const toAddress = tx.to_address?.toLowerCase()
        const userAddress = address.toLowerCase()
        const valueWei = tx.value || "0"
        const amountEth = Number(ethers.formatEther(valueWei))
        const timestamp = tx.block_timestamp
        const txHash = tx.hash

        let kind: "send" | "receive" | "other" = "other"
        let counterparty: string | undefined

        if (fromAddress === userAddress && toAddress !== userAddress) {
          kind = "send"
          counterparty = toAddress
        } else if (toAddress === userAddress && fromAddress !== userAddress) {
          kind = "receive"
          counterparty = fromAddress
        }

        activities.push({
          signature: txHash,
          kind,
          amountEth: amountEth > 0 ? amountEth : undefined,
          counterparty,
          time: timestamp,
        })
      }
    }

    console.log("[ETH Activity] Parsed activities:", activities)
    return activities
  } catch (error) {
    console.error("[ETH Activity] Error fetching activity:", error)
    return []
  }
}
