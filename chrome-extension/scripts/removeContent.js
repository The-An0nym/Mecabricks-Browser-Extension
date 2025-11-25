/**
 * Removes comments by hidden users
 * @param {String[]} users list of hidden users
 */
function removeComments(users) {
  const usernames = document.getElementsByClassName("author");
  for (let i = usernames.length - 1; i >= 0; i--) {
    if (users.includes(usernames[i].innerText.trim().toLowerCase())) {
      usernames[i].parentNode.parentNode.parentNode.remove();
      console.log("%c removed element!", "background: #c20; color: #fff");
    }
  }
}

/**
 * Removes posts by hidden users
 * @param {String[]} users list of hidden users
 */
function removePosts(users) {
  const usernames = document.getElementsByClassName("username");
  for (let i = usernames.length - 1; i >= 0; i--) {
    if (users.includes(usernames[i].innerText.trim().toLowerCase())) {
      usernames[i].parentNode.parentNode.parentNode.parentNode.remove();
      console.log("%c removed element!", "background: #c20; color: #fff");
    }
  }
}

/**
 * Removes models by hidden users
 * @param {String[]} users list of hidden users
 */
function removeModels(users) {
  const usernames = document.getElementsByClassName("username");
  for (let i = usernames.length - 1; i >= 0; i--) {
    if (users.includes(usernames[i].innerText.trim().toLowerCase())) {
      usernames[i].parentNode.parentNode.parentNode.remove();
      console.log("%c removed element!", "background: #c20; color: #fff");
    }
  }
}

/**
 * Removes discussions created by hidden users
 * @param {String[]} users list of hidden users
 */
function removeThread(users) {
  const usernames = document.getElementsByClassName("info");
  for (let i = usernames.length - 1; i >= 0; i--) {
    if (
      users.includes(
        usernames[i].getElementsByTagName("a")[0].innerText.trim().toLowerCase()
      )
    ) {
      usernames[i].parentNode.parentNode.remove();
      console.log("%c removed element!", "background: #c20; color: #fff");
    }
  }
}

/* --- Mutation obs triggered functions --- */

/**
 * Removes conversation indicator of hidden users (on /account/messages)
 * @param {String[]} users list of hidden users
 */
function removeMessages(users) {
  const items = document.getElementsByClassName("item");
  if (items.length === 0) return;
  for (let i = items.length - 1; i >= 0; i--) {
    if (
      users.includes(
        items[i]
          .getElementsByClassName("username")[0]
          .innerText.trim()
          .toLowerCase()
      )
    ) {
      items[i].remove();
    }
  }
}

/**
 * Removes notifications that have to do with hidden users
 * @param {String[]} users list of hidden users
 */
function removeNotifications(users) {
  const items = document.getElementsByClassName("notification");
  if (items.length === 0) return;
  for (let i = items.length - 1; i >= 0; i--) {
    // SENDERS (in case of singular notifications, i.e. unique like or comment)
    if (items[i].querySelector(".senders > a")) {
      const eles = items[i]
        .getElementsByClassName("senders")[0]
        .getElementsByTagName("a");
      if (eles.length === 1) {
        if (users.includes(eles[0].innerText.trim().toLowerCase())) {
          items[i].remove();
          continue;
        }
      }
      for (let i = eles.length - 1; i >= 0; i--) {
        if (users.includes(eles[i].innerText.trim().toLowerCase())) {
          if (eles[i].nextSibling) {
            if (eles[i].nextSibling.textContent === ", ")
              eles[i].nextSibling.remove();
          }
          eles[i].remove();
        }
      }
    }

    // PRIVATE MESSAGES
    if (
      items[i].getElementsByClassName("title")[0].innerText ===
        "Private conversation" &&
      users.includes(
        items[i]
          .getElementsByClassName("user")[0]
          .innerText.trim()
          .toLowerCase()
      )
    ) {
      items[i].remove();

      // MODELS
    } else if (
      items[i].getElementsByClassName("image-container").length === 1 &&
      users.includes(
        items[i]
          .getElementsByClassName("user")[0]
          .innerText.trim()
          .toLowerCase()
      )
    ) {
      items[i].remove();
    }
  }
}

/**
 * Removes hidden models or forum discussion from the notifications tab
 * @param {String[]} ids list of hidden models or forum discussions
 */
function removeById(ids) {
  const items = document.getElementsByClassName("notification");
  if (items.length === 0) return;
  for (let i = items.length - 1; i >= 0; i--) {
    const href = items[i].getElementsByClassName("title")[0].href;

    let id;
    if (href.includes("models")) id = href.split("/")[5];
    else if (href.includes("topic")) id = href.split("/")[6];
    else continue;

    if (ids.includes(id)) items[i].remove();
  }
}
