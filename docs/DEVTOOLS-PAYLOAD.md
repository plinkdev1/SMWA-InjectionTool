# DevTools Payload & Bookmarklet Guide

## Overview

Two injection methods that don't require installing an extension:
- **DevTools payload** — paste into Chrome DevTools console via USB
- **Bookmarklet** — one-tap injection from Android Chrome address bar

Both use `@solana-mobile/wallet-standard-mobile@0.4.4` bundled inline — no server, no CDN dependency at runtime for the DevTools method.

---

## Method 1 — DevTools Console (USB)

### Prerequisites
- Android device with USB debugging enabled
- USB cable
- Desktop Chrome

### Steps

**1. Enable USB debugging:**
```
Settings → About Phone → tap "Build number" 7 times
Settings → Developer Options → USB Debugging → ON
```

**2. Connect and open remote DevTools:**
```
Desktop Chrome → chrome://inspect/#devices
```
Find your device → find the tab → click **inspect**.

**3. Paste the payload:**
Open `payload/mwa-inject.js` → Select All → Copy → paste into Console → Enter.

**4. Verify:**
```javascript
window.__mwa  // → { registered: true, ... }
```

### How the Inline Bundle Works

Previous approaches tried loading the bundle from esm.sh or a local HTTP server.
Both failed:
- esm.sh: dependency mismatch (`startScenario` export missing in `^2.2.5`)
- Local server: mixed content blocked (HTTP on HTTPS page)
- ngrok: setup friction, requires internet tunnel

The current approach embeds the entire bundle as **base64** directly in the script:

```
BUNDLE_B64 (113KB base64 string)
  └─► atob() → Uint8Array → Blob → blob:// URL
        └─► import(blobUrl)
              └─► registerMwa()
```

No network request. No CSP issues. No mixed content. Works on any HTTPS page.

---

## Method 2 — Bookmarklet

### Prerequisites
- GitHub repo published with a `v1.0.0` tag (for jsDelivr CDN URL)

### One-time Setup

**1. Publish your repo:**
```bash
git tag v1.0.0 && git push --tags
```

**2. Update bookmarklet.js with your GitHub username:**
```javascript
const GITHUB_USER = 'your-actual-username'; // in payload/bookmarklet.js
```

**3. Generate the bookmark URI:**
```bash
node payload/bookmarklet.js
```
Copy the printed `javascript:` line.

**4. Install on Android Chrome:**
1. Bookmark any page (⋮ → ☆)
2. Open bookmarks → long press → Edit
3. Replace URL with the `javascript:` line
4. Rename to **"Inject MWA"** → Save

### Usage
1. Navigate to any Solana dApp
2. Tap address bar → type "Inject" → tap "Inject MWA"
3. Alert: "✅ MWA Injected!"
4. Open wallet picker → "Mobile Wallet Adapter"

### Note on CSP
The bookmarklet loads the bundle from `cdn.jsdelivr.net`. If the target dApp
has a strict Content-Security-Policy that blocks this domain, use the Chrome
Extension instead — it loads from a `chrome-extension://` URL which bypasses
page CSP entirely.
