import { ethers } from "ethers"

export type EvmChain = "ethereum" | "bsc"
export type EvmNetwork = "mainnet" | "testnet"
export type EvmAddress = `0x${string}`

export const EVM_RPC: Record<EvmChain, Record<EvmNetwork, string>> = {
  ethereum: {
    mainnet: "https://cloudflare-eth.com",
    testnet: "https://sepolia.gateway.tenderly.co", // public test RPC
  },
  bsc: {
    mainnet: "https://bsc-dataseed.binance.org",
    testnet: "https://data-seed-prebsc-1-s1.binance.org:8545",
  },
}

export function getEvmProvider(chain: EvmChain, network: EvmNetwork) {
  const overrideVar =
    chain === "ethereum" ? process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL : process.env.NEXT_PUBLIC_BSC_RPC_URL
  const url = overrideVar || EVM_RPC[chain][network]
  return new ethers.JsonRpcProvider(url)
}

export function getEvmWallet(privateKeyHex: string, chain: EvmChain, network: EvmNetwork) {
  const provider = getEvmProvider(chain, network)
  return new ethers.Wallet(privateKeyHex, provider)
}

export async function getEvmNativeBalance(address: EvmAddress, chain: EvmChain, network: EvmNetwork) {
  const provider = getEvmProvider(chain, network)
  const wei = await provider.getBalance(address)
  return Number(ethers.formatEther(wei))
}

// ERC20 ABI (subset)
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "function transfer(address to, uint256 amount) returns (bool)",
]

export async function getErc20Balance(
  tokenAddress: EvmAddress,
  owner: EvmAddress,
  chain: EvmChain,
  network: EvmNetwork,
) {
  const provider = getEvmProvider(chain, network)
  const c = new ethers.Contract(tokenAddress, ERC20_ABI, provider)
  const [bal, decimals, symbol, name] = await Promise.all([c.balanceOf(owner), c.decimals(), c.symbol(), c.name()])
  return { balance: Number(ethers.formatUnits(bal, decimals)), symbol, name, decimals }
}

export async function sendEvmNative(
  privateKeyHex: string,
  to: EvmAddress,
  amountEth: string,
  chain: EvmChain,
  network: EvmNetwork,
) {
  const wallet = getEvmWallet(privateKeyHex, chain, network)
  const tx = await wallet.sendTransaction({ to, value: ethers.parseEther(amountEth) })
  return await tx.wait()
}

export async function sendErc20(
  privateKeyHex: string,
  tokenAddress: EvmAddress,
  to: EvmAddress,
  amount: string,
  chain: EvmChain,
  network: EvmNetwork,
) {
  const wallet = getEvmWallet(privateKeyHex, chain, network)
  const c = new ethers.Contract(tokenAddress, ERC20_ABI, wallet)
  const decimals: number = await c.decimals()
  const tx = await c.transfer(to, ethers.parseUnits(amount, decimals))
  return await tx.wait()
}
