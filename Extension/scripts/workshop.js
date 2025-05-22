// ToDo ::
// Generate dynamic list of already added images -> Consider using JSON
// Clean and optimize code
// Removing images?

if (url.includes("workshop")) appendContent();

const displayedImageNames = [];
const displayedImageSizes = [];
const imagePositionsX = [];
const imagePositionsY = [];

function appendContent() {
  menuOption = createMenuOption();
  menuPanel = createMenuPanel();

  document.addEventListener("mousedown", (e) =>
    toggleMenuEvent(e, menuOption, menuPanel)
  );
}

function toggleMenuEvent(e, mO, mP) {
  if (!mP.contains(e.target) && !mO.contains(e.target)) {
    mP.style.display = "none";
  } else if (mO.contains(e.target)) {
    toggleMenu();
  }
}

function toggleMenu() {
  const mP = document.getElementById("background-image-menu");
  if (mP.style.display === "block") {
    mP.style.display = "none";
  } else {
    mP.style.display = "block";
  }
}

function createMenuPanel() {
  const div = document.createElement("div");
  div.className = "ui-panel-window ui-panel-window-bottom ui-menu-panel";
  div.id = "background-image-menu";
  div.style.width = "220px";
  div.style.left = "670px";
  div.style.top = "58px";

  // Wrapper
  const wrapper = document.createElement("div");

  /* INPUT */
  const inputSection = document.createElement("div");
  inputSection.className = "section";

  const label = document.createElement("label");
  label.id = "image-input-label";
  label.setAttribute("for", "image-input");
  label.className = "item";

  // Empty menu icon
  const emptyMenuIcon = document.createElement("div");
  emptyMenuIcon.className = "ui-menu-icon ui-icon";
  label.appendChild(emptyMenuIcon);

  label.appendChild(document.createTextNode("Add reference image"));

  inputSection.appendChild(label);

  const input = document.createElement("input");
  input.id = "image-input";
  input.type = "file";
  input.accept = ".png, .jpeg, .jpg, .gif";
  input.addEventListener("change", loadImage);

  inputSection.appendChild(input);

  /* LIST OF IMAGES*/
  const listSection = document.createElement("div");
  listSection.className = "section";
  listSection.id = "image-list";
  listSection.style.display = "none";

  /* ADDING EVERYTHING */
  wrapper.appendChild(inputSection);
  wrapper.appendChild(listSection);
  div.appendChild(wrapper);
  document.body.appendChild(div);

  div.style.display = "none";

  return div;
}

function createSlider(name, val, min, max, step, callBack, index) {
  const div = document.createElement("div");
  div.className = "ui-number-wrapper ui-position-single ui-margin-top-5";
  div.style.width = "100%";

  const numberSliderWrapper = document.createElement("div");
  div.class = "ui-number-std";

  const arrowLeft = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );
  arrowLeft.setAttribute("class", "ui-number-arrow ui-number-arrow-left");
  arrowLeft.innerHTML =
    '<symbol id="arrow-196f33f5d09" viewBox="0 0 21 32"><path d="M12.88 10.88v10.32l-5.28-5.2z"></path></symbol><use xlink:href="#arrow-196f33f5d09"></use>';

  numberSliderWrapper.appendChild(arrowLeft);

  const numberSlider = document.createElement("div");
  numberSlider.className = "ui-number-slider custom-slider";
  numberSlider.style.width = "calc(100% - 26px)";

  const numberText = document.createElement("div");
  numberText.className = "ui-number-text";
  numberText.textContent = name;
  numberSlider.appendChild(numberText);

  const numberValue = document.createElement("div");
  numberValue.className = "ui-number-value";
  numberValue.textContent = val;
  numberSlider.appendChild(numberValue);

  numberSliderWrapper.appendChild(numberSlider);

  const arrowRight = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );
  arrowRight.setAttribute("class", "ui-number-arrow ui-number-arrow-right");
  arrowRight.innerHTML = '<use xlink:href="#arrow-196f33f5d09"></use>';
  numberSliderWrapper.appendChild(arrowRight);

  div.appendChild(numberSliderWrapper);

  const input = document.createElement("input");
  input.type = "text";
  input.className = "ui-input ui-number-input";
  input.style.display = "none";

  div.appendChild(input);

  numberValue.min = min;
  numberValue.max = max;
  numberValue.inp = input;
  numberValue.numberSlider = numberSlider;
  numberValue.moved = false;
  numberValue.mouseDown = false;
  numberValue.callBack = callBack;
  numberValue.index = index;

  numberSlider.valEle = numberValue;
  input.valEle = numberValue;

  arrowLeft.addEventListener("mouseup", incVal);
  arrowLeft.valEle = numberValue;
  arrowLeft.step = -step;
  arrowRight.addEventListener("mouseup", incVal);
  arrowRight.valEle = numberValue;
  arrowRight.step = step;

  numberSlider.addEventListener("mousedown", horizontalMouseDrag); // START
  document.addEventListener("mouseup", horizontalMouseDrag); // STOP*/

  return div;
}

