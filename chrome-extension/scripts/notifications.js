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
    const key = "notificationHistory" + Math.floor(i / 12);
    dataBlock[key] = notifications.slice(i, i + 12);
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
      // See if "duplicates" (same model/thread/etc.) -> If yes, delete notif at second pointer (j)
      if (sameOrigin(n1, notifications[j])) notifications.splice(j, 1);
    }
  }
}

function clearNotifications() {
  fetch("/en/account/notifications");
  if (url.includes("workshop")) {
    document.querySelector("a > .notifications").remove();
  } else if (url.includes("partmanager")) {
    document.querySelector(".user > .notifications").remove();
  } else {
    if (document.querySelector("#header-notifications"))
      document.querySelector("#header-notifications").remove();
  }
}

function sameOrigin(notif1, notif2) {
  if (notif1.code !== notif2.code) return false;
  // Compare IDs
  if ([1010, 1011, 1012].includes(notif1.code)) {
    if (notif1.model.alphanumId !== notif2.model.alphanumId) return false;
  } else if (notif1.code === 1020) {
    if (notif1.topic.id !== notif2.topic.id) return false;
  } else if (notif1.code === 1030) {
    if (notif1.chat.alphanumId !== notif2.chat.alphanumId) return false;
  }
  return true;
}

async function checkNotifications() {
  const sHiddenUsers = await chrome.storage.sync.get("hiddenUsers");
  const sHiddenThreads = await chrome.storage.sync.get("hiddenThreads");
  const sHideDeletedUsers = await chrome.storage.sync.get("hideDeletedUsers");
  const hidUsers = sHiddenUsers.hiddenUsers;
  const hidThreads = sHiddenThreads.hiddenThreads;
  const hideDelUsers = sHideDeletedUsers.hideDeletedUsers;

  if (!hidUsers && !hidThreads && !hideDelUsers) return;

  const sNotificationsHistory0 = await chrome.storage.sync.get(
    "notificationHistory0"
  );
  const notifHistory0 = sNotificationsHistory0.notificationHistory0;

  if (!notifHistory0) {
    loadHistory();
    return;
  }

  const notifications = await getNewNotifications(notifHistory0);

  if (!notifications) {
    clearNotifications();
    return;
  }

  if (hideDelUsers) {
    hidUsers.push("");
  }

  console.log(notifications);

  if (await allNotificationsBlocked(notifications, hidUsers, hidThreads)) {
    const completeNotifsHistory = await getNotificationHistory();
    setNotificationHistory(notifications.concat(completeNotifsHistory));
    clearNotifications();
    storeLatestNotifications();
    return;
  } else {
    // NOTIFICATIONS AREN'T ALL BLOCKED
  }
}

async function getNotificationHistory() {
  let notifications = [];
  for (let i = 0; i < 25; i++) {
    const key = "notificationHistory" + i;
    const notifBlock = await chrome.storage.sync.get(key);
    if (!notifBlock[key]) break;
    notifications = notifications.concat(notifBlock[key]);
  }
  return notifications;
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
  for (const notif of notifications) {
    if (notif.senders.users.every((u) => hidUsers.includes(u.name))) continue;
    // In future this may be handled via ID instead of title name
    if (notif.code === 1020) {
      if (hidThreads) if (hidThreads.includes(notif.topic.title)) continue;
    } else if ([1010, 1011, 1012].includes(notif.code)) {
      if (hidUsers.includes(notif.model.user.name)) continue;
    }

    // Check if any sender is spam
    if (!notif.senders.users.some((u) => hidUsers.includes(u.name)))
      return false;
    // Check if single sender -> If not, it should have `continued` before
    if (notif.senders.users.length === 1) return false;
    // Loop with isNotificationBlocked with notifications and hiddenUsers
    if (!(await newSendersBlocked(notif, hidUsers))) return false;
  }

  return true;
}

async function newSendersBlocked(notif, hidUsers) {
  // Max 300 notifs will be stored in the notification history.
  // 300 / 12 = 25
  for (let i = 0; i < 25; i++) {
    const histKey = "notificationHistory" + i;
    const notifBlock = await chrome.storage.sync.get(histKey);
    if (!notifBlock[histKey]) return false; // As not every is blocked, there will be a new non-hidden user
    for (const oldNotif of notifBlock[histKey]) {
      if (!sameOrigin(oldNotif, notif)) continue;
      const oldSenders = oldNotif.senders.users.map((u) => u.name);
      const newSenders = notif.senders.users.map((u) => u.name);

      // Newest sender HAS to be hidUser
      if (!hidUsers.includes(newSenders[0])) return false;
      // Most recent not-hidden user
      const lastIndex = oldSenders.findIndex((s) => !hidUsers.includes(s));
      const lastUser = oldSenders[lastIndex];
      // Senders list HAS to include the most rencent sender of the old senders
      if (!newSenders.includes(lastUser)) return false;
      const index = newSenders.indexOf(lastUser);

      // Order not same
      if (
        !newSenders
          .slice(index)
          .every((s, k) => s === oldSenders[lastIndex + k])
      )
        return false;
      // Newest users not all blocked
      if (!newSenders.slice(0, index).every((s) => hidUsers.includes(s)))
        return false;

      // Store datetimes so that the notifications can also be hidden in the notifications tab
      blackListDateTime(notif.datetime);

      return true;
    }
  }

  // In case none were found
  return false;
}

async function blackListDateTime(datetime) {
  const preList = await chrome.storage.sync.get("datetimeBlacklist");
  const obj = {};
  if (preList.datetimeBlacklist)
    obj.datetimeBlackList = preList.datetimeBlackList.push(datetime);
  else obj.datetimeBlackList = [datetime];
  chrome.storage.sync.set(obj);
}

async function storeLatestNotifications() {
  const notifHist0 = await chrome.storage.sync.get("notificationHistory0");
  if (!notifHist0.notificationHistory0) {
    loadHistory();
    return;
  }

  const lastDateTime = notifHist0.notificationHistory0[0].datetime;
  const newNotifications = await loadUntilDateTime(Date.parse(lastDateTime));

  // No new notifications
  if (!newNotifications) return;

  const oldNotifications = await getNotificationHistory();

  setNotificationHistory(newNotifications.concat(oldNotifications));
}

// Check if there are notifications
if (url.includes("workshop")) {
  if (document.querySelector("a > .notifications")) checkNotifications();
} else if (url.includes("partmanager")) {
  if (document.querySelector(".user > .notifications")) checkNotifications();
} else if (url.includes("notifications")) {
  storeLatestNotifications();
} else {
  if (document.querySelector("#header-notifications")) checkNotifications();
}
