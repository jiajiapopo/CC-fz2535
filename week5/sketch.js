// 抽象时钟：粉嫩樱花树与时光小鸟
// 秒：每秒有一片绿叶变成粉色（一小时 3600 片，整点时整棵树变粉）
// 分：每分钟前 10 秒飞来一只小鸟，第二只鸟来再飞走
// 时：每小时 3600 秒，整棵树变粉色
let leaves = [];     // 存放 3600 片叶子属性的数组
let greens = [];     // 预存绿叶颜色的数组
let minuteStart = 0; // 这一分钟开始的时间（毫秒）
let lastM = -1;

function setup() {
  createCanvas(windowWidth, windowHeight);
  randomSeed(5);

  greens = [color(80, 130, 55), color(105, 150, 65), color(65, 110, 45)];

  // 在椭圆树冠内生成 3600 片叶子
  while (leaves.length < 3600) {
    let x = random(400), y = random(500);
    let d = sq((x - 200) / 200) + sq((y - 250) / 250);
    
    if (d < 1) {
      leaves.push({ 
        x: x, 
        y: y, 
        // 关键修改：让目标点均匀覆盖整个画布区域（包含正中央）
        targetX: random(-400, 800), 
        targetY: random(-400, 800),
        delay: random(0, 0.8), // 错开起飞时间
        size: random(4, 7), 
        green: floor(random(3)) 
      });
    }
  }
}
function draw() {
  //let s = second(), m = minute() % 2, h = hour();测试时间
  let h = hour(), m = minute(), s = second(); // 获取系统时间 [1-3] 
  // 监测分钟切换，记录当前分钟的起始时间点
  if (m !== lastM) {
    lastM = m;
    minuteStart = millis() - s * 1000; // millis() 记录运行毫秒数 [4]
  }

  // 设置小鸟颜色与纯白背景
  colorMode(HSB);
  let birdHue = (m * 137) % 360; 
  let bodyColor = color(birdHue, 65, 85); // 鲜艳身体
  let wingColor = color(birdHue, 80, 60); // 略深的翅膀
  colorMode(RGB);
  background(255);
  
  // 将整棵树与小鸟平移至屏幕中央
  push();
  translate(width / 2 - 200, height / 2 - 300);
  
  // 绘制树干
  noStroke();
  fill(150, 145, 130);
  rect(193, 420, 14, 180);
  
  //树叶绘制循环
  
  //let resetTime = (millis() / 1000) % 6; // 临时测试
  //let isHourReset = true;    // 强制开启测试
  let resetTime = s + ((millis() - minuteStart) % 1000) / 1000;
  let isHourReset = (m === 0 && resetTime < 4);             

  for (let i = 0; i < leaves.length; i++) {
    let L = leaves[i];
    let curX, curY, curColor;
    let curSize = L.size;

    if (isHourReset) {
      if (resetTime < 2) {
        // 0–2 秒：含有 delay 的爆散，树冠瞬间瓦解！[3]
        let k = constrain((resetTime - L.delay) / 1.2, 0, 1);
        curX = lerp(L.x, L.targetX, k);
        curY = lerp(L.y, L.targetY, k);
        curColor = color(240, 150, 180);
      } else if (resetTime < 4) {
        //原路聚回阶段 (2–4s)：起点终点对调，并用镜像延迟 (0.8 - delay) 倒放聚回！
        let tReturn = resetTime - 2;
        let k = constrain((tReturn - (0.8 - L.delay)) / 1.2, 0, 1);
        curX = lerp(L.targetX, L.x, k);
        curY = lerp(L.targetY, L.y, k);
        curColor = lerpColor(color(240, 150, 180), greens[L.green], k);
      } //else {
        // 3. 关键补丁 (4–6s)：聚回完毕！安稳停靠在树上，绝不消失！
        //curX = L.x;
        //curY = L.y;
        //curColor = greens[L.green];
      //}
    } else {
      // 平时阶段：按秒变粉
      let pinkCount = m * 60 + s;
      curX = L.x;
      curY = L.y;

      if (i < pinkCount) {
        curColor = color(240, 150, 180);
      } else if (i === pinkCount) {
        let k = constrain((millis() - minuteStart) / 1000 - s, 0, 1);
        curColor = lerpColor(greens[L.green], color(240, 150, 180), k);
        curSize = L.size * (1 + sin(k * PI));
      } else {
        curColor = greens[L.green];
      }
    }

    fill(curColor);
    circle(curX, curY, curSize);
  }

  // 小鸟交接动画：下一只鸟落树后，上一只鸟才飞走
  // ------------------------------------------------
  if (!isHourReset && m !== 0) {
    let t = (millis() - minuteStart) / 1000; // 这一分钟过去了几秒

    // 1. 计算上一分钟的小鸟（旧鸟）位置与颜色
    let prevM = (m - 1 + 60) % 60;
    let oldPerchLeaf = leaves[(prevM * 137) % 3600];
    colorMode(HSB);
    let oldHue = (prevM * 137) % 360;
    let oldBody = color(oldHue, 65, 85);
    let oldWing = color(oldHue, 80, 60);

    // 2. 计算当前分钟的小鸟（新鸟）位置与颜色
    let newPerchLeaf = leaves[(m * 137) % 3600];
    let newHue = (m * 137) % 360;
    let newBody = color(newHue, 65, 85);
    let newWing = color(newHue, 80, 60);
    colorMode(RGB); // 恢复 RGB 模式

    // A. 绘制旧鸟（0–3 秒陪伴在树上，3–6 秒飞离）
    if (t < 6 && m !== 1) {
      let oldX = oldPerchLeaf.x;
      let oldY = oldPerchLeaf.y;
      let oldFlying = false;

      if (t >= 3) { // 3–6 秒：向右上方飞走
        let k = sq((t - 3) / 3);
        oldX = lerp(oldPerchLeaf.x, width + 30, k);
        oldY = lerp(oldPerchLeaf.y, oldPerchLeaf.y - 150, k);
        oldFlying = true;
      }
      drawBird(oldX, oldY, oldFlying, oldBody, oldWing);
    }

    // B. 绘制新鸟（0–3 秒从左侧飞入，3 秒后一直栖息）
    let newX = newPerchLeaf.x;
    let newY = newPerchLeaf.y;
    let newFlying = false;

    if (t < 3) { // 0–3 秒：飞入树梢
      let k = 1 - sq(1 - t / 3);
      newX = lerp(-30, newPerchLeaf.x, k);
      newY = lerp(newPerchLeaf.y - 120, newPerchLeaf.y, k);
      newFlying = true;
    }

    drawBird(newX, newY, newFlying, newBody, newWing);
  }
  
  pop();
}