function incVal(e) {
  let tar = e.target;
  if (tar.tagName === "use") tar = tar.parentNode; // In case the path is selected
  const valEle = tar.valEle;
  const step = tar.step;
  const min = valEle.min;
  const max = valEle.max;

  const val = isNaN(valEle.textContent) ? false : parseInt(valEle.textContent);
  if (!val) return;
  if (val + step > max || val + step < min) return;

  valEle.textContent = val + step;
  valEle.callBack(valEle);
}

function updateValueFromSlider(valEle, val) {
  if (isNaN(val)) return;
  val = parseInt(val);
  const max = valEle.max;
  const min = valEle.min;
  if (val > max) val = max;
  if (val < min) val = min;
  valEle.textContent = val;
  valEle.callBack(valEle);
}

function hideInput(e) {
  if (e.type === "keydown") {
    if (e.keyCode !== 13) return;
  }
  const inp = e.target;
  inp.style.display = "none";
  updateValueFromSlider(inp.valEle, inp.value);
}

function horizontalMouseDrag(e) {
  let valEle = e.target.valEle;
  if (!valEle) {
    if (document.valEle) valEle = document.valEle;
    else return;
  }
  valEle.inp.removeEventListener("focusout", hideInput);
  valEle.inp.removeEventListener("keydown", hideInput);
  if (e.type === "mousedown") {
    valEle.mouseDown = true;
    document.valEle = valEle;
    valEle.startX = e.clientX;
    valEle.iniVal = parseInt(valEle.textContent);
    document.valEle = valEle;
    document.addEventListener("mousemove", mouseTracker);
  } else if (valEle.mouseDown) {
    valEle.mouseDown = false;
    if (!valEle.moved) {
      valEle.inp.style.display = "block";
      valEle.inp.addEventListener("focusout", hideInput);
      valEle.inp.addEventListener("keydown", hideInput);
      valEle.inp.value = valEle.textContent;
      valEle.inp.focus();
      valEle.inp.select();
    }
    valEle.moved = false;
    document.removeEventListener("mousemove", mouseTracker);
  }
}

function mouseTracker(e) {
  const valEle = document.valEle;
  if (!valEle.moved) {
    if (e.startX !== e.clientX) valEle.moved = true;
    else return;
  }
  const startX = valEle.startX;
  const iniVal = valEle.iniVal;
  let val = iniVal + Math.round((startX - e.clientX) / -3);
  updateValueFromSlider(valEle, val);
}

function createMenuOption() {
  const toolbar = document.getElementById("toolbar-top");
  const div = document.createElement("div");

  const uiPanelWrapper = document.createElement("div");
  uiPanelWrapper.className = "ui-panel-wrapper ui-position-single";
  uiPanelWrapper.style.width = "80px";

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.innerHTML =
    '<symbol id="arrow-196ede21e3a" viewBox="0 0 32 32"><path d="M9.68 12.8h12.72l-6.4 7.040z"></path></symbol><use xlink:href="#arrow-196ede21e3a"></use>';
  svg.setAttribute("class", "ui-select-arrow");

  const symbol = document.createElement("symbol");
  symbol.id = "arrow-196ede21e3a";
  symbol.innerHTML = '<path d="M9.68 12.8h12.72l-6.4 7.040z"></path>';
  symbol.setAttribute("viewBox", "0 0 32 32");
  svg.appendChild(symbol);

  const use = document.createElement("use");
  use.setAttribute("xlink:href", "#arrow-196ede21e3a");
  svg.appendChild(use);
  uiPanelWrapper.appendChild(svg);

  const uiPanelText = document.createElement("div");
  uiPanelText.className = "ui-panel-text";
  uiPanelText.style.width = "calc(100% - 26px)";
  uiPanelText.textContent = "Images";
  uiPanelWrapper.appendChild(uiPanelText);

  div.appendChild(uiPanelWrapper);

  toolbar.appendChild(div);

  return div;
}

function createMenuImageSection(imageData) {
  const imageIndex = displayedImageSizes.length - 1;
  const imageName = displayedImageNames[imageIndex];
  const imageSize = displayedImageSizes[imageIndex];
  const imageXPos = imagePositionsX[imageIndex];
  const imageYPos = imagePositionsY[imageIndex];

  const details = document.createElement("details");
  details.className = "image-item";

  const summary = document.createElement("summary");
  summary.textContent = imageName;

  details.appendChild(summary);

  // PREVIEW
  const previewWrapper = document.createElement("div");
  previewWrapper.className = "preview-wrapper";

  const preview = document.createElement("img");
  preview.src = imageData;
  preview.className = "image-preview";
  previewWrapper.appendChild(preview);
  details.appendChild(previewWrapper);

  // SIZE
  const size = createSlider("Size", 30, 30, 100, 1, changeSize, imageIndex);
  details.appendChild(size);

  // X
  const posX = createSlider("X", 0, 0, 100, 1, changeXPos, imageIndex);
  details.appendChild(posX);

  // Y
  const posY = createSlider("Y", 0, 0, 100, 1, changeYPos, imageIndex);
  details.appendChild(posY);

  return details;
}

function loadImage(e) {
  toggleMenu();
  const file = e.target.files[0];

  const sep = file.name.split(".");
  const ext = sep.pop();
  if (!["jpg", "jpeg", "png", "gif"].includes(ext)) return;
  const name = sep.join(".");

  const bgElement = document.querySelector(
    "#workbench > div.viewport > div.scene > canvas"
  );

  let fileReader = new FileReader();
  fileReader.readAsDataURL(file);
  fileReader.onload = function () {
    displayedImageNames.push(name);
    displayedImageSizes.push(30);
    imagePositionsX.push(0);
    imagePositionsY.push(0);
    const previousImages = bgElement.style.backgroundImage;
    if (previousImages) {
      bgElement.style.backgroundImage = `${previousImages}, url('${fileReader.result}')`;
    } else {
      document.getElementById("image-list").style.display = "block";
      bgElement.style.backgroundImage = `url('${fileReader.result}')`;
    }
    const div = createMenuImageSection(fileReader.result);
    document.getElementById("image-list").appendChild(div);
    updateImages();
  };
}

function updateImages() {
  const bgElement = document.querySelector(
    "#workbench > div.viewport > div.scene > canvas"
  );

  bgElement.style.backgroundSize = `${displayedImageSizes.join("%, ")}%`;
  bgElement.style.backgroundPositionX = `${imagePositionsX.join("%, ")}%`;
  bgElement.style.backgroundPositionY = `${imagePositionsY.join("%, ")}%`;
}

function changeSize(val) {
  let index = val.index;
  let value = val.textContent;
  if (isNaN(index) || isNaN(value)) return;
  index = parseInt(index);
  value = parseInt(value);
  displayedImageSizes[index] = value;
  updateImages();
}

function changeXPos(val) {
  let index = val.index;
  let value = val.textContent;
  if (isNaN(index) || isNaN(value)) return;
  index = parseInt(index);
  value = parseInt(value);
  imagePositionsX[index] = value;
  updateImages();
}

function changeYPos(val) {
  let index = val.index;
  let value = val.textContent;
  if (isNaN(index) || isNaN(value)) return;
  index = parseInt(index);
  value = parseInt(value);
  imagePositionsY[index] = value;
  updateImages();
}
