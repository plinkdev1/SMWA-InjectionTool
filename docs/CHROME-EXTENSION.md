# Chrome Extension — Install & Usage Guide

## Requirements
- Android device running **Chrome 128+** (released September 2024)
- Developer Mode enabled in Chrome settings

## One-Time Setup

### Step 1 — Enable Developer Mode
```
Android Chrome → ⋮ (three-dot menu) → Settings
→ scroll to bottom → About Chrome
→ tap "Chrome version" 7 times rapidly
→ Developer options now appears in Settings
→ Settings → Developer options → Enable "Extensions" toggle
```

### Step 2 — Download the extension
Download `smwa-injection-tool-extension.zip` from the [GitHub Releases](https://github.com/your-org/mwa-injector/releases) page.

### Step 3 — Sideload the extension
```
Android Chrome → ⋮ → Extensions → Manage extensions
→ tap "Load unpacked"
→ navigate to the downloaded .zip (or extracted folder)
→ tap "Select"
```

You should see **"MWA Injector — Solana Mobile"** appear in your extensions list with a green status.

## Usage

1. Open any Solana dApp in Chrome (must be HTTPS)
2. The extension injects automatically at page load — no action needed
3. Open the dApp's connect-wallet modal
4. **"Mobile Wallet Adapter"** will appear as a wallet option
5. Tap it — your installed wallet app (Phantom, Solflare, etc.) launches

## Popup Controls

Tap the extension icon (⬡) in the toolbar to open the popup:
- **Injection status badge** — shows whether MWA was registered successfully
- **Enable globally** toggle — turns injection on/off for all pages
- **Enable this site** toggle — turns injection on/off for the current origin only

## Troubleshooting

**Extension doesn't appear in toolbar**  
→ Tap ⋮ → Extensions → find MWA Injector → enable "Show in toolbar"

**Status shows "Error: not_secure_context"**  
→ MWA requires HTTPS. The dApp must be served over HTTPS.

**Status shows "Pending…" but wallet doesn't appear**  
→ Reload the dApp tab — some SPAs only scan for wallets at load time.  
→ Check that at least one MWA-compatible wallet app is installed:
  - [Phantom](https://play.google.com/store/apps/details?id=app.phantom)
  - [Solflare](https://play.google.com/store/apps/details?id=com.solflare.mobile)
  - [Backpack](https://play.google.com/store/apps/details?id=app.backpack)

**"Load unpacked" button is missing**  
→ Developer Mode is not enabled. See Step 1 above.
