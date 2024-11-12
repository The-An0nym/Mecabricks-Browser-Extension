const url = window.location.href;

if (url.includes("comments")) {
  const x = document.getElementsByClassName("emoji"); // Get Emoji elements
  for (let i = 0; i < x.length; i++) {
    let y = x[i].src;
    y = y.slice(0, 62) + y.slice(68, 74) + "svg"; // Fix URLs
    x[i].src = y;
  }
}

if (url.includes("emojis")) {
  const x = document.getElementsByClassName("image"); // Get Emoji elements
  for (let i = 0; i < x.length; i++) {
    let y = x[i].childNodes[0].src;
    y =
      "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/" +
      y.slice(33, y.indexOf(".png")) +
      ".svg"; // Fix URLs
    x[i].childNodes[0].src = y;
  }
}
