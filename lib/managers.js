// lib/managers.js
// Responsible for manager list filtering
// No DOM access, no page interaction — pure logic

// Takes a list of manager IDs and a customerId
// Returns the filtered list with the customer excluded if they appear in it
function filterManagers(managerIds, customerId) {
  if (!customerId) return managerIds;

  const filtered = managerIds.filter(id => id !== customerId);

  if (filtered.length < managerIds.length) {
    console.log("Giva CC: excluded customer", customerId, "from CC.");
  }

  return filtered;
}
