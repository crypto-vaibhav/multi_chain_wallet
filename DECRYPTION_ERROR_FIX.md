# Decryption Error Fix

## Problem
Getting `OperationError` when trying to unlock wallet:
```
OperationError at decryptData (lib/encryption.ts:60:41)
```

## Root Cause
This error occurs when:
1. **Wrong password** - User entered incorrect password
2. **Corrupted data** - Old wallet data from previous encryption system
3. **Incompatible format** - Data encrypted with different algorithm/key

## Solution Applied

### 1. Better Error Handling in `multi-wallet-context.tsx`
- Added try-catch with specific error detection
- Detects `OperationError` and provides helpful message
- Checks if data might be old/corrupted format

### 2. Improved User Feedback in `wallet-lock-screen.tsx`
- Shows clear error messages:
  - "Invalid password" for wrong credentials
  - "Unable to decrypt wallet..." for corrupted data
- Added error recovery options

### 3. Added "Clear Wallet Data" Button
- Appears when unlock fails
- Warns user to backup private keys first
- Clears all wallet data:
  - `wallet_encrypted`
  - `wallet_activities`
  - `wallet_testnet_mode`
- Reloads page for fresh start

## How to Use

### If You Get Decryption Error:

**Option 1: Try Correct Password**
- Double-check password spelling
- Check Caps Lock is off
- Try password you used when creating wallet

**Option 2: Clear and Start Fresh** (⚠️ DANGER - You'll lose wallet!)
1. **FIRST**: Make sure you have your private keys backed up!
2. Click "Clear Wallet Data & Start Fresh" button
3. Confirm the warning
4. Page reloads automatically
5. Create new wallet OR import with private key

### To Avoid Data Loss:

**Before Clearing Data:**
1. Go to Settings tab
2. Export Private Keys for:
   - Solana
   - Ethereum  
   - BSC
3. Save them securely
4. Now safe to clear data

## Technical Details

### Error Detection
```typescript
if (error?.name === "OperationError" || error?.message?.includes("decrypt")) {
  // Handle decryption failure
}
```

### Data Cleared
```typescript
localStorage.removeItem("wallet_encrypted")      // Wallet keys
localStorage.removeItem("wallet_activities")     // Transaction history
localStorage.removeItem("wallet_testnet_mode")   // Network preference
```

### Safe Recovery Flow
1. Error caught → User notified
2. User backs up keys (if possible)
3. User clears data
4. User imports wallet with private keys
5. Wallet restored with new encryption

## Prevention

### For Future:
- **Always backup private keys** after creating/importing wallet
- **Write down password** in secure location
- **Test unlock** before logging out
- **Export keys regularly** from Settings

### Testing Unlock:
1. Lock wallet (Settings → Lock Wallet)
2. Immediately try to unlock
3. If it works, password is correct
4. If not, reset now while you can export keys

## Common Scenarios

### Scenario 1: "I forgot my password"
❌ **Cannot recover** - encryption is one-way
✅ **Solution**: Clear data and import with private keys

### Scenario 2: "Error after browser update"
❌ **Data might be corrupted**
✅ **Solution**: Clear data and import with private keys

### Scenario 3: "Error after clearing browser cache"
⚠️ **Might have deleted partial data**
✅ **Solution**: Clear all wallet data and import fresh

### Scenario 4: "Worked yesterday, error today"
🤔 **Likely password issue**
✅ **Solution**: Try different password variations

## Support

If you continue having issues:
1. Check browser console for detailed errors
2. Verify you're using supported browser (Chrome, Firefox, Safari, Edge)
3. Try in incognito/private mode
4. Clear browser cache completely
5. Import wallet in fresh browser session

## Important Warnings

⚠️ **NEVER share your private keys**
⚠️ **NEVER screenshot your private keys**
⚠️ **NEVER store private keys in cloud**
⚠️ **ALWAYS backup before clearing data**
⚠️ **TEST password before logging out**

## Data Storage Locations

All wallet data is stored in browser localStorage:
- `wallet_encrypted` - Encrypted wallet data (keys, mnemonic)
- `wallet_activities` - Transaction history
- `wallet_testnet_mode` - Network preference (mainnet/testnet)

**None of this data is sent to servers** - it's all local to your browser!
