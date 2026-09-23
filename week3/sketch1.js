function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER); 
  colorMode(HSB, 360, 100, 100);
}

function draw() {
  background(50, 30, 50);
  for (let x = 50; x < width; x += 95) {
    for (let y = 50; y < height; y += 95) {

        
        push();            
        translate(x, y);

        let angle = map(mouseY, 0, height, 0, PI); 
        rotate(angle);
        
        let s = map(y, 0, height, 1, 1.5);
        scale(s);

        let hueValue = map(mouseX, 0, width, 0, 360);
        fill(hueValue, 80, 90);
        stroke(100);
        
        rect(0, 0, 50, 50);
        line(-20, -20, 20, 20);
       
        pop();    
    }           
  }
}