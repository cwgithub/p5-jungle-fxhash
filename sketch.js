const noGraphicsBuffers = 1;
let noCurvePoints; // Number of points in each curve
let noCurves;
const sideLength = 1000; // Size of each buffer

let curves = new Array(noCurves);
let curveGap = 10; // sideLength / (noCurves + 1);

let pointGap = sideLength / (noCurvePoints - 1);
let topLine = new Array(noCurvePoints);

let bottomLine = new Array(noCurvePoints);

// let palette = ["#F8FAFC", "#D9EAFD", "#BCCCDC", "#9AA6B2", "#F14A00"];
// let palette = ["#9CFA08", "#9CFA08", "#9CFA08", "#9CFA08", "#9CFA08"];

const palettes = {
  sunset: ["#ff9a8b", "#ff6a88", "#ff99ac", "#ffb6c1", "#ffcad4"],
  ocean: ["#264653", "#2a9d8f", "#e9c46a", "#f4a261", "#e76f51"],
  neon: ["#ff00ff", "#ff8800", "#ffcc00", "#00ffcc", "#8800ff"],
  pastel: ["#a8dadc", "#f1faee", "#457b9d", "#1d3557", "#e63946"],
  forest: ["#2b2d42", "#8d99ae", "#edf2f4", "#ef233c", "#d90429"],
  retro: ["#ffbe0b", "#fb5607", "#ff006e", "#8338ec", "#3a86ff"],
  chris: ["#F8FAFC", "#D9EAFD", "#BCCCDC", "#9AA6B2", "#F14A00"],
  greens: ["#9CFA08", "#7BC043", "#58B368", "#3B945E", "#2F4858"],
  vaporwave: ["#ff71ce", "#01cdfe", "#05ffa1", "#b967ff", "#fffb96"],
  dusk: ["#3c1642", "#086375", "#1dd3b0", "#affc41", "#b2ff9e"],
  earth: ["#a9714b", "#eac67a", "#c6a15b", "#5e503f", "#a7c4bc"],
  candy: ["#ffb6b9", "#fae3d9", "#bbded6", "#8ac6d1", "#d6d6d6"],
  fire: ["#ff6f3c", "#ff9a3c", "#ffc93c", "#ff9a3c", "#ff6f3c"],
  cold: ["#ced8f0", "#a6b1e1", "#b486ab", "#985277", "#5c374c"],
  night: ["#0d1b2a", "#1b263b", "#415a77", "#778da9", "#e0e1dd"],
  tropical: ["#ff7e5f", "#feb47b", "#ff6e7f", "#bfe9ff", "#00c6ff"],
  muted: ["#2e4057", "#66a182", "#c4a35a", "#d0c1a1", "#f7f3e3"],
  pop: ["#ff595e", "#ffca3a", "#8ac926", "#1982c4", "#6a4c93"],
  grayscale: ["#111", "#333", "#666", "#999", "#ccc"],
};

// Example usage in p5.js
let palettePrimary, paletteSecondary;
let panels = [];
let graphicsBuffers = new Array(noGraphicsBuffers);
let activeBackground;
let xOffset = 100;
let yOffset = 100;

function setup() {
  noLoop();

  noCurvePoints = floor(random(10, 40)); // Number of points in each curve
  noCurves = floor(random(10, 100));

  palettePrimary = getRandomPalette(palettes);
  paletteSecondary = getRandomPalette(palettes);

  activeBackground = palettePrimary[1];

  createCanvas(
    // sideLength * noBuffers + 100 * (noBuffers + 1),
    sideLength + 200,
    sideLength + 200
  );
  background(activeBackground);

  // grid anchor points
  for (let i = 0; i < noCurvePoints; i++) {
    topLine[i] = createVector(i * pointGap, 0);
    bottomLine[i] = createVector(i * pointGap, sideLength);
  }

  // create the buffers
  for (let i = 0; i < noGraphicsBuffers; i++) {
    graphicsBuffers[i] = createGraphics(sideLength, sideLength);
  }

  const bufferPicker = floor(random(0, noGraphicsBuffers));
  panels = generatePanels(graphicsBuffers[bufferPicker]);
  drawGrid(graphicsBuffers[0]);
}

function draw() {
  renderPanelsInBuffer(graphicsBuffers[0], panels);
  image(graphicsBuffers[0], xOffset, yOffset); // Draw image from its center
}

function drawGrid(localBuffer) {
  push();
  localBuffer.stroke(180);
  localBuffer.strokeWeight(1);

  const midHeight = localBuffer.height / 2;

  localBuffer.line(0, midHeight, localBuffer.width, midHeight);

  // Draw vertical "grid" lines
  const drawGridLines = true;
  if (drawGridLines) {
    for (let x = 0; x < noCurvePoints; x++) {
      localBuffer.line(
        topLine[x].x,
        topLine[x].y,
        bottomLine[x].x,
        bottomLine[x].y
      );
    }
  }
  pop();
}

