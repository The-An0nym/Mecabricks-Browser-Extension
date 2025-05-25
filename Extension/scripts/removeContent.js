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
  if (url.includes("models")) {
    removeComments(data.hiddenUsers);
  }
  if (url.includes("topic")) {
    removePosts(data.hiddenUsers);
  }
  if (url.includes("library")) {
    removeModels(data.hiddenUsers);
  }
  if (url.includes("category")) {
    removeThread(data.hiddenUsers);
  }
  if (url.includes("messages")) {
    removeMessages(data.hiddenUsers);
  }
  if (url.includes("notifications")) {
    removeNotifications(data.hiddenUsers);
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
    removeThreadNotifications(data.hiddenThreads);
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

function removeMessages(users) {
  let callOnce = false;

  // Select the node that will be observed for mutations
  const targetNode = document.getElementsByClassName("nano-content")[0];

  // Options for the observer (which mutations to observe)
  const config = { childList: true };

  // Callback function to execute when mutations are observed
  const remMessages = (mutationList, observer) => {
    if (callOnce) return;
    callOnce = true;
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
        } else {
          callOnce = false;
        }
      }
    }
  };

  // Create an observer instance linked to the callback function
  const observer = new MutationObserver(remMessages);

  // Start observing the target node for configured mutations
  observer.observe(targetNode, config);
}

function removeNotifications(users) {
  let callOnce = false;
  const targetNode = document.getElementById("notifications");
  const config = { childList: true };

  // Callback function to execute when mutations are observed
  const remNotifications = (mutationList, observer) => {
    if (callOnce) return;
    callOnce = true;
    for (const mutation of mutationList) {
      if (mutation.type === "childList") {
        const items = document.getElementsByClassName("notification");
        if (items.length !== 0) {
          for (let i = items.length - 1; i >= 0; i--) {
            // PRIVATE MESSAGES
            if (
              items[i].getElementsByClassName("title")[0].innerText ===
                "Private conversation" &&
              users.includes(
                items[i].getElementsByClassName("user")[0].innerText
              )
            ) {
              items[i].remove();

              // MODELS
            } else if (
              items[i].getElementsByClassName("image-container").length === 1 &&
              users.includes(
                items[i].getElementsByClassName("user")[0].innerText
              )
            ) {
              items[i].remove();
              // SENDERS (in case of singular notifications, i.e. unique like or comment)
            } else if (
              users.includes(
                items[i].querySelector(".senders > a").innerText
              ) &&
              items[i].querySelector(".senders").getElementsByTagName("a")
                .length === 1
            ) {
              items[i].remove();
            }
          }
        } else {
          callOnce = false;
        }
      }
    }
  };

  const observer = new MutationObserver(remNotifications);
  observer.observe(targetNode, config);
}

function removeThreadNotifications(thread) {
  let callOnce = false;

  // Select the node that will be observed for mutations
  const targetNode = document.getElementById("notifications");

  // Options for the observer (which mutations to observe)
  const config = { childList: true };

  // Callback function to execute when mutations are observed
  const remThreads = (mutationList, observer) => {
    if (callOnce) return;
    callOnce = true;
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
        } else {
          callOnce = false;
        }
      }
    }
  };

  // Create an observer instance linked to the callback function
  const observer = new MutationObserver(remThreads);

  // Start observing the target node for configured mutations
  observer.observe(targetNode, config);
}
