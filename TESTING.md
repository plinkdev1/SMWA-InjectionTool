# Testing Guide

How to verify SMWA Injection Tool is working correctly across all three delivery methods.

---

## Reference Test dApp

Use **https://solana.com** as the primary test target. It loads the Wallet Standard
and shows a wallet picker — ideal for confirming MWA registration is visible to a real dApp.

Other good test targets:
- https://jup.ag (Jupiter — popular DEX)
- https://raydium.io
- https://orca.so

---

## Method 1 — DevTools Payload

### Setup
1. Connect Android via USB → enable USB debugging
2. Open Chrome on Android → navigate to `https://solana.com`
3. Desktop Chrome → `chrome://inspect/#devices` → click **inspect** on the tab
4. Console tab → paste `payload/mwa-inject.js` → Enter

### Expected Console Output
```
[MWA-INJECT] Starting MWA injection — wallet-standard-mobile@0.4.4 (inline bundle)
[MWA-INJECT] ✅ Android confirmed: Android XX
[MWA-INJECT] ✅ Secure context confirmed (HTTPS)
[MWA-INJECT] Decoding inline bundle...
[MWA-INJECT] ✅ Blob URL created: blob:https://solana.com/...
[MWA-INJECT] ✅ Module loaded. Exports: LocalSolanaMobileWalletAdapterWallet, ...
[MWA-INJECT] ✅ registerMwa() confirmed
[MWA-INJECT] ✅ Wallet type: Local (Android direct connection)
[MWA-INJECT] ✅ MWA wallet injected successfully!
```

### Verify the Result Object
In the same Console, type:
```javascript
window.__mwa
```
Expected:
```json
{
  "version": "0.4.4",
  "isAndroid": true,
  "isSecureContext": true,
  "moduleLoaded": true,
  "registered": true,
  "walletType": "LocalSolanaMobileWalletAdapterWallet",
  "error": null
}
```

### Verify Wallet Picker (on Android screen)
1. On the solana.com page → find the "Connect Wallet" button
2. Tap it → the wallet picker modal opens
3. **"Mobile Wallet Adapter"** should appear in the list
4. Tap it → your installed wallet app (Phantom, Solflare, Backpack) launches

---

## Method 2 — Chrome Extension

### Setup
1. Run `node build.mjs` to ensure bundle is current
2. Transfer `extension/` folder to Android device
3. `chrome://extensions` → Developer mode → Load unpacked → select folder

### Verify Auto-Injection
1. Navigate to `https://solana.com` (fresh page load — no prior injection)
2. Open DevTools via USB → Console tab
3. Type: `window.__mwaExt`
4. Expected: `{ registered: true, source: "chrome-extension", ... }`

### Verify Wallet Picker
Same as Method 1 step above.

---

## Method 3 — Bookmarklet

### Setup
See `docs/DEVTOOLS-PAYLOAD.md` bookmarklet section.

### Verify
1. Navigate to `https://solana.com`
2. Tap address bar → type "Inject" → tap "Inject MWA"
3. Alert shows: "✅ MWA Injected!"
4. Dismiss → open wallet picker → "Mobile Wallet Adapter" appears

---

## Method 4 — ADB Script

```bash
# List tabs
node scripts/inject.mjs --list

# Inject
node scripts/inject.mjs

# Expected output
[MWA-ADB] ✅ MWA wallet injected successfully!
[MWA-ADB] ✅ Type: LocalSolanaMobileWalletAdapterWallet
```

---

## Common Failure Modes

| Symptom | Cause | Fix |
|---|---|---|
| "Not a secure context" | Testing on HTTP | Use HTTPS page |
| "import() from Blob URL failed" | Browser restriction | Reload page, retry |
| Wallet picker shows MWA but tap does nothing | No wallet app installed | Install Phantom or Solflare |
| Wallet picker doesn't show MWA after injection | dApp loaded listeners before injection | Reload page and inject immediately |
| Extension not auto-injecting | Chrome < 128 or flag not enabled | Check `chrome://version` |
