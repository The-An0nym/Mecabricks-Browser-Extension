// Select the node that will be observed for mutations
const targetNode = document.body;

// Options for the observer (which mutations to observe)
const config = { childList: true };

// Callback function to execute when mutations are observed
const tryRemoval = (mutationList, observer) => {
  for (const mutation of mutationList) {
    if (mutation.type === "childList") {
      const overlay = document.querySelector(
        'div[style*="height: 100%; position: fixed; width: 100%; z-index: 20000;"]'
      ); // Targets any div with position fixed
      if (overlay) {
        overlay.style.height = "0%"; // Hide the overlay
      }
    }
  }
};

// Create an observer instance linked to the callback function
const observer = new MutationObserver(tryRemoval);

// Start observing the target node for configured mutations
observer.observe(targetNode, config);
