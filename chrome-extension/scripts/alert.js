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

async function getTimer() {
  const enabled = await chrome.storage.sync.get("postCooldown");
  if (!enabled.postCooldown) return;
  const data = await chrome.storage.sync.get("lastPost");
  if (!data.lastPost) return;
  const datetime = data.lastPost;
  const now = Date.parse(new Date());
  if (now - datetime < 1000 * 60) {
    const timeRemaining = 60000 - (now - datetime);
    const ele = document.createElement("div");
    ele.className = "post-timer";
    ele.textContent = Math.round(timeRemaining / 1000);
    document.body.prepend(ele);
    const x = setInterval(update, 100, datetime, ele);
    setTimeout(() => {
      ele.remove();
      clearInterval(x);
    }, timeRemaining);
  }
}

function update(datetime, ele) {
  const now = Date.parse(new Date());
  ele.textContent = Math.round(60 - (now - datetime) / 1000);
}

async function setTimer() {
  const data = await chrome.storage.sync.get("lastPost");
  const now = Date.parse(new Date());
  if (data.lastPost) {
    const datetime = Date.parse(data.lastPost);
    if (now - datetime < 1000 * 60) return;
  }

  chrome.storage.sync.set({ lastPost: now });
}

getTimer();
