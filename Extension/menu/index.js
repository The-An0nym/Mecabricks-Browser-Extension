// To do:
// Clean up, maybe re-use functions?
// Re-use storage?
// Fix css (use classes over IDs)

const hidUserToggle = document.getElementById("del_user");
const numNotifyToggle = document.getElementById("num_notifications");
const manageUsers = document.getElementById("manage-users");
const manageThreads = document.getElementById("manage-threads");
const back = document.getElementsByClassName("back");
const hideUserButton = document.getElementById("hide-user");
const hideThreadButton = document.getElementById("hide-thread");

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

// EVENT LISTENERS
for (let i of back) i.addEventListener("mouseup", options);
manageUsers.addEventListener("mouseup", listHiddenUsers);
manageThreads.addEventListener("mouseup", listHiddenThreads);
hideUserButton.addEventListener("mouseup", hideUser);
hideThreadButton.addEventListener("mouseup", hideThread);

function options() {
  document.getElementById("options").style.display = "flex";
  document.getElementById("hidden-users").style.display = "none";
  document.getElementById("hidden-threads").style.display = "none";
}

/* HIDDEN USERS */

function listHiddenUsers() {
  document.getElementById("options").style.display = "none";
  document.getElementById("hidden-users").style.display = "flex";
  const usersWrapper = document.getElementById("users-wrapper");
  chrome.storage.sync.get("hiddenUsers", (data) => {
    if (data.hiddenUsers) {
      if (data.hiddenUsers.length !== 0) {
        // Enforce that wrapper is empty
        usersWrapper.innerHTML = "";
        const hidUsers = data.hiddenUsers;
        for (user of hidUsers) {
          wrapper = document.createElement("span");
          wrapper.className = "hidden-user-wrapper item";

          const span = document.createElement("span");
          span.textContent = user;
          wrapper.appendChild(span);

          const del = document.createElement("span");
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
        const span = document.createElement("span");
        span.textContent = "You have no hidden users...";
        usersWrapper.appendChild(span);
      }
    } else {
      // Enforce that wrapper is empty
      usersWrapper.innerHTML = "";
      const span = document.createElement("span");
      span.textContent = "You have no hidden users...";
      usersWrapper.appendChild(span);
    }
  });
}

function hideUser() {
  const inp = document.getElementById("user-inp");
  val = inp.value;
  if (val !== "") {
    chrome.storage.sync.get("hiddenUsers", (data) => {
      if (data.hiddenUsers) {
        const hidUsers = data.hiddenUsers;
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
        const hidUsers = [];
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
      const hidUsers = data.hiddenUsers;
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

/* HIDDEN THREADS */
function listHiddenThreads() {
  document.getElementById("options").style.display = "none";
  document.getElementById("hidden-threads").style.display = "flex";
  const threadsWrapper = document.getElementById("threads-wrapper");
  chrome.storage.sync.get("hiddenThreads", (data) => {
    if (data.hiddenThreads) {
      if (data.hiddenThreads.length !== 0) {
        // Enforce that wrapper is empty
        threadsWrapper.innerHTML = "";
        const hidThreads = data.hiddenThreads;
        for (threads of hidThreads) {
          wrapper = document.createElement("span");
          wrapper.className = "hidden-thread-wrapper item";

          span = document.createElement("span");
          span.textContent = threads;
          wrapper.appendChild(span);

          del = document.createElement("span");
          del.textContent = "🗑️";
          del.className = "button";
          del.addEventListener("mouseup", () => {
            unhideThread(threads);
          });
          wrapper.appendChild(del);

          threadsWrapper.appendChild(wrapper);
        }
      } else {
        console.log("empty");
        // Enforce that wrapper is empty
        threadsWrapper.innerHTML = "";
        const span = document.createElement("span");
        span.textContent = "You have no hidden threads...";
        threadsWrapper.appendChild(span);
      }
    } else {
      console.log("empty2");
      // Enforce that wrapper is empty
      threadsWrapper.innerHTML = "";
      const span = document.createElement("span");
      span.textContent = "You have no hidden threads...";
      threadsWrapper.appendChild(span);
    }
  });
}

function hideThread() {
  const inp = document.getElementById("thread-inp");
  val = inp.value;
  if (val !== "") {
    chrome.storage.sync.get("hiddenThreads", (data) => {
      if (data.hiddenThreads) {
        const hidThreads = data.hiddenThreads;
        if (!hidThreads.includes(val)) {
          // Append to list
          hidThreads.push(val);
          chrome.storage.sync.set({ hiddenThreads: hidThreads });
          inp.setAttribute("placeholder", "");
          listHiddenThreads();
        } else {
          inp.setAttribute("placeholder", "Already hidden");
        }
      } else {
        // Create list
        const hidThreads = [];
        hidThreads.push(val);
        chrome.storage.sync.set({ hiddenThreads: hidThreads });
        inp.setAttribute("placeholder", "");
        listHiddenThreads();
      }
    });
  } else {
    inp.setAttribute("placeholder", "Invalid");
  }
  inp.value = "";
}

function unhideThread(thread) {
  chrome.storage.sync.get("hiddenThreads", (data) => {
    if (data.hiddenThreads) {
      hidThreads = data.hiddenThreads;
      if (hidThreads.includes(thread)) {
        // Update List
        const indx = hidThreads.indexOf(thread);
        hidThreads.splice(indx, 1);
        chrome.storage.sync.set({ hiddenThreads: hidThreads });
        listHiddenThreads();
      }
    }
  });
}
