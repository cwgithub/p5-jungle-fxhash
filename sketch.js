let noBuffers = 1;

const sideLength = 1000;
let curves = new Array(getNoCurves());
let curveGap = sideLength / (getNoCurves() + 1);

let pointGap = sideLength / (getNoPoints() - 1);
let topLine = new Array(getNoPoints());
let bottomLine = new Array(getNoPoints());

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
  greens: ["#9CFA08", "#9CFA08", "#9CFA08", "#9CFA08", "#9CFA08"],
};

// Example usage in p5.js
let palette = palettes.greens;

let panels = [];
let buffers = new Array(noBuffers);
let lastUpdateTime = 0;
let updateInterval = 5000; // 5 seconds

let activeBackground = palette[1];
let xOffset = 100;
let yOffset = 100;

function getNoPoints() {
  return 50;
}
function getNoCurves() {
  return 50;
}

function setup() {
  // noLoop();

  createCanvas(
    sideLength * noBuffers + 100 * (noBuffers + 1),
    sideLength + 200
  );
  background(activeBackground);

  // grid anchor points
  for (let i = 0; i < getNoPoints(); i++) {
    topLine[i] = createVector(i * pointGap, 0);
    bottomLine[i] = createVector(i * pointGap, sideLength);
  }

  // create the buffers
  for (let i = 0; i < noBuffers; i++) {
    buffers[i] = createGraphics(sideLength, sideLength);
  }
  const bufferPicker = floor(random(0, noBuffers));
  panels = generatePanels(buffers[bufferPicker]);
  drawGrid(buffers[0]);
}

function draw() {
  if (deltasApplied < 450) {
    mutatePanels(panels);
  } else {
    deltasApplied = 0;
    deltaPicker = floor(random(4))
    panels = generatePanels(buffers[0]);
  }

  renderPanelsInBuffer(buffers[0], panels);

  image(buffers[0], xOffset, yOffset); // Draw image from its center
}

function drawGrid(localBuffer) {
  push();
  localBuffer.stroke(0);
  localBuffer.strokeWeight(1);
  // Draw vertical "grid" lines
  const drawGridLines = false;
  if (drawGridLines) {
    for (let i = 0; i < getNoPoints(); i++) {
      localBuffer.line(
        topLine[i].x,
        topLine[i].y,
        bottomLine[i].x,
        bottomLine[i].y
      );
    }
  }
  pop();
}

function generatePanels() {
  const startX = 0;
  const endX = sideLength;

  curves = generateCurveData(startX, endX);

  // const drawables = [topLine, ...curves, bottomLine];
  // const drawables = [topLine, ...curves, bottomLine];
  const drawables = [ ...curves];

  // The body of this loop "looks ahead by 1"
  panels = [];
  for (let d = 0; d < drawables.length - 1; d++) {
    const upper = drawables[d];
    const lower = drawables[d + 1];

    // Create the "Panels"
    for (let i = 0; i < getNoPoints(); i++) {
      if (i < getNoPoints() - 1) {


        const panel = {
          topLeftX: upper[i].x,
          topLeftY: upper[i].y,
          topRightX: upper[i + 1].x,
          topRightY: upper[i + 1].y,
          bottomLeftX: lower[i].x,
          bottomLeftY: lower[i].y,
          bottomRightX: lower[i + 1].x,
          bottomRightY: lower[i + 1].y,
        };

        panels.push(panel);
      }
    }
  }

  return panels;
}

function generateCurveData(startX, endX) {
  const curves = new Array(getNoCurves());

  // Generate the curves (vector arrays)
  for (let c = 0; c < getNoCurves(); c++) {
    curves[c] = generateCurveVectors(
      startX,
      curveGap + curveGap * c,
      endX,
      curveGap + curveGap * c
    );
  }

  return curves;
}

function generateCurveVectors(startX, startY, endX, endY) {
  const curveVectors = new Array(getNoPoints());

  const ctrl1X = sideLength / 2 + random(sideLength / 2);
  const ctrl1Y = random(sideLength / 2);
  const ctrl2X = sideLength / 2 + random(sideLength / 2);
  const ctrl2Y = random(sideLength / 2) + sideLength / 2;

  // DBEUG Draw the bezier curve
  // localBuffer.bezier(
  //   startX,
  //   startY,
  //   ctrl1X,
  //   ctrl1Y,
  //   ctrl2X,
  //   ctrl2Y,
  //   endX,
  //   endY
  // );

  for (let i = 0; i < getNoPoints(); i++) {
    let t = i / (getNoPoints() - 1);
    let px = bezierPoint(startX, ctrl1X, ctrl2X, endX, t);
    let py = bezierPoint(startY, ctrl1Y, ctrl2Y, endY, t);
    curveVectors[i] = createVector(px, py);
  }

  return curveVectors;
}

function renderPanelsInBuffer(localBuffer, panels) {
  const drawPanels = true;
  if (drawPanels) {
    const palettePicker = floor(random(4)); // Returns 0, 1, 2, 3, or 4
    const drawPanel = true;
    if (drawPanel) {
      push();
      localBuffer.stroke(0);
      localBuffer.fill(panelFill);
      localBuffer.strokeWeight(1);
      // localBuffer.noFill();
      for (let i = 0; i < panels.length; i++) {
        const p = panels[i];

        // localBuffer.fill(palette[palettePicker]);
        localBuffer.beginShape();

        localBuffer.vertex(p.topLeftX, p.topLeftY);
        localBuffer.vertex(p.bottomRightX, p.bottomRightY);
        localBuffer.vertex(p.topRightX, p.topRightY);
        localBuffer.vertex(p.bottomLeftX, p.bottomLeftY);
        localBuffer.endShape(CLOSE);
      }
      pop();
    }
  }
}

let deltasApplied = 0;
let deltaPicker = 0;
let panelFill = palette[2]

function mutatePanels(panels) {
  const xDelta = floor(random(2));

  deltasApplied++;

  for (let i = 0; i < panels.length; i++) {
    const p = panels[i];



    switch (deltaPicker) {
      case 0:
        p.topLeftY += random(2) / 10;
        p.topLeftX += random(2) / 10;
        break;

      case 1:
        p.topLeftY -= random(2) / 10;
        p.topLeftX += random(2) / 10;
        break;

      case 2:
        p.topLeftY -= random(2) / 10;
        p.topLeftX -= random(2) / 10;
        break;

      case 3:
        p.topLeftY -= random(2) / 10;
        p.topLeftX -= random(2) / 10;
        break;
    }
  }
}
