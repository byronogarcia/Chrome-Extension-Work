// lib/siteData.js
// Responsible for loading and querying data.json
// No DOM access, no page interaction — pure data lookup

let siteDataCache = null;

// Fetches and caches data.json
// Returns the full parsed JSON object
async function getSiteData() {
  if (!siteDataCache) {
    const url = chrome.runtime.getURL("data.json");
    siteDataCache = await fetch(url)
      .then(res => res.json())
      .catch(err => {
        console.error("Failed to load data.json:", err);
        return null;
      });
  }
  return siteDataCache;
}

// Looks up the site config object from data.json by siteId
// Returns the site object or null if not found
function getSiteConfig(siteData, siteId) {
  if (!siteData || !siteId) return null;
  return siteData.sites?.[siteId] ?? null;
}
