let url =
  "https://api.open-meteo.com/v1/forecast" +
  "?latitude=40.71&longitude=-74.01" +
  "&current=temperature_2m" +
  "&hourly=temperature_2m" +
  "&past_days=7&forecast_days=1" +
  "&timezone=America%2FNew_York";

let days = []; // { date, temps } for each day
let dayIndex = 0; // day on screen
let nowTemp;
let loaded = false;
let lastSignature = ""; // last day + hour count painted

// set for the current day
let lowTemp, highTemp, baseHue, hueRange;

// filled in by the program
let clouds = [];
let stars = [];
let startFrame = 0;

// settings
let framesPerHour = 16; // delay between hours
let spreadSpeed = 0.03; // how fast a cloud spreads
let cloudsPerHour = 9;
let layersPerCloud = 3; // more = softer edge
let pointsPerLayer = 44;
let starsPerHour = 60;
let glowRadius = 150; // mouse lights stars within this distance

async function setup() {
  createCanvas(800, 800);
  colorMode(HSB, 360, 100, 100, 100);
  noStroke();
  loadData();
}

async function loadData() {
  let weather = await loadJSON(url);
  console.log(weather);

  nowTemp = weather.current.temperature_2m;

  // group the hours by day
  let newDays = [];
  let nowTime = weather.current.time; // "2026-11-24T20:30"
  for (let i = 0; i < weather.hourly.time.length; i++) {
    let time = weather.hourly.time[i];
    let date = time.slice(0, 10); // "2026-11-24"
    let t = weather.hourly.temperature_2m[i];
    if (t == null) continue;
    if (time > nowTime) continue; // skip future hours
    let last = newDays[newDays.length - 1];
    if (!last || last.date != date) {
      last = { date: date, temps: [] };
      newDays.push(last);
    }
    last.temps.push(t);
  }

  let wasOnToday = !loaded || dayIndex == days.length - 1;
  days = newDays;
  if (wasOnToday) dayIndex = days.length - 1; // show today
  loaded = true;

  // repaint only when a new hour or day arrives
  let day = days[dayIndex];
  let signature = day.date + " " + day.temps.length;
  if (signature != lastSignature) {
    lastSignature = signature;
    buildPainting(day);
  }
}

function keyPressed() {
  if (!loaded) return;
  if (key == "ArrowLeft" && dayIndex > 0) dayIndex--;
  if (key == "ArrowRight" && dayIndex < days.length - 1) dayIndex++;
  if (key == "ArrowLeft" || key == "ArrowRight" || key == " ") {
    lastSignature = days[dayIndex].date + " " + days[dayIndex].temps.length;
    buildPainting(days[dayIndex]);
  }
}

function mousePressed() {
  if (loaded) buildPainting(days[dayIndex]);
}

function buildPainting(day) {
  // the date is the seed: same day, same shapes
  let seed = Number(
    day.date.slice(0, 4) + day.date.slice(5, 7) + day.date.slice(8, 10),
  );
  randomSeed(seed);
  noiseSeed(seed);

  lowTemp = min(day.temps);
  highTemp = max(day.temps);
  let total = 0;
  for (let i = 0; i < day.temps.length; i++) total += day.temps[i];
  let mean = total / day.temps.length;

  baseHue = tempHue(mean); // main color
  hueRange = constrain(map(highTemp - lowTemp, 0, 14, 40, 140), 40, 140); // bigger swing = more colors

  clouds = [];
  stars = [];
  for (let hour = 0; hour < day.temps.length; hour++) {
    let t = day.temps[hour];

    let x = map(hour, 0, 23, 40, width - 40);
    let y = map(t, lowTemp, highTemp + 0.001, height - 150, 130);
    let sizeScale = map(t, lowTemp, highTemp + 0.001, 0.75, 1.4); // warmer = bigger

    // small clouds scattered around (x, y)
    for (let j = 0; j < cloudsPerHour; j++) {
      let a = random(TWO_PI);
      let d = random(0, 1) * random(0, 1) * 330 * sizeScale; // mostly near the center
      let size = random(55, 135) * sizeScale;
      clouds.push(makeCloud(day, hour, x + cos(a) * d, y + sin(a) * d, size));
    }

    // sparkles
    for (let j = 0; j < starsPerHour; j++) {
      let a = random(TWO_PI);
      let d = random(0, 1) * random(0, 1) * 420 * sizeScale;
      let size = random(0.8, 2.4);
      if (random() < 0.07) size = random(3, 4.5); // a few big ones
      stars.push({
        hour: hour,
        x: x + cos(a) * d,
        y: y + sin(a) * d,
        size: size,
        grow: 0,
        glow: 0, // 1 = lit by the mouse
        phase: random(TWO_PI),
        speed: random(0.03, 0.12),
      });
    }
  }

  startFrame = frameCount;
}

