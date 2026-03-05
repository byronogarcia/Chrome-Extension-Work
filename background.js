// Runs when you click the extension icon

let siteDataJSON;

function getSiteData() {
  if (!siteDataJSON) {
    const url = chrome.runtime.getURL("data.json");

    siteDataJSON = fetch(url)
      .then(res => res.json())
      .catch(err => {
        console.error("Failed to load data.json:", err);
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
  console.log("Running in: ", window.location.href);

  // ignore top
  //if (window.self !== window.top) return;

  let siteId = null;

  // setting value as selected site from LocationId select first
  const locationSelect = document.querySelector('select[name="LocationId"]');
  //const locationSelect = document.querySelector('select[name="LocationId"]');


  if (locationSelect && locationSelect.value) {
    siteId = locationSelect.value.trim();

    console.log("Checked LocationId, siteId:", siteId);
  } else {
    console.log("LocationId select not found:", siteId);
  }

  // if LocationId is empty try PreviousLocationId select
  if (!siteId) {

    const previousLocation = document.querySelector('input[name="PreviousLocationId"]');

    if (previousLocation && previousLocation.value) {
      siteId = previousLocation.value.trim();

      console.log("Checked PreviousLocationId, siteId:", siteId);
    } else {
      console.log("PreviousLocationId select not found:", siteId);
    }
  }


  const siteConfig = siteData?.sites?.[siteId];

  // if its empty return log saying so
  if (!siteConfig) {
    console.log("No mapping for site:", siteId)
    return;
  }

  const users = siteConfig.managers;

  // if still empty then log again
  if (!siteId) {
    console.log("No site selected.");
    return;
  }



  if (!users || users.length === 0) {
    console.log("No manager for site:", siteId);
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


  // Trigger change for jQuery/Select2

  if (window.jQuery) {
    window.jQuery(input).val(formatted).trigger("change");
  } else {
    input.value = formatted;
    input.dispatchEvent(new Event ("change", { bubbles: true }))
  }

  console.log("Customer CC successfully set to:", formatted);
}
