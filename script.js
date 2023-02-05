// import {toRgbHslHex} from './rbg.js'

const colorPickerBtn = document.querySelector("#color-picker");
const clearAll = document.querySelector(".clear-all");
const colorList = document.querySelector(".all-colors");
const pickedColors = JSON.parse(localStorage.getItem("recent-colors") || "[]");

const maxRecent = 16;
const colorType = localStorage.getItem("color-type") || "hex";

const copyColor = (elem) => {
  elem.innerText = "Copied";
  navigator.clipboard.writeText(elem.dataset.color); //copy color
  setTimeout(() => (elem.innerText = elem.dataset.color), 1000);
};

const addPickedColor = (color) => {
  const { hex, rgb, hsl } = toRgbHslHex(color);
  toRgbHslHex(color);

   color = colorType === "rgb" ? rgb : colorType === "hsl" ? hsl : hex;

  const background = `background: ${color}`;
  const boxShadow = `box-shadow: ${
    color == "#ffffff" ? "#ccc" : color
  }91 0px 5px 5px`;
  const colorValue = `background-color: ${color}; color: ${
    lightOrDark(hex) === "light" ? "#000" : "#fff"
  }; border-color: ${lightOrDark(hex) === "light" ? "#000" : "#fff"};
  `;

  const colorDiv = document.createElement("div");
  colorDiv.classList.add("color-tooltip");
  colorDiv.setAttribute("style", `${background}; ${boxShadow}`);
  colorDiv.addEventListener("click", (e) =>
    copyColor(e.currentTarget.firstElementChild)
  );

  const tooltipSpan = document.createElement("span");
  tooltipSpan.classList.add("value", "hex", "tooltiptext");
  tooltipSpan.setAttribute("data-color", color);
  tooltipSpan.setAttribute("style", colorValue);
  tooltipSpan.textContent = color;

  colorDiv.appendChild(tooltipSpan);

  colorList.insertBefore(colorDiv, colorList.children[0]);
  if (colorList.hasChildNodes()) {
    document.querySelector(".recent-colors").classList.remove("hide");
  }
};

function updateColor(colorType) {
  const children = document.querySelectorAll(".tooltiptext");
  // get all children
  // const children = colorList.childNodes;

  // iterate over all child nodes
  colorList.classList = `all-colors ${colorType}`;
  children.forEach((li) => {
    const newColor = toRgbHslHex(li.textContent)[colorType];
    li.textContent = newColor;
    li.dataset.color = newColor;
  });
}

const showPickedColor = () => {
  //   console.log(JSON.parse(localStorage.getItem("picked-colors") || "[]"));
  if (!pickedColors.length) return;
  colorList.innerHTML = "";
  document.querySelector(".recent-colors").classList.remove("hide");
  pickedColors.map((color, i) => addPickedColor(color));
};

const setColorType = (el) => {
//   console.log("You selected: ", el.target.value);
  const option = el.target.value;

  if (option === "esc") return;
  localStorage.setItem("color-type", option);
  updateColor(option);
  return option;
};

const colorSelect = document.getElementById("color-type");
if (colorSelect) {
  colorSelect.addEventListener("change", (e) => setColorType(e));
  colorSelect.value = colorType;
}
showPickedColor();
colorList.classList = `all-colors ${colorType}`;

const openEyeDropper = () => {
  document.body.style.display = "none";
  setTimeout(async () => {
    try {
      // check if browser supports
      if (!window.EyeDropper) {
        alert("Your browser does not support the EyeDropper API");
        return;
      }

      // Opening the eye dropper and getting the selected color
      const eyeDropper = new EyeDropper();
      const { sRGBHex } = await eyeDropper.open();
      const { hex, rgb, hsl } = toRgbHslHex(sRGBHex);
      const copiedText =
        colorType === "rgb" ? rgb : colorType === "hsl" ? hsl : hex;
      navigator.clipboard.writeText(copiedText);
      lightOrDark(sRGBHex);
      // Adding the color to the list if it doesn't already exist
      if (!pickedColors.includes(sRGBHex)) {
        pickedColors.push(sRGBHex);

        if (pickedColors.length >= maxRecent) {
          pickedColors.splice(0, pickedColors.length - maxRecent);
          const colors = document.querySelectorAll(".color-tooltip");
          colors[colors.length - 1].remove();
        }

        localStorage.setItem("recent-colors", JSON.stringify(pickedColors));
        addPickedColor(sRGBHex);
      } else {
        //remove the color and add to the front
        const findIndexNormal = pickedColors.findIndex(
          (hex) => hex === sRGBHex
        );

        const findIndex = pickedColors
          .reverse()
          .findIndex((hex) => hex === sRGBHex);
        const colors = document.querySelectorAll(".color-tooltip");

        console.log(sRGBHex, findIndex, pickedColors.reverse());
        pickedColors.splice(findIndexNormal, 1);

        colors[findIndex].remove();

        pickedColors.push(sRGBHex);

        localStorage.setItem("recent-colors", JSON.stringify(pickedColors));
        addPickedColor(sRGBHex);
      }
    } catch (error) {
      alert("Failed to copy the color code!");
    }
    document.body.style.display = "block";
  }, 10);
};

