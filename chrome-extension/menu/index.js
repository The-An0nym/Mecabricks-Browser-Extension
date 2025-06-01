// To do:
// Clean up, maybe re-use functions?
// Re-use storage?
// Fix css (use classes over IDs)

const hidUserToggle = document.getElementById("del_user");
const numNotifyToggle = document.getElementById("num_notifications");
const manageUsers = document.getElementById("manage-users");
const manageIds = document.getElementById("manage-ids");
const usersInp = document.getElementById("user-inp");
const back = document.getElementsByClassName("back");
const hideUserButton = document.getElementById("hide-user");

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
manageIds.addEventListener("mouseup", listIdNames);
hideUserButton.addEventListener("mouseup", hideUser);
usersInp.addEventListener("keyup", (e) => {
  if (e.code === "Enter") hideUser();
});

function options() {
  document.getElementById("options").style.display = "flex";
  document.getElementById("hidden-users").style.display = "none";
  document.getElementById("hidden-ids").style.display = "none";
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
        for (const user of hidUsers) {
          wrapper = document.createElement("span");
          wrapper.className = "hidden-user-wrapper item";

          const span = document.createElement("span");
          span.textContent = user;
          wrapper.appendChild(span);

          const del = document.createElement("span");
          del.textContent = "✖";
          del.className = "button delete";
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
  const val = usersInp.value.trim().toLowerCase();

  if (val !== "") {
    chrome.storage.sync.get("hiddenUsers", (data) => {
      if (data.hiddenUsers) {
        const hidUsers = data.hiddenUsers;
        if (!hidUsers.includes(val)) {
          // Append to list
          hidUsers.push(val);
          // Sort list
          hidUsers.sort((a, b) => a.localeCompare(b));
          chrome.storage.sync.set({ hiddenUsers: hidUsers });
          usersInp.setAttribute("placeholder", "");
          listHiddenUsers();
        } else {
          usersInp.setAttribute("placeholder", "Already hidden");
        }
      } else {
        // Create list
        const hidUsers = [];
        hidUsers.push(val);
        chrome.storage.sync.set({ hiddenUsers: hidUsers });
        usersInp.setAttribute("placeholder", "");
        listHiddenUsers();
      }
    });
  } else {
    usersInp.setAttribute("placeholder", "Invalid");
  }
  usersInp.value = "";
}

function unhideUser(user) {
  console.log(user);
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

/* blocked ids */
async function listIdNames() {
  document.getElementById("options").style.display = "none";
  document.getElementById("hidden-ids").style.display = "flex";
  const idsWrapper = document.getElementById("ids-wrapper");
  const hidden = await chrome.storage.sync.get("hidden_id_name");

  idsWrapper.innerHTML = "";

  if (!hidden.hidden_id_name) {
    const span = document.createElement("span");
    span.textContent = "You have no unsubscribed things...";
    threadsWrapper.appendChild(span);
    return;
  }

  if (
    !hidden.hidden_id_name.ids.length ||
    !hidden.hidden_id_name.names.length
  ) {
    const span = document.createElement("span");
    span.textContent = "You have no unsubscribed things...";
    idsWrapper.appendChild(span);
    return;
  }

  for (let i = 0; i < hidden.hidden_id_name.ids.length; i++) {
    wrapper = document.createElement("span");
    wrapper.className = "hidden-ids-wrapper";

    const textSVGWrapper = document.createElement("span");

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "item-svg");
    svg.setAttribute("viewBox", "0 0 200 200");

    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");

    if (
      !isNaN(hidden.hidden_id_name.ids[i]) &&
      hidden.hidden_id_name.ids[i].length < 10
    ) {
      use.setAttribute("href", "#thread-svg");
    } else {
      use.setAttribute("href", "#model-svg");
    }

    svg.appendChild(use);
    textSVGWrapper.appendChild(svg);

    const span = document.createElement("span");
    span.textContent = hidden.hidden_id_name.names[i];
    textSVGWrapper.appendChild(span);

    wrapper.appendChild(textSVGWrapper);

    const del = document.createElement("span");
    del.textContent = "✖";
    del.className = "button delete";
    del.addEventListener("mouseup", async () => {
      await removeId(
        hidden.hidden_id_name.ids[i],
        hidden.hidden_id_name.names[i]
      );
      listIdNames();
    });
    wrapper.appendChild(del);

    idsWrapper.appendChild(wrapper);
  }
}

/* COPY PASTE FROM (currently) BBCODE.JS */
async function removeId(id, name) {
  if (!id || !name) return;
  const previous = await chrome.storage.sync.get("hidden_id_name");

  if (!previous.hidden_id_name) return;
  let newIDs = previous.hidden_id_name.ids;
  let newNames = previous.hidden_id_name.names;

  const idIndex = newIDs.indexOf(id);

  if (newNames.includes(id)) {
    const index = newNames.indexOf(id);
    newNames.splice(index, 1);
  } else if (newNames.length === newIDs.length) {
    newNames.splice(idIndex, 1);
  } else return;

  if (newIDs.includes(id)) {
    newIDs.splice(idIndex, 1);
  } else return;

  const obj = {};
  obj.hidden_id_name = {};
  obj.hidden_id_name.ids = newIDs;
  obj.hidden_id_name.names = newNames;

  chrome.storage.sync.set(obj);
}
