function setUpBBCodeFormatter(textAs) {
  //prettier-ignore
  const fTypes = ["i", "b", "u", "s", "center", "code", "img", "url", "color", "size", "youtube", "mecabricks"];

  for (const texta of textAs) {
    // Create container with 0px height
    const container = document.createElement("div");
    container.className = "text-editing-container";

    // Emojis
    const emoji = document.createElement("div");
    emoji.className = "emoji-pop-up";
    container.appendChild(emoji);

    // Create pop-up containing buttons
    const div = document.createElement("div");
    div.className = "formatting-pop-up";

    // Append buttons to pop-up
    for (let type of fTypes) {
      let button = document.createElement("button");
      button.innerHTML = type;
      button.addEventListener("mousedown", () => formatSelection(type, texta));
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
    const emojiInstance = emojis(emoji);
    texta.addEventListener("keyup", emojiInstance);
    texta.addEventListener("mouseup", emojiInstance);
    texta.addEventListener("focusout", () => {
      container.getElementsByClassName("formatting-pop-up")[0].style.display =
        "none";
      container.getElementsByClassName("emoji-pop-up")[0].style.display =
        "none";
    });
  }
}

// Check if text has been selected in textarea
function checkSelection(container, e, removeWhiteSpace) {
  const texta = e.target;
  const textSelection = window.getSelection().toString();
  const formatter = container.getElementsByClassName("formatting-pop-up")[0];
  if (textSelection === "") {
    formatter.style.display = "none";
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
  formatter.style.display = "block";
  container.style.position = "";
  container.style.top = "";
  bounds = container.getBoundingClientRect();
  if (bounds.y < 60 || bounds.y > window.innerHeight + 20) {
    container.style.position = "fixed";
    container.style.top = "85px";
  }
}

// Add BBCode to user input
function formatSelection(str, texta) {
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

  texta.value =
    tv.slice(0, start) + str0 + tv.slice(start, end) + str1 + tv.slice(end);

  setTimeout(() => {
    texta.select();
    // Mouse cursor or selection
    if (editable && http) {
      texta.selectionStart = texta.selectionEnd = end + str0.length + 1;
    } else if (editable) {
      texta.selectionStart = texta.selectionEnd = start + 2 + str.length;
    } else {
      texta.selectionStart = start + 2 + str.length;
      texta.selectionEnd = end + 2 + str.length;
      const e = {};
      e.target = texta;
      checkSelection(texta.previousSibling, e, true);
    }
  }, 20);
}

const emojis = (popUp) => {
  return function (e) {
    e.target.removeEventListener("keydown", emojiTab);
    popUp.style.display = "none";
    if (e.target.selectionEnd !== e.target.selectionStart) return;

    const text = e.target.value;
    const [start, end] = getEmojiStartEnd(e.target);
    if (start === end) return;
    if (end - start < 2) return;
    const query = text.slice(start, end);

    popUp.style.display = "block";
    popUp.innerHTML = "";

    for (const key in emojiList) {
      if (emojiList[key][0].includes(query)) {
        const span = document.createElement("span");
        span.className = "emoji-item";
        span.title = emojiList[key][0];

        const img = document.createElement("img");
        img.src = `//cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${emojiList[key][1]}.svg`;
        span.appendChild(img);

        span.addEventListener("mousedown", () => {
          insertEmoji(e.target, start, end, emojiList[key][0]);
        });
        popUp.appendChild(span);
      }
    }
    e.target.addEventListener("keydown", emojiTab);
  };
};

function emojiTab(e) {
  if (e.code !== "Tab") return;
  const [start, end] = getEmojiStartEnd(e.target);
  if (start === end) return;
  if (end - start < 2) return;

  const emoji = document.querySelector(".emoji-pop-up > .emoji-item").title;
  if (!emoji) return;

  e.preventDefault();
  insertEmoji(e.target, start, end, emoji);
}

function getEmojiStartEnd(ele) {
  const end = ele.selectionStart;
  const text = ele.value;
  let start = end;
  for (let i = 1; i < 30; i++) {
    const char = text[end - i];
    if (char === ":") {
      start = end - i + 1;
      break;
    } else if (!/[a-z0-9_\+\-]/g.test(char)) return [0, 0];
  }
  return [start, end];
}

function insertEmoji(tar, start, end, emoji) {
  const text = tar.value;
  const newText = text.slice(0, start) + emoji + ":" + text.slice(end);
  tar.value = newText;
  setTimeout(() => {
    tar.select();
    tar.selectionEnd = tar.selectionStart = end + emoji.length + 1;
  }, 20);
}

// Set texta (textarea) that will be edited -> Should add support for mutliple textareas
function formattingSetup() {
  const elements = document.getElementsByTagName("textarea");
  if (elements.length !== 0) {
    setUpBBCodeFormatter(elements);
  }
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

  // Character Limit
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

function commentCharLimit() {
  const ta = document.getElementById("comments-new-input");
  // Character Limit
  const div = document.createElement("div");
  div.textContent = ta.value.length + "/500";
  div.className = "comment-character-limit";

  ta.parentNode.appendChild(div);

  ta.addEventListener("keyup", () => {
    div.textContent = ta.value.length + "/500";
    if (ta.value.length > 500) div.style.color = "#ed1c24";
    else div.style.color = "#000";
  });
}

function setupAccLibraryListener() {
  const config = { childList: true };
  const targetNode = document.getElementById("gallery-content");
  const observer = new MutationObserver(privateLibrarySetup);
  observer.observe(targetNode, config);
}

/* BLOCK MECHANISM */

async function threadSubButton() {
  const navBar = document.getElementById("nav-bar");
  const button = document.createElement("button");

  const id = pathname[pathname.indexOf("topic") + 1];
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

async function modelSubButton() {
  const comment = document.getElementById("comments-qty");
  const button = document.createElement("button");

  const id = pathname[pathname.length - 1];
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
    const username = ele.innerText;
    if (/^[A-z0-9_.-]+$/g.test(username)) continue;
    if (ele.querySelector("a")) ele.querySelector("a").style.color = "#f64";
    else ele.style.color = "#f64";
  }
}
