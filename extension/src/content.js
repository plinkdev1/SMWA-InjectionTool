/**
 * extension/src/content.js — ISOLATED world content script
 *
 * Runs at document_start in the ISOLATED world (can't directly touch page JS).
 * Strategy (MetaMask pattern):
 *   1. Read enabled state from chrome.storage
 *   2. Inject UMD bundle (mwa-wallet-standard.umd.js) as a web-accessible <script>
 *   3. Inject inject.js (also web-accessible) as a <script> immediately after
 *   4. Listen for MWA_INJECT_RESULT message and relay it to background
 *
 * Both scripts run in the MAIN world via <script> tag injection, giving them
 * direct access to the page's Wallet Standard registry.
 */

(async function ContentBridge() {
  const TAG    = '[MWA-CONTENT]';
  const origin = window.location.origin;

  // ── 1. Read enabled state from storage ────────────────────────────────────
  let settings;
  try {
    settings = await chrome.storage.local.get(['globalEnabled', 'disabledOrigins']);
  } catch (e) {
    // storage unavailable — default to enabled
    settings = {};
  }

  const globalEnabled   = settings.globalEnabled !== false; // default: true
  const disabledOrigins = settings.disabledOrigins ?? [];
  const originEnabled   = !disabledOrigins.includes(origin);
  const enabled         = globalEnabled && originEnabled;

  // ── 2. Bridge config to MAIN world via window property ────────────────────
  // We use a custom DOM event to avoid any chance of the page reading our config
  // before inject.js runs. The script tag ordering guarantees inject.js runs
  // after the bundle, so window.__mwaInjectorConfig will already be set.
  const configScript = document.createElement('script');
  configScript.textContent = `window.__mwaInjectorConfig = ${JSON.stringify({ enabled, appName: 'MWA Injector' })};`;
  (document.head || document.documentElement).appendChild(configScript);
  configScript.remove();

  if (!enabled) {
    console.debug(TAG, `Injection disabled for ${origin}`);
    return;
  }

  // ── 3. Inject UMD bundle (runs in MAIN world via <script> tag) ────────────
  function injectScript(filename) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = chrome.runtime.getURL(filename);
      script.onload  = () => { script.remove(); resolve(); };
      script.onerror = () => { script.remove(); reject(new Error(`Failed to load ${filename}`)); };
      (document.head || document.documentElement).appendChild(script);
    });
  }

  try {
    // Bundle first — sets window.MWAWalletStandard
    await injectScript('src/mwa-wallet-standard.umd.js');
    // Then injection logic — reads window.MWAWalletStandard and calls registerMwa()
    await injectScript('src/inject.js');
    console.debug(TAG, `Scripts injected for ${origin}`);
  } catch (e) {
    console.error(TAG, 'Script injection failed:', e.message);
  }

  // ── 4. Listen for result from MAIN world ──────────────────────────────────
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    if (event.data?.type !== 'MWA_INJECT_RESULT') return;

    // Relay result to background service worker for popup display
    try {
      chrome.runtime.sendMessage({
        type:   'MWA_INJECT_RESULT',
        tabUrl: window.location.href,
        ...event.data,
      });
    } catch (_) {
      // Extension context invalidated (e.g. extension updated) — ignore
    }
  });
})();
