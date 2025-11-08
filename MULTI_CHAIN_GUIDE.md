# Multi-Chain Wallet Support Guide

## 🌐 Supported Blockchains

Your wallet now supports **10 major blockchain networks**:

### 1. **Solana (SOL)**
- **Type**: Layer 1 blockchain
- **Networks**: Mainnet, Devnet, Testnet
- **Native Token**: SOL
- **Explorer**: https://explorer.solana.com
- **CoinGecko ID**: solana

### 2. **Ethereum (ETH)**
- **Type**: Layer 1 blockchain  
- **Networks**: Mainnet, Sepolia (testnet)
- **Native Token**: ETH
- **Chain IDs**: Mainnet (1), Sepolia (11155111)
- **Explorer**: https://etherscan.io
- **CoinGecko ID**: ethereum

### 3. **BNB Smart Chain (BNB)**
- **Type**: Layer 1 blockchain
- **Networks**: Mainnet, Testnet
- **Native Token**: BNB
- **Chain IDs**: Mainnet (56), Testnet (97)
- **Explorer**: https://bscscan.com
- **CoinGecko ID**: binancecoin

### 4. **Polygon (MATIC)**
- **Type**: Layer 2 (Ethereum sidechain)
- **Networks**: Mainnet, Amoy (testnet)
- **Native Token**: MATIC
- **Chain IDs**: Mainnet (137), Amoy (80002)
- **Explorer**: https://polygonscan.com
- **CoinGecko ID**: matic-network

### 5. **Avalanche (AVAX)**
- **Type**: Layer 1 blockchain
- **Networks**: C-Chain Mainnet, Fuji (testnet)
- **Native Token**: AVAX
- **Chain IDs**: Mainnet (43114), Fuji (43113)
- **Explorer**: https://snowtrace.io
- **CoinGecko ID**: avalanche-2

### 6. **Arbitrum (ETH)**
- **Type**: Layer 2 (Ethereum rollup)
- **Networks**: Mainnet, Sepolia (testnet)
- **Native Token**: ETH
- **Chain IDs**: Mainnet (42161), Sepolia (421614)
- **Explorer**: https://arbiscan.io
- **CoinGecko ID**: ethereum

### 7. **Optimism (ETH)**
- **Type**: Layer 2 (Ethereum rollup)
- **Networks**: Mainnet, Sepolia (testnet)
- **Native Token**: ETH
- **Chain IDs**: Mainnet (10), Sepolia (11155420)
- **Explorer**: https://optimistic.etherscan.io
- **CoinGecko ID**: ethereum

### 8. **Base (ETH)**
- **Type**: Layer 2 (Ethereum rollup by Coinbase)
- **Networks**: Mainnet, Sepolia (testnet)
- **Native Token**: ETH
- **Chain IDs**: Mainnet (8453), Sepolia (84532)
- **Explorer**: https://basescan.org
- **CoinGecko ID**: ethereum

### 9. **Fantom (FTM)**
- **Type**: Layer 1 blockchain
- **Networks**: Mainnet, Testnet
- **Native Token**: FTM
- **Chain IDs**: Mainnet (250), Testnet (4002)
- **Explorer**: https://ftmscan.com
- **CoinGecko ID**: fantom

### 10. **Celo (CELO)**
- **Type**: Layer 1 blockchain (mobile-first)
- **Networks**: Mainnet, Alfajores (testnet)
- **Native Token**: CELO
- **Chain IDs**: Mainnet (42220), Alfajores (44787)
- **Explorer**: https://celoscan.io
- **CoinGecko ID**: celo

---

## 🔌 RPC Endpoints

Each chain has multiple RPC fallback endpoints for reliability:

### Solana RPCs
**Mainnet:**
- https://api.mainnet-beta.solana.com
- https://solana-mainnet.g.alchemy.com/v2/demo
- https://rpc.ankr.com/solana

**Devnet:**
- https://api.devnet.solana.com
- https://rpc.ankr.com/solana_devnet

### Ethereum RPCs
**Mainnet:**
- https://ethereum.publicnode.com
- https://eth.llamarpc.com
- https://rpc.ankr.com/eth

**Sepolia:**
- https://ethereum-sepolia.publicnode.com
- https://rpc.ankr.com/eth_sepolia

### BNB Chain RPCs
**Mainnet:**
- https://bsc-dataseed.binance.org
- https://rpc.ankr.com/bsc

**Testnet:**
- https://bsc-testnet.publicnode.com
- https://data-seed-prebsc-1-s1.binance.org:8545

### Polygon RPCs
**Mainnet:**
- https://polygon-rpc.com
- https://rpc.ankr.com/polygon

**Amoy:**
- https://rpc-amoy.polygon.technology
- https://polygon-amoy-bor-rpc.publicnode.com

### Avalanche RPCs
**Mainnet:**
- https://api.avax.network/ext/bc/C/rpc
- https://rpc.ankr.com/avalanche

**Fuji:**
- https://api.avax-test.network/ext/bc/C/rpc
- https://rpc.ankr.com/avalanche_fuji

### Arbitrum RPCs
**Mainnet:**
- https://arb1.arbitrum.io/rpc
- https://rpc.ankr.com/arbitrum

**Sepolia:**
- https://sepolia-rollup.arbitrum.io/rpc

### Optimism RPCs
**Mainnet:**
- https://mainnet.optimism.io
- https://rpc.ankr.com/optimism

**Sepolia:**
- https://sepolia.optimism.io

### Base RPCs
**Mainnet:**
- https://mainnet.base.org
- https://base.llamarpc.com

**Sepolia:**
- https://sepolia.base.org

### Fantom RPCs
**Mainnet:**
- https://rpc.ftm.tools
- https://rpc.ankr.com/fantom

**Testnet:**
- https://rpc.testnet.fantom.network

