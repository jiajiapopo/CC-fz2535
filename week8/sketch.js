let img; 
let disp; 
let xoff, yoff; 

async function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  disp = createGraphics(640, 480);
  // load my photo
  img = await loadImage("assets/me.jpg");

  if (img.width > disp.width) {
    img.resize(disp.width, 0);
  }
  if (img.height > disp.height) {
    img.resize(0, disp.height);
  }
  
  img.loadPixels();
  
  xoff = (disp.width - img.width) / 2;
  yoff = (disp.height - img.height) / 2;
  background(255);
}

function draw() {
  disp.background(255);
  const stepSize = floor(map(mouseX, 0, width, 4, 12));
  
  for (let y = 0; y < img.height; y += stepSize) {
    for (let x = 0; x < img.width; x += stepSize) {  
      const i = y * img.width + x;
      const [r, g, b] = [
        img.pixels[i * 4],
        img.pixels[i * 4 + 1],
        img.pixels[i * 4 + 2],
      ];

      disp.push();
      disp.translate(xoff + x + stepSize / 2, yoff + y + stepSize / 2);     
      let h = stepSize / 0.6; // happy accident: triangles bigger than the cell overlap like knitted stitches
      disp.fill(r, g, b);
      disp.noStroke();
      disp.triangle(-h, h, 0, -h, h, h);
      disp.pop();
    }
  }
  
  image(disp, 0, 0, width, height);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(255);
}

function keyPressed() {
  switch (key) {
    case "f":
      let fs = fullscreen();
      fullscreen(!fs);
      break;
  }
}