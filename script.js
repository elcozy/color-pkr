const colorPickerBtn = document.querySelector("#color-picker");
const clearAll = document.querySelector(".clear-all");
const colorList = document.querySelector(".all-colors");
const pickedColors = JSON.parse(localStorage.getItem("picked-colors") || "[]");

// Copying the color code to the clipboard and updating the element text
const copyColor = (elem) => {
  elem.innerText = "Copied";
  navigator.clipboard.writeText(elem.dataset.color);
  setTimeout(() => (elem.innerText = elem.dataset.color), 1000);
};

const createElem = (color) => {
  const background = `background: ${color}`;
  const boxShadow = `box-shadow: ${
    color == "#ffffff" ? "#ccc" : color
  }91 0px 5px 5px`;
  const colorValue = `background-color: ${color}; color: ${
    lightOrDark(color) === "light" ? "#000" : "#fff"
  }; border-color: ${lightOrDark(color) === "light" ? "#000" : "#fff"};`;

  const colorDiv = document.createElement("div");
  colorDiv.classList.add("color");
  colorDiv.addEventListener("click", (e) =>
    copyColor(e.currentTarget.firstElementChild.firstElementChild)
  );

  const rectSpan = document.createElement("span");
  rectSpan.classList.add("rect", "color-tooltip");
  rectSpan.setAttribute("style", `${background}; ${boxShadow}`);

  const valueSpan = document.createElement("span");
  valueSpan.classList.add("value", "hex", "tooltiptext");
  valueSpan.setAttribute("data-color", color);
  valueSpan.setAttribute("style", colorValue);
  valueSpan.textContent = color;

  rectSpan.appendChild(valueSpan);
  colorDiv.appendChild(rectSpan);

  if (colorList.hasChildNodes()) {
    colorList.insertBefore(colorDiv, colorList.children[0]);
  } else {
    colorList.appendChild(colorDiv);
  }
  document.querySelector(".picked-colors").classList.remove("hide");

};
const showColor = () => {
  if (!pickedColors.length) return;
  colorList.innerHTML = "";
  pickedColors.map((color) => {
    createElem(color);
  });
  document.querySelector(".picked-colors").classList.remove("hide");

  return;
  const colorElementse = pickedColors
    .slice(0)
    .reverse()
    .map((color) => {
      const background = `background: ${color}`;
      const boxShadow = `box-shadow: ${
        color == "#ffffff" ? "#ccc" : color
      }91 0px 5px 5px`;
      const colorValue = `background-color: ${color}; color: ${
        lightOrDark(color) === "light" ? "#000" : "#fff"
      }; border-color: ${lightOrDark(color) === "light" ? "#000" : "#fff"};`;

      return `
          <div class="color">
            <span class="rect color-tooltip" style="${background}; ${boxShadow}"> 
              <span class="value hex tooltiptext" data-color="${color}" style="${colorValue}">${color}</span>
            </span>
          </div>
        `;
    })
    .join("");

  colorList.innerHTML = colorElements;
  document.querySelector(".picked-colors").classList.remove("hide");

  document.querySelectorAll(".color").forEach((li) => {
    li.addEventListener("click", (e) =>
      copyColor(e.currentTarget.firstElementChild.firstElementChild)
    );
  });
};

showColor();

const activateEyeDropper = () => {
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
      navigator.clipboard.writeText(sRGBHex);
      lightOrDark(sRGBHex);
      // Adding the color to the list if it doesn't already exist
      if (!pickedColors.includes(sRGBHex)) {
        pickedColors.push(sRGBHex);
        localStorage.setItem("picked-colors", JSON.stringify(pickedColors));
        createElem(sRGBHex);
        // showColor();
      }
    } catch (error) {
      alert("Failed to copy the color code!");
    }
    document.body.style.display = "block";
  }, 10);
};

// Clearing all picked colors, updating local storage, and hiding the colorList element
const clearAllColors = () => {
  pickedColors.length = 0;
  colorList.innerHTML = ''
  localStorage.setItem("picked-colors", JSON.stringify(pickedColors));
  document.querySelector(".picked-colors").classList.add("hide");
};

clearAll.addEventListener("click", clearAllColors);
colorPickerBtn.addEventListener("click", activateEyeDropper);

function lightOrDark(color) {
  // Check the format of the color, HEX or RGB?
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
  hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));

  // Using the HSP value, determine whether the color is light or dark
  if (hsp > 127.5) {
    console.log(color, "light");
    return "light";
  } else {
    console.log(color, "dark");
    return "dark";
  }
}
