
export function toRgbHslHex(color) {
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
  console.log({
    hex: hex,
    rgb: rgb,
    hsl: hsl,
  });
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

  return "hsl(" + h.toFixed(2) + ", " + s.toFixed(2) + "%, " + l.toFixed(2) + "%)";
}
function hslToRgb(hsl) {
  let hslValues = color.match(/\d+/g);
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

