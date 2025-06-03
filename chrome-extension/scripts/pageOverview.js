const pathname =
  window.location.pathname[3] === "/"
    ? window.location.pathname.split("/").slice(2)
    : window.location.pathname.split("/").slice(1);
const fullUrl = window.location.href;

// Wrapper
if (document.title !== "503 Service Unavailable") {
  switch (pathname[0]) {
    case "account": // ACCOUNT
      // appendContent.js
      if (pathname.includes("library")) setupAccLibraryListener();
      if (pathname.includes("messages")) formattingSetup();
      break;
    case "workshop": // WORKSHOP
      appendImageMenu(); // referenceImages.js
      // workshopFolders.js
      const ele = document.getElementById("menu-import");
      ele.addEventListener("mouseup", () => setTimeout(menuImpClicked, 100));
      // notifications.js
      let x = new MutationObserver(() => {
        if (document.querySelector("a > .notifications")) {
          checkNotifications();
          x.disconnect();
        }
      });
      x.observe(document.body, { childList: true });
      break;
    case "partmanager": // PART MANAGER
      // notifications.js
      if (document.querySelector(".user > .notifications"))
        checkNotifications();
      break;
    case "library": // PUBLIC LIBRARY
      validUsername(document.getElementsByClassName("username"));
      if (fullUrl.includes("%22")) fixQuotesSearch();
      break;
    case "forum": // FORUM
      if (pathname[1] === "category") {
        // CATEGORY
        formattingSetup();
      } else if (pathname[1] === "topic") {
        // DISCUSSION
        validUsername(document.getElementsByClassName("username"));
        threadSubButton();
        formattingSetup();
      }
      break;
    case "models": // PUBLIC LIBRARY MODEL
      modelSubButton();
      validUsername(document.getElementsByClassName("author"));
      commentCharLimit();
      formattingSetup();
      break;
    case "user": // USER
      if (pathname[2] === "comments") {
        // USER COMMENT HISTORY
        fixEmojisComments(); // fix.js
      }
      break;
    case "emojis": // EMOJIS
      // fix.js
      fixEmojisPage();
      break;
  }

  // NOTIFICATIONS
  if (pathname.includes("notifications")) {
    storeLatestNotifications();
  } else {
    if (document.querySelector("#header-notifications")) checkNotifications();
  }

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
}
