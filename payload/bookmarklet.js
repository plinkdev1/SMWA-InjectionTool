/**
 * bookmarklet.js  —  @solana-mobile/wallet-standard-mobile@0.4.4
 * ─────────────────────────────────────────────────────────────────────────────
 * MWA Injector Bookmarklet — Android Chrome, no desktop/USB required
 *
 * HOW TO INSTALL ON ANDROID CHROME:
 *   1. Bookmark any page (tap ⋮ → ☆ Add to bookmarks)
 *   2. Open bookmarks (tap ⋮ → Bookmarks)
 *   3. Find the bookmark → long press → Edit
 *   4. Replace the URL field with the javascript: line from BOOKMARKLET_URI below
 *   5. Rename it to "Inject MWA" → Save
 *
 * HOW TO USE:
 *   1. Navigate to any Solana dApp in Android Chrome
 *   2. Tap address bar → type "Inject MWA" → tap the bookmark suggestion
 *   3. Wait for: "✅ MWA Injected!"
 *   4. Open dApp wallet picker → tap "Mobile Wallet Adapter"
 *
 * BUNDLE:
 *   The bookmarklet loads /payload/mwa-wallet-standard.bundle.js from
 *   jsDelivr after you publish the GitHub repo with a v1.0.0 tag.
 *   jsDelivr serves with CORS headers, allowing dynamic import() from any page.
 *
 *   If the target dApp has a strict CSP blocking cdn.jsdelivr.net,
 *   use the Chrome Extension instead (see /extension/).
 *
 * SETUP: Replace YOUR_GITHUB_USER below before running `node payload/bookmarklet.js`
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Config ────────────────────────────────────────────────────────────────────
const GITHUB_USER = 'plinkdev1'; // ← replace with your GitHub username
const REPO = 'SMWA-InjectionTool';
const TAG         = 'v1.0.0';
const BUNDLE_CDN  = `https://cdn.jsdelivr.net/gh/${GITHUB_USER}/${REPO}@${TAG}/payload/mwa-wallet-standard.bundle.js`;

// ── Bookmarklet URI ───────────────────────────────────────────────────────────
// Single line to paste as Android Chrome bookmark URL.
const BOOKMARKLET_URI = `javascript:(async()=>{const T='[MWA]',U='${BUNDLE_CDN}';if(window.__mwa?.registered){console.warn(T,'Already injected. Delete window.__mwa to re-run.');return;}if(!window.isSecureContext){alert(T+' ERROR: Page must be HTTPS.');return;}console.log(T,'Loading bundle...');let m;try{m=await import(U);}catch(e){alert(T+' Load failed: '+e.message+'\n\nIf CSP error → use the Chrome Extension approach instead.');return;}const{registerMwa:R,createDefaultAuthorizationCache:A,createDefaultChainSelector:C,createDefaultWalletNotFoundHandler:W}=m;if(typeof R!=='function'){alert(T+' registerMwa() not found. Bundle may be outdated.');return;}try{R({appIdentity:{name: 'SMWA Injection Tool',uri:window.location.origin,icon:'favicon.ico'},authorizationCache:A(),chains:['solana:mainnet','solana:devnet','solana:testnet','solana:localnet'],chainSelector:C(),onWalletNotFound:W(),remoteHostAuthority:undefined});window.__mwa={registered:true,version:'0.4.4',ts:new Date().toISOString()};window.dispatchEvent(new Event('wallet-standard:register-wallet'));console.log(T,'Registered OK — window.__mwa');alert('\\u2705 MWA Injected!\\n\\nOpen the dApp wallet picker to connect.');}catch(e){alert(T+' registerMwa() failed: '+e.message);console.error(T,e);}})();`;

// ── Annotated source (same logic, readable) ───────────────────────────────────
const ANNOTATED = `
javascript:(async () => {

  const TAG        = '[MWA]';
  const BUNDLE_URL = '${BUNDLE_CDN}';

  // Prevent double-injection
  if (window.__mwa?.registered) {
    console.warn(TAG, 'Already injected. Delete window.__mwa to re-run.');
    return;
  }

  // Wallet Standard only works in secure contexts
  if (!window.isSecureContext) {
    alert(TAG + ' ERROR: Page must be HTTPS.');
    return;
  }

  console.log(TAG, 'Loading bundle from jsDelivr...');

  // Load the pre-built ESM bundle.
  // Using our own hosted bundle (not esm.sh) avoids the startScenario/
  // startRemoteScenario export mismatch that breaks 0.5.x betas on esm.sh.
  let module;
  try {
    module = await import(BUNDLE_URL);
  } catch (e) {
    alert(TAG + ' Load failed: ' + e.message
      + '\\n\\nIf CSP error → use the Chrome Extension approach instead.');
    return;
  }

  const {
    registerMwa,
    createDefaultAuthorizationCache,
    createDefaultChainSelector,
    createDefaultWalletNotFoundHandler,
  } = module;

  if (typeof registerMwa !== 'function') {
    alert(TAG + ' registerMwa() not found. Bundle may be outdated.');
    return;
  }

  try {
    registerMwa({
      appIdentity: {
        name: 'SMWA Injection Tool',
        uri:  window.location.origin,
        icon: 'favicon.ico',
      },
      authorizationCache:  createDefaultAuthorizationCache(),
      chains:              [
        'solana:mainnet',
        'solana:devnet',
        'solana:testnet',
        'solana:localnet',
      ],
      chainSelector:       createDefaultChainSelector(),
      onWalletNotFound:    createDefaultWalletNotFoundHandler(),
      remoteHostAuthority: undefined,   // local Android connection
    });

    window.__mwa = {
      registered: true,
      version:    '0.4.4',
      ts:         new Date().toISOString(),
    };

    // Notify legacy Wallet Standard event listeners on the page
    window.dispatchEvent(new Event('wallet-standard:register-wallet'));

    console.log(TAG, 'Registered OK — inspect: window.__mwa');
    alert('✅ MWA Injected!\\n\\nOpen the dApp wallet picker to connect.');

  } catch (e) {
    alert(TAG + ' registerMwa() failed: ' + e.message);
    console.error(TAG, e);
  }

})();
`;

// ── Print instructions when run via Node.js ───────────────────────────────────
if (typeof process !== 'undefined' && process.argv[1]?.includes('bookmarklet')) {
  console.log('\n══════════════════════════════════════════════════════════════════');
  console.log('  SMWA Injection Tool — Android Chrome Bookmarklet');
  console.log('══════════════════════════════════════════════════════════════════');
  console.log('\nCopy the following line as your Android Chrome bookmark URL:\n');
  console.log(BOOKMARKLET_URI);
  console.log('\n══════════════════════════════════════════════════════════════════');
  if (GITHUB_USER === 'YOUR_GITHUB_USER') {
    console.log('\n⚠️  WARNING: Replace YOUR_GITHUB_USER in bookmarklet.js first!');
    console.log('   Then tag your repo: git tag v1.0.0 && git push --tags\n');
  } else {
    console.log(`\nBundle CDN URL: ${BUNDLE_CDN}\n`);
  }
}

// ── Export for tooling ────────────────────────────────────────────────────────
if (typeof module !== 'undefined') {
  module.exports = { BOOKMARKLET_URI, ANNOTATED, BUNDLE_CDN };
}
