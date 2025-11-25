/**
 * GLOBAL CONSTANTS
 * @var pathname is a list of all folders or file names after *BASEURL/LANG/*
 */
const pathname =
  window.location.pathname[3] === "/"
    ? window.location.pathname.split("/").slice(2)
    : window.location.pathname.split("/").slice(1);
const fullUrl = window.location.href;
const lang =
  window.location.pathname[3] === "/"
    ? window.location.pathname.slice(1, 3)
    : "en";

/**
 * Determines which functions need to be executing
 * based on what page the user currently is.
 */
const main = function () {
  // Guard clause in case the website is down
  if (document.title == "503 Service Unavailable") return;

  switch (pathname[0]) {
    // Personal account
    case "account":
      // Functions can be found in appendContent.js
      AppendPublicProfile();
      if (pathname[1] === "library") setupAccLibraryListener();
      else if (pathname[1] === "messages") {
        formattingSetup();
        const x = new MutationObserver(() => {
          validUsername(target.getElementsByClassName("username"));
          x.disconnect();
        });
        const target = document.getElementsByClassName("nano-content")[0];
        x.observe(target, { childList: true });
      }
      break;

    // Workshop
    case "workshop":
      appendImageMenu(); // referenceImages.js

      // workshopFolders.js
      const ele = document.getElementById("menu-import");
      ele.addEventListener("mouseup", () => setTimeout(menuImpClicked, 100));

      // notifications.js
      const x = new MutationObserver(() => {
        if (document.querySelector("a > .notifications")) {
          checkNotifications();
          x.disconnect();
        }
      });

      x.observe(document.body, { childList: true });
      const y = new MutationObserver(() => {
        if (document.querySelector("#part-library > .header > .tooltip")) {
          magnifierSetup(); // workshopFolders.js
          y.disconnect();
        }
      });
      y.observe(document.body, { childList: true });
      break;

    // Partmanager
    case "partmanager":
      // notifications.js
      if (document.querySelector(".user > .notifications"))
        checkNotifications();
      break;

    // Public library
    case "library":
      validUsername(document.getElementsByClassName("username"));
      if (fullUrl.includes("%22")) fixQuotesSearch();
      break;

    // Any forum page
    case "forum":
      // On forum/category
      if (pathname[1] === "category") {
        // CATEGORY
        formattingSetup();

        // On forum/topic
      } else if (pathname[1] === "topic") {
        // DISCUSSION
        validUsername(document.getElementsByClassName("username"));
        threadSubButton();
        formattingSetup();
        forumCharLimit();

        // alert.js
        document
          .querySelector("#reply-wrapper > .button")
          .addEventListener("mouseup", () => {
            setTimer();
            getTimer();
          });
      }
      break;

    // Model page
    case "models":
      modelSubButton();
      validUsername(document.getElementsByClassName("author"));
      commentCharLimit();
      formattingSetup();
      // Alert.js
      document
        .getElementById("comments-new-post")
        .addEventListener("mouseup", () => {
          setTimer();
          getTimer();
        });
      break;

    // Public user profile
    case "user":
      if (pathname[2] === "comments") {
        // USER COMMENT HISTORY
        fixEmojisComments(); // fix.js
      }
      break;

    // Special /emojis/ page
    case "emojis":
      // fix.js
      fixEmojisPage();
      break;
  }

  // For notification storage/checking regarding hidden threads/users
  if (pathname[1] === "notifications") storeLatestNotifications();
  else if (document.querySelector("#header-notifications"))
    checkNotifications();

  // Hide deleted users
  chrome.storage.sync.get("hideDeletedUsers", (data) => {
    if (!data.hideDeletedUsers) return;
    if (pathname[0] === "models") removeComments([""]);
    if (pathname[1] === "topic") removePosts([""]);
  });

  // Numbered notifications
  chrome.storage.sync.get("numberedNotifications", (data) => {
    if (!data.numberedNotifications) {
      document.body.style.setProperty("--font-color", "white");
    } else {
      if (pathname[0] !== "partmanager" && pathname[1] !== "notifications") {
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

    if (pathname[0] === "models") removeComments(data.hiddenUsers);
    else if (pathname[1] === "topic") removePosts(data.hiddenUsers);
    else if (pathname[0] === "library") removeModels(data.hiddenUsers);
    else if (pathname[0] === "") removeModels(data.hiddenUsers);
    else if (pathname[1] === "category") removeThread(data.hiddenUsers);
    else {
      const config = { childList: true };
      if (pathname[1] === "messages") {
        const targetNode = document.getElementsByClassName("nano-content")[0];
        const observer = new MutationObserver(() => {
          removeMessages(data.hiddenUsers);
        });
        observer.observe(targetNode, config);
      } else if (pathname[1] === "notifications") {
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

    if (pathname[1] === "notifications") {
      const targetNode = document.getElementById("notifications");
      const config = { childList: true };
      const observer = new MutationObserver(() => {
        removeById(data.hidden_id_name.ids);
      });
      observer.observe(targetNode, config);
    }
  });
};

/**
 * Starting point of everything
 */
main();
