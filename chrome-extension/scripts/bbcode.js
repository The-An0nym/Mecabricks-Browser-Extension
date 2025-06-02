function setUpBBCodeFormatter(textAs) {
  //prettier-ignore
  const fTypes = ["i", "b", "u", "s", "center", "code", "img", "url", "color", "size"];

  for (const texta of textAs) {
    // Create container with 0px height
    const container = document.createElement("div");
    container.id = "formatting-container";
    container.style.display = "none";

    // Create pop-up containing buttons
    const div = document.createElement("div");
    div.id = "formatting-pop-up";

    // Append buttons to pop-up
    for (let type of fTypes) {
      let button = document.createElement("button");
      button.innerHTML = type;
      button.addEventListener("mousedown", () => formatSelection(type));
      button.className = "formatting-button";
      div.appendChild(button);
    }

    // Append pop-up to container and container to DOM
    container.appendChild(div);
    texta.parentNode.insertBefore(container, texta);

    // Set eventlistener
    texta.addEventListener("mouseup", (e) =>
      setTimeout(checkSelection, 10, container, e, true)
    ); // Delay ensures window.getSelection() has time to update properly
    texta.addEventListener("keyup", (e) => checkSelection(container, e, false));
    texta.addEventListener(
      "focusout",
      () => (container.style.display = "none")
    );
  }
}

// Check if text has been selected in textarea
function checkSelection(container, e, removeWhiteSpace) {
  texta = e.target;
  const textSelection = window.getSelection().toString();
  if (textSelection === "") {
    container.style.display = "none";
    return;
  }

  if (textSelection.trim() === "") return;

  if (removeWhiteSpace) {
    if (textSelection.trim().length !== textSelection.length) {
      const index = textSelection.indexOf(textSelection.trim());
      texta.selectionStart += index;
      texta.selectionEnd -=
        textSelection.length - (index + textSelection.trim().length);
      // Remove end whitespace
      if (texta.selectionEnd === texta.selectionStart) return; // In case a single space was selected
    }
  }
  container.style.display = "block";
}

// Add BBCode to user input
function formatSelection(str) {
  const tv = texta.value;
  const start = texta.selectionStart;
  const end = texta.selectionEnd;

  const editable = ["url", "size", "color"].includes(str); // Bool for editables
  const http = str === "url" && tv.slice(start, end).includes("http"); // Bool if URL

  let str0 = editable ? "[" + str + "=" : "[" + str;
  let str1 = http ? "][/" + str + "]" : "[/" + str + "]";

  if (str === "size") {
    str0 += "px]"; // [size=px]{content}
  } else if (!http) {
    str0 += "]"; // [url=]{content} or [color=]{content}
  }

  //prettier-ignore
  texta.value = tv.slice(0, start) + str0 + tv.slice(start, end) + str1 + tv.slice(end);
  texta.select();

  // Mouse cursor or selection
  if (editable && http) {
    texta.selectionStart = texta.selectionEnd = end + str0.length + 1;
  } else if (editable) {
    texta.selectionStart = texta.selectionEnd = start + 2 + str.length;
  } else {
    texta.selectionStart = start + 2 + str.length;
    texta.selectionEnd = end + 2 + str.length;
  }
}

// Set texta (textarea) that will be edited -> Should add support for mutliple textareas
function formattingSetup() {
  const elements = document.getElementsByTagName("textarea");
  if (elements.length !== 0) {
    setUpBBCodeFormatter(elements);
  }
}

// Only allow specific pages & check if page has textarea
if (["models", "topic", "category", "messages"].some((s) => url.includes(s))) {
  formattingSetup();
}

// For model editor
function privateLibrarySetup() {
  const ta = document.getElementById("properties-description");
  if (!ta) return;
  // Make description box vertically extenable
  ta.style.resize = "vertical";
  ta.style.minHeight = "120px";
  ta.style.maxHeight = "480px";
  ta.style.width = "640px";
  ta.parentNode.style.height = "auto";
  ta.parentNode.style.paddingBottom = "0"; // Remove thicker bottom edge
  ta.parentNode.style.width = "660px";

  /* Character Limit */
  const div = document.createElement("div");
  div.textContent = ta.value.length + "/5000";
  div.className = "model-character-limit";

  ta.parentNode.appendChild(div);

  ta.addEventListener("keyup", () => {
    div.textContent = ta.value.length + "/5000";
    if (ta.value.length > 5000) div.style.color = "#ed1c24";
    else div.style.color = "#fff";
  });

  setUpBBCodeFormatter([ta]);
}

if (url.includes("account/library")) {
  const config = { childList: true };
  const targetNode = document.getElementById("gallery-content");
  const observer = new MutationObserver(privateLibrarySetup);
  observer.observe(targetNode, config);
}

/* BLOCK MECHANISM */

if (url.includes("topic")) threadSubButton();
async function threadSubButton() {
  const navBar = document.getElementById("nav-bar");
  const button = document.createElement("button");

  const urlList = url.split("/");
  const id = urlList[urlList.indexOf("topic") + 1];
  const name = navBar.getElementsByTagName("b")[0].textContent;
  if (await unsubscribed(id)) {
    button.addEventListener("mouseup", async () => {
      await removeId(id, name);
      button.remove();
      threadSubButton();
    });
    button.textContent = "Resubscribe";
  } else {
    button.addEventListener("mouseup", async () => {
      await storeId(id, name);
      button.remove();
      threadSubButton();
    });
    button.textContent = "Unsubscribe";
  }
  button.className = "block-button forum-button";

  navBar.appendChild(button);
}

if (url.includes("/models/")) modelSubButton();
async function modelSubButton() {
  const comment = document.getElementById("comments-qty");
  const button = document.createElement("button");

  const id = url.split("/").pop();
  const name = document.getElementsByClassName("name")[0].textContent;
  if (await unsubscribed(id)) {
    button.addEventListener("mouseup", async () => {
      await removeId(id, name);
      button.remove();
      modelSubButton();
    });
    button.textContent = "Resubscribe";
  } else {
    button.addEventListener("mouseup", async () => {
      await storeId(id, name);
      button.remove();
      modelSubButton();
    });
    button.textContent = "Unsubscribe";
  }
  button.className = "block-button";

  comment.appendChild(button);
}

async function unsubscribed(id) {
  const hidden = await chrome.storage.sync.get("hidden_id_name");
  if (hidden.hidden_id_name) return hidden.hidden_id_name.ids.includes(id);
  else return false;
}

async function storeId(id, name) {
  if (!id || !name) return;
  const previous = await chrome.storage.sync.get("hidden_id_name");
  let newIDs = [];
  let newNames = [];
  if (previous.hidden_id_name) {
    newIDs = previous.hidden_id_name.ids;
    if (newIDs.includes(id)) return;
    newIDs.push(id);
    newNames = previous.hidden_id_name.names;
    newNames.push(name);
  } else {
    newIDs = [id];
    newNames = [name];
  }

  const obj = {};
  obj.hidden_id_name = {};
  obj.hidden_id_name.ids = newIDs;
  obj.hidden_id_name.names = newNames;

  chrome.storage.sync.set(obj);
}

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

/* UNSUPPORTED NAMES RED */
function validUsername(eles) {
  if (!eles.length) return;
  for (const ele of eles) {
    const username = ele.textContent;
    if (/^[A-z0-9_.-]+$/g.test(username)) continue;
    ele.style.color = "#d00";
  }
}

if (url.includes("/models/"))
  validUsername(document.getElementsByClassName("author"));
if (url.includes("library") || url.includes("topic"))
  validUsername(document.getElementsByClassName("username"));