function drawBird(x, y, flying, bodyColor, wingColor) {
  push();
  translate(x, y);
  scale(1.6);
  noStroke();

  // 1. 身体
  fill(bodyColor);
  ellipse(0, 0, 22, 14);

  // 2. 栖息时的低头微动作
  let peckAngle = flying ? 0 : sin(frameCount * 0.01) * 0.12;
  rotate(peckAngle);

  // 3. 头部与鸟嘴
  fill(bodyColor);
  circle(10, -5, 11);
  fill(240, 170, 60);
  triangle(15, -6, 15, -3, 21, -4);

  // ------------------------------------------------
  // 4. 新增：眨眼逻辑（每 180 帧/约3秒 眨眼 10 帧）
  // ------------------------------------------------
  let isBlinking = (frameCount % 180) < 10;

  if (isBlinking) {
    stroke(40);
    strokeWeight(1);
    line(11, -7, 14, -7); // 眨眼：小横线
    noStroke();          // 记得画完恢复 noStroke()
  } else {
    fill(40);
    circle(12, -7, 2.5);  // 平时：睁开的小圆眼
  }

  // 5. 翅膀
  fill(wingColor);
  let flap = flying ? sin(frameCount * 0.6) * 0.9 : 0.2;
  rotate(-flap);
  triangle(-6, -2, 6, -2, -2, -16);

  pop();
}
// 自动响应窗口大小变动
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}