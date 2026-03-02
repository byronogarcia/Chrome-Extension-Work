function insertCustomerCC(siteData) {

  console.log("Extension triggered.");
  console.log("Running in:", window.location.href);

  // Ignore top frame
  if (window.self === window.top) return;

  let siteId = null;

  const select = document.querySelector('select[name="LocationId"]');
  if (select && select.value) {
    siteId = select.value.trim();
  }

  if (!siteId) {
    const previousLocation = document.querySelector('input[name="PreviousLocationId"]');
    if (previousLocation && previousLocation.value) {
      siteId = previousLocation.value.trim();
    }
  }

  if (!siteId) {
    console.log("No site selected.");
    return;
  }

  const siteConfig = siteData?.sites?.[siteId];

  if (!siteConfig) {
    console.log("No mapping for site:", siteId);
    return;
  }

  const users = siteConfig.managers;

  if (!users || users.length === 0) {
    console.log("No managers found.");
    return;
  }

  const formatted = users.map(id => `user:${id}`).join(",");

  const input = document.getElementById("customerCC");

  if (!input) {
    console.log("customerCC input not found");
    return;
  }

  if (window.jQuery) {
    window.jQuery(input).val(formatted).trigger("change");
  } else {
    input.value = formatted;
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  console.log("Customer CC successfully set to:", formatted);
}
