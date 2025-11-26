/**
 * NOTE: Blacklisting notifications is currently not implement due to complexity issues
 * and likely won't be implemented in the future either. There may also be too many edge
 * cases to consider for it to even be useful or accurate.
 */

/**
 * Gets 10 notifications after a certain datetime
 * @param {String} date datetime (empty string returns 10 most recent notifications)
 * @returns {Promise} returns 10 most recent notifications
 */
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

/**
 * Loads all notifications until a given datetime (max. 300 notifications)
 * @param {String} max upper datetime bound
 * @returns {JSON[]} returns array of notification objects
 */
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

/**
 * Loads notification history (of the past two weeks) and sets it into the notification History
 */
async function loadHistory() {
  const twoWeeksAgo = Date.parse(new Date()) - 24 * 3600 * 1000 * 14;
  const notifications = await loadUntilDateTime(twoWeeksAgo);

  setNotificationHistory(notifications, false);
}

/**
 * Saves notification array in browser storage
 * @param {JSON[]} notifications array of notificatoin objects
 */
function setNotificationHistory(notifications) {
  if (!notifications) return;

  normalizeList(notifications); // Original array will be altered

  // Storage limit is 8192 bytes per item
  for (let i = 0; i < notifications.length; i += 12) {
    const dataBlock = {};
    const key = "notificationHistory" + Math.floor(i / 12);
    dataBlock[key] = notifications.slice(i, i + 12);
    browser.storage.sync.set(dataBlock);
  }
}

/** NOTIFICATION CODES
 * 1010 | Model comment
 * 1011 | Model like
 * 1012 | Model render
 * 1020 | Discussion post
 * 1030 | Message
 */

/**
 * Removes duplicate notifications and expired notification objects
 * @param {JSON[]} notifications array of notification objects
 */
