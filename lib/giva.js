// lib/giva.js
// Responsible for all DOM interaction with the Giva page
// This is the ONLY file that reads from or writes to the Giva ticket form

// Reads the current site ID from the ticket form
// Checks LocationId first, falls back to PreviousLocationId
// Returns the site ID string or null if not found
function getSiteId() {
  const locationSelect = document.querySelector('select[name="LocationId"]');
  if (locationSelect && locationSelect.value) {
    return locationSelect.value.trim();
  }

  const previousLocation = document.querySelector('input[name="PreviousLocationId"]');
  if (previousLocation && previousLocation.value) {
    return previousLocation.value.trim();
  }

  return null;
}

// Takes an array of manager ID strings and sets the customerCC field
// Handles both jQuery/Select2 and native DOM events
// This is the single place that modifies the Giva page
function applyCustomerCC(managerIds) {
  const input = document.getElementById("customerCC");
  if (!input) {
    console.log("Giva CC: customerCC input not found.");
    return;
  }

  // Format: "user:123456,user:654321"
  const formatted = managerIds.map(id => `user:${id}`).join(",");

  if (window.jQuery) {
    window.jQuery(input).val(formatted).trigger("change");
  } else {
    input.value = formatted;
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  console.log("Giva CC: set to", formatted);
}
