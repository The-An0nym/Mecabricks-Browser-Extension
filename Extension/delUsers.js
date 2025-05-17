// Check the toggle state and conditionally run the script
chrome.storage.sync.get("scriptEnabled", (data) => {
  if (!data.scriptEnabled) {
    return;
  }
  if (url.includes("models")) {
    removeComments();
  }
  if (url.includes("topic")) {
    removePosts();
  }
  console.log("pass!");
});

function removeComments() {
  const usernames = document.getElementsByClassName("author");
  for (let i = usernames.length - 1; i >= 0; i--) {
    if (usernames[i].innerText === "") {
      usernames[i].parentNode.parentNode.parentNode.remove();
      console.log("%c removed element!", "background: #c20; color: #fff");
    }
  }
}

function removePosts() {
  const usernames = document.getElementsByClassName("username");
  for (let i = usernames.length - 1; i >= 0; i--) {
    if (usernames[i].innerText === "") {
      usernames[i].parentNode.parentNode.parentNode.parentNode.remove();
      console.log("%c removed element!", "background: #c20; color: #fff");
    }
  }
}
