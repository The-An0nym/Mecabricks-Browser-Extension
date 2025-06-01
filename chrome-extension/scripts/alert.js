function tryRemoval() {
  const overlay = document.querySelector(
    'div[style*="height: 100%; position: fixed; width: 100%; z-index: 20000;"]'
  ); // Targets any div with position fixed
  if (overlay) overlay.style.height = "0%"; // Hide the overlay
}

if (document.getElementById("alert-wrapper")) {
  document.getElementById("alert-wrapper").style.height = "0";
} else {
  const targetNode = document.body;
  const config = { childList: true };
  const observer = new MutationObserver(tryRemoval);
  observer.observe(targetNode, config);
}
