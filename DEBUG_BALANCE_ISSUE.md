# Debugging Balance Display Issue

## Current Situation
Your wallet is designed to show ALL token balances (SOL, ETH, BNB) at the same time in the multi-wallet interface.

## Common Issues & Solutions

### Issue 1: Network Mismatch
- **Problem**: You have funds on testnet but the wallet is checking mainnet (or vice versa)
- **Solution**: 
  - Check which network you're on (look at the top of the wallet UI)
  - The wallet shows:
    - Selected chain balances on the network you selected (devnet/testnet/mainnet)
    - Other chains always on mainnet
  
### Issue 2: Fresh Wallet with No Funds
- **Problem**: The wallet is new and has no funds on any network
- **Solution**: Send some test funds to your addresses:
  - **Solana Devnet**: Use https://faucet.solana.com
  - **Ethereum Sepolia**: Use https://sepoliafaucet.com
  - **BSC Testnet**: Use https://testnet.bnbchain.org/faucet-smart

### Issue 3: RPC Endpoint Failures
- **Problem**: Public RPC endpoints are blocked or failing
- **Check**: Open browser console (F12) and look for errors
- **Solution**: The wallet has multiple fallback RPCs that will retry automatically

## How to Debug

1. **Open Browser Console** (F12 or Right Click → Inspect → Console)

2. **Look for these log messages**:
   ```
   [MultiWallet] Starting balance refresh for accounts: [...]
   [MultiWallet] Fetching balance for solana on devnet: <address>
   [MultiWallet] Using Solana RPC: <url>
   [MultiWallet] Solana balance fetched: <number>
   ```

3. **Check for errors**:
   - Red error messages about RPC failures
   - "All RPC endpoints failed" messages
   - Network timeout errors

4. **Verify your addresses have funds**:
   - Copy your Solana address → Check on https://explorer.solana.com/?cluster=devnet
   - Copy your Ethereum address → Check on https://sepolia.etherscan.io
   - Copy your BSC address → Check on https://testnet.bscscan.com

## Quick Fixes

### Fix 1: Refresh Balances
Click the refresh button or switch between tabs to trigger a balance refresh.

### Fix 2: Switch Networks
Try switching between mainnet/devnet/testnet to see if balances appear.

### Fix 3: Check Console Logs
The detailed logs will show exactly where the issue is happening.

### Fix 4: Verify API Keys
Make sure your `.env.local` file has the Moralis API key (for Ethereum transaction history).

## Expected Behavior

When working correctly, you should see:
1. ✅ Total Portfolio Value showing sum of all assets
2. ✅ "Your Assets" section showing SOL, ETH, and BNB balances
3. ✅ Each asset showing its balance and USD value
4. ✅ "All Wallet Addresses" section showing addresses for all chains

## Still Having Issues?

Share the console logs from your browser's developer console.