### Celo RPCs
**Mainnet:**
- https://forno.celo.org
- https://rpc.ankr.com/celo

**Alfajores:**
- https://alfajores-forno.celo-testnet.org

---

## 📝 How to Receive Tokens

### For All Chains:
1. **Open your wallet** and navigate to the Home tab
2. **Click "Receive"** button
3. **Select the chain** you want to receive on (Solana, Ethereum, Polygon, etc.)
4. **Copy your address** for that specific chain
5. **Share the address** with the sender
6. **Wait for confirmation** - tokens will appear in your wallet automatically

### Important Notes:
- ⚠️ Each chain has a **different address format**
- ⚠️ **Solana addresses** are Base58 encoded (e.g., `7xKXt...abc123`)
- ⚠️ **EVM addresses** (ETH, BSC, Polygon, etc.) are hex format (e.g., `0x742d...ef456`)
- ⚠️ **DO NOT** send tokens from one chain to another chain's address!

---

## 💸 How to Send Tokens

### For All Chains:
1. **Open your wallet** and navigate to the Home tab
2. **Click "Send"** button
3. **Select the asset** you want to send (SOL, ETH, BNB, MATIC, etc.)
4. The wallet will **automatically select the correct chain**
5. **Enter recipient address** (wallet validates the format)
6. **Enter amount** to send
7. **Review transaction** details
8. **Confirm** to broadcast the transaction

### Address Validation:
- ✅ Wallet **automatically validates** addresses based on selected chain
- ✅ **Solana**: Validates Base58 format and public key
- ✅ **EVM chains**: Validates checksum address format
- ❌ Invalid addresses will show an error message

---

## 🔄 Chain Switching

The wallet **automatically switches chains** when you:
- Select a different asset in the Send dialog
- Click on an asset card in the home screen
- View token details

### Manual Switching:
You can manually switch chains by:
1. Clicking on any asset card in "Your Assets" section
2. The wallet switches to that chain's network
3. All transactions will use the selected chain

---

## 🧪 Testnet Support

Each chain supports testnets for development:

| Chain | Mainnet Network | Testnet Network |
|-------|----------------|-----------------|
| Solana | mainnet-beta | devnet, testnet |
| Ethereum | mainnet | sepolia |
| BSC | mainnet | testnet |
| Polygon | mainnet | amoy |
| Avalanche | mainnet | fuji |
| Arbitrum | mainnet | sepolia |
| Optimism | mainnet | sepolia |
| Base | mainnet | sepolia |
| Fantom | mainnet | testnet |
| Celo | mainnet | alfajores |

### Getting Testnet Tokens:

**Solana Devnet:**
```bash
solana airdrop 2 YOUR_ADDRESS --url devnet
```
Or use: https://faucet.solana.com

**Ethereum Sepolia:**
- https://sepoliafaucet.com
- https://faucet.quicknode.com/ethereum/sepolia

**BSC Testnet:**
- https://testnet.bnbchain.org/faucet-smart

**Polygon Amoy:**
- https://faucet.polygon.technology

**Avalanche Fuji:**
- https://core.app/tools/testnet-faucet

**Arbitrum Sepolia:**
- https://faucet.quicknode.com/arbitrum/sepolia

**Optimism Sepolia:**
- https://app.optimism.io/faucet

**Base Sepolia:**
- https://portal.cdp.coinbase.com/products/faucet

**Fantom Testnet:**
- https://faucet.fantom.network

**Celo Alfajores:**
- https://faucet.celo.org/alfajores

---

## 🔐 Security Features

### Multi-Chain Wallet Security:
- ✅ **Single HD Wallet**: One mnemonic phrase for all chains
- ✅ **Encrypted Storage**: All private keys encrypted in localStorage
- ✅ **Password Protection**: Master password required for all operations
- ✅ **Address Validation**: Prevents sending to invalid addresses
- ✅ **Transaction Verification**: Double-check before sending

### Best Practices:
1. **Backup your mnemonic** phrase securely (paper, metal plate)
2. **Never share** your private keys or mnemonic
3. **Test with small amounts** first on testnets
4. **Verify addresses** carefully before sending
5. **Use testnets** for development and learning

---

## 📊 Price Tracking

The wallet fetches real-time prices from **CoinGecko API**:
- ✅ Live price updates every 5 minutes
- ✅ 24h price changes and percentages
- ✅ Historical charts (1D, 1W, 1M, 1Y)
- ✅ Market stats (high, low, volume, market cap)

### Supported Price Data:
- SOL: `solana`
- ETH: `ethereum`
- BNB: `binancecoin`
- MATIC: `matic-network`
- AVAX: `avalanche-2`
- FTM: `fantom`
- CELO: `celo`

---

## 🚀 Future Enhancements

### Coming Soon:
- [ ] Token swap functionality (DEX integration)
- [ ] NFT support across chains
- [ ] Transaction history with filters
- [ ] Custom RPC endpoints
- [ ] Hardware wallet support
- [ ] Multi-signature wallets
- [ ] DApp browser integration

---

## 📞 Support

For issues or questions:
1. Check the wallet console for detailed error messages
2. Verify you're using the correct network (mainnet vs testnet)
3. Ensure you have enough balance for gas fees
4. Try switching to a different RPC endpoint
5. Check blockchain explorers for transaction status

---

## ⚡ Quick Reference

### Sending Tokens Checklist:
- [ ] Select correct asset/chain
- [ ] Verify recipient address format
- [ ] Check you have enough balance + gas
- [ ] Double-check amount
- [ ] Confirm transaction

### Receiving Tokens Checklist:
- [ ] Share correct address for the chain
- [ ] Wait for network confirmations
- [ ] Refresh wallet to see balance update

---

**Made with ❤️ for the Web3 community**
