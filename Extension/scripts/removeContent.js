// Hide deleted users
chrome.storage.sync.get("hideDeletedUsers", (data) => {
  if (!data.hideDeletedUsers) {
    return;
  }
  if (url.includes("models")) {
    removeComments([""]);
  }
  if (url.includes("topic")) {
    removePosts([""]);
  }
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
  if (!data.hiddenUsers) {
    return;
  }
  if (data.hiddenUsers.length === 0) {
    return;
  }

  if (url.includes("models")) removeComments(data.hiddenUsers);
  else if (url.includes("topic")) removePosts(data.hiddenUsers);
  else if (url.includes("library")) removeModels(data.hiddenUsers);
  else if (url.includes("category")) removeThread(data.hiddenUsers);
  else {
    const config = { childList: true };
    if (url.includes("messages")) {
      const targetNode = document.getElementsByClassName("nano-content")[0];
      const observer = new MutationObserver((e) => {
        removeMessages(e, data.hiddenUsers);
      });
      observer.observe(targetNode, config);
    } else if (url.includes("notifications")) {
      const targetNode = document.getElementById("notifications");
      const observer = new MutationObserver((e) => {
        removeNotifications(e, data.hiddenUsers);
      });
      observer.observe(targetNode, config);
    }
  }
});

// Hide threads
chrome.storage.sync.get("hiddenThreads", (data) => {
  if (!data.hiddenThreads) {
    return;
  }
  if (data.hiddenThreads.length === 0) {
    return;
  }
  if (url.includes("notifications")) {
    const targetNode = document.getElementById("notifications");
    const config = { childList: true };
    const observer = new MutationObserver((e) => {
      removeThreadNotifications(e, data.hiddenThreads);
    });
    observer.observe(targetNode, config);
  }
});

function removeComments(users) {
  const usernames = document.getElementsByClassName("author");
  for (let i = usernames.length - 1; i >= 0; i--) {
    if (users.includes(usernames[i].innerText)) {
      usernames[i].parentNode.parentNode.parentNode.remove();
      console.log("%c removed element!", "background: #c20; color: #fff");
    }
  }
}

function removePosts(users) {
  const usernames = document.getElementsByClassName("username");
  for (let i = usernames.length - 1; i >= 0; i--) {
    if (users.includes(usernames[i].innerText)) {
      usernames[i].parentNode.parentNode.parentNode.parentNode.remove();
      console.log("%c removed element!", "background: #c20; color: #fff");
    }
  }
}

function removeModels(users) {
  const usernames = document.getElementsByClassName("username");
  for (let i = usernames.length - 1; i >= 0; i--) {
    if (users.includes(usernames[i].innerText)) {
      usernames[i].parentNode.parentNode.parentNode.remove();
      console.log("%c removed element!", "background: #c20; color: #fff");
    }
  }
}

function removeThread(users) {
  const usernames = document.getElementsByClassName("info");
  for (let i = usernames.length - 1; i >= 0; i--) {
    if (users.includes(usernames[i].getElementsByTagName("a")[0].innerText)) {
      usernames[i].parentNode.parentNode.remove();
      console.log("%c removed element!", "background: #c20; color: #fff");
    }
  }
}

/* Mutation obs functions */
function removeMessages(mutationList, users) {
  for (const mutation of mutationList) {
    if (mutation.type === "childList") {
      const items = document.getElementsByClassName("item");
      if (items.length !== 0) {
        for (let i = items.length - 1; i >= 0; i--) {
          if (
            users.includes(
              items[i].getElementsByClassName("username")[0].innerText
            )
          ) {
            items[i].remove();
          }
        }
      }
      break; // Ensures it only runs once
    }
  }
}

function removeNotifications(mutationList, users) {
  for (const mutation of mutationList) {
    if (mutation.type === "childList") {
      const items = document.getElementsByClassName("notification");
      if (items.length !== 0) {
        for (let i = items.length - 1; i >= 0; i--) {
          // PRIVATE MESSAGES
          if (
            items[i].getElementsByClassName("title")[0].innerText ===
              "Private conversation" &&
            users.includes(items[i].getElementsByClassName("user")[0].innerText)
          ) {
            items[i].remove();

            // MODELS
          } else if (
            items[i].getElementsByClassName("image-container").length === 1 &&
            users.includes(items[i].getElementsByClassName("user")[0].innerText)
          ) {
            items[i].remove();
            // SENDERS (in case of singular notifications, i.e. unique like or comment)
          } else if (
            users.includes(items[i].querySelector(".senders > a").innerText) &&
            items[i].querySelector(".senders").getElementsByTagName("a")
              .length === 1
          ) {
            items[i].remove();
          }
        }
      }
      break; // Ensures it only runs once
    }
  }
}

function removeThreadNotifications(mutationList, thread) {
  for (const mutation of mutationList) {
    if (mutation.type === "childList") {
      const items = document.getElementsByClassName("notification");
      if (items.length !== 0) {
        for (let i = items.length - 1; i >= 0; i--) {
          // THREADS
          if (
            items[i].getElementsByClassName("icon-container").length === 1 &&
            thread.includes(
              items[i].getElementsByClassName("title")[0].innerText
            )
          ) {
            items[i].remove();
          }
        }
      }
      break; // Ensures it only runs once
    }
  }
}