function normalizeList(notifications) {
  // notifications.length will automatically update
  for (let i = 0; i <= notifications.length - 1; i++) {
    // Check if expired
    const n1 = notifications[i];
    const now = Date.parse(new Date()); // Now
    const past = Date.parse(n1.datetime);
    if ((now - past) / (24 * 3600 * 1000) > 14) {
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

/**
 * Marks user notifications as read
 */
function clearNotifications() {
  fetch("/en/account/notifications");
  const newURL = `https://www.mecabricks.com/${lang}/account/library`;
  if (pathname.includes("workshop")) {
    const ele = document.querySelector("a > .notifications");
    if (ele) {
      ele.parentElement.href = newURL;
      ele.remove();
    }
  } else if (pathname.includes("partmanager")) {
    if (document.querySelector(".user > .notifications")) {
      document.querySelector(".user > .notifications").remove();
      document.querySelector(".user > .picture").href = newURL;
    }
  } else {
    if (document.querySelector("#header-notifications")) {
      document.querySelector("#header-notifications").remove();
      document.querySelector("#header-username").href = newURL;
    }
  }
}

/**
 * Checks whether two notification objects have the same origin
 * (e.g. are both "like" notifications from the same model?)
 * @param {JSON} notif1 notification object
 * @param {JSON} notif2 notificaton object
 * @returns {boolean}
 */
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

/**
 * Checks notifications in advance if all notifications are caused by origins that are hidden
 * by the user. If yes, mark the notifications as read and remove the notification badge.
 */
async function checkNotifications() {
  const sHiddenUsers = await browser.storage.sync.get("hiddenUsers");
  const sHidIds = await browser.storage.sync.get("hidden_id_name");
  const sHideDeletedUsers = await browser.storage.sync.get("hideDeletedUsers");
  const hidUsers = sHiddenUsers.hiddenUsers;

  const hidIds = sHidIds.hidden_id_name
    ? sHidIds.hidden_id_name.ids
    : undefined;

  const hideDelUsers = sHideDeletedUsers.hideDeletedUsers;

  if (!hidUsers && !hidIds && !hideDelUsers) return;

  const sNotificationsHistory0 = await browser.storage.sync.get(
    "notificationHistory0"
  );
  const notifHistory0 = sNotificationsHistory0.notificationHistory0;

  if (!notifHistory0) {
    loadHistory();
    return;
  }

  const notifications = await getNewNotifications(notifHistory0[0]);

  if (!notifications) {
    clearNotifications();
    return;
  }

  if (hideDelUsers) hidUsers.push("");

  if (await allNotificationsBlocked(notifications, hidUsers, hidIds)) {
    const completeNotifsHistory = await getNotificationHistory();
    setNotificationHistory(notifications.concat(completeNotifsHistory));
    clearNotifications();
    storeLatestNotifications();
    return;
  } else {
    // Not all notifications are caused by origins that are hidden by the user
    // Thus the notification badge shouldn't be hidden
  }
}

/**
 * Gets notifications from storage
 * @returns {JSON[]} array of notifications
 */
async function getNotificationHistory() {
  let notifications = [];

  // Notifications are stored over several objects due to their large size
  for (let i = 0; i < 25; i++) {
    const key = "notificationHistory" + i;
    const notifBlock = await browser.storage.sync.get(key);
    if (!notifBlock[key]) break;
    notifications = notifications.concat(notifBlock[key]);
  }
  return notifications;
}

/**
 * Returns array of unread notifications based on last saved notification(s)
 * @param {JSON[0]} lastNotification
 * @returns {JSON[]} array of notification objects
 */
async function getNewNotifications(lastNotification) {
  try {
    const lastDateTime = lastNotification.datetime;
    const notifications = await loadUntilDateTime(Date.parse(lastDateTime));
    return notifications;
  } catch (e) {
    console.warn(e);
    return [];
  }
}

/**
 * Checks whether all (unread) notifications are "blocked" (in the sense that the notification
 * was caused by a source hidden by the user)
 * @param {JSON[]} notifications array of notification objects
 * @param {String[]} hidUsers hidden users (by username)
 * @param {String[]} hidIds hidden discussion or models (by id)
 * @returns {boolean}
 */
async function allNotificationsBlocked(notifications, hidUsers, hidIds) {
  for (const notif of notifications) {
    if (
      notif.senders.users.every((u) =>
        hidUsers.includes(u.name.trim().toLowerCase())
      )
    )
      continue;
    // In future this may be handled via ID instead of title name
    if (notif.code === 1020) {
      if (hidIds) if (hidIds.includes(JSON.stringify(notif.topic.id))) continue;
    } else if ([1010, 1011, 1012].includes(notif.code)) {
      if (hidIds) if (hidIds.includes(notif.model.alphanumId)) continue;
      if (hidUsers.includes(notif.model.user.name.trim().toLowerCase()))
        continue;
    }

    // Check if any sender is spam
    if (
      !notif.senders.users.some((u) =>
        hidUsers.includes(u.name.trim().toLowerCase())
      )
    )
      return false;
    // Check if single sender -> If not, it should have `continued` before
    if (notif.senders.users.length === 1) return false;

    // Loop with isNotificationBlocked with notifications and hiddenUsers
    if (!(await newSendersBlocked(notif, hidUsers))) return false;
  }

  return true;
}

/**
 * Compares notification to past notification to see the user(s) who newly posted on this
 * origin (e.g. model comment section) are hidden. If a non-hidden user precedes hidden user,
 * this will naturally return false, as the notification badge should be shown in case a
 * non-hidden user generates a notification (e.g. comments).
 * NOTE: The edge case where users may comment in the same order is not considered, e.g.
 * (hidden, xyz) vs. (hidden, xyz) will return false, even if *xyz* commented anew
 * @param {JSON} notif notification object
 * @param {String[]} hidUsers array of hidden users (by username)
 * @returns {boolean}
 */
async function newSendersBlocked(notif, hidUsers) {
  // Max 300 notifs will be stored in the notification history.
  // 300 / 12 = 25
  for (let i = 0; i < 25; i++) {
    const histKey = "notificationHistory" + i;
    const notifBlock = await browser.storage.sync.get(histKey);
    if (!notifBlock[histKey]) return false; // As not every is blocked, there will be a new non-hidden user
    for (const oldNotif of notifBlock[histKey]) {
      if (!sameOrigin(oldNotif, notif)) continue;
      const oldSenders = oldNotif.senders.users.map((u) =>
        u.name.trim().toLowerCase()
      );
      const newSenders = notif.senders.users.map((u) =>
        u.name.trim().toLowerCase()
      );

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
      blackListNotifications(notif);

      return true;
    }
  }

  // In case none were found
  return false;
}

/**
 * Saves blacklisted notification, such that this notification may be
 * later removed in the notifications tab. NOTE: This behavior is currently
 * not implemented due to complexity.
 * @param {JSON} notif notification object
 */
async function blackListNotifications(notif) {
  const preList = await browser.storage.sync.get("idBlacklist");
  const obj = {};

  let id;

  if ([1010, 1011, 1012].includes(notif.code)) id = notif.model.alphanumId;
  else if (notif.code === 1020) id = notif.topic.id;
  else if (notif.code === 1030) id = notif.chat.alphanumId;
  else return;

  if (preList.idBlacklist) obj.idBlackList = preList.idBlackList.push(id);
  else obj.idBlackList = [id];
  browser.storage.sync.set(obj);
}

/**
 * Saves lastest notifications (when on notifications tab) or loads history from scratch
 * if nothing is saved
 */

async function storeLatestNotifications() {
  const notifHist0 = await browser.storage.sync.get("notificationHistory0");
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
