function setUpBBCodeFormatter(textAs) {
  for (texta of textAs) {
    //prettier-ignore
    const fTypes = ["i", "b", "u", "s", "center", "code", "img", "url", "color", "size"];

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

  if (textSelection.trim() === "") {
    return;
  }

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
  if (elements.length != 0) {
    setUpBBCodeFormatter(elements);
  }
}

// Only allow specific pages & check if page has textarea
if (["models", "topic", "category", "messages"].some((s) => url.includes(s))) {
  formattingSetup();
}

// For model editor
function privateLibraryObserver() {
  // Select the node that will be observed for mutations
  const targetNode = document.getElementById("gallery-content");

  // Options for the observer (which mutations to observe)
  const config = { childList: true };

  // Callback function to execute when mutations are observed
  const appendBBcode = (mutationList, observer) => {
    for (const mutation of mutationList) {
      if (mutation.type === "childList") {
        const item = document.getElementById("properties");
        if (item) {
          setUpBBCodeFormatter(item.getElementsByTagName("textarea"));
        }
      }
    }
  };

  // Create an observer instance linked to the callback function
  const observer = new MutationObserver(appendBBcode);

  // Start observing the target node for configured mutations
  observer.observe(targetNode, config);
}

if (url.includes("account/library")) privateLibraryObserver;
