/**
 * Gives each textArea of an array BBCode formatting tools and an emoji pop-up bar
 * @param {Element} textAreaArray
 */
function setUpBBCodeFormatter(textAreaArray) {
  //prettier-ignore
  const fTypes = ["i", "b", "u", "s", "center", "code", "img", "url", "color", "size", "youtube", "mecabricks"];

  for (const texta of textAreaArray) {
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

/**
 * Check if text has been selected in textarea
 * @param {Element} container the BBCode pop-up which needs to be shown
 * @param {Event} e event
 * @param {boolean} removeWhiteSpace if true will trim the selection to remove white space
 */
function checkSelection(container, e, removeWhiteSpace) {
  const texta = e.target;
  const textSelection = window.getSelection().toString();
  const formatter = container.getElementsByClassName("formatting-pop-up")[0];

  if (textSelection === "" || textSelection.trim() === "") {
    formatter.style.display = "none";
    return;
  }

  if (
    removeWhiteSpace &&
    textSelection.trim().length !== textSelection.length
  ) {
    // Adjust selection
    const index = textSelection.indexOf(textSelection.trim());
    texta.selectionStart += index;
    texta.selectionEnd -=
      textSelection.length - (index + textSelection.trim().length);
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

/**
 * Adding the BBCode tags to a textArea around selected text
 * @param {String} str
 * @param {Element} texta textarea
 */
function formatSelection(tag, texta) {
  const tv = texta.value;
  const start = texta.selectionStart;
  const end = texta.selectionEnd;

  const editable = ["url", "size", "color"].includes(tag); // Bool for editables
  const http = tag === "url" && tv.slice(start, end).includes("http"); // Bool if URL

  let startTag = editable ? "[" + tag + "=" : "[" + tag;
  let endTag = http ? "][/" + tag + "]" : "[/" + tag + "]";

  if (tag === "size") {
    startTag += "px]"; // [size=px]{content}
  } else if (!http) {
    startTag += "]"; // [url=]{content} or [color=]{content}
  }

  texta.value =
    tv.slice(0, start) +
    startTag +
    tv.slice(start, end) +
    endTag +
    tv.slice(end);

  // Small delay needed to work properly
  setTimeout(() => {
    texta.select();
    // Mouse cursor or selection
    if (editable && http) {
      texta.selectionStart = texta.selectionEnd = end + startTag.length + 1;
    } else if (editable) {
      texta.selectionStart = texta.selectionEnd = start + 2 + tag.length;
    } else {
      texta.selectionStart = start + 2 + tag.length;
      texta.selectionEnd = end + 2 + tag.length;
      const e = {};
      e.target = texta;
      checkSelection(texta.previousSibling, e, true);
    }
  }, 20);
}

/**
 * Function generator handling emoji events and emoji pop-up
 * @param {Element} popUp emojis pop-up quick select
 * @returns {function} function
 */
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

/**
 * Eventlistener function that will insert selected emoji when tab ist pressed
 * @param {Event} e event
 */
function emojiTab(e) {
  if (e.code !== "Tab") return;
  const [start, end] = getEmojiStartEnd(e.target, true);
  if (start === end) return;
  if (end - start < 2) return;

  const emoji = document.querySelector(".emoji-pop-up > .emoji-item").title;
  if (!emoji) return;

  e.preventDefault();
  insertEmoji(e.target, start, end, emoji);
}

/**
 * Determines where the user is trying to insert an emoji
 * @param {Element} textArea the text area element ?
 * @param {boolean} delLastTab deletes last tab (in case one is appended)
 * @returns {Array} [start, end] index of textArea text
 */

function getEmojiStartEnd(textArea, delLastTab = false) {
  // TODO test whether delLastTab is still necessary
  const end = textArea.selectionStart; // Current position of user cursor
  let text = textArea.value;
  if (/\t/.test(text[text.length - 1])) {
    text = text.slice(0, text.length - 2);
  }
  let start = end;
  console.log([text]);
  for (let i = 1; i < 30; i++) {
    const char = text[end - i];
    if (char === ":") {
      start = end - i + 1;
      break;
    } else if (!/[a-z0-9_\+\-]/g.test(char)) return [0, 0];
  }
  return [start, end];
}

/**
 * Changes the text area to insert the emoji at the desired place
 * @param {Element} tar target
 * @param {index} start start index of emoji
 * @param {index} end end index of emoji
 * @param {String} emoji Emoji to be inserted
 */
function insertEmoji(tar, start, end, emoji) {
  const text = tar.value;
  const newText = text.slice(0, start) + emoji + ":" + text.slice(end);
  tar.value = newText;

  // Delay necessary
  setTimeout(() => {
    tar.select();
    tar.selectionEnd = tar.selectionStart = end + emoji.length + 1;
  }, 20);
}

/**
 * Start of text formatting set up (for BBCode and emoji panels) for all text areas
 */
function formattingSetup() {
  const elements = document.getElementsByTagName("textarea");
  if (elements.length !== 0) {
    setUpBBCodeFormatter(elements);
  }
}

/**
 * Changes the private library model editor (e.g. BBCode and Emoji panel to description)
 */
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

  // BBCode and emojis
  setUpBBCodeFormatter([ta]);
}

/**
 * Adds an observer to the private library to detect the opening of the model editor
 * and applies the wanted changes (e.g. BBCode and emoji formatting for description)
 */
function setupAccLibraryListener() {
  const config = { childList: true };
  const targetNode = document.getElementById("gallery-content");
  const observer = new MutationObserver(privateLibrarySetup);
  observer.observe(targetNode, config);
}

/**
 * Adds character limit indicator to comments
 */
function commentCharLimit() {
  const ta = document.getElementById("comments-new-input");
  if (!ta) return;

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

/**
 * Adds character limit indicator to forum posts
 */
function forumCharLimit() {
  const tas = document.getElementsByTagName("textarea");
  for (let i = 0; i < tas.length; i++) {
    const ta = tas[i];

    if (i !== tas.length - 1 && !ta.parentNode.querySelector(".edit")) continue;

    const span = document.createElement("span");
    if (i === tas.length - 1) span.className = "forum-character-limit-reply";
    else span.className = "forum-character-limit";
    span.textContent = ta.value.length + "/1000";

    ta.addEventListener("keyup", () => {
      span.textContent = ta.value.length + "/1000";
      if (ta.value.length > 1000) span.style.color = "#ed1c24";
      else span.style.color = "#676e75";
    });

    ta.after(span);
  }
}

/**
 * Appens public profile button the the menu bar on /account/ page
 */
function AppendPublicProfile() {
  const bar = document.getElementById("subHeader-wrapper");
  const anchor = document.createElement("a");

  let username;

  if (pathname[1] != "notifications")
    username = document
      .getElementById("header-username")
      .childNodes[0].nodeValue.trim();
  else
    username = document
      .querySelector("#user-card > .data > .username")
      .textContent.trim();

  anchor.href = `https://www.mecabricks.com/${lang}/user/${username}`;
  anchor.className = "button";
  anchor.id = "subHeader-profile";
  anchor.textContent = "Profile";

  bar.appendChild(anchor);
}

/**
 * Marks invalid usernames red
 * @param {Element[]} elements all the elements that contain usernames to be checked
 */
function validUsername(elements) {
  if (!elements.length) return;

  for (const ele of elements) {
    const username = ele.innerText;
    if (/^[A-z0-9_.-]+$/g.test(username)) continue; // Valid username

    if (ele.querySelector("a")) ele.querySelector("a").style.color = "#f64";
    else ele.style.color = "#f64";
  }
}

/* BLOCK MECHANISMS/APPENDAGES */
// TODO maybe move to separate file?

/**
 * Adds and updates un/subscrube button on forum discussions
 */
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

/**
 * Adds and updates un/subscribe button for model comment sections
 */
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

/**
 * Checks whether the user is unsubscribed, given the id
 * @param {String} id id of forum discussion or model
 * @returns {boolean} unsubscribed?
 */
async function unsubscribed(id) {
  const hidden = await browser.storage.sync.get("hidden_id_name");
  if (hidden.hidden_id_name) return hidden.hidden_id_name.ids.includes(id);
  else return false;
}

/**
 * Creates in entry in the unsubscribed list
 * @param {String} id id of forum discussion or model
 * @param {String} name title of the forum discussion or model
 * @returns
 */
async function storeId(id, name) {
  if (!id || !name) return;
  const previous = await browser.storage.sync.get("hidden_id_name");
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

  browser.storage.sync.set(obj);
}

/**
 * Deletes an entry in the unsubscribed list
 * @param {String} id id of forum discussion or model
 * @param {String} name title of forum discussion or model
 */

async function removeId(id, name) {
  if (!id || !name) return;
  const previous = await browser.storage.sync.get("hidden_id_name");

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

  browser.storage.sync.set(obj);
}
