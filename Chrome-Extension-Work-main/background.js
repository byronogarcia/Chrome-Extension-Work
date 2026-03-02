// Runs when you click the extension icon

let siteDataJSON;

function getSiteData() {
  if (!siteDataJSON) {
    const url = chrome.runtime.getURL("sites.json");

    siteDataJSON = fetch(url)
      .then(res => res.json())
      .catch(err => {
        console.error("Failed to load sites.json:", err);
        return null;
      });
  }

  return siteDataJSON;
}


chrome.action.onClicked.addListener(async (tab) => {

  const allowedHost = "https://santehealth.giva.net/";

  if (!tab.url.startsWith(allowedHost)) {
    console.log("Not allowed host.");
    return;
  }

  const siteData = await getSiteData();

  if (!siteData) {
    console.log("Site data failed to load.");
    return;
  }

  await chrome.scripting.executeScript({
    target: { tabId: tab.id, allFrames: true },
    func: insertCustomerCC,
    args: [siteData]
  });
});



function insertCustomerCC(siteData) {

  console.log("Extension triggered.");

 // if (window.self !== window.top) return;

// Previous implementation with hardcoded mapping
  // const siteUserMap = {
  //   "5382": ["369454", "691092"],
  //   "7325": ["462822", "590021", "574556"]
  // };

  // const siteConfig = siteData?.sites?.[siteId];

  let siteConfig = null;

  // Extracting from siteData JSON based on siteId from the page
  // We will continue using siteConfig
  // siteData is the JSON object

  if (siteData && siteData.sites && siteId in siteData.sites) {
    siteConfig = siteData.sites[siteId];
  }

  // if its empty return log saying so
  if (!siteConfig) {
    console.log("No mapping for site:", siteId)
    return;
  }

  // initializing and setting users to managers from siteConfig
  // ID selection
  const users = siteConfig.managers;

  console.log("Site name:", siteConfig.name);
  console.log("Users found:", users);

  let siteId = null;

  // setting value as selected site from LocationId select first
  const locationSelect = document.querySelector('select[name="LocationId"] option[selected]');

  if (locationSelect) {
    siteId = locationSelect.value;
    console.log("Checked LocationId, siteId:", siteId);
  } else {
    console.log("LocationId select not found:", siteId);
  }

  // if LocationId is empty try PreviousLocationId select
  if (!siteId) {

    const previousLocation = document.querySelector('input[name="PreviousLocationId"]');

    if (previousLocation) {
      siteId = previousLocation.value;
      console.log("Checked PreviousLocationId, siteId:", siteId);
    } else {
      console.log("PreviousLocationId select not found:", siteId);
    }
  }

  
  if (!siteId) {
    console.log("No site selected.");
    return;
  }


  //const users = siteUserMap[siteId];

  if (!users) {
    console.log("No mapping for site:", siteId);
    return;
  }

  console.log("Users found:", users);

  // Format: user:123456,user:654321
  const formatted = users.map(id => `user:${id}`).join(",");

  const input = document.getElementById("customerCC");

  if (!input) {
    console.log("customerCC input not found:", input);
    return;
  }


  input.value = formatted;

  // Trigger change for jQuery/Select2
  input.dispatchEvent(new Event("change", { bubbles: true }));

  console.log("Customer CC successfully set to:", formatted);
}
