# Contributing to SMWA Injection Tool

Thanks for your interest in contributing! This project is part of the Solana Mobile ecosystem and welcomes community contributions.

---

## Getting Started

```bash
git clone https://github.com/YOUR_GITHUB_USER/mwa-injector
cd mwa-injector
npm install
node build.mjs
```

---

## Project Structure

```
payload/        ← DevTools payload and bookmarklet
extension/      ← Chrome MV3 extension
scripts/        ← ADB automation and packaging scripts
docs/           ← Per-method documentation
build.mjs       ← esbuild bundler (run after any dependency changes)
```

---

## How to Contribute

### Reporting Bugs
Open a GitHub Issue with:
- Your Android version and Chrome version (`chrome://version`)
- The full console output from DevTools
- Steps to reproduce

### Submitting Changes
1. Fork the repo
2. Create a branch: `git checkout -b fix/your-fix-name`
3. Make your changes
4. Run `node build.mjs` to rebuild the bundle if you changed any dependencies
5. Test on a real Android device — emulators do not support MWA
6. Open a Pull Request with a clear description of what changed and why

### Updating the Package Version
If `@solana-mobile/wallet-standard-mobile` releases a new stable version:
1. Update the version in `package.json`
2. Run `npm install`
3. Run `node build.mjs` — this rebuilds the bundle and refreshes the base64 in `mwa-inject.js`
4. Test the DevTools payload on a real device before submitting a PR

---

## Code Style

- Plain JavaScript — no TypeScript, no framework
- Comments explain **why**, not just what
- Keep the DevTools payload readable — it's a reference implementation

---

## License

By contributing you agree your contributions will be licensed under the MIT License.
