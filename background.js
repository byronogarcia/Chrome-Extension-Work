// background.js - Giva CC Autofill

let siteDataJSON;

// Loads and caches data.json
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

// As the name implies, when extension is clicked it runs
chrome.action.onClicked.addListener(async (tab) => {

  // Only run on Sante Health Giva instance, if not return
  const allowedHost = "https://santehealth.giva.net/";

  // Check if it is the correct host, if not return
  if (!tab.url.startsWith(allowedHost)) {
    return;
  }

  // Loading site data from data.json, if it fails log and return
  const siteData = await getSiteData();
  if (!siteData) {
    console.log("Site data failed to load.");
    return;
  }

// Read Customer ID using this executeScript
  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id, allFrames: true },
    world: "MAIN",
    func: () => String(window.TicketApp?.customer?.id ?? "")
  });
  const customerId = results?.map(r => r.result).find(r => r !== "") ?? "";
  // Log the customerId to verify it's being retrieved correctly
  console.log("customerId:", customerId);

  // Another excecuteScript to now insert the Customer CC
  await chrome.scripting.executeScript({
    target: { tabId: tab.id, allFrames: true },
    func: insertCustomerCC,
    args: [siteData, customerId]
  });

  // Visual feedback for the user that the extension ran successfully
  // Shows a green ✓ on the icon for 3 seconds then clears
  chrome.action.setBadgeText({ text: "✓", tabId: tab.id });
  chrome.action.setBadgeBackgroundColor({ color: "#2e7d32", tabId: tab.id });
  setTimeout(() => chrome.action.setBadgeText({ text: "", tabId: tab.id }), 3000);
});


// Function defined here, takes in siteData from our data.json
// and customerId we got from the previous executeScript
function insertCustomerCC(siteData, customerId) {

  // Logging if its running and what window its running in
  console.log("Giva CC running in:", window.location.href);

  let siteId = null;

  // Read from the webpage and get LocationID
  // Example: <option value="5382">AGHA</option>
  // Pulls LocationId setting it as 5382
  const locationSelect = document.querySelector('select[name="LocationId"]');
  if (locationSelect && locationSelect.value) {
    // if locationSelect is found and has a value, set siteId to it
    // trim is used to remove any extra whitespace just in case
    siteId = locationSelect.value.trim();
  }

  // If siteId is empty check Previous Location
  if (!siteId) {
    const previousLocation = document.querySelector('input[name="PreviousLocationId"]');
    if (previousLocation && previousLocation.value) {
      siteId = previousLocation.value.trim();
    } 
  }

  // Used to stop the function if its empty after two checks
  // At this point it checked LocationId and PreviousLocationId and both were empty
  if (!siteId) return;

  const siteConfig = siteData?.sites?.[siteId];
  // if site does not exist in our data.json log and return
  if (!siteConfig) {
    console.log("No mapping for site:", siteId)
    return;
  }

  const users = siteConfig.managers;
  // if still empty then log again

  if (!users || users.length === 0) {
    console.log("No manager for site:", siteId);
    return;
  }

  // Print manager IDs before filtering
  console.log("Users found:", users);

  // To prevent adding the customer CC
  // if the customer is also a manager we exclude them from the CC list
  const filtered = users.filter(id => id !== customerId);
  if (customerId && filtered.length < users.length) {
  console.log("Excluded customer from CC:", customerId);
  }

  // Format: user:123456,user:654321
  const formatted = filtered.map(id => `user:${id}`).join(",");

  const input = document.getElementById("customerCC");
  if (!input) return;


  // Trigger change for jQuery/Select2
  if (window.jQuery) {
    window.jQuery(input).val(formatted).trigger("change");
  } else {
    input.value = formatted;
    input.dispatchEvent(new Event ("change", { bubbles: true }))
  }

  console.log("Customer CC successfully set to:", formatted);
}