// cloud's shape
function makeCloud(day, hour, x, y, size) {
  let n = random(1000); // noise
  let shapes = []; // one outline per layer
  for (let layer = 0; layer < layersPerCloud; layer++) {
    let ring = [];
    let scale = map(layer, 0, layersPerCloud - 1, 0.82, 1.0);
    for (let i = 0; i < pointsPerLayer; i++) {
      let a = map(i, 0, pointsPerLayer, 0, TWO_PI);
      // noise around a circle, so the outline closes
      let big = noise(n + cos(a) * 0.9, sin(a) * 0.9, layer * 0.15); // overall shape
      let small = noise(n + 50 + cos(a) * 4.5, sin(a) * 4.5, layer * 0.15); // small bumps
      ring.push(scale * (0.6 + big * 0.55 + small * 0.4));
    }
    shapes.push(ring);
  }
  return {
    hour: hour,
    x: x,
    y: y,
    size: size,
    shapes: shapes,
    grow: 0, // 0 = just landed, 1 = fully spread
    col: hourColor(day, hour, random(-3, 3), random(7, 13)),
  };
}

// color of one hour
function hourColor(day, hour, lighten, alpha) {
  // cooler hours lean blue, warmer hours lean pink
  let h =
    baseHue +
    map(
      day.temps[hour],
      lowTemp,
      highTemp + 0.001,
      -hueRange / 2,
      hueRange / 2,
    );
  h = (h + 360) % 360;
  let s = 42;
  let b = 97 + lighten;
  return color(h, s, constrain(b, 0, 100), alpha);
}

// temperature → hue
let colorStops = [
  { temp: -10, hue: 200 }, // cyan-blue
  { temp: 5, hue: 225 }, // blue
  { temp: 12, hue: 265 }, // violet
  { temp: 20, hue: 320 }, // pink
  { temp: 32, hue: 385 }, // orange
];

function tempHue(t) {
  t = constrain(t, colorStops[0].temp, colorStops[colorStops.length - 1].temp);
  // blend between the two nearest stops
  for (let i = 0; i < colorStops.length - 1; i++) {
    if (t <= colorStops[i + 1].temp) {
      let h = map(
        t,
        colorStops[i].temp,
        colorStops[i + 1].temp,
        colorStops[i].hue,
        colorStops[i + 1].hue,
      );
      return h;
    }
  }
  return colorStops[colorStops.length - 1].hue;
}

function draw() {
  background(40, 3, 99);

  if (!loaded) {
    fill(0, 0, 30);
    textSize(18);
    text("loading…", 30, 40);
    return;
  }

  // reload every 15 minutes
  if (frameCount % 54000 == 0) loadData();

  let day = days[dayIndex];
  let t = frameCount - startFrame;
  let paintingHour = -1; // hour spreading right now

  for (let i = 0; i < clouds.length; i++) {
    let cloud = clouds[i];
    if (t < cloud.hour * framesPerHour) continue; // not its turn yet

    // ease toward fully spread
    cloud.grow = lerp(cloud.grow, 1, spreadSpeed);
    if (cloud.grow < 0.97) paintingHour = cloud.hour;
    drawCloud(cloud);
  }

  // sparkles
  let moved = dist(mouseX, mouseY, pmouseX, pmouseY); // mouse speed
  for (let i = 0; i < stars.length; i++) {
    let star = stars[i];
    if (t < star.hour * framesPerHour + 20) continue;
    star.grow = lerp(star.grow, 1, spreadSpeed * 2);

    // a moving mouse lights nearby stars
    let away = dist(mouseX, mouseY, star.x, star.y);
    if (moved > 1 && away < glowRadius) {
      star.glow = max(star.glow, map(away, 0, glowRadius, 1, 0));
    }
    star.glow *= 0.965; // fade out

    let twinkle = map(sin(frameCount * star.speed + star.phase), -1, 1, 0, 1);
    let bright = constrain(twinkle * 0.55 + star.glow, 0, 1);
    let size = star.size * star.grow * (1 + star.glow);

    // halo, then the dot
    fill(0, 0, 100, 9 * bright);
    circle(star.x, star.y, size * 3.2);
    fill(0, 0, 100, 100 * bright);
    circle(star.x, star.y, size);

    // cross glint on big stars
    if (star.size > 3 && bright > 0.5) {
      let ray = size * 2.2 * bright;
      stroke(0, 0, 100, 80 * bright);
      strokeWeight(0.8);
      line(star.x - ray, star.y, star.x + ray, star.y);
      line(star.x, star.y - ray, star.x, star.y + ray);
      noStroke();
    }
  }

  // caption
  fill(0, 0, 35);
  textSize(13);
  let label =
    "New York   " + day.date + "   " + lowTemp + "° – " + highTemp + "°C";
  if (paintingHour >= 0) {
    label +=
      "   " + nf(paintingHour, 2) + ":00  " + day.temps[paintingHour] + "°C";
  } else if (dayIndex == days.length - 1) {
    label += "   now " + nf(day.temps.length - 1, 2) + ":00  " + nowTemp + "°C";
  }
  text(label, 20, height - 17);
  textAlign(RIGHT);
  text("← →", width - 20, height - 17);
  textAlign(LEFT);
}

// stacked translucent shapes
function drawCloud(cloud) {
  fill(cloud.col);
  let r = cloud.size * cloud.grow;
  for (let layer = 0; layer < layersPerCloud; layer++) {
    let ring = cloud.shapes[layer];
    beginShape();
    for (let i = 0; i < pointsPerLayer; i++) {
      let a = map(i, 0, pointsPerLayer, 0, TWO_PI);
      vertex(cloud.x + cos(a) * r * ring[i], cloud.y + sin(a) * r * ring[i]);
    }
    endShape(CLOSE);
  }
}
