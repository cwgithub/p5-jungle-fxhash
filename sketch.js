let noGraphicsBuffers = 1;

function getNoPoints() {
  return 10;
}
function getNoCurves() {
  return 15;
}

const sideLength = 1000; // Size of each buffer
let curves = new Array(getNoCurves());
let curveGap = 100; // sideLength / (getNoCurves() + 1);

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
let palette = palettes.forest;
let panels = [];
let graphicsBuffers = new Array(noGraphicsBuffers);
let activeBackground = palette[1];
let xOffset = 100;
let yOffset = 100;

function setup() {
  noLoop();

  createCanvas(
    // sideLength * noBuffers + 100 * (noBuffers + 1),
    sideLength + 200,
    sideLength + 200
  );
  background(activeBackground);

  // grid anchor points
  for (let i = 0; i < getNoPoints(); i++) {
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
    for (let x = 0; x < getNoPoints(); x++) {
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
  // const drawables = [topLine, ...curves, bottomLine];
  const drawables = [...curves];

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

function generateCurveData(graphicsBuffer) {
  const curves = new Array(getNoCurves());

  const startX = 0;
  const endX = sideLength;
  const totalCurvesRange = (getNoCurves() - 1) * curveGap;

  let curveY = (graphicsBuffer.height - totalCurvesRange) / 2;

  // Generate the curves (vector arrays)
  for (let c = 0; c < getNoCurves(); c++) {
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
  const curveVectors = new Array(getNoPoints());

  const flatCurves = true

  // const ctrl1X = sideLength / 2 + random(sideLength / 2);
  // const ctrl1Y = random(sideLength / 2);

  // const ctrl2X = sideLength / 2 + random(sideLength / 2);
  // const ctrl2Y = random(sideLength / 2) + sideLength / 2;

  const ctrl1X = sideLength / 2 ;
  const ctrl1Y = sideLength / 2;

  const ctrl2X = sideLength / 2 ;
  const ctrl2Y = sideLength / 2;



  // DEBUG Draw the bezier curve

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
      // localBuffer.fill(panelFill);
      // localBuffer.fill(palette[palettePicker]);
      localBuffer.strokeWeight(1);
      // localBuffer.noFill();
      for (let i = 0; i < panels.length; i++) {
        const p = panels[i];

        localBuffer.beginShape();
        localBuffer.vertex(p.topLeftX, p.topLeftY);
        localBuffer.vertex(p.topRightX, p.topRightY);
        localBuffer.vertex(p.bottomRightX, p.bottomRightY);
        localBuffer.vertex(p.bottomLeftX, p.bottomLeftY);
        localBuffer.endShape(CLOSE);
      }
      pop();
    }
  }
}
