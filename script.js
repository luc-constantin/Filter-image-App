const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const img = new Image();
const reader = new FileReader();
const dropOverlay = document.getElementById("drop-overlay");
const popup = document.getElementById("theme-popup");
const uploader = document.getElementById("uploader");

uploader.addEventListener("change", (e) => {
  uploadImage(e.target.files[0]);
});

// Drag & Drop Events
dropOverlay.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropOverlay.classList.add("hover");
});
dropOverlay.addEventListener("dragleave", () => {
  dropOverlay.classList.remove("hover");
});
dropOverlay.addEventListener("drop", (e) => {
  e.preventDefault();
  dropOverlay.classList.remove("hover");
  const file = e.dataTransfer.files[0];
  if (file) {
    uploadImage(file);
  }
});

function uploadImage(file) {
  reader.readAsDataURL(file);
  reader.onload = () => {
    img.src = reader.result;
    img.onload = () => {

      // Get the actual visible frame where the image must fit
      const frameWidth = dropOverlay.clientWidth;
      const frameHeight = dropOverlay.clientHeight;

      // IMAGE SIZE
      let imgW = img.width;
      let imgH = img.height;

      // SCALE IMAGE TO FIT FRAME (prevent overflow)
      const scale = Math.min(frameWidth / imgW, frameHeight / imgH) * 0.95;

      imgW *= scale;
      imgH *= scale;

      // Resize canvas
      canvas.width = imgW;
      canvas.height = imgH;

      // Clear and draw scaled image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, imgW, imgH);

      // Hide upload overlay
      dropOverlay.classList.remove("show");
    };
  };
}


// Filters
function applyFilter(callback) {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b] = callback(data[i], data[i + 1], data[i + 2]);
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }
  ctx.putImageData(imageData, 0, 0);
}
function grayscale() {
  applyFilter((r, g, b) => {
    const grey = r * 0.21 + g * 0.71 + b * 0.07;
    return [grey, grey, grey];
  });
}
function sepia() {
  applyFilter((r, g, b) => {
    const grey = r * 0.21 + g * 0.71 + b * 0.07;
    return [grey + 95, grey + 58, grey];
  });
}
function invert() {
  applyFilter((r, g, b) => [255 - r, 255 - g, 255 - b]);
}
function smartInvert() {
  applyFilter((r, g, b) => [20 - r, 240 - g, 125 - b]);
}
function preservePrimaryColors() {
  applyFilter((r, g, b) => {
    if (r > g && r > b) return [r, g, b];
    if (b > r && b > g) return [r, g, b];
    if (r > 180 && g > 180 && b < 100) return [r, g, b];
    const avg = (r + g + b) / 3;
    return [avg, avg, avg];
  });
}
function colorBoost() {
  applyFilter((r, g, b) => [Math.min(255, r + 40), Math.min(255, g + 40), Math.min(255, b + 40)]);
}
function highContrast() {
  applyFilter((r, g, b) => {
    const avg = (r + g + b) / 3;
    const val = avg > 128 ? 255 : 0;
    return [val, val, val];
  });
}
function blueTone() {
  applyFilter((r, g, b) => [r * 0.5, g * 0.5, Math.min(255, b + 50)]);
}
function swapChannels(a, b) {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const temp = data[i + a];
    data[i + a] = data[i + b];
    data[i + b] = temp;
  }
  ctx.putImageData(imageData, 0, 0);
}
function rbg() { swapChannels(1, 2); }
function bgr() { swapChannels(2, 0); }
function gbr() { swapChannels(1, 2); }
function grb() { swapChannels(1, 0); }

function clearChanges() {
  if (!img.src) return;
  img.src = reader.result;
}
function download() {
  const image = canvas.toDataURL();
  const link = document.createElement("a");
  link.href = image;
  link.download = "filtered-image.png";
  link.click();
}
function clearPhoto() {
  if (!img.src || img.src === window.location.href) {
    showPopup("⚠️ No photo to remove");
    return;
  }
  if (confirm("Are you sure you want to remove the photo?")) {
    window.location.reload();
  }
}
function toggleTheme() {
  const isDark = document.body.classList.toggle("light");
  document.getElementById("themeToggle").textContent = isDark ? "☀️" : "🌙";
}
function detectTheme() {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = !prefersDark;
  document.body.classList.toggle("light", isDark);
  document.getElementById("themeToggle").textContent = isDark ? "☀️" : "🌙";
  showPopup(`Auto theme detected: ${isDark ? "Light" : "Dark"}`);
}
function showPopup(msg) {
  popup.textContent = msg;
  popup.classList.add("show");
  setTimeout(() => {
    popup.classList.remove("show");
  }, 4000);
}

window.addEventListener("DOMContentLoaded", detectTheme);

// Bind buttons
const buttons = document.querySelectorAll("button");
buttons[0].addEventListener("click", grayscale);
buttons[1].addEventListener("click", sepia);
buttons[2].addEventListener("click", invert);
buttons[3].addEventListener("click", smartInvert);
buttons[4].addEventListener("click", rbg);
buttons[5].addEventListener("click", bgr);
buttons[6].addEventListener("click", gbr);
buttons[7].addEventListener("click", grb);
buttons[8].addEventListener("click", preservePrimaryColors);
buttons[9].addEventListener("click", colorBoost);
buttons[10].addEventListener("click", highContrast);
buttons[11].addEventListener("click", blueTone);
buttons[12].addEventListener("click", clearChanges);
buttons[13].addEventListener("click", download);
