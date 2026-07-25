// content.js — Giva CC Autofill
// Runs on all santehealth.giva.net pages
// Only job: detect when LocationId has a value on a corp site
// and notify background.js to show the yellow ! badge

// Poll every 500ms for LocationId to have a value
const interval = setInterval(() => {
  const locationSelect = document.querySelector('select[name="LocationId"]');

  if (locationSelect && locationSelect.value) {
    const siteId = locationSelect.value.trim();
    clearInterval(interval);

    // Send siteId to background.js — it will check the mode in data.json
    // and decide whether to show the corp badge
    chrome.runtime.sendMessage({ type: "SITE_DETECTED", siteId });
  }
}, 500);

// Stop polling after 30 seconds to prevent runaway intervals
setTimeout(() => clearInterval(interval), 30000);
