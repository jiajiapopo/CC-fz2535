let seed = 1234;
let doExport = false;

function setup() {
    createCanvas(576, 384); // 适配 Week 4 的 6"x4" 标准画布
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
    for (let x = 30; x <= width - 30; x += 2) {
        // 🌟 2D 噪声核心：同时传入 x 和 baseY 两个维度 [1, 3]
        let n = noise(x * inc, baseY * inc);
        let y = baseY + map(n, 0, 1, -amp, amp);
        vertex(x, y);
    }
    endShape();
}

function draw() {
    if (doExport) {
        beginRecordSvg("noise2D_" + seed + ".svg"); 
    }

    noiseSeed(seed);
    randomSeed(seed);
    background(255);
    noFill();
    stroke(0);

    let inc = 0.004; // 2D 噪声缩放因子（缩放越小，过渡越平滑）[1]
    let y = 50;

    while (y < height - 50) {
        let currentGap = map(y, 50, height - 50, 2, 8);
        let currentAmp = map(y, 50, height - 50, 2, 100);
        drawLine(y, currentAmp, inc);
        y += currentGap;
    }

    if (doExport) {
        endRecordSvg();
        doExport = false;
    }
}