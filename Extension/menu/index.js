document.addEventListener("DOMContentLoaded", () => {
  const hidUserToggle = document.getElementById("del_user");
  const numNotifyToggle = document.getElementById("num_notifications");
  const manageHidden = document.getElementById("manage-hidden");
  const back = document.getElementById("back");
  const hideButton = document.getElementById("hide");

  /* HIDE DELETED USERS*/
  // Load saved state
  chrome.storage.sync.get("hideDeletedUsers", (data) => {
    hidUserToggle.checked = data.hideDeletedUsers || false;
  });

  // Listen for changes to the checkbox
  hidUserToggle.addEventListener("change", () => {
    const isEnabled = hidUserToggle.checked;

    // Save the state
    chrome.storage.sync.set({ hideDeletedUsers: isEnabled });
  });

  /* NUMBERED NOTIFICATIONS */
  // Load saved state
  chrome.storage.sync.get("numberedNotifications", (data) => {
    numNotifyToggle.checked = data.numberedNotifications || false;
  });

  // Listen for changes to the checkbox
  numNotifyToggle.addEventListener("change", () => {
    const isEnabled = numNotifyToggle.checked;

    // Save the state
    chrome.storage.sync.set({ numberedNotifications: isEnabled });
  });

  manageHidden.addEventListener("mouseup", listHiddenUsers);
  back.addEventListener("mouseup", options);
  hideButton.addEventListener("mouseup", hideUser);
});

function options() {
  document.getElementById("options").style.display = "flex";
  document.getElementById("hidden-users").style.display = "none";
}

function listHiddenUsers() {
  document.getElementById("options").style.display = "none";
  document.getElementById("hidden-users").style.display = "flex";
  usersWrapper = document.getElementById("users-wrapper");
  chrome.storage.sync.get("hiddenUsers", (data) => {
    if (data.hiddenUsers) {
      if (data.hiddenUsers.length !== 0) {
        // Enforce that wrapper is empty
        usersWrapper.innerHTML = "";
        hidUsers = data.hiddenUsers;
        for (user of hidUsers) {
          wrapper = document.createElement("span");
          wrapper.className = "hidden-user-wrapper item";

          span = document.createElement("span");
          span.textContent = user;
          wrapper.appendChild(span);

          del = document.createElement("span");
          del.textContent = "🗑️";
          del.className = "button";
          del.addEventListener("mouseup", () => {
            unhideUser(user);
          });
          wrapper.appendChild(del);

          usersWrapper.appendChild(wrapper);
        }
      } else {
        // Enforce that wrapper is empty
        usersWrapper.innerHTML = "";
        span = document.createElement("span");
        span.textContent = "You have no hidden users...";
        usersWrapper.appendChild(span);
      }
    } else {
      // Enforce that wrapper is empty
      usersWrapper.innerHTML = "";
      span = document.createElement("span");
      span.textContent = "You have no hidden users...";
      usersWrapper.appendChild(span);
    }
  });
}

function hideUser() {
  inp = document.getElementById("inp");
  val = inp.value;
  if (val !== "") {
    chrome.storage.sync.get("hiddenUsers", (data) => {
      if (data.hiddenUsers) {
        hidUsers = data.hiddenUsers;
        if (!hidUsers.includes(val)) {
          // Append to list
          hidUsers.push(val);
          chrome.storage.sync.set({ hiddenUsers: hidUsers });
          inp.setAttribute("placeholder", "");
          listHiddenUsers();
        } else {
          inp.setAttribute("placeholder", "Already hidden");
        }
      } else {
        // Create list
        hidUsers = [];
        hidUsers.push(val);
        chrome.storage.sync.set({ hiddenUsers: hidUsers });
        inp.setAttribute("placeholder", "");
        listHiddenUsers();
      }
    });
  } else {
    inp.setAttribute("placeholder", "Invalid");
  }
  inp.value = "";
}

function unhideUser(user) {
  chrome.storage.sync.get("hiddenUsers", (data) => {
    if (data.hiddenUsers) {
      hidUsers = data.hiddenUsers;
      if (hidUsers.includes(user)) {
        // Update List
        const indx = hidUsers.indexOf(user);
        hidUsers.splice(indx, 1);
        chrome.storage.sync.set({ hiddenUsers: hidUsers });
        listHiddenUsers();
      }
    }
  });
}
