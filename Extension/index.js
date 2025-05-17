document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("del_user");

  // Load saved state
  chrome.storage.sync.get("scriptEnabled", (data) => {
    toggle.checked = data.scriptEnabled || false;
  });

  // Listen for changes to the checkbox
  toggle.addEventListener("change", () => {
    const isEnabled = toggle.checked;

    // Save the state
    chrome.storage.sync.set({ scriptEnabled: isEnabled });
  });
});
