# Token Support Guide (USDC, USDT, and More)

## 📘 Overview

Your wallet now supports **ERC-20 tokens** (Ethereum and EVM chains) and **SPL tokens** (Solana), including popular tokens like:
- 💵 **Stablecoins**: USDC, USDT, DAI
- 🔄 **Wrapped Assets**: WETH, WBTC
- 🏦 **DeFi Tokens**: UNI, AAVE, LINK
- 🎭 **Meme Coins**: SHIB, PEPE
- And many more!

---

## 🪙 Supported Tokens

### **Stablecoins** (Available on Multiple Chains)

#### **USDC (USD Coin)**
- **Symbol**: USDC
- **Decimals**: 6
- **Chains**: Ethereum, Polygon, Avalanche, Arbitrum, Optimism, Base, BSC, Solana

**Contract Addresses:**
- Ethereum: `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`
- Polygon: `0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359`
- Arbitrum: `0xaf88d065e77c8cC2239327C5EDb3A432268e5831`
- Optimism: `0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85`
- Base: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- Avalanche: `0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E`
- BSC: `0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d`
- Solana: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`

#### **USDT (Tether)**
- **Symbol**: USDT
- **Decimals**: 6
- **Chains**: Ethereum, Polygon, Avalanche, Arbitrum, Optimism, BSC, Solana

**Contract Addresses:**
- Ethereum: `0xdAC17F958D2ee523a2206206994597C13D831ec7`
- Polygon: `0xc2132D05D31c914a87C6611C10748AEb04B58e8F`
- Arbitrum: `0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9`
- Optimism: `0x94b008aA00579c1307B0EF2c499aD98a8ce58e58`
- Avalanche: `0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7`
- BSC: `0x55d398326f99059fF775485246999027B3197955`
- Solana: `Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB`

#### **DAI (Dai Stablecoin)**
- **Symbol**: DAI
- **Decimals**: 18
- **Chains**: Ethereum, Polygon, Avalanche, Arbitrum, Optimism, Base, BSC

**Contract Addresses:**
- Ethereum: `0x6B175474E89094C44Da98b954EedeAC495271d0F`
- Polygon: `0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063`
- Arbitrum: `0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1`
- Optimism: `0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1`
- Base: `0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb`
- Avalanche: `0xd586E7F844cEa2F87f50152665BCbc2C279D8d70`
- BSC: `0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3`

---

## 📥 How to Receive Tokens (USDC, USDT, etc.)

### **Step-by-Step Guide:**

1. **Open Your Wallet**
   - Navigate to the wallet home screen

2. **Click "Receive" Button**
   - Opens the receive dialog

3. **Select the Chain**
   - Choose the blockchain network (Ethereum, Polygon, Arbitrum, etc.)
   - **Important**: The token must exist on this chain!

4. **Copy Your Address**
   - Click the copy button next to your address
   - This is your **same address** for all tokens on that chain

5. **Share Address with Sender**
   - Send the address to whoever is sending you tokens
   - Tell them which chain you're using

6. **Wait for Tokens**
   - Tokens will appear in your wallet automatically
   - May take a few seconds to minutes depending on network

### **Important Notes:**

✅ **Same Address for All ERC-20 Tokens**
- Your Ethereum address works for USDC, USDT, DAI, etc.
- Example: `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb3`
- This address receives ETH, USDC, USDT, LINK, UNI, etc. on Ethereum

✅ **Same Address Across EVM Chains**
- Your address is the SAME on Ethereum, Polygon, BSC, Arbitrum, etc.
- Example: `0x742d...bEb3` works on ALL EVM chains

✅ **Solana is Different**
- Solana has a different address format
- Example: `7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU`
- This address receives SOL, USDC (on Solana), USDT (on Solana), etc.

⚠️ **CRITICAL**: Always receive tokens on the correct chain!
- USDC on Ethereum ≠ USDC on Polygon (different blockchains!)
- Cannot send USDC from Ethereum to Polygon address directly
- Need a bridge for cross-chain transfers

---

## 📤 How to Send Tokens (USDC, USDT, etc.)

### **Method 1: Through Wallet UI**

1. **Click "Send" Button**
   - Opens send dialog

2. **Select Token**
   - Choose the token you want to send (USDC, USDT, DAI, etc.)
   - Wallet automatically detects which chain the token is on

3. **Enter Recipient Address**
   - Paste the recipient's address
   - Wallet validates the address format

4. **Enter Amount**
   - Type the amount of tokens to send
   - Shows your balance and USD value

5. **Review Transaction**
   - Check recipient, amount, and fees
   - Gas fees paid in native token (ETH, MATIC, etc.)

6. **Confirm and Send**
   - Transaction broadcasts to blockchain
   - Wait for confirmation

### **Method 2: Programmatic (Using Functions)**

```typescript
import { sendERC20Token } from "@/lib/wallet-utils"
import { getTokenContract } from "@/lib/tokens"

