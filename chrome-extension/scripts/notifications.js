// The prupose of this file:
// Save the last 10 - 30 Notifications and check for differences whenever new notifications pop up
// If those changes only includes hidden users and thread, hide the notification badge
// Maybe -> Only fetch if there is a new notification (-> Notification number increased. Save this somewhere)
// Otherwise fetch, store differences, etc.
// ALSO: Don't forget to link it to the manifest.json
async function getNotifications(date) {
  const dateTime = encodeURIComponent(date);
  try {
    const response = await fetch("/api/notifications/get", {
      headers: {
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
      body: `datetime=${dateTime}&lang=en`,
      method: "POST",
    });
    const result = await response.json();
    if (result.status !== "pass") return Promise.reject("failed pass");
    return Promise.resolve(result.data);
  } catch (e) {
    return Promise.reject(e);
  }
}

async function loadHistory() {
  let notifications = [];
  let dateTime = "";
  for (let page = 0; page < 30; page++) {
    try {
      const data = await getNotifications(dateTime);
      notifications = notifications.concat(data.notifications);
      dateTime = data.notifications[data.notifications.length - 1].datetime;

      // Next page?
      if (!data.next) break;

      // Older than three weeks?
      const now = Date.parse(new Date()); // Now
      const past = Date.parse(dateTime);
      if ((now - past) / (24 * 3600 * 1000) > 21) break;
    } catch (e) {
      console.log(e);
      break;
    }
  }

  if (!notifications) return;

  makeUnique(notifications); // Original array will be altered
  chrome.storage.sync.set({ notificationHistory: notifications });
}

// CODES
// 1010 Model comment
// 1011 Model like
// 1012 Model render
// 1020 Thread Message
// 1030 Message

function makeUnique(notifications) {
  // O(n^2)... whoopsie
  // notifications.length will automatically update
  for (let i = 0; i < notifications.length - 1; i++) {
    for (let j = i + 1; j < notifications.length; j++) {
      const n1 = notifications[i];
      const n2 = notifications[j];

      if (n1.code !== n2.code) continue;
      if ([1010, 1011, 1012].includes(n1.code)) {
        if (n1.model.alphanumId !== n2.model.alphanumId) continue;
      } else if (n1.code === 1020) {
        if (n1.topic.id !== n2.topic.id) continue;
      } else if (n1.code === 1030) {
        if (n1.chat.alphanumId !== n2.chat.alphanumId) continue;
      }
      // Delete n2
      notifications.splice(j, 1);
    }
  }

  return notifications;
}

function refresh() {
  fetch("/en/account/notifications");
  if (url.includes("workshop")) {
    document.querySelector("a > .notifications").remove();
  } else if (url.includes("partmanager")) {
    document.querySelector(".user > .notifications").remove();
  } /*else if (url.includes("notifications")) {
    loadHistory(); // This will refresh history
  }*/ else {
    if (document.querySelector("#header-notifications"))
      document.querySelector("#header-notifications").remove();
  }
}

/*async function checkNotifications() {
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
        console.log("Notifications do not include the last saved notification");
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
}*/

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
