// Runs when you click the extension icon
chrome.action.onClicked.addListener(async (tab) => {

  const allowedHost = "https://santehealth.giva.net/";

  if (!tab.url.startsWith(allowedHost)) {
    console.log("Not allowed host.");
    return;
  }

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: insertCustomerCC
  });
});


// ===============================
// FUNCTION THAT RUNS IN THE PAGE
// ===============================
function insertCustomerCC() {

  console.log("Extension triggered.");

  // ===============================
  // Hardcoded Site → User mapping
  // ===============================
  const siteUserMap = {
    "5382": ["369454", "691092"],
    "7325": ["462822", "590021", "574556"]
  };

  let siteId = null;

  // ===============================
  // Try primary selector
  // ===============================
  const locationSelect = document.querySelector('select[name="LocationId"]');

  if (locationSelect) {
    siteId = locationSelect.value;
    console.log("Checked LocationId, siteId:", siteId);
  } else {
    console.log("LocationId select not found.");
  }

  // ===============================
  // Fallback selector
  // ===============================
  if (!siteId) {

    const previousLocation = document.querySelector('select[name="PreviousLocationId"]');

    if (previousLocation) {
      siteId = previousLocation.value;
      console.log("Checked PreviousLocationId, siteId:", siteId);
    } else {
      console.log("PreviousLocationId select not found.");
    }
  }

  // ===============================
  // If still no site
  // ===============================
  if (!siteId) {
    console.log("No site selected.");
    return;
  }

  // ===============================
  // Lookup users
  // ===============================
  const users = siteUserMap[siteId];

  if (!users) {
    console.log("No mapping for site:", siteId);
    return;
  }

  console.log("Users found:", users);

  // Format: user:123456,user:654321
  const formatted = users.map(id => `user:${id}`).join(",");

  // ===============================
  // Find hidden input
  // ===============================
  const input = document.getElementById("customerCC");

  if (!input) {
    console.log("customerCC input not found.");
    return;
  }

  // ===============================
  // Set value
  // ===============================
  input.value = formatted;

  // Trigger change for jQuery/Select2
  input.dispatchEvent(new Event("change", { bubbles: true }));

  console.log("Customer CC successfully set to:", formatted);
}
