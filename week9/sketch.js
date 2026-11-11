let video;
let faceMesh;
let faces = [];
let handPose;
let hands = [];

let birdX = 700;
let birdY = 80;
let birdDir = 1;
let minConfidence = 0.8;

let bodyColor;
let wingColor;

async function setup() {
  createCanvas(800, 600);

  video = createCapture(VIDEO, { flipped: true });
  video.size(800, 600);
  video.hide();

  handPose = await ml5.handPose({ flipped: true });
  handPose.detectStart(video, gotHands);
  faceMesh = await ml5.faceMesh({
    maxFaces: 1,
    refineLandmarks: false,
    flipped: true,
  });
  faceMesh.detectStart(video, gotFaces);

  colorMode(HSB);
  bodyColor = color(330, 65, 85);
  wingColor = color(330, 80, 60);
  colorMode(RGB);
}

function draw() {
  image(video, 0, 0, width, height);

  let targetX;
  let targetY;

  if (hands.length > 0) {
    targetX = hands[0].index_finger_tip.x;
    targetY = hands[0].index_finger_tip.y - 20;
  } else if (faces.length > 0) {
    let box = faces[0].box;
    targetX = box.xMin + box.width / 2;
    targetY = box.yMin - box.height * 0.35;
  } else {
    let t = frameCount * 0.005;
    targetX = noise(0, t) * width;
    targetY = noise(100, t) * height;
  }

  if (targetX < birdX - 2) {
    birdDir = -1;
  } else if (targetX > birdX + 2) {
    birdDir = 1;
  }

  birdX = lerp(birdX, targetX, 0.015);
  birdY = lerp(birdY, targetY, 0.015);

  let flying =
    (hands.length === 0 && faces.length === 0) ||
    dist(birdX, birdY, targetX, targetY) > 10;

  push();
  translate(birdX, birdY);
  scale(birdDir, 1);
  drawBird(0, 0, flying, bodyColor, wingColor);
  pop();
}

function gotHands(results) {
  hands = [];
  for (let i = 0; i < results.length; i++) {
    if (results[i].confidence > minConfidence) {
      hands.push(results[i]);
    }
  }
}
function gotFaces(results) {
  faces = results;
}

function drawBird(x, y, flying, bodyColor, wingColor) {
  push();
  translate(x, y);
  scale(1.6);
  noStroke();

  fill(bodyColor);
  ellipse(0, 0, 22, 14);

  let peckAngle = flying ? 0 : sin(frameCount * 0.01) * 0.12;
  rotate(peckAngle);

  fill(bodyColor);
  circle(10, -5, 11);
  fill(240, 170, 60);
  triangle(15, -6, 15, -3, 21, -4);

  let isBlinking = frameCount % 180 < 10;
  if (isBlinking) {
    stroke(40);
    strokeWeight(1);
    line(11, -7, 14, -7);
    noStroke();
  } else {
    fill(40);
    circle(12, -7, 2.5);
  }

  fill(wingColor);
  let flap = flying ? sin(frameCount * 0.6) * 0.9 : 0.2;
  rotate(-flap);
  triangle(-6, -2, 6, -2, -2, -16);

  pop();
}
