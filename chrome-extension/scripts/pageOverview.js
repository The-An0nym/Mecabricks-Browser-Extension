const url = window.location.pathname;

if (url.includes("workshop")) {
  // referenceImages.js
  appendImageMenu();

  // notifications.js
  if (document.querySelector("a > .notifications")) checkNotifications();

  // workshopFolders.js
  document
    .getElementById("menu-import")
    .addEventListener("mouseup", () => setTimeout(menuImpClicked, 100));
}

if (url.includes("partmanager")) {
  if (document.querySelector(".user > .notifications")) checkNotifications();
}

if (url.includes("notifications")) {
  storeLatestNotifications();
} else {
  if (document.querySelector("#header-notifications")) checkNotifications();
}

/* emojis */
if (url.includes("comments")) fixEmojisComments();
if (url.includes("emojis")) fixEmojisPage();

// Only allow specific pages & check if page has textarea
if (["/models/", "topic", "category", "messages"].some((s) => url.includes(s)))
  formattingSetup();

if (url.includes("account/library")) {
  setupAccLibraryListener();
} else if (url.includes("library") || url.includes("topic")) {
  validUsername(document.getElementsByClassName("username"));
  if (url.includes("%22")) fixQuotesSearch();
}

if (url.includes("topic")) threadSubButton();

if (url.includes("/models/")) {
  // appendContent.js
  modelSubButton();
  validUsername(document.getElementsByClassName("author"));
  commentCharLimit();
}

// Hide deleted users
chrome.storage.sync.get("hideDeletedUsers", (data) => {
  if (!data.hideDeletedUsers) return;
  if (url.includes("models")) removeComments([""]);
  if (url.includes("topic")) removePosts([""]);
});

// Numbered notifications
chrome.storage.sync.get("numberedNotifications", (data) => {
  if (!data.numberedNotifications) {
    document.body.style.setProperty("--font-color", "white");
  } else {
    if (!url.includes("partmanager") && !url.includes("notifications")) {
      if (document.getElementById("header-notifications")) {
        badge = document.getElementById("header-notifications");
        badge.innerText = "";
        badge.style.padding = "0";
        badge.style.width = "16px";
        badge.style.height = "16px";
        badge.style.marginLeft = "-2px";
        badge.style.borderRadius = "50%";
      }
    }
  }
});

// Hidden users
chrome.storage.sync.get("hiddenUsers", (data) => {
  if (!data.hiddenUsers) return;
  if (data.hiddenUsers.length === 0) return;

  if (url.includes("models")) removeComments(data.hiddenUsers);
  else if (url.includes("topic")) removePosts(data.hiddenUsers);
  else if (url.includes("library")) removeModels(data.hiddenUsers);
  else if (url.includes("category")) removeThread(data.hiddenUsers);
  else {
    const config = { childList: true };
    if (url.includes("messages")) {
      const targetNode = document.getElementsByClassName("nano-content")[0];
      const observer = new MutationObserver(() => {
        removeMessages(data.hiddenUsers);
      });
      observer.observe(targetNode, config);
    } else if (url.includes("notifications")) {
      const targetNode = document.getElementById("notifications");
      const observer = new MutationObserver(() => {
        removeNotifications(data.hiddenUsers);
      });
      observer.observe(targetNode, config);
    }
  }
});

// Hide threads
chrome.storage.sync.get("hidden_id_name", (data) => {
  if (!data.hidden_id_name) return;
  if (data.hidden_id_name.length === 0) return;

  if (url.includes("notifications")) {
    const targetNode = document.getElementById("notifications");
    const config = { childList: true };
    const observer = new MutationObserver(() => {
      removeById(data.hidden_id_name.ids);
    });
    observer.observe(targetNode, config);
  }
});
