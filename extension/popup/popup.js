/**
 * popup.js — Extension Popup Logic
 */

(async function () {

  const globalToggle  = document.getElementById('globalToggle');
  const siteHostname  = document.getElementById('siteHostname');
  const siteToggleBtn = document.getElementById('siteToggleBtn');
  const statusVal     = document.getElementById('statusVal');
  const walletTypeVal = document.getElementById('walletTypeVal');

  // Get current tab hostname
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  let hostname = '';
  try { hostname = new URL(tab.url).hostname; } catch (_) {}
  siteHostname.textContent = hostname || 'N/A';

  // Load current preferences
  const prefs = await chrome.storage.sync.get({ enabled: true, disabledSites: [] });

  globalToggle.checked = prefs.enabled;
  const isSiteDisabled = prefs.disabledSites.includes(hostname);
  updateSiteBtn(isSiteDisabled);

  // Read injection status from the tab (window.__mwaExt)
  if (tab.id) {
    try {
      const [result] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.__mwaExt ?? null,
      });
      const mwa = result?.result;
      if (mwa?.registered) {
        statusVal.textContent   = '✅ Injected';
        statusVal.className     = 'status-val ok';
        walletTypeVal.textContent = 'LocalSolanaMobileWalletAdapterWallet';
      } else if (mwa?.error) {
        statusVal.textContent = '❌ ' + mwa.error;
        statusVal.className   = 'status-val err';
      } else {
        statusVal.textContent = '⚠️ Not injected yet';
        statusVal.className   = 'status-val warn';
      }
    } catch (_) {
      statusVal.textContent = '— (restricted page)';
      statusVal.className   = 'status-val';
    }
  }

  // Global toggle
  globalToggle.addEventListener('change', async () => {
    await chrome.storage.sync.set({ enabled: globalToggle.checked });
  });

  // Per-site toggle
  siteToggleBtn.addEventListener('click', async () => {
    const current = await chrome.storage.sync.get({ disabledSites: [] });
    const sites   = current.disabledSites;
    const idx     = sites.indexOf(hostname);
    if (idx === -1) {
      sites.push(hostname);
    } else {
      sites.splice(idx, 1);
    }
    await chrome.storage.sync.set({ disabledSites: sites });
    updateSiteBtn(sites.includes(hostname));
  });

  function updateSiteBtn(isDisabled) {
    if (isDisabled) {
      siteToggleBtn.textContent  = 'Enable';
      siteToggleBtn.className    = 'btn-site-toggle enable';
    } else {
      siteToggleBtn.textContent  = 'Disable';
      siteToggleBtn.className    = 'btn-site-toggle disable';
    }
  }

})();
