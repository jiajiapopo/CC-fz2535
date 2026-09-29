let seed = 1234;
let doExport = false;

function setup() {
    createCanvas(576, 384);
}

function keyPressed() {
    if (key == "r") {
        seed = floor(random(13001));
    }
    if (key == "s") {
        doExport = true;
    }
}

function drawLine(baseY, amp, inc) {
    beginShape();
    for (let x = 30; x <= width - 30; x += 4) {
        let n = noise(x * inc, baseY * inc);
        let y = baseY + map(n, 0, 1, -amp, amp);
        vertex(x, y);
    }
    endShape();
}

function draw() {
    if (doExport) {
        beginRecordSvg("myPlot"+seed+".svg"); 
    }

    noiseSeed(seed);
    randomSeed(seed);
    background(220);
    noFill();
 
    let inc = 0.005; 
    let y = 50;

    while (y < height - 50) {
    let currentGap = map(y, 50, height - 50, 3, 18);
    let currentAmp = map(y, 50, height - 50, 2, 70);
    drawLine(y, currentAmp, inc);
    y += currentGap;
    }

    if (doExport) {
        endRecordSvg();
        doExport = false;
    }
}