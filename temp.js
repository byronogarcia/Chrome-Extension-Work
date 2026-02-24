// Runs when you click the extension icon
// <option value="7325" selected="selected">The Heart Group Fresno</option>
// <input type="hidden" name="PreviousLocationId" value="7325">

// <select class="w-100" name="LocationId" tabindex="1">
// 																		<option value="">Choose</option>
																		
// 																			<option value="4409">- Asset Deletion -</option>
																		
// 																			<option value="4570">- Storage 125 -</option>
																		
// 																			<option value="4569">- Storage 210 -</option>
																		
// 																			<option value="4571">- Storage 225 -</option>
																		
// 																			<option value="5382" selected="selected">AGHA</option>
																		
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

// Try selected option first
const selectedOption = document.querySelector('select[name="LocationId"] option[selected]');

if (selectedOption) {
  siteId = selectedOption.value;
  console.log("Found selected option:", siteId);
}

// Fallback to hidden PreviousLocationId
if (!siteId) {
  const previousLocation = document.querySelector('input[name="PreviousLocationId"]');

  if (previousLocation) {
    siteId = previousLocation.value;
    console.log("Using PreviousLocationId:", siteId);
  }
}

if (!siteId) {
  console.log("No site ID found at all.");
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
