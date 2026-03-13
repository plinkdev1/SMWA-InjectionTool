# ADB Automation Script — Usage Guide

## What it does
`scripts/inject.mjs` automates the DevTools injection via ADB + Chrome DevTools Protocol (CDP). 
It finds the active HTTPS Chrome tab on a connected Android device and runs the full inline payload automatically — no manual console pasting.

## Prerequisites
- [ADB (Android Debug Bridge)](https://developer.android.com/tools/releases/platform-tools) installed and in `$PATH`
- USB cable (data cable, not charge-only)
- Android device: USB debugging ON
  ```
  Settings → About Phone → tap "Build number" 7 times
  Settings → Developer Options → USB Debugging → ON
  ```
- Chrome open on the Android device on an HTTPS dApp tab

## Usage

```bash
# Install dependencies (first time)
npm install

# Inject into the first HTTPS tab found
npm run inject

# List all open Chrome tabs
npm run inject -- --list

# Target a specific tab by URL substring
npm run inject -- --url jup.ag

# Target a specific connected device
npm run inject -- --serial ABC123DEF456
```

## CI/CD Integration

```yaml
# GitHub Actions example
- name: Inject MWA into test dApp
  run: |
    adb connect $DEVICE_HOST:$DEVICE_PORT
    npm run inject -- --url $TEST_DAPP_URL
```

## Troubleshooting

**"No Android devices found"**  
→ Check USB cable (use data cable)  
→ Confirm USB debugging dialog on the device  
→ Run `adb devices` to verify

**"Failed to reach CDP endpoint"**  
→ Chrome is not open, or the forward command failed  
→ Try manually: `adb forward tcp:9222 localabstract:chrome_devtools_remote`  
→ Then visit: `http://localhost:9222/json`

**"Tab has no WebSocket debugger URL"**  
→ Close any existing DevTools window attached to that tab first

**Timeout waiting for response**  
→ The inline payload is ~91KB — on slow devices the evaluate call takes ~10s  
→ Default timeout is 30s; if it still times out, check device memory
