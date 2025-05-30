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

async function loadUntilDateTime(max) {
  let notifications = [];
  let dateTime = "";
  for (let page = 0; page < 30; page++) {
    try {
      const data = await getNotifications(dateTime);
      notifications = notifications.concat(data.notifications);
      dateTime = data.notifications[data.notifications.length - 1].datetime;

      // Next page?
      if (!data.next) break;

      // Older than max?
      const numericDateTime = Date.parse(dateTime);
      if (numericDateTime <= max) break;
    } catch (e) {
      console.log(e);
      break;
    }
  }

  // Refine
  let lim = 10;
  const length = notifications.length;
  if (length < lim) {
    lim = length;
  }
  for (let i = 0; i < lim; i++) {
    const datetime = notifications[length - 10 + i].datetime;
    if (Date.parse(datetime) <= max) {
      notifications.splice(length - 10 + i);
      break;
    }
  }

  return notifications;
}

async function loadHistory() {
  const threeWeeksAgo = Date.parse(new Date()) - 24 * 3600 * 1000 * 21;
  const notifications = await loadUntilDateTime(threeWeeksAgo);

  setNotificationHistory(notifications, false);
}

function setNotificationHistory(notifications) {
  if (!notifications) return;

  normalizeList(notifications); // Original array will be altered

  // Storage limit is 8192 bytes per item
  for (let i = 0; i < notifications.length; i += 12) {
    const dataBlock = {};
    dataBlock["notificationHistory" + i] = notifications.slice(i, i + 12);
    chrome.storage.sync.set(dataBlock);
  }
}

// CODES
// 1010 Model comment
// 1011 Model like
// 1012 Model render
// 1020 Thread Message
// 1030 Message

function normalizeList(notifications) {
  // O(n^2)... whoopsie
  // notifications.length will automatically update
  for (let i = 0; i <= notifications.length - 1; i++) {
    // Check if expired
    const n1 = notifications[i];
    const now = Date.parse(new Date()); // Now
    const past = Date.parse(n1.datetime);
    if ((now - past) / (24 * 3600 * 1000) > 21) {
      // Delete n1
      notifications.splice(i, 1);
      continue;
    }

    for (let j = i + 1; j < notifications.length; j++) {
      // See if "duplicates" (same model/thread/etc.)
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
}

function clearNotifications() {
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

function areNotificationsSame(n1, n2) {
  return n1.datetime === n2.datetime;
}

// For later
// When trying to figure out which senders are wrong/same
function sendersSomething(obj1, obj2) {
  if (obj1.code !== obj2.code) return false;
  // Compare IDs
  if ([1010, 1011, 1012].includes(n1.code)) {
    if (n1.model.alphanumId !== n2.model.alphanumId) return false;
  } else if (n1.code === 1020) {
    if (n1.topic.id !== n2.topic.id) return false;
  } else if (n1.code === 1030) {
    if (n1.chat.alphanumId !== n2.chat.alphanumId) return false;
  }
}

async function checkNotifications() {
  const sHiddenUsers = await chrome.storage.sync.get("hiddenUsers");
  const sHiddenThreads = await chrome.storage.sync.get("hiddenThreads");
  const sHideDeletedUsers = await chrome.storage.sync.get("hideDeletedUsers");
  const hidUsers = sHiddenUsers.hiddenUsers;
  const hidThreads = sHiddenThreads.hiddenThreads;
  const hideDelUsers = sHideDeletedUsers.hideDeletedUsers;

  console.log(hidUsers);

  if (!hidUsers && !hidThreads && !hideDelUsers) return;

  const sNotificationsHistory0 = await chrome.storage.sync.get(
    "notificationHistory0"
  );
  const notifHistory0 = sNotificationsHistory0.notificationHistory0;

  if (!notifHistory0) {
    loadHistory();
    console.log("Load History");
    return;
  }

  const notifications = await getNewNotifications(notifHistory0);

  console.log(notifications);

  if (!notifications) {
    console.log(!notifications);
    clearNotifications();
    return;
  }

  if (hideDelUsers) {
    hidUsers.push("");
  }

  if (await allNotificationsBlocked(notifications, hidUsers, hidThreads)) {
    // DO STUFF HERE: TODO
    // Store datetimes so that the notifications can also be hidden in the notifications tab
    clearNotifications();
    return;
  } else {
    // Do nothing ig? -> Unhide notifications?
    // Save number
  }
}

async function getNewNotifications(notifHistory0) {
  try {
    const lastDateTime = notifHistory0[0].datetime;
    const notifications = await loadUntilDateTime(Date.parse(lastDateTime));

    return notifications;
  } catch (e) {
    console.log(e);
    return [];
  }
}

async function allNotificationsBlocked(notifications, hidUsers, hidThreads) {
  for (let i = 0; i < notifications.length; i++) {
    // Loop with isNotificationBlocked with notifications and hiddenUsers
  }
  return false;
}

function isNotificationBlocked(notification) {
  // Do stuff here
  return false;
}

// Check if there are notifications
if (url.includes("workshop")) {
  if (document.querySelector("a > .notifications")) checkNotifications();
} else if (url.includes("partmanager")) {
  if (document.querySelector(".user > .notifications")) checkNotifications();
} /* else if (url.includes("notifications")) {
  storeLatestNotification();
}*/ else {
  if (document.querySelector("#header-notifications")) checkNotifications();
}
