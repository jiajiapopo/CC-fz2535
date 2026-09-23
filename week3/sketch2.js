function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER); 
  colorMode(HSB, 360, 100, 100);
}

function draw() {
  background(50, 30, 50);
  noFill();
  for (let x = 50; x <= width; x = x + 100) {
    for (let i = 0; i < 50; i++) {
        
        push();            

        let hueValue = map(mouseX, 0, width, 0, 360);
        stroke(hueValue, 80, 90);
            
        ellipse(x, height/2, i*20);
        
        pop();    
                
    }
  }
}