let circleMoveX = 0; 
let trianglePortion = 1;    
let rectangleRotation = 0;   
let r = 255, g = 255, b = 255; 
let click = 0;

function setup() {
  createCanvas(windowWidth, windowHeight); 
  angleMode(DEGREES); 
}

function draw() {
  background(220, 10, 120); 

  push(); 
  translate(circleMoveX, 0); 
  fill(r, g, b); 
  ellipse(180, 180, 170); 
  pop(); 

  push();
  translate(366, 316); 
  scale(trianglePortion); 
  fill(r, g, b); 
  triangle(-16, -66, 84, 34, -66, 34); 
  pop();

  push();
  translate(145, 475); 
  fill(r, g, b); 
  rotate(rectangleRotation); 
  rectMode(CENTER); 
  rect(0, 0, 150, 150); 
  pop();
}

function mousePressed() {
  click++; 
  if (click == 1) {
    circleMoveX = 85; 
    trianglePortion = 0.5;     
    rectangleRotation = 45;    
    r = 0;               
    g = 255;
    b = 0;
  
  } else if (click == 2) {
    circleMoveX = -85; 
    trianglePortion = 1;     
    rectangleRotation = 90;    
    r = 255;               
    g = 0;
    b = 0;
  
  } else if (click == 3) {
    circleMoveX = 85; 
    trianglePortion = 2;     
    rectangleRotation = 0;    
    r = 255;               
    g = 165;
    b = 0;
 
  } else if (click == 4) {
    circleMoveX = 85; 
    trianglePortion = 2;     
    rectangleRotation = 45;    
    r = random(255);               
    g = random(255);
    b = random(255);

  } else if (click == 5) {
    click = 0;
    circleMoveX = -85; 
    trianglePortion = 0.5;     
    rectangleRotation = 0;    
    r = random(255);               
    g = random(255);
    b = random(255);
  }
}
