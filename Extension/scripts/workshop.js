// ToDo ::
// Generate dynamic list of already added images
// Implement UI to add images
// Implement Logic...
// Allow pressing "image" button to HIDE the pop-up (currently it will simply re-generate it)

if (url.includes("workshop")) appendContent();

const displayedImageNames = [];
const displayedImageSizes = [];

function appendContent() {
  menuOption = createMenuOption();
  menuPanel = createMenuPanel();

  document.addEventListener("mousedown", (e) =>
    toggleMenu(e, menuOption, menuPanel)
  );
}

function toggleMenu(e, mO, mP) {
  if (!mP.contains(e.target) && !mO.contains(e.target)) {
    mP.style.display = "none";
  } else if (mO.contains(e.target)) {
    if (mP.style.display === "block") {
      mP.style.display = "none";
    } else {
      mP.style.display = "block";
    }
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
  const inputsection = document.createElement("div");
  inputsection.className = "section";

  const label = document.createElement("label");
  label.id = "image-input-label";
  label.setAttribute("for", "image-input");
  label.className = "item";

  // Empty menu icon
  const emptyMenuIcon = document.createElement("div");
  emptyMenuIcon.className = "ui-menu-icon ui-icon";
  label.appendChild(emptyMenuIcon);

  label.appendChild(document.createTextNode("Add reference image"));

  inputsection.appendChild(label);

  const input = document.createElement("input");
  input.id = "image-input";
  input.type = "file";
  input.addEventListener("change", loadImage);

  inputsection.appendChild(input);

  /* LIST OF IMAGES*/
  const listsection = document.createElement("div");
  listsection.className = "section";

  const todo = document.createElement("div");
  todo.className = "image-item";

  // Empty menu icon
  const emptyMenuIcon2 = document.createElement("div");
  emptyMenuIcon2.className = "ui-menu-icon ui-icon";
  todo.appendChild(emptyMenuIcon2);

  todo.appendChild(document.createTextNode("To do..."));

  listsection.appendChild(todo);

  /* ADDING EVERYTHING */
  wrapper.appendChild(inputsection);
  wrapper.appendChild(listsection);
  div.appendChild(wrapper);
  document.body.appendChild(div);

  div.style.display = "none";

  return div;
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

function loadImage(e) {
  toggleMenu();
  const file = e.target.files[0];

  const bgElement = document.querySelector(
    "#workbench > div.viewport > div.scene > canvas"
  );

  let fileReader = new FileReader();
  fileReader.readAsDataURL(file);
  fileReader.onload = function () {
    displayedImageNames.push(file.name);
    displayedImageSizes.push(200);
    const previousImages = bgElement.style.backgroundImage;
    if (previousImages) {
      bgElement.style.backgroundImage = `${previousImages}, url('${fileReader.result}')`;
    } else {
      bgElement.style.backgroundImage = `url('${fileReader.result}')`;
    }
    updateImages();
  };
}

function updateImages() {
  const bgElement = document.querySelector(
    "#workbench > div.viewport > div.scene > canvas"
  );

  const imagePositionsX = [0].concat(
    displayedImageSizes.map((elem, index) =>
      displayedImageSizes.slice(0, index + 1).reduce((a, b) => a + b)
    )
  );
  imagePositionsX.pop();
  bgElement.style.backgroundSize = `${displayedImageSizes.join("px, ")}px`;
  bgElement.style.backgroundPositionX = `${imagePositionsX.join("px, ")}px`;
}
