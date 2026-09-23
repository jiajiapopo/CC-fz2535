function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER); 
  colorMode(HSB, 360, 100, 100);
  noLoop();
}

function draw() {
  background(0);
  
  for (let x = 50; x < width; x += 95) {
    for (let y = 50; y < height; y += 95) {
        
        push();            
        translate(x, y);
 
        rotate(random(-0.2, 0.2));
        
        scale(random(-0.15, 0.15));

        
        fill(random(360), 80, 90);
        stroke(100);
        strokeWeight(1.5);
        
        rect(0, 0, 50, 50);
        line(-20, -20, 20, 20);
       
        pop();    
    }           
  }
}

function mousePressed() {
  redraw();
}