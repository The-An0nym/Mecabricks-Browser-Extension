// Fixing emojis
function fixEmojisComments() {
  const x = document.getElementsByClassName("emoji"); // Get Emoji elements
  for (let i = 0; i < x.length; i++) {
    let y = x[i].src;
    y = y.slice(0, 62) + y.slice(68, 74) + "svg"; // Fix URLs
    x[i].src = y;
  }
}

function fixEmojisPage() {
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

// Fixing search with quotation marks
function fixQuotesSearch() {
  const prev = document.getElementsByClassName("button sprite-gallery prev")[0];
  const next = document.getElementsByClassName("button sprite-gallery next")[0];

  if (!prev.outerHTML.includes("disabled")) {
    let x = fullUrl;
    if (fullUrl.includes("&page=")) {
      let y = x.split("&page=");
      let z = parseInt(y[1]);
      z--;
      x = y[0] + "&page=" + z;
      prev.href = x;
    }
  }

  if (!next.outerHTML.includes("disabled")) {
    let x = fullUrl;
    if (fullUrl.includes("&page=")) {
      let y = x.split("&page=");
      let z = parseInt(y[1]);
      z++;
      x = y[0] + "&page=" + z;
    } else {
      x = x + "&page=2";
    }
    next.href = x;
  }
}