const clearAllColors = () => {
  pickedColors.length = 0;
  colorList.innerHTML = "";
  localStorage.setItem("recent-colors", JSON.stringify(pickedColors));
  document.querySelector(".recent-colors").classList.add("hide");
};

clearAll.addEventListener("click", clearAllColors);
colorPickerBtn.addEventListener("click", openEyeDropper);

function lightOrDark(color) {
  // Check the format of the color, HEX or RGB?
  let r;
  let g;
  let b;

  if (color.match(/^rgb/)) {
    // If HEX --> store the red, green, blue values in separate variables
    color = color.match(
      /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/
    );

    r = color[1];
    g = color[2];
    b = color[3];
  } else {
    // If RGB --> Convert it to HEX: http://gist.github.com/983661
    color = +("0x" + color.slice(1).replace(color.length < 5 && /./g, "$&$&"));

    r = color >> 16;
    g = (color >> 8) & 255;
    b = color & 255;
  }

  // HSP equation from http://alienryderflex.com/hsp.html
  let hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));

  // Using the HSP value, determine whether the color is light or dark
  if (hsp > 127.5) {
    // console.log(color, "light");
    return "light";
  } else {
    // console.log(color, "dark");
    return "dark";
  }
}

function toRgbHslHex(color) {
  let hex = color;
  let hsl = color;
  let rgb = color;

  if (typeof color === "string") {
    if (color.startsWith("#")) {
      hex = color;
      rgb = hexToRgb(hex);
      hsl = rgbToHsl(rgb);
    } else if (color.startsWith("rgb")) {
      rgb = color;
      hex = rgbToHex(rgb);
      hsl = rgbToHsl(rgb);
    } else if (color.startsWith("hsl")) {
      hsl = color;
      rgb = hslToRgb(hsl);
      hex = rgbToHex(rgb);
    }
  }

  return {
    hex: hex,
    rgb: rgb,
    hsl: hsl,
  };
}

function hexToRgb(hex) {
  let r, g, b;

  if (hex.length === 4) {
    r = "0x" + hex[1] + hex[1];
    g = "0x" + hex[2] + hex[2];
    b = "0x" + hex[3] + hex[3];
  } else if (hex.length === 7) {
    r = "0x" + hex[1] + hex[2];
    g = "0x" + hex[3] + hex[4];
    b = "0x" + hex[5] + hex[6];
  }

  return "rgb(" + [r, g, b].map((x) => parseInt(x, 16)).join(", ") + ")";
}

function rgbToHex(rgb) {
  let values = rgb
    .substring(4, rgb.length - 1)
    .split(", ")
    .map((x) => parseInt(x).toString(16));

  return "#" + values.map((x) => (x.length === 1 ? "0" + x : x)).join("");
}
function rgbToHsl(rgb) {
  let rgbValues = rgb.match(/\d+/g);
  let r = Number(rgbValues[0]);
  let g = Number(rgbValues[1]);
  let b = Number(rgbValues[2]);

  r /= 255;
  g /= 255;
  b /= 255;
  let h, s, l;
  const min = Math.min(r, g, b);
  const max = Math.max(r, g, b);

  if (max === min) {
    h = 0;
  } else if (max === r) {
    h = 60 * (0 + (g - b) / (max - min));
  } else if (max === g) {
    h = 60 * (2 + (b - r) / (max - min));
  } else if (max === b) {
    h = 60 * (4 + (r - g) / (max - min));
  }

  if (h < 0) {
    h = h + 360;
  }

  l = (min + max) / 2;

  if (max === 0 || min === 1) {
    s = 0;
  } else {
    s = (max - l) / Math.min(l, 1 - l);
  }

  s *= 100;
  l *= 100;

  return (
    "hsl(" + Math.round(h) + ", " + Math.round(s) + "%, " + Math.round(l) + "%)"
  );
}
function hslToRgb(hsl) {
  let hslValues = hsl.match(/\d+/g);
  let h = Number(hslValues[0]);
  let s = Number(hslValues[1]);
  let l = Number(hslValues[2]);

  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return (
    "rgb(" +
    Math.round(r * 255) +
    ", " +
    Math.round(g * 255) +
    ", " +
    Math.round(b * 255) +
    ")"
  );
}

// localStorage.setItem("recent-colors", JSON.stringify([
//     "#ffffff",
//     "#202124",
//     "#e8eaed",
//     "#b97755",
//     "#ee9665",
//     "#89b3f5",
//     "#8ab4f7",
//     "#292a2d",
//     "#348c85",
//     "#36d4c7",
//     "#999999",
//     "#ddc1a0",
//     "#1b1714",
//     "#d5ab7e",
//     "#e0c4a3",
//     "#4d3324",
//     "#0b66c2",
//     "#e90811",
//     "#b3060f",
//     "#b5050f",
//     "#ff0000",
//     "#ffebeb",
//     "#717171",
//     "#ececec",
//     "#ed1e45",
//     "#e50148",
//     "#ee61ec",
//     "#194d80",
//     "#979154",
//     "#96644a"
// ]));
