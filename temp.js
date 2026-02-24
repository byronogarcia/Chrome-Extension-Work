// Runs when you click the extension icon

chrome.action.onClicked.addListener(async (tab) => {
  const allowedHost = "https://santehealth.giva.net/";


  if (!tab.url.startsWith(allowedHost)) return;

  // Inject and execute a function into the page
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: insertCustomerCC
  });
  
});


  // Hardcoded Site → User mapping
  const siteUserMap = {

    "5382": ["369454", "691092"],

    "7325": ["462822", "590021", "574556"]
  };

  let siteId = null;

  // Find the Location dropdown
  const locationSelect = document.querySelector('select[name="LocationId"]');
  if (locationSelect) {
    siteId = locationSelect.value;
    console.log("checked LocationId, siteId: ", siteId);
  }

  // fallback, checking previous
  if (!siteId) {
    const previousLocation = document.querySelector('select[name="PreviousLocationId"]');
    

    if (previousLocation) {
      siteId = previousLocation.value;
      console.log("Checked PreviousLocationId, siteId: ", siteId);
    }
  }

  if (!siteId) {
    console.log("No site selected", siteId);
    return;
  }

  const users = siteUserMap[siteId];
  if (!users) {
    console.log("No mapping for site:", siteId);
    return;
  }

  // Format as: user:123456,user:654321
  const formatted = users.map(id => `user:${id}`).join(",");

  const input = document.getElementById("customerCC");
  if (!input) {
    console.log("customerCC input not found.");
    return;
  }

  input.value = formatted;

  // Trigger change so jQuery / Select2 detects update
  input.dispatchEvent(new Event("change", { bubbles: true }));

  console.log("Customer CC set to:", formatted);
}
