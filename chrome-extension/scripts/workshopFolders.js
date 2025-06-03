function reOrderFolders() {
  const wrapper = document.getElementsByClassName("nano-content")[0];
  if (!wrapper) return;
  const eles = wrapper.getElementsByClassName("item");
  if (!eles.length) return;
  if (eles[0].done) return;

  const folderEles = [];
  for (let i = eles.length - 1; i >= 0; i--) {
    const ele = eles[i];
    if (ele.getElementsByClassName("folder").length) {
      ele.remove();
      folderEles.push(ele);
    }
  }
  for (const ele of folderEles) {
    wrapper.prepend(ele);
  }

  const eles2 = wrapper.getElementsByClassName("item");
  eles2[0].done = true;
}

function menuImpClicked() {
  document
    .getElementById("import-button")
    .addEventListener("mouseup", () => setTimeout(impClicked, 100));
}

function impClicked() {
  if (document.getElementsByClassName("nano-content").length) {
    const config = { childList: true };
    const targetNode = document.getElementsByClassName("nano-content")[0];
    const observer = new MutationObserver(reOrderFolders);
    observer.observe(targetNode, config);
  }
}
