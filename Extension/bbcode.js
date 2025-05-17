function setUpBBCodeFormatter() {
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
    button.addEventListener("click", () => formatSelection(type));
    button.className = "formatting-button";
    div.appendChild(button);
  }

  // Append pop-up to container and container to DOM
  container.appendChild(div);
  texta.parentNode.insertBefore(container, texta);

  // Set eventlistener
  texta.addEventListener("mouseup", () => checkSelection(container));
  texta.addEventListener("keydown", () => (container.style.display = "none"));
}

// Check if text has been selected in textarea
function checkSelection(container) {
  if (
    window.getSelection().toString() === "" ||
    texta !== document.activeElement
  ) {
    container.style.display = "none";
    return;
  }
  // Remove end whitespace
  if (
    texta.value[texta.selectionEnd - 1] === " " ||
    texta.value[texta.selectionEnd - 1] === "\n"
  ) {
    texta.selectionEnd--;
  }
  console.log(texta.value.slice(texta.selectionStart, texta.selectionEnd));
  container.style.display = "block";
}

// Add BBCode to user input
function formatSelection(str) {
  const tv = texta.value;
  const start = texta.selectionStart;
  const end = texta.selectionEnd;

  const editable = ["url", "size", "color"].includes(str); // Bool for editables
  const http = str === "url" && tv.slice(start, end).includes("http");

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

  // do not nest!
  if (editable && http) {
    texta.selectionStart = texta.selectionEnd = end + str0.length + 1;
  } else if (editable) {
    texta.selectionStart = texta.selectionEnd = start + 2 + str.length;
  } else {
    texta.selectionStart = start + 2 + str.length;
    texta.selectionEnd = end + 2 + str.length;
  }
}

// Initializing variables
const elements = document.getElementsByTagName("textarea");
let texta;

// Only allow specific pages & check if page has textarea
if (["models", "topic", "category", "messages"].some((s) => url.includes(s))) {
  if (elements.length != 0) {
    texta = elements[elements.length - 1];
    setUpBBCodeFormatter();
  }
}
