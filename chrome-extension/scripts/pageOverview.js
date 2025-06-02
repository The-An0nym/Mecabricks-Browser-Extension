const pathname = window.location.pathname.split("/");
const fullUrl = window.location.href;

if (pathname.includes("workshop")) {
  // referenceImages.js
  appendImageMenu();

  // notifications.js
  if (document.querySelector("a > .notifications")) checkNotifications();

  // workshopFolders.js
  document
    .getElementById("menu-import")
    .addEventListener("mouseup", () => setTimeout(menuImpClicked, 100));
}

if (pathname.includes("partmanager")) {
  if (document.querySelector(".user > .notifications")) checkNotifications();
}

if (pathname.includes("notifications")) {
  storeLatestNotifications();
} else {
  if (document.querySelector("#header-notifications")) checkNotifications();
}

/* emojis */
if (pathname.includes("comments")) fixEmojisComments();
if (pathname.includes("emojis")) fixEmojisPage();

// Only allow specific pages & check if page has textarea
if (!pathname.includes("user") && pathname.includes("models")) {
  // appendContent.js
  modelSubButton();
  validUsername(document.getElementsByClassName("author"));
  commentCharLimit();
  if (["topic", "category", "messages"].some((s) => pathname.includes(s))) {
    formattingSetup();
  }
}

if (pathname.includes("account")) {
  if (pathname.includes("library")) setupAccLibraryListener();
} else if (pathname.includes("library") || pathname.includes("topic")) {
  validUsername(document.getElementsByClassName("username"));

  if (fullUrl.includes("%22")) fixQuotesSearch();
}

if (pathname.includes("topic")) threadSubButton();

// Hide deleted users
chrome.storage.sync.get("hideDeletedUsers", (data) => {
  if (!data.hideDeletedUsers) return;
  if (pathname.includes("models")) removeComments([""]);
  if (pathname.includes("topic")) removePosts([""]);
});

// Numbered notifications
chrome.storage.sync.get("numberedNotifications", (data) => {
  if (!data.numberedNotifications) {
    document.body.style.setProperty("--font-color", "white");
  } else {
    if (
      !pathname.includes("partmanager") &&
      !pathname.includes("notifications")
    ) {
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

  if (pathname.includes("models")) removeComments(data.hiddenUsers);
  else if (pathname.includes("topic")) removePosts(data.hiddenUsers);
  else if (pathname.includes("library")) removeModels(data.hiddenUsers);
  else if (pathname.includes("category")) removeThread(data.hiddenUsers);
  else {
    const config = { childList: true };
    if (pathname.includes("messages")) {
      const targetNode = document.getElementsByClassName("nano-content")[0];
      const observer = new MutationObserver(() => {
        removeMessages(data.hiddenUsers);
      });
      observer.observe(targetNode, config);
    } else if (pathname.includes("notifications")) {
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

  if (pathname.includes("notifications")) {
    const targetNode = document.getElementById("notifications");
    const config = { childList: true };
    const observer = new MutationObserver(() => {
      removeById(data.hidden_id_name.ids);
    });
    observer.observe(targetNode, config);
  }
});
