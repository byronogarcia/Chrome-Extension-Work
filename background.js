// background.js — Giva CC Autofill
// Coordinator — reads JSON, finds site, routes to automatic or corporate flow
// Does not interact with the Giva page directly — that's handled by lib/giva.js

// Import shared lib files into the service worker context
// importScripts is the service worker equivalent of <script src="...">
importScripts("lib/siteData.js", "lib/managers.js");

// ----------------------------------------------------------
// Badge helpers
// ----------------------------------------------------------

// Green ✓ — shown after successful CC insertion
function showSuccessBadge(tabId) {
  chrome.action.setBadgeText({ text: "✓", tabId });
  chrome.action.setBadgeBackgroundColor({ color: "#2e7d32", tabId });
  setTimeout(() => chrome.action.setBadgeText({ text: "", tabId }), 3000);
}

// Yellow ! — shown when a corp site is detected, prompting user to click
function showCorpBadge(tabId) {
  chrome.action.setBadgeText({ text: "!", tabId });
  chrome.action.setBadgeBackgroundColor({ color: "#f9a825", tabId });
}


// ----------------------------------------------------------
// Message listener
// Handles messages from content.js and popup.js
// ----------------------------------------------------------
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  // FROM content.js — a site was detected via LocationId
  // Check the mode in data.json — if corporate, show yellow ! badge
  if (message.type === "SITE_DETECTED") {
    getSiteData().then(siteData => {
      const siteConfig = getSiteConfig(siteData, message.siteId);
      if (siteConfig?.mode === "corporate") {
        showCorpBadge(sender.tab.id);
      }
    });
  }

  // FROM popup.js — user confirmed a manager selection in the corporate dropdown
  // managerIds is already resolved by the popup — just apply it to the page
  if (message.type === "CORPORATE_SELECTION") {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const tab = tabs[0];
      const customerId = await getCustomerId(tab.id);
      const filtered = filterManagers(message.managerIds, customerId);

      // applyCustomerCC lives in lib/giva.js — inject it into the page
      await chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: true },
        func: applyCustomerCC,
        args: [filtered]
      });

      showSuccessBadge(tab.id);
    });
  }

  // FROM popup.js — automatic mode, managers already resolved and filtered
  // Just inject applyCustomerCC into the page and show the badge
  if (message.type === "CC_APPLY") {
    chrome.scripting.executeScript({
      target: { tabId: message.tabId, allFrames: true },
      func: applyCustomerCC,
      args: [message.managerIds]
    }).then(() => showSuccessBadge(message.tabId));
  }

});


// ----------------------------------------------------------
// getCustomerId
// Reads TicketApp.customer.id from the page's JS context
// Requires world: "MAIN" since TicketApp is a page-level variable
// ----------------------------------------------------------
async function getCustomerId(tabId) {
  const results = await chrome.scripting.executeScript({
    target: { tabId, allFrames: true },
    world: "MAIN",
    func: () => String(window.TicketApp?.customer?.id ?? "")
  });
  return results?.map(r => r.result).find(r => r !== "") ?? "";
}


// ----------------------------------------------------------
// applyCustomerCC — injected into the page by executeScript
// Defined here so it can be passed to executeScript as a function reference
// Mirrors lib/giva.js but must be self-contained for injection
// ----------------------------------------------------------
function applyCustomerCC(managerIds) {
  const input = document.getElementById("customerCC");
  if (!input) return;

  const formatted = managerIds.map(id => `user:${id}`).join(",");

  if (window.jQuery) {
    window.jQuery(input).val(formatted).trigger("change");
  } else {
    input.value = formatted;
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  console.log("Giva CC: set to", formatted);
}