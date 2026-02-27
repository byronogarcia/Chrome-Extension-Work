// Runs when you click the extension icon

let siteDataPromise;

// function getSiteData() {
//   if (!siteDataPromise) {
//     const url = chrome.runtime.getURL("sites.json");

//     siteDataPromise = fetch(url)
//       .then(res => res.json())
//       .catch(err => {
//         console.error("Failed to load sites.json:", err);
//         return null;
//       });
//   }

//   return siteDataPromise;
// }


chrome.action.onClicked.addListener(async (tab) => {

  const allowedHost = "https://santehealth.giva.net/";

  if (!tab.url.startsWith(allowedHost)) {
    console.log("Not allowed host.");
    return;
  }

  await chrome.scripting.executeScript({
    target: { tabId: tab.id, allFrames: true },
    func: insertCustomerCC
  });
});



function insertCustomerCC() {

  console.log("Extension triggered.");

 // if (window.self !== window.top) return;


  const siteUserMap = {
    "5382": ["369454", "691092"],
    "7325": ["462822", "590021", "574556"]
  };

  let siteId = null;

  const locationSelect = document.querySelector('select[name="LocationId"] option[selected]');

  if (locationSelect) {
    siteId = locationSelect.value;
    console.log("Checked LocationId, siteId:", siteId);
  } else {
    console.log("LocationId select not found:", siteId);
  }


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


  const users = siteUserMap[siteId];

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
