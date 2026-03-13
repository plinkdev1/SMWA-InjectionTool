/**
 * extension/src/inject.js — MAIN world injection script
 * Runs in page context. Loaded via <script> tag from content.js.
 * window.MWAWalletStandard must be set before this runs.
 */
(function () {
  const TAG = '[MWA-EXT]';
  const config = window.__mwaInjectorConfig ?? { enabled: true };

  if (!config.enabled) {
    window.postMessage({ type: 'MWA_INJECT_RESULT', status: 'disabled' }, '*');
    return;
  }
  if (window.__mwaRegistered) {
    window.postMessage({ type: 'MWA_INJECT_RESULT', status: 'already_registered' }, '*');
    return;
  }
  if (!window.isSecureContext) {
    console.warn(TAG, 'Not a secure context — skipping.');
    window.postMessage({ type: 'MWA_INJECT_RESULT', status: 'error', error: 'not_secure_context' }, '*');
    return;
  }

  const mwa = window.MWAWalletStandard;
  if (!mwa || typeof mwa.registerMwa !== 'function') {
    console.error(TAG, 'MWAWalletStandard bundle not loaded.');
    window.postMessage({ type: 'MWA_INJECT_RESULT', status: 'error', error: 'bundle_not_loaded' }, '*');
    return;
  }

  const { registerMwa, createDefaultAuthorizationCache, createDefaultChainSelector, createDefaultWalletNotFoundHandler } = mwa;

  try {
    registerMwa({
      appIdentity: {
        name: config.appName ?? document.title ?? 'SMWA Injection Tool',
        uri:  window.location.origin,
        icon: 'favicon.ico',
      },
      authorizationCache:  createDefaultAuthorizationCache(),
      chains: ['solana:mainnet','solana:devnet','solana:testnet','solana:localnet'],
      chainSelector:       createDefaultChainSelector(),
      onWalletNotFound:    createDefaultWalletNotFoundHandler(),
      remoteHostAuthority: undefined,
    });

    window.__mwaRegistered = true;
    window.dispatchEvent(new Event('wallet-standard:register-wallet'));

    const ua = navigator.userAgent;
    const walletType = /android/i.test(ua) && !/(WebView|; wv\))/i.test(ua)
      ? 'LocalSolanaMobileWalletAdapterWallet'
      : !/android|iphone|ipad/i.test(ua) ? 'RemoteSolanaMobileWalletAdapterWallet'
      : 'skipped_webview';

    console.log(TAG, '✅ MWA registered:', walletType);
    window.postMessage({ type: 'MWA_INJECT_RESULT', status: 'registered', walletType, origin: window.location.origin, timestamp: new Date().toISOString() }, '*');
  } catch (e) {
    console.error(TAG, 'registerMwa() failed:', e.message);
    window.postMessage({ type: 'MWA_INJECT_RESULT', status: 'error', error: e.message }, '*');
  }
})();