// Example: Send 100 USDC on Ethereum
const privateKey = "your_private_key"
const usdcContract = getTokenContract("USDC", "ethereum") // 0xA0b8...
const recipient = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb3"
const amount = "100" // 100 USDC
const rpcUrl = "https://ethereum.publicnode.com"

const txHash = await sendERC20Token(
  privateKey,
  usdcContract,
  recipient,
  amount,
  rpcUrl
)

console.log(`Transaction: ${txHash}`)
```

---

## 💰 Checking Token Balances

### **Programmatic Balance Check:**

```typescript
import { getERC20TokenBalance } from "@/lib/wallet-utils"
import { getTokenContract } from "@/lib/tokens"

// Check USDC balance on Ethereum
const usdcContract = getTokenContract("USDC", "ethereum")
const walletAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb3"
const rpcUrl = "https://ethereum.publicnode.com"

const { balance, symbol } = await getERC20TokenBalance(
  usdcContract,
  walletAddress,
  rpcUrl
)

console.log(`${symbol} Balance: ${balance}`)
// Output: "USDC Balance: 1234.56"
```

### **Check Multiple Tokens:**

```typescript
import { getMultipleERC20Balances } from "@/lib/wallet-utils"
import { DEFAULT_TOKENS_BY_CHAIN } from "@/lib/tokens"

// Get all default tokens for Ethereum
const tokens = DEFAULT_TOKENS_BY_CHAIN.ethereum // ["USDC", "USDT", "DAI", ...]
const contracts = tokens.map(t => getTokenContract(t, "ethereum"))

const balances = await getMultipleERC20Balances(
  contracts,
  walletAddress,
  rpcUrl
)

