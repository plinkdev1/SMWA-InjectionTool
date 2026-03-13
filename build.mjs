/**
 * build.mjs — esbuild bundler
 * ─────────────────────────────────────────────────────────────────────────────
 * Builds @solana-mobile/wallet-standard-mobile@0.4.4 into a self-contained
 * ESM bundle for use by:
 *   - payload/mwa-inject.js     (DevTools inline blob approach)
 *   - payload/bookmarklet.js    (CDN-loaded from jsDelivr after GitHub release)
 *   - extension/               (web_accessible_resource bundled with extension)
 *
 * USAGE:
 *   node build.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { build }   from 'esbuild';
import { readFileSync, writeFileSync, copyFileSync } from 'fs';
import { resolve, dirname }   from 'path';
import { fileURLToPath }       from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));

// ── Entry point ───────────────────────────────────────────────────────────────
const ENTRY = resolve(__dir, 'bundle-entry.mjs');

// ── Ensure bundle-entry.mjs exists ───────────────────────────────────────────
writeFileSync(ENTRY, `export {
  registerMwa,
  createDefaultAuthorizationCache,
  createDefaultChainSelector,
  createDefaultWalletNotFoundHandler,
  LocalSolanaMobileWalletAdapterWallet,
  RemoteSolanaMobileWalletAdapterWallet,
} from '@solana-mobile/wallet-standard-mobile';
`);

console.log('[build] Building @solana-mobile/wallet-standard-mobile@0.4.4...');

// ── Build (minified, for payload embedding and CDN hosting) ───────────────────
await build({
  entryPoints: [ENTRY],
  bundle:      true,
  format:      'esm',
  outfile:     resolve(__dir, 'payload/mwa-wallet-standard.bundle.js'),
  platform:    'browser',
  target:      'es2020',
  minify:      true,
  sourcemap:   false,
  external:    [],
});

console.log('[build] ✅ payload/mwa-wallet-standard.bundle.js');

// ── Copy bundle into extension directory ──────────────────────────────────────
copyFileSync(
  resolve(__dir, 'payload/mwa-wallet-standard.bundle.js'),
  resolve(__dir, 'extension/mwa-wallet-standard.bundle.js')
);
console.log('[build] ✅ extension/mwa-wallet-standard.bundle.js (copy)');

// ── Regenerate base64 inline in mwa-inject.js ─────────────────────────────────
console.log('[build] Embedding bundle into payload/mwa-inject.js...');
const bundleContent = readFileSync(
  resolve(__dir, 'payload/mwa-wallet-standard.bundle.js'),
  'utf8'
);
const b64 = Buffer.from(bundleContent).toString('base64');

let injectSrc = readFileSync(resolve(__dir, 'payload/mwa-inject.js'), 'utf8');
// Replace the BUNDLE_B64 value between single quotes
injectSrc = injectSrc.replace(
  /const BUNDLE_B64 = '([^']*)';/,
  `const BUNDLE_B64 = '${b64}';`
);
writeFileSync(resolve(__dir, 'payload/mwa-inject.js'), injectSrc);
console.log('[build] ✅ payload/mwa-inject.js updated with new base64');

console.log('\n[build] All done. Files updated:');
console.log('  payload/mwa-wallet-standard.bundle.js');
console.log('  extension/mwa-wallet-standard.bundle.js');
console.log('  payload/mwa-inject.js  (BUNDLE_B64 refreshed)');
