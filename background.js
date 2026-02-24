// background.js
// Runs when you click the extension icon

chrome.action.onClicked.addListener(async (tab) => {

  // Only run on normal webpages
  if (!tab.url.startsWith("http")) return;

  // Inject and execute a function into the page
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: insertCustomerCC
  });
});

// This function runs inside the webpage context
function insertCustomerCC() {

  // Hardcoded Site → User mapping
  const siteUserMap = {
    "5382": ["123456"],
    "1234": ["123456", "654321", "000111"]
  };

  // Find the Location dropdown
  const select = document.querySelector('select[name="LocationId"]');
  if (!select) {
    console.log("Location dropdown not found.");
    return;
  }

  const selectedSite = select.value;

  const users = siteUserMap[selectedSite];
  if (!users) {
    console.log("No mapping for site:", selectedSite);
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
