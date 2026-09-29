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

    let gap = 7;             
    let inc = 0.005; 

    for (let y = 50; y < height - 50; y += gap) {
        let currentAmp = map(y, 50, height - 50, 100, 2);
        drawLine(y, currentAmp, inc);
    }

    if (doExport) {
        endRecordSvg();
        doExport = false;
    }
}