balances.forEach(({ symbol, balance }) => {
  console.log(`${symbol}: ${balance}`)
})
// Output:
// USDC: 1234.56
// USDT: 500.00
// DAI: 0
```

---

## 🔄 Cross-Chain Transfers

### **Important: Bridges Required!**

You **CANNOT** directly send tokens from one chain to another:
- ❌ Cannot send USDC from Ethereum directly to Polygon address
- ❌ Cannot send USDC from Arbitrum directly to Optimism

### **Solution: Use Bridges**

To move tokens between chains, use:

1. **Official Bridges:**
   - **Polygon Bridge**: https://wallet.polygon.technology/bridge
   - **Arbitrum Bridge**: https://bridge.arbitrum.io
   - **Optimism Bridge**: https://app.optimism.io/bridge
   - **Base Bridge**: https://bridge.base.org

2. **Third-Party Bridges:**
   - **Synapse**: https://synapseprotocol.com
   - **Hop Protocol**: https://app.hop.exchange
   - **Stargate**: https://stargate.finance
   - **Across**: https://across.to

3. **Centralized Exchanges:**
   - Send to exchange → Withdraw on different chain
   - More steps but often cheaper

---

## ⛽ Gas Fees

### **Understanding Gas:**

When sending tokens, you pay gas fees in the **native token** of the chain:

| Chain | Native Token | Used For Gas |
|-------|--------------|--------------|
| Ethereum | ETH | ✅ |
| Polygon | MATIC | ✅ |
| BSC | BNB | ✅ |
| Arbitrum | ETH | ✅ |
| Optimism | ETH | ✅ |
| Base | ETH | ✅ |
| Avalanche | AVAX | ✅ |
| Solana | SOL | ✅ |

### **Example:**
- Sending USDC on Ethereum requires ETH for gas
- Sending USDC on Polygon requires MATIC for gas
- You must have native tokens to send ERC-20 tokens!

### **Gas Fee Estimates:**

| Chain | Typical Gas Fee | Speed |
|-------|----------------|-------|
| Ethereum | $5-50 | 15 sec - 5 min |
| Polygon | $0.01-0.10 | 2-5 sec |
| BSC | $0.10-0.50 | 3 sec |
| Arbitrum | $0.10-1 | 15 sec |
| Optimism | $0.10-1 | 15 sec |
| Base | $0.01-0.10 | 2 sec |
| Avalanche | $0.50-2 | 2 sec |
| Solana | $0.00025 | 1 sec |

---

## 🛡️ Security Best Practices

### **Before Sending:**
1. ✅ **Double-check recipient address** - Transactions are irreversible!
2. ✅ **Verify the chain** - USDC on Ethereum ≠ USDC on Polygon
3. ✅ **Check gas balance** - Ensure you have native tokens for fees
4. ✅ **Start with small amounts** - Test with $10 before sending $10,000
5. ✅ **Save recipient address** - Create contact if sending frequently

### **Before Receiving:**
1. ✅ **Confirm chain with sender** - Which blockchain are they using?
2. ✅ **Share correct address** - Match the chain they're sending from
3. ✅ **Wait for confirmations** - Don't panic if tokens don't appear instantly
4. ✅ **Check transaction** - Use block explorer to track

### **Common Mistakes to Avoid:**
- ❌ Sending tokens to exchange without memo/tag (for some chains)
- ❌ Sending tokens on wrong chain (lost forever!)
- ❌ Not having gas fees (transaction will fail)
- ❌ Typing address manually (always copy/paste)
- ❌ Sending to smart contract without checking compatibility

---

## 📊 Token Display in Wallet

The wallet automatically shows:
- ✅ Token symbol (USDC, USDT, DAI, etc.)
- ✅ Token balance with correct decimals
- ✅ USD value (from CoinGecko prices)
- ✅ Chain indicator (which blockchain)
- ✅ Price charts and stats

### **Token Detection:**
The wallet will:
1. Scan for popular tokens on each chain
2. Show tokens with balance > 0
3. Update prices every 5 minutes
4. Display in "Your Assets" section

---

## 🔧 Advanced: Adding Custom Tokens

To add a custom ERC-20 token:

1. **Get Contract Address**
   - Find on Etherscan, CoinGecko, or project website

2. **Add to tokens.ts:**
```typescript
export const SUPPORTED_TOKENS: Record<string, TokenInfo> = {
  // ... existing tokens
  YOUR_TOKEN: {
    symbol: "TKN",
    name: "Your Token",
    decimals: 18,
    coingeckoId: "your-token",
    contracts: {
      ethereum: "0x...", // contract address
      polygon: "0x...",
    },
  },
}
```

3. **Add to Default List:**
```typescript
export const DEFAULT_TOKENS_BY_CHAIN: Record<Chain, string[]> = {
  ethereum: ["USDC", "USDT", "DAI", "YOUR_TOKEN"], // Add here
  // ...
}
```

---

## 🧪 Testing with Testnet Tokens

### **Get Testnet USDC:**

**Ethereum Sepolia:**
- Faucet: https://faucet.circle.com
- Contract: Check Circle's documentation

**Polygon Amoy:**
- Use testnet faucet
- Bridge from Sepolia

**Arbitrum Sepolia:**
- Bridge from Ethereum Sepolia

---

## 📞 Troubleshooting

### **"Transaction Failed" Error:**
- ✅ Check gas balance (need ETH, MATIC, etc.)
- ✅ Increase gas limit
- ✅ Check recipient address is valid
- ✅ Ensure you have enough token balance

### **"Tokens Not Showing":**
- ✅ Refresh wallet
- ✅ Check correct chain is selected
- ✅ Verify tokens sent to correct address
- ✅ Check transaction on block explorer
- ✅ Wait for network confirmations

### **"Insufficient Funds for Gas":**
- ✅ Get native tokens (ETH, MATIC, etc.)
- ✅ Use faucet for testnets
- ✅ Buy on exchange and transfer

---

## 📚 Quick Reference

### **Sending USDC:**
1. Click "Send"
2. Select USDC
3. Enter recipient address (same chain!)
4. Enter amount
5. Confirm (needs gas in native token)

### **Receiving USDC:**
1. Click "Receive"
2. Select chain (Ethereum, Polygon, etc.)
3. Copy address
4. Share with sender
5. Wait for confirmation

### **Checking Balance:**
- View in "Your Assets" section
- Shows all tokens with balance > 0
- Click token for details and chart

---

## 🚀 Coming Soon

- [ ] **Token Swap** - Exchange tokens directly in wallet
- [ ] **Cross-chain Bridge** - Move tokens between chains
- [ ] **Token Approvals** - Manage DApp permissions
- [ ] **NFT Support** - View and send NFTs
- [ ] **Custom Token Import** - Add any ERC-20/SPL token
- [ ] **Gas Optimization** - Auto-calculate best gas price

---

**Made with ❤️ - Trade safely!**