function generatePanels(graphicsBuffer) {
  curves = generateCurveData(graphicsBuffer);

  // const drawables = [topLine, ...curves, bottomLine];
  const drawables = [...curves];

  // The body of this loop "looks ahead by 1"
  panels = [];
  for (let d = 0; d < drawables.length - 1; d++) {
    const upper = drawables[d];
    const lower = drawables[d + 1];
    const offset = 0; // random(-10, 10); // Random offset for the panels

    // Create the "Panels"
    for (let i = 0; i < noCurvePoints; i++) {
      if (i < noCurvePoints - 1) {
        const panel = {
          topLeftX: upper[i].x + offset,
          topLeftY: upper[i].y,
          topRightX: upper[i + 1].x + offset,
          topRightY: upper[i + 1].y,
          bottomLeftX: lower[i].x - offset,
          bottomLeftY: lower[i].y,
          bottomRightX: lower[i + 1].x - offset,
          bottomRightY: lower[i + 1].y,
        };

        panels.push(panel);
      }
    }
  }

  return panels;
}

function generateCurveData(graphicsBuffer) {
  const curves = new Array(noCurves);

  const startX = 0;
  const endX = sideLength;
  const totalCurvesRange = (noCurves - 1) * curveGap;

  let curveY = (graphicsBuffer.height - totalCurvesRange) / 2;

  // Generate the curves (vector arrays)
  for (let c = 0; c < noCurves; c++) {
    curves[c] = generateCurveVectors(
      graphicsBuffer,
      startX,
      curveY,
      endX,
      curveY
    );
    curveY += curveGap; // Move down for the next curve
  }

  return curves;
}

function generateCurveVectors(graphicsBuffer, startX, startY, endX, endY) {
  const curveVectors = new Array(noCurvePoints);

  const ctrl1X = sideLength / 2 + random(sideLength / 2);
  const ctrl1Y = random(sideLength / 2);

  const ctrl2X = sideLength / 2 + random(sideLength / 2);
  const ctrl2Y = random(sideLength / 2) + sideLength / 2;

  // const ctrl1X = sideLength / 2;
  // const ctrl1Y = sideLength / 2;

  // const ctrl2X = sideLength / 2;
  // const ctrl2Y = sideLength / 2;

  // DEBUG Draw the bezier curve
  if (false) {
    push();
    graphicsBuffer.stroke(0, 0, 0, 50);
    graphicsBuffer.strokeWeight(10); // Set stroke weight to 1
    graphicsBuffer.noFill();
    graphicsBuffer.bezier(
      startX,
      startY,
      ctrl1X,
      ctrl1Y,
      ctrl2X,
      ctrl2Y,
      endX,
      endY
    );
    pop();
  }

  for (let i = 0; i < noCurvePoints; i++) {
    let t = i / (noCurvePoints - 1);
    let px = bezierPoint(startX, ctrl1X, ctrl2X, endX, t);
    let py = bezierPoint(startY, ctrl1Y, ctrl2Y, endY, t);
    curveVectors[i] = createVector(px, py);
  }

  return curveVectors;
}

function renderPanelsInBuffer(localBuffer, panels) {
  const drawPanels = true;
  if (drawPanels) {
    const drawPanel = true;
    if (drawPanel) {
      push();
      localBuffer.stroke(0);
      // localBuffer.fill(panelFill);
      // localBuffer.strokeWeight(1);
      // localBuffer.noFill();
      for (let i = 0; i < panels.length; i++) {
        const p = panels[i];
        const palettePicker = floor(random(4)); // Returns 0, 1, 2, 3, or 4

        localBuffer.beginShape();

        let r, g, b, a;
        const cPrimary = palettePrimary[palettePicker];
        const cSecondary = palettePrimary[palettePicker];

        let binary = int(random(2)); // returns 0 or 1
        if (binary) {
          r = red(cPrimary);
          g = green(cPrimary);
          b = blue(cPrimary);
          // a = random(100, 255);
        } else {
          r = red(cSecondary);
          g = green(cSecondary);
          b = blue(cSecondary);
          // a = random(50, 200);
        }

        localBuffer.fill(r, g, b, a);

        let binary2 = int(random(2)); // returns 0 or 1

        if (binary2) {
          localBuffer.vertex(p.topLeftX, p.topLeftY);
          localBuffer.vertex(p.topRightX, p.topRightY);
          localBuffer.vertex(p.bottomRightX, p.bottomRightY);
          localBuffer.vertex(p.bottomLeftX, p.bottomLeftY);
        } else {
          localBuffer.vertex(p.bottomRightX, p.bottomRightY);
          localBuffer.vertex(p.topLeftX, p.topLeftY);
          localBuffer.vertex(p.bottomLeftX, p.bottomLeftY);
          localBuffer.vertex(p.topRightX, p.topRightY);
        }
        localBuffer.endShape(CLOSE);
      }
      pop();
    }
  }
}

function getRandomPalette(paletteObj) {
  let keys = Object.keys(paletteObj);
  let randomKey = random(keys); // p5.js random() works with arrays
  return paletteObj[randomKey];
}
