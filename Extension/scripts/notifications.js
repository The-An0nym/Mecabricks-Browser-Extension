// The prupose of this file:
// Save the last 10 - 30 Notifications and check for differences whenever new notifications pop up
// If those changes only includes hidden users and thread, hide the notification badge
// Maybe -> Only fetch if there is a new notification (-> Notification number increased. Save this somewhere)
// Otherwise fetch, store differences, etc.
// ALSO: Don't forget to link it to the manifest.json
async function checkNotifications() {
  const r = await fetch("/api/notifications/get", {
    headers: {
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    body: "datetime=&lang=en",
    method: "POST",
  });
  const res = await r.json();
  if (res.status !== "pass") return;

  chrome.storage.sync.get("lastNotification", (d) => {
    if (d.lastNotification) {
      const lastNotification = d.lastNotification;
      let index = 0;
      for (const notification of res.data.notifications) {
        index++;
        if (notification.code !== lastNotification.code) continue;
        if (
          !sameSenders(
            notification.senders.users,
            lastNotification.senders.users
          )
        )
          continue;
        if (!sameStats(notification.stats, lastNotification.stats)) continue;
        // Found the notification!
        index--;
        break;
      }
      console.log(index);
      if (index === 0) return; // No new notifications
      if (index < 10) {
        if (anyUnblocked(res.data.notifications.slice(0, index))) return;
        chrome.storage.sync.set({
          lastNotification: res.data.notifications[0],
        });
        fetch("/account/notifications"); // Clear notifications
        // HIDE NOTIFICATION HERE
        console.log("hide!");
      } else {
        console.warn(
          "Notifications do not include the last saved notification"
        );
        // Save 10th notification
        const _notification = res.data.notifications[9];
        chrome.storage.sync.set({ lastNotification: _notification });
        console.log(_notification);
        // Load another page of notifications? -> Unlikely that they are *all* unblocked...
      }
    } else {
      // First time
      const _notification = res.data.notifications[9];
      chrome.storage.sync.set({ lastNotification: _notification });
      console.log(_notification);
    }
  });

  // Call fetch("/account/notifications") when needing to clear notifications
}

function anyUnblocked(list) {
  for (const item of list) {
    // Do lotta stuff here
    // ADD: Store list of notifications insead of a single one so I can compare differences in senders
  }
  return false;
}

function sameSenders(arr1, arr2) {
  if (!arr1) return false;
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i].name !== arr2[i].name) return false;
  }
  return true;
}

function sameStats(obj1, obj2) {
  for (const key of Object.keys(obj1)) {
    if (!obj2[key]) return false;
    if (obj1[key] !== obj2[key]) return false;
  }
  return true;
}

async function storeLatestNotification() {
  const r = await fetch("/api/notifications/get", {
    headers: {
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    body: "datetime=&lang=en",
    method: "POST",
  });
  const res = await r.json();
  if (res.status !== "pass") return;

  chrome.storage.sync.set({
    lastNotification: res.data.notifications[0],
  });
}

// Check if there are notifications
if (url.includes("workshop")) {
  if (document.querySelector("a > .notifications")) checkNotifications();
} else if (url.includes("partmanager")) {
  if (document.querySelector(".user > .notifications")) checkNotifications();
} else if (url.includes("notifications")) {
  storeLatestNotification();
} else {
  if (document.querySelector("#header-notifications")) checkNotifications();
}
