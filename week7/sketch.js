let pMapper;
let topQuad, leftQuad, rightQuad, bottomQuad, treeQuad;;
const SIZE = 400;
let showLabels = true; 
let snowflakes = [];
let frontFlakes = [];
let numFlakes = 60;

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    pMapper = createProjectionMapper(this);
    
    // create five quads
    topQuad = pMapper.createQuadMap(SIZE, SIZE);
    leftQuad = pMapper.createQuadMap(SIZE, SIZE);
    rightQuad = pMapper.createQuadMap(SIZE, SIZE);
    bottomQuad = pMapper.createQuadMap(SIZE, SIZE);
    treeQuad = pMapper.createQuadMap(300, 400);
    //snowflakes
    for (let i = 0; i < numFlakes; i++) {
        snowflakes.push({
            x: random(SIZE),
            y: random(-SIZE, SIZE),
            r: random(2, 6),
            size: random(2, 6),
            speed: random(1, 3)
        });
    }
    for (let i = 0; i < 20; i++) {
        frontFlakes.push({
            x: random(300),
            y: random(400),
            size: random(5, 10),      // bigger than on the wall
            speed: random(1.5, 3)     // faster
        });
    }
}


function draw() {
    background(0);
    topQuad.displaySketch(drawTop);
    leftQuad.displaySketch(drawLeft);
    rightQuad.displaySketch(drawRight);
    bottomQuad.displaySketch(drawBottom);
    treeQuad.displaySketch(drawTreeQuad);
}

function drawTop(g) {
    gradient(g, 0, 0, SIZE, SIZE, color(70, 62, 55), color(25, 22, 20));  
    labels(g, ["1", "3", "4", "2"]);
}


function drawLeft(g) {
    gradient(g, 0, 0, SIZE, 0, color(150, 120, 90), color(80, 62, 48));
    drawSnowflakes(g);
    labels(g, ["2", "4", "5", "6"]);
}

function drawRight(g) {
    gradient(g, 0, 0, SIZE, 0, color(80, 62, 48), color(150, 120, 90));
    drawSnowflakes(g);
    labels(g, ["4", "3", "7", "5"]);
}

function drawBottom(g) {
    gradient(g, 0, 0, SIZE, SIZE, color(140, 150, 165), color(245, 248, 255));
    labels(g, ["8", "7", "5", "6"]);
}
function drawTreeQuad(g) {
    g.clear();
    g.noStroke();
    // shadow
    g.fill(0, 0, 0, 80);
    g.ellipse(150, 378, 200, 25);
    // tree trunk
    g.fill(80, 50, 30);
    g.rect(140, 330, 20, 50);
    // leaves three layers
    g.fill(34, 139, 34);
    g.triangle(150, 180, 20, 340, 280, 340);
    g.triangle(150, 110, 45, 250, 255, 250);
    g.triangle(150, 40, 70, 160, 230, 160);
    // star
    g.fill(255, 215, 90);
    g.circle(150, 40, 18);
    // color lights
    let colors = [[255, 80, 80], [255, 210, 90], [120, 200, 255]];
    for (let i = 0; i < 15; i++) {
        let x = 150 + sin(i * 2.3) * (i * 7);       
        let y = 90 + i * 16;
        let c = colors[i % 3];
        let on = 0.5 + 0.5 * sin(frameCount * 0.1 + i);  
        g.fill(c[0], c[1], c[2], 100 + 155 * on);
        g.circle(x, y, 8);
    }
    drawFrontSnow(g); 
    // show red stroke
    if (showLabels) {
        g.noFill();
        g.stroke(255, 0, 0);
        g.strokeWeight(4);
        g.rect(2, 2, 296, 396);
    }
}

function drawSnowflakes(g) {
    g.noStroke();
    g.fill(255, 255, 255, 220); // the color of snowflakes clear white
    for (let flake of snowflakes) {
        g.circle(flake.x, flake.y, flake.size);
        // renew snowflakes location
        flake.y += flake.speed;
        flake.x += random(-0.5, 0.5); // move around
        // if snowflake goes off the bottom of the screen, goes back from top
        if (flake.y > SIZE) {
            flake.y = -SIZE;
            flake.x = random(SIZE);
        }
    }
}

function drawFrontSnow(g) {
    g.noStroke();
    for (let f of frontFlakes) {
        // move around
        f.y += f.speed;
        f.x += random(-0.5, 0.5);
        if (f.y > 400) {
            f.y = -10;
            f.x = random(300);
        }
        // Fade out near the edges to hide the quad's boundary
        let edge = min(f.x, 300 - f.x, f.y, 400 - f.y);
        let fade = constrain(edge / 40, 0, 1);

        g.fill(255, 255, 255, 220 * fade);
        g.circle(f.x, f.y, f.size);
    }
}


function labels(g, nums) {
    if (!showLabels) return;
    g.push();
    g.fill(255, 60, 60);
    g.noStroke();
    g.textSize(36);
    g.textAlign(LEFT, TOP);     g.text(nums[0], 10, 10);
    g.textAlign(RIGHT, TOP);    g.text(nums[1], SIZE - 10, 10);
    g.textAlign(RIGHT, BOTTOM); g.text(nums[2], SIZE - 10, SIZE - 10);
    g.textAlign(LEFT, BOTTOM);  g.text(nums[3], 10, SIZE - 10);
    g.pop();
}


function keyPressed() {
    switch (key) {
        case "c":
            pMapper.toggleCalibration();
            break;
        case "f":
            let fs = fullscreen();
            fullscreen(!fs);
            break;
        case "l":
            pMapper.load("maps/map.json");
            break;
        case "s":
            pMapper.save("map.json");
            break;
        case "d":
            showLabels = !showLabels;
            break;
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function gradient(g, x0, y0, x1, y1, c0, c1) {
    const ctx = g.drawingContext;
    const grd = ctx.createLinearGradient(x0, y0, x1, y1);
    grd.addColorStop(0, c0.toString());
    grd.addColorStop(1, c1.toString());
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, SIZE, SIZE);
}
