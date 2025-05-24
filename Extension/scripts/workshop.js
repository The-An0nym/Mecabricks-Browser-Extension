// ToDo ::
// Clean and optimize code
// Removing images

if (url.includes("workshop")) appendContent();

const imgsList = [];

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

function createSlider(name, val, min, max, step, sensitivity, callBack, index) {
  const div = document.createElement("div");
  div.className = "ui-number-wrapper ui-position-single ui-margin-top-5";
  div.style.width = "calc(100% - 15px)";

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

  numberValue.sensitivity = sensitivity;
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

  if (isNaN(valEle.textContent)) return;
  val = parseInt(valEle.textContent);
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
  inp.removeEventListener("focusout", hideInput);
  inp.removeEventListener("keydown", hideInput);
  inp.style.display = "none";
  updateValueFromSlider(inp.valEle, inp.value);
}

function horizontalMouseDrag(e) {
  let valEle = e.target.valEle;
  if (!valEle) {
    if (document.valEle) valEle = document.valEle;
    else return;
  }
  if (e.type === "mousedown") {
    valEle.mouseDown = true;
    document.valEle = valEle;
    valEle.startX = e.clientX;
    valEle.iniVal = parseInt(valEle.textContent);
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
  const sensitivity = valEle.sensitivity;
  let val = iniVal + Math.round((startX - e.clientX) / -sensitivity);
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
  const index = imgsList.length - 1;
  const imageName = imgsList[index].name;

  const details = document.createElement("details");
  details.className = "image-item";
  details.id = "image-" + index;

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

  // HIDE
  const checkBoxWrapper = document.createElement("div");
  checkBoxWrapper.className = "ui-checkbox-wrapper";
  checkBoxWrapper.style.width = "calc(100% - 15px)";

  const randomID = Math.round(Math.random() * 1000);

  const checkBoxInp = document.createElement("input");
  checkBoxInp.type = "checkbox";
  checkBoxInp.id = "checkbox-c-" + randomID;
  checkBoxInp.className = "ui-checkbox-input";
  checkBoxInp.index = index;
  checkBoxInp.addEventListener("change", toggleImageVisibility);

  checkBoxWrapper.appendChild(checkBoxInp);

  const checkBoxLabel = document.createElement("label");
  checkBoxLabel.setAttribute("for", "checkbox-c-" + randomID);

  checkBoxLabel.innerHTML =
    '<svg class="ui-checkbox ui-checkbox-right"><symbol id="tick-196fd42c562" viewBox="0 0 32 32"><path d="M27 4l-15 15-7-7-5 5 12 12 20-20z"></path></symbol><use xlink:href="#tick-196fd42c562"></use></svg>';

  const checkBoxText = document.createElement("span");
  checkBoxText.textContent = "Hide";

  checkBoxLabel.appendChild(checkBoxText);
  checkBoxWrapper.appendChild(checkBoxLabel);
  details.appendChild(checkBoxWrapper);

  // SIZE
  const size = createSlider("Size", 30, 30, 300, 1, 2, changeSize, index);
  details.appendChild(size);

  // X
  const posX = createSlider("X", 50, 0, 100, 1, 3, changeXPos, index);
  details.appendChild(posX);

  // Y
  const posY = createSlider("Y", 50, 0, 100, 1, 3, changeYPos, index);
  details.appendChild(posY);

  // DELETE
  const removeWrapper = document.createElement("div");
  removeWrapper.className = "ui-button-wrapper ui-position-single";
  removeWrapper.style.textAlign = "center";
  removeWrapper.style.width = "calc(100% - 15px)";
  removeWrapper.style.marginTop = "15px";
  removeWrapper.addEventListener("mouseup", removeImage);
  removeWrapper.index = index;

  const removeText = document.createElement("div");
  removeText.className = "ui-button-text";
  removeText.textContent = "Remove";

  removeWrapper.appendChild(removeText);
  details.appendChild(removeWrapper);

  return details;
}

function loadImage(e) {
  if (!e.target.files.length) return;
  toggleMenu();
  const file = e.target.files[0];

  const sep = file.name.split(".");
  const ext = sep.pop();
  if (!["jpg", "jpeg", "png", "gif"].includes(ext)) return;
  const name = sep.join(".");

  const bgElement = document.querySelector(
    "#workbench > div.viewport > div.scene > canvas"
  );

  let fR = new FileReader();
  fR.readAsDataURL(file);
  fR.onload = function () {
    var img = new Image();

    img.src = fR.result;

    img.onload = function () {
      const index = imgsList.length;
      imgsList.push({});
      imgsList[index].name = name;
      imgsList[index].size = 30;
      imgsList[index].x = 50;
      imgsList[index].y = 50;
      imgsList[index].ratio = img.height / img.width;
      imgsList[index].hide = false;

      const previousImages = bgElement.style.backgroundImage;
      if (previousImages) {
        bgElement.style.backgroundImage = `${previousImages}, url('${img.src}')`;
      } else {
        document.getElementById("image-list").style.display = "block";
        bgElement.style.backgroundImage = `url('${img.src}')`;
      }
      const div = createMenuImageSection(img.src);
      document.getElementById("image-list").appendChild(div);
      updateImages();

      e.target.value = "";
    };
  };
}

function updateImages() {
  const bgElement = document.querySelector(
    "#workbench > div.viewport > div.scene > canvas"
  );

  const cHeight = parseInt(
    document.querySelector("div.scene > canvas").style.height.slice(0, -2)
  );
  const cWidth = parseInt(
    document.querySelector("div.scene > canvas").style.width.slice(0, -2)
  );

  const size = [];
  const xPos = [];
  const yPos = [];

  imgsList.forEach((i) => {
    if (i.hide) size.push(0);
    else size.push(i.size);
    const iWidth = (cWidth / 100) * i.size;
    xPos.push(((cWidth + iWidth - 20) / 100) * i.x - iWidth + 10);
    const iHeight = (cWidth / 100) * i.size * i.ratio;
    yPos.push(((cHeight + iHeight - 20) / 100) * i.y - iHeight + 10);
  });

  if (size.length === 0) {
    bgElement.style.backgroundSize = "";
    bgElement.style.backgroundPositionX = "";
    bgElement.style.backgroundPositionY = "";
  } else {
    bgElement.style.backgroundSize = `${size.join("%, ")}%`;
    bgElement.style.backgroundPositionX = `${xPos.join("px, ")}px`;
    bgElement.style.backgroundPositionY = `${yPos.join("px, ")}px`;
  }
}

function changeSize(val) {
  let index = val.index;
  let value = val.textContent;
  if (isNaN(index) || isNaN(value)) return;
  index = parseInt(index);
  value = parseInt(value);
  imgsList[index].size = value;
  updateImages();
}

function changeXPos(val) {
  let index = val.index;
  let value = val.textContent;
  if (isNaN(index) || isNaN(value)) return;
  index = parseInt(index);
  value = parseInt(value);
  imgsList[index].x = value;
  updateImages();
}

function changeYPos(val) {
  let index = val.index;
  let value = val.textContent;
  if (isNaN(index) || isNaN(value)) return;
  index = parseInt(index);
  value = parseInt(value);
  imgsList[index].y = value;
  updateImages();
}

function toggleImageVisibility(e) {
  if (e.target.index === undefined) return;
  index = e.target.index;
  imgsList[index].hide = !imgsList[index].hide;
  updateImages();
}

function removeImage(e) {
  let index;
  if (e.target.index === undefined) index = e.target.parentNode.index;
  else index = e.target.index;
  imgsList.splice(index, 1);
  const bgElement = document.querySelector(
    "#workbench > div.viewport > div.scene > canvas"
  );

  const previousImages = bgElement.style.backgroundImage.split(", ");
  previousImages.splice(index, 1);
  bgElement.style.backgroundImage = previousImages.join(", ");
  document.getElementById("image-" + index).remove();
  if (imgsList.length === 0)
    document.getElementById("image-list").style.display = "none";
  updateImages();
}
