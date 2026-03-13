# SMWA Injection Tool — Tested dApps & Device Compatibility

> Last updated: March 13, 2026

---

## ✅ Confirmed Working

| dApp | URL | Method | Device | Notes |
|------|-----|--------|--------|-------|
| Jupiter | jup.ag | Method B (CDP) | Samsung A55, Android 10, Chrome 145 | Wallet picker appears, full MWA flow works |

---

## 🔲 Pending Tests

| dApp | URL | Status |
|------|-----|--------|
| Raydium | raydium.io | Not yet tested |
| Orca | orca.so | Not yet tested |
| Magic Eden | magiceden.io | Not yet tested |
| Drift | drift.trade | Not yet tested |
| MarginFi | marginfi.com | Not yet tested |

---

## 📱 Device Compatibility — Method A (Chrome Extension)

| Device | Android Version | Chrome Version | Method A Status | Notes |
|--------|----------------|----------------|-----------------|-------|
| Samsung A55 | Android 10 | Chrome 145 | ❌ Blocked | Samsung blocks Chrome extensions at manufacturer level, even in developer mode. Method A is non-functional on Samsung hardware. |

> **Note for users:** If you are on a Samsung device, use **Method B (Chrome DevTools Protocol)** instead. Method A (Chrome Extension) requires a non-Samsung Android device or a device where the manufacturer does not restrict Chrome extension loading.

---

## 🔵 Method B (Chrome DevTools Protocol) — Device Compatibility

| Device | Android Version | Chrome Version | Status | Notes |
|--------|----------------|----------------|--------|-------|
| Samsung A55 | Android 10 | Chrome 145 | ✅ Working | Confirmed via jup.ag live test |

---

## 📝 Notes

- Testing is ongoing — PRs welcome with your own device/dApp results
- If you test on a non-Samsung Android device with Method A, please open an issue or PR with your findings
- All tests use `wallet-standard-mobile@0.4.4`
