/**
 * extension/src/background.js — Service Worker
 * Receives injection results from content scripts and caches them for the popup.
 */

// In-memory cache: tabId → last injection result
const tabResults = new Map();

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type !== 'MWA_INJECT_RESULT') return;
  if (!sender.tab?.id) return;
  tabResults.set(sender.tab.id, {
    ...message,
    receivedAt: new Date().toISOString(),
  });
});

// Popup requests status for the active tab
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== 'GET_TAB_STATUS') return;
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab    = tabs[0];
    const result = tab ? tabResults.get(tab.id) : null;
    sendResponse({ result, tabUrl: tab?.url });
  });
  return true; // async response
});

// Clean up cache when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  tabResults.delete(tabId);
});
