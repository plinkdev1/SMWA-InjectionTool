#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# inject.sh — Shell wrapper for SMWA Injection Tool ADB automation
#
# USAGE:
#   ./scripts/inject.sh              # inject into first HTTPS tab
#   ./scripts/inject.sh --list       # list open Chrome tabs
#   ./scripts/inject.sh --tab 1      # inject into tab index 1
#   ./scripts/inject.sh --url jup.ag # inject into tab matching URL
#   ./scripts/inject.sh --verbose    # show full CDP output
#
# PREREQUISITES:
#   - Node.js 18+
#   - ADB installed and on PATH
#   - Android device connected via USB with USB debugging enabled
# ─────────────────────────────────────────────────────────────────────────────

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Check Node.js
if ! command -v node &>/dev/null; then
  echo "❌ Node.js not found. Install from https://nodejs.org"
  exit 1
fi

# Check ADB
if ! command -v adb &>/dev/null; then
  echo "❌ ADB not found. Install Android Platform Tools:"
  echo "   macOS:  brew install android-platform-tools"
  echo "   Linux:  sudo apt install adb"
  echo "   Win:    https://developer.android.com/tools/releases/platform-tools"
  exit 1
fi

# Run the Node.js injector, passing all arguments through
exec node "$ROOT_DIR/scripts/inject.mjs" "$@"
