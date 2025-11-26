// TODO
// Clean up, maybe re-use functions?

/**
 * Global constant
 * @type {Element}
 */
const hidUserToggle = document.getElementById("del_user");
const numNotifyToggle = document.getElementById("num_notifications");
const postCooldown = document.getElementById("post_cooldown");
const manageUsers = document.getElementById("manage-users");
const manageIds = document.getElementById("manage-ids");
const usersInp = document.getElementById("user-inp");
const back = document.getElementsByClassName("back");
const hideUserButton = document.getElementById("hide-user");

/**
 * Sets browser
 */
const browser = window.browser ? window.browser : window.chrome;

/**
 * Sets all sliders to their saved value(s)
 */
function setAllSliders() {
  setupSlider("hideDeletedUsers", "hideDeletedUsers", hidUserToggle);
  setupSlider(
    "numberedNotifications",
    "numberedNotifications",
    numNotifyToggle
  );
  setupSlider("postCooldown", "postCooldown", postCooldown);
}

async function setupSlider(objName, boolName, element) {
  const data = await loadObject(objName);

  const checked = data[boolName] || false; // data[boolName] could be undefined
  element.checked = checked;

  element.addEventListener("change", () => {
    const isEnabled = element.checked;
    const obj = {};
    obj[boolName] = isEnabled;
    saveObject(obj);
  });
}

setAllSliders();

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

/* INFO TEXT */
function createInfoText(ele, text) {
  const span = document.createElement("span");
  span.className = "info-text";
  span.textContent = text;
  ele.appendChild(span);
}

/* HIDDEN USERS */

/**
 * Creates list of hidden users
 **/
async function listHiddenUsers() {
  document.getElementById("options").style.display = "none";
  document.getElementById("hidden-users").style.display = "flex";
  const usersWrapper = document.getElementById("users-wrapper");

  const data = await loadObject("hiddenUsers");

  usersWrapper.innerHTML = "";
  if (!data.hiddenUsers) {
    createInfoText(usersWrapper, "🛈 You have not hidden any users yet...");
    return;
  }

  if (data.hiddenUsers.length === 0) {
    createInfoText(usersWrapper, "🛈 You have not hidden any users yet...");
    return;
  }

  // Enforce that wrapper is empty
  usersWrapper.innerHTML = "";
  const hidUsers = data.hiddenUsers;

  for (const user of hidUsers) {
    wrapper = document.createElement("span");
    wrapper.className = "items-wrapper";

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
}

async function hideUser() {
  const val = usersInp.value.trim().toLowerCase();

  if (val === "") {
    usersInp.setAttribute("placeholder", "Invalid");
    usersInp.value = "";
    return;
  }

  const data = await loadObject("hiddenUsers");

  if (data.hiddenUsers) {
    const hidUsers = data.hiddenUsers;
    if (!hidUsers.includes(val)) {
      // Append to list
      hidUsers.push(val);
      // Sort list
      hidUsers.sort((a, b) => a.localeCompare(b));
      saveObject({ hiddenUsers: hidUsers });
      usersInp.setAttribute("placeholder", "");
      listHiddenUsers();
    } else {
      usersInp.setAttribute("placeholder", "Already hidden");
    }
  } else {
    // Create list
    const hidUsers = [];
    hidUsers.push(val);
    saveObject({ hiddenUsers: hidUsers });
    usersInp.setAttribute("placeholder", "");
    listHiddenUsers();
  }

  usersInp.value = "";
}

async function unhideUser(user) {
  const data = await loadObject("hiddenUsers");
  if (!data.hiddenUsers) return;

  const hidUsers = data.hiddenUsers;
  if (hidUsers.includes(user)) {
    // Update List
    const indx = hidUsers.indexOf(user);
    hidUsers.splice(indx, 1);
    saveObject({ hiddenUsers: hidUsers });
    listHiddenUsers();
  }
}

/* blocked ids */
async function listIdNames() {
  document.getElementById("options").style.display = "none";
  document.getElementById("hidden-ids").style.display = "flex";
  const idsWrapper = document.getElementById("ids-wrapper");
  const hidden = await loadObject("hidden_id_name");

  idsWrapper.innerHTML = "";

  if (!hidden.hidden_id_name) {
    createInfoText(idsWrapper, "🛈 You have not unsubscribed anything yet...");
    return;
  }

  if (
    !hidden.hidden_id_name.ids.length ||
    !hidden.hidden_id_name.names.length
  ) {
    createInfoText(idsWrapper, "🛈 You have not unsubscribed anything yet...");
    return;
  }

  for (let i = 0; i < hidden.hidden_id_name.ids.length; i++) {
    wrapper = document.createElement("span");
    wrapper.className = "items-wrapper";

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
    span.title = hidden.hidden_id_name.names[i];
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
  const previous = await loadObject("hidden_id_name");

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

  saveObject(obj);
}

/**
 * Sets object in browser
 * @param {String} name name of object
 * @returns {Promise} promise of object
 */
function loadObject(name) {
  return browser.storage.sync.get(name);
}

/**
 * Sets object in browser
 * @param {JSON} obj object
 */
function saveObject(obj) {
  browser.storage.sync.set(obj);
}
