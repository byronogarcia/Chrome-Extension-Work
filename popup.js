// popup.js — Giva CC Autofill
// Runs when the popup opens (user clicks the extension icon)
//
// Two paths:
//   mode: "automatic" → resolve managers from data.json, send to background.js
//   mode: "corporate" → show nested dropdown, send selected managers to background.js
//
// The popup never touches the Giva page directly.
// It only sends managers to background.js via CORPORATE_SELECTION or CC_APPLY.
// background.js calls applyCustomerCC() — the single place that modifies the page.


// ----------------------------------------------------------
// Data helpers — mirrors lib/siteData.js
// popup.js can't use importScripts so these are inlined here
// ----------------------------------------------------------
async function getSiteData() {
  const url = chrome.runtime.getURL("data.json");
  return fetch(url).then(r => r.json()).catch(() => null);
}

// Reads the current tab's LocationId or PreviousLocationId
async function getSiteId(tabId) {
  const results = await chrome.scripting.executeScript({
    target: { tabId, allFrames: true },
    func: () => {
      const loc = document.querySelector('select[name="LocationId"]');
      if (loc && loc.value) return loc.value.trim();
      const prev = document.querySelector('input[name="PreviousLocationId"]');
      if (prev && prev.value) return prev.value.trim();
      return "";
    }
  });
  return results?.map(r => r.result).find(r => r && r !== "") ?? "";
}

// Reads TicketApp.customer.id from the page's JS context
async function getCustomerId(tabId) {
  const results = await chrome.scripting.executeScript({
    target: { tabId, allFrames: true },
    world: "MAIN",
    func: () => String(window.TicketApp?.customer?.id ?? "")
  });
  return results?.map(r => r.result).find(r => r !== "") ?? "";
}


// ----------------------------------------------------------
// buildDropdowns
// Recursively builds <select> dropdowns from the dept tree.
// Each node either has "departments" (go deeper) or "managers" (leaf).
// When a leaf is reached, the Apply button is enabled.
// ----------------------------------------------------------
let selectedManagers = null;

function buildDropdowns(node, container) {
  // Remove any dropdowns below the current level when rebuilding
  const level = container.children.length;
  while (container.children.length > level) {
    container.removeChild(container.lastChild);
  }

  // Reset state — require user to re-select down to a leaf
  selectedManagers = null;
  document.getElementById("confirm-btn").disabled = true;

  const select = document.createElement("select");

  // Default placeholder option
  const defaultOpt = document.createElement("option");
  defaultOpt.value = "";
  defaultOpt.textContent = "-- Select --";
  select.appendChild(defaultOpt);

  // One option per key in the current node
  Object.keys(node).forEach(key => {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = key;
    select.appendChild(opt);
  });

  select.addEventListener("change", () => {
    const chosen = node[select.value];
    if (!chosen) return;

    // Remove dropdowns below this level before adding new ones
    while (container.children.length > level + 1) {
      container.removeChild(container.lastChild);
    }

    if (chosen.departments) {
      // Has children — build the next dropdown level
      buildDropdowns(chosen.departments, container);
    } else if (chosen.managers) {
      // Leaf node — store managers and enable Apply
      selectedManagers = chosen.managers;
      document.getElementById("confirm-btn").disabled = false;
    }
  });

  container.appendChild(select);
}


// ----------------------------------------------------------
// Main — runs when popup opens
// ----------------------------------------------------------
document.addEventListener("DOMContentLoaded", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const siteData = await getSiteData();

  if (!siteData) {
    document.getElementById("status").textContent = "Failed to load site data.";
    return;
  }

  const siteId = await getSiteId(tab.id);
  const siteConfig = siteData?.sites?.[siteId];

  // Show the site name as a label regardless of mode
  if (siteConfig) {
    document.getElementById("site-label").textContent = `Site: ${siteConfig.name}`;
  }

  // ----------------------------------------------------------
  // Corporate mode — show nested dropdown
  // ----------------------------------------------------------
  if (siteConfig?.mode === "corporate") {
    document.getElementById("regular-ui").style.display = "none";
    document.getElementById("corp-ui").style.display = "block";

    const container = document.getElementById("dropdowns");
    buildDropdowns(siteConfig.departments, container);

    // Apply button — send selected managers to background.js
    // background.js applies customer exclusion then calls applyCustomerCC
    document.getElementById("confirm-btn").addEventListener("click", () => {
      if (!selectedManagers) return;
      chrome.runtime.sendMessage({
        type: "CORPORATE_SELECTION",
        managerIds: selectedManagers
      });
      window.close();
    });

  // ----------------------------------------------------------
  // Automatic mode — resolve managers and send to background.js
  // ----------------------------------------------------------
  } else if (!siteConfig?.mode || siteConfig?.mode !== "corporate") {
    const statusEl = document.getElementById("status");

    const managers = siteConfig.managers ?? [];
    if (managers.length === 0) {
      statusEl.textContent = "No managers found for this site.";
      return;
    }

    const customerId = await getCustomerId(tab.id);
    const filtered = managers.filter(id => id !== customerId);

    // Send resolved managers to background.js to apply to the page
    chrome.runtime.sendMessage({
      type: "CC_APPLY",
      managerIds: filtered,
      tabId: tab.id
    });

    statusEl.textContent = `✓ CC set for ${siteConfig.name}`;
    statusEl.style.color = "#2e7d32";
    setTimeout(() => window.close(), 1000);

  // ----------------------------------------------------------
  // Unknown site — no mapping in data.json
  // ----------------------------------------------------------
  } else {
    document.getElementById("status").textContent = siteId
      ? `No mapping for site: ${siteId}`
      : "No site selected on this page.";
  }
});
