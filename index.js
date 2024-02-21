document.body.addEventListener("mousedown", handleMouseDown);
document.body.addEventListener("mouseup", handleMouseUp);
document.body.addEventListener("dragstart", preventDefault);
document.body.addEventListener("drop", preventDefault);

function createGrid(target, size) {
  if (typeof target === "string") {
    target = document.querySelector(target);
  }

  target.innerHTML = "";

  for (let x = 0; x < size; x++) {
    const row = document.createElement("div");
    row.classList.add("row");
    for (let y = 0; y < size; y++) {
      const column = document.createElement("div");
      column.classList.add("column");
      // Initial color
      column.style.backgroundColor = "white";
      assignEventListener(column);
      row.appendChild(column);
    }
    target.appendChild(row);
  }
}

function assignEventListener(target) {
  target.addEventListener("mouseenter", handleMouseEnter);
  target.addEventListener("dragstart", preventDefault);
  target.addEventListener("drop", preventDefault);
}

function preventDefault(event) {
  event.preventDefault();
}

let isDrawing = false;

function handleMouseEnter(event) {
  if (!isDrawing) return;

  if (pencilMode) {
    pencilBrush(event);
  } else if (eraserMode) {
    eraser(event);
  } else {
    penBrush(event);
  }
}

function handleMouseUp() {
  isDrawing = false;
}

function handleMouseDown(event) {
  isDrawing = true;
  if (event.target.classList.contains("column")) {
    handleMouseEnter(event);
  }
}

let color = "black";
function penBrush(event) {
  event.target.style.backgroundColor = color;
}

let pencilMode = false;
let eraserMode = false;
function pencilBrush(event) {
  const darkenOffset = 20;

  event.target.style.backgroundColor = getDarkenedColor(
    event.target,
    darkenOffset,
  );
}

function eraser(event) {
  event.target.style.backgroundColor = "white";
}

// Both RGBtoHSL and HSLtoRGB definitely is not written by me. I am not capable of this stuff.
function RGBtoHSL(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const l = Math.max(r, g, b);
  const s = l - Math.min(r, g, b);
  const h = s
    ? l === r
      ? (g - b) / s
      : l === g
        ? 2 + (b - r) / s
        : 4 + (r - g) / s
    : 0;
  return [
    60 * h < 0 ? 60 * h + 360 : 60 * h,
    100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
    (100 * (2 * l - s)) / 2,
  ];
}

function HSLtoRGB(h, s, l) {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [255 * f(0), 255 * f(8), 255 * f(4)];
}

/**
 * Calculate the darkened color of the target element's background color by a specified offset.
 * @param {HTMLElement} element - The target element
 * @param {number} offset - The offset to darken the color by
 * @returns {string} - The darkened color in rgb format
 */
function getDarkenedColor(element, offset) {
  // Get the computed color of the target element, which in default case is white.
  const targetColor = getComputedStyle(element).backgroundColor;
  // Match the target color with the regex
  // Expected Output: ["rgb(255,255,255)", "255", "255", "255"]
  let match = targetColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);

  const red = parseInt(match[1]);
  const green = parseInt(match[2]);
  const blue = parseInt(match[3]);

  // Convert RGB to HSL
  let hslColor = RGBtoHSL(red, green, blue);

  // HSL => Hue, Saturation, Lightness
  // Reduce lightness by offset.
  hslColor[2] -= offset;

  // Convert the darkened HSL color back to RGB.
  const darkenedColor = HSLtoRGB(hslColor[0], hslColor[1], hslColor[2]);

  return `rgb(${darkenedColor[0]}, ${darkenedColor[1]}, ${darkenedColor[2]}`;
}

function handleButtonClick(event) {
  const button = event.target;
  const allButtons = button.parentNode.children;

  for (const btn of allButtons) {
    btn.classList.remove("selected");
  }

  button.classList.add("selected");

  if (button.id === "pen-button") {
    pencilMode = false;
    eraserMode = false;
  } else if (button.id === "pencil-button") {
    eraserMode = false;
    pencilMode = true;
  } else if (button.id === "eraser-button") {
    eraserMode = true;
    pencilMode = false;
  }
}

const buttons = document.querySelectorAll(".toolbox-container .left .button");
for (const button of buttons) {
  button.addEventListener("click", handleButtonClick);
}

const clearButton = document.querySelector("#clear-button");
clearButton.addEventListener("click", () => {
  const allGrids = document.querySelectorAll(".column");
  for (const grid of allGrids) {
    console.log(grid);
    grid.style.backgroundColor = "white";
  }
});

const alwan = new Alwan("#color-picker");

alwan.on("change", (event) => {
  // Since mousedown and mouseup events are registered on the body element,
  // we need to make sure that when user is changing the color, isDrawing is set to false.
  isDrawing = false;
  color = event.rgb;
});

const range = document.getElementById("size");
const label = document.querySelector("label[for='size']");
range.addEventListener("input", () => {
  label.textContent = `${range.value}x${range.value}`;
  createGrid(drawingBoard, range.value);
});

const drawingBoard = document.querySelector("#drawing-panel");
createGrid(drawingBoard, 10);
