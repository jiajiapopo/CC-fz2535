let video;
let handPose;
let hands = [];
let minConfidence = 0.8;

let videoScale = 1;
let videoX = 0;
let videoY = 0;

let chordHand;
let melodyHand;

let fft;
let playing = false;

let ripples = [];

let majorScale = [0, 2, 4, 5, 7, 9, 11];
let minorScale = [0, 2, 3, 5, 7, 8, 10];
let majorNames = ["C", "D", "E", "F", "G", "A", "B"];
let minorNames = ["C", "D", "Eb", "F", "G", "Ab", "Bb"];

class ChordHand {
  constructor() {
    this.oscs = [];

    this.level = new p5.Amplitude();
    for (let i = 0; i < 4; i++) {
      let osc = new p5.Oscillator();
      osc.setType("triangle");
      osc.connect(this.level);
      this.oscs.push(osc);
    }

    this.palmX = 0;
    this.palmY = 0;

    this.lowest = 48;
    this.degree = 0;
    this.isMajor = true;
    this.tones = [];
    this.name = "";

    this.bpm = 110;
    this.volume = 0.12;
    this.beat = 0;
    this.lastBeatTime = 0;
    this.active = false;

    this.candidate = 0;
    this.candidateFrames = 0;
    this.holdFrames = 4;

    this.tiltAmount = 0.25;

    this.buildNotes();
  }

  read(hand) {
    this.palmX = hand.middle_finger_mcp.x;
    this.palmY = hand.middle_finger_mcp.y;

    let thumb = thumbIsOut(hand);
    let index = fingerIsOut(hand, "index_finger");
    let middle = fingerIsOut(hand, "middle_finger");
    let ring = fingerIsOut(hand, "ring_finger");
    let pinky = fingerIsOut(hand, "pinky_finger");

    let found = -1;
    if (thumb && pinky && !middle && !ring) {
      if (index) {
        found = 6;
      } else {
        found = 5;
      }
    } else {
      let count = 0;
      if (thumb) count++;
      if (index) count++;
      if (middle) count++;
      if (ring) count++;
      if (pinky) count++;
      if (count > 0) {
        found = count - 1;
      }
    }

    if (found == this.candidate) {
      this.candidateFrames++;
    } else {
      this.candidate = found;
      this.candidateFrames = 0;
    }
    if (
      found >= 0 &&
      this.candidateFrames == this.holdFrames &&
      found != this.degree
    ) {
      this.degree = found;
      this.buildNotes();
      this.strike();
    }

    let tilt = atan2(
      hand.middle_finger_mcp.x - hand.wrist.x,
      hand.wrist.y - hand.middle_finger_mcp.y,
    );
    if (tilt > this.tiltAmount && this.isMajor) {
      this.isMajor = false;
      this.buildNotes();
      this.strike();
    } else if (tilt < this.tiltAmount / 2 && !this.isMajor) {
      this.isMajor = true;
      this.buildNotes();
      this.strike();
    }

    noStroke();
    fill(120, 220, 255);
    if (thumb) circle(hand.thumb_tip.x, hand.thumb_tip.y, 16);
    if (index) circle(hand.index_finger_tip.x, hand.index_finger_tip.y, 16);
    if (middle) circle(hand.middle_finger_tip.x, hand.middle_finger_tip.y, 16);
    if (ring) circle(hand.ring_finger_tip.x, hand.ring_finger_tip.y, 16);
    if (pinky) circle(hand.pinky_finger_tip.x, hand.pinky_finger_tip.y, 16);
  }

  buildNotes() {
    let scale = majorScale;
    let names = majorNames;
    if (!this.isMajor) {
      scale = minorScale;
      names = minorNames;
    }

    let fromRoot = [];
    for (let i = 0; i < 7; i++) {
      let step = this.degree + i;
      let octave = floor(step / 7);
      fromRoot.push(scale[step % 7] + 12 * octave);
    }

    let root = fromRoot[0];
    let third = fromRoot[2];
    let fifth = fromRoot[4];
    let seventh = fromRoot[6];
    this.tones = [root, third, fifth, seventh];

    let kind = "";
    if (third - root == 4 && seventh - root == 11) {
      kind = "maj7";
    } else if (third - root == 4 && seventh - root == 10) {
      kind = "7";
    } else if (third - root == 3 && fifth - root == 7) {
      kind = "m7";
    } else if (third - root == 3 && fifth - root == 6) {
      kind = "m7b5";
    }
    this.name = names[this.degree] + kind;
  }

  strike() {
    this.beat = 0;
    this.lastBeatTime = millis();
    ripples.push(
      new Ripple(
        this.palmX,
        this.palmY,
        noteHue(this.lowest + this.tones[0]),
        40,
        5,
      ),
    );
  }

  play(active) {
    this.active = active;
    let beatLength = 60000 / this.bpm;

    if (millis() - this.lastBeatTime > beatLength) {
      this.beat = (this.beat + 1) % 4;
      this.lastBeatTime = millis();

      if (active) {
        ripples.push(
          new Ripple(
            this.palmX,
            this.palmY,
            noteHue(this.lowest + this.tones[0]),
            40,
            5,
          ),
        );
      }
    }

    let age = (millis() - this.lastBeatTime) / beatLength;
    let amp = 0;
    if (active) {
      amp = map(age, 0, 1, this.volume, this.volume * 0.1, true);
    }

    for (let i = 0; i < this.oscs.length; i++) {
      this.oscs[i].freq(midiToHz(this.lowest + this.tones[i]));
      this.oscs[i].amp(amp);
    }
  }

  render() {
    if (this.active) {
      let size = map(this.level.getLevel(), 0, 0.2, 40, 220, true);
      colorMode(HSB, 360, 100, 100, 100);
      noStroke();
      fill(noteHue(this.lowest + this.tones[0]), 70, 100, 35);
      circle(this.palmX, this.palmY, size);
      colorMode(RGB, 255);
    }

    let keyName = "C major";
    if (!this.isMajor) {
      keyName = "C minor";
    }
    noStroke();
    fill(255);
    textAlign(LEFT, TOP);
    textSize(48);
    text(this.name, 20, 20);
    textSize(20);
    text(keyName, 20, 75);

    for (let i = 0; i < 4; i++) {
      stroke(255, 150);
      strokeWeight(1);
      if (this.active && i == this.beat) {
        fill(255);
      } else {
        noFill();
      }
      circle(30 + i * 24, 120, 14);
    }
  }
}

class MelodyHand {
  constructor() {
    this.osc = new p5.Oscillator();
    this.osc.setType("sine");

    this.level = new p5.Amplitude();
    this.osc.connect(this.level);

    this.note = 60;
    this.lastNote = -1;

    this.lowest = 48;
    this.volume = 0.25;
    this.currentAmp = 0;
    this.pluck = 0;

    this.fingers = [
      "index_finger",
      "middle_finger",
      "ring_finger",
      "pinky_finger",
    ];
    this.noteIndex = -1;

    this.touchAt = 0.3;
    this.letGoAt = 0.42;

    this.octaveZone = 1;
    this.octaveNames = ["low", "middle", "high"];
    this.zoneMargin = 25;

    this.hand = null;
  }

  play(hand, tones) {
    this.hand = hand;

    let thumbX = hand.thumb_tip.x;
    let thumbY = hand.thumb_tip.y;
    let palmX = hand.middle_finger_mcp.x;
    let palmY = hand.middle_finger_mcp.y;

    let handSize = dist(hand.wrist.x, hand.wrist.y, palmX, palmY);

    let gaps = [];
    for (let i = 0; i < this.fingers.length; i++) {
      let tip = hand[this.fingers[i] + "_tip"];
      gaps.push(dist(thumbX, thumbY, tip.x, tip.y) / handSize);
    }

    let closest = 0;
    for (let i = 0; i < gaps.length; i++) {
      if (gaps[i] < gaps[closest]) {
        closest = i;
      }
    }

    if (this.noteIndex == -1) {
      if (gaps[closest] < this.touchAt) {
        this.noteIndex = closest;
      }
    } else if (gaps[this.noteIndex] > this.letGoAt) {
      this.noteIndex = -1;
    } else if (
      gaps[closest] < this.touchAt &&
      gaps[closest] < gaps[this.noteIndex] - 0.1
    ) {
      this.noteIndex = closest;
    }

    let zoneH = height / 3;
    let fromBottom = height - palmY;
    let newZone = constrain(floor(fromBottom / zoneH), 0, 2);
    let insideZone = fromBottom - newZone * zoneH;

    if (newZone > this.octaveZone && insideZone > this.zoneMargin) {
      this.octaveZone = newZone;
    } else if (
      newZone < this.octaveZone &&
      insideZone < zoneH - this.zoneMargin
    ) {
      this.octaveZone = newZone;
    }

    let targetAmp = 0;
    if (this.noteIndex == -1) {
      this.lastNote = -1;
    } else {
      this.note = this.lowest + tones[this.noteIndex] + 12 * this.octaveZone;
      this.osc.freq(midiToHz(this.note));

      if (this.note != this.lastNote) {
        ripples.push(new Ripple(thumbX, thumbY, noteHue(this.note), 60, 6));
        this.lastNote = this.note;
        this.pluck = 1;
      }

      let softer = map(this.note, 60, 96, 1, 0.4, true);

      targetAmp = this.volume * softer * (0.6 + 0.4 * this.pluck);
      this.pluck = this.pluck * 0.92;
    }
    this.glideTo(targetAmp);
  }

  glideTo(targetAmp) {
    this.currentAmp = lerp(this.currentAmp, targetAmp, 0.25);
    this.osc.amp(this.currentAmp);
  }

  silence() {
    this.hand = null;
    this.noteIndex = -1;
    this.lastNote = -1;
    this.glideTo(0);
  }

  render(howManyTones) {
    let zoneH = height / 3;
    stroke(255, 80);
    strokeWeight(1);
    line(width / 2, height - zoneH, width - 90, height - zoneH);
    line(width / 2, height - 2 * zoneH, width - 90, height - 2 * zoneH);
    noStroke();
    textAlign(LEFT, CENTER);
    textSize(16);
    for (let i = 0; i < 3; i++) {
      if (this.hand != null && i == this.octaveZone) {
        fill(255);
      } else {
        fill(255, 90);
      }
      text(this.octaveNames[i], width / 2 + 10, height - (i + 0.5) * zoneH);
    }

    let stepH = 60;
    let ladderX = width - 70;
    let ladderBottom = height / 2 + (howManyTones * stepH) / 2;
    for (let i = 0; i < howManyTones; i++) {
      let stepY = ladderBottom - (i + 1) * stepH;
      stroke(255, 120);
      strokeWeight(1);
      if (i == this.noteIndex) {
        fill(255, 200);
      } else {
        noFill();
      }
      rect(ladderX, stepY, 40, stepH - 6);
    }

    if (this.hand != null) {
      let hand = this.hand;

      if (this.noteIndex != -1) {
        let size = map(this.level.getLevel(), 0, 0.3, 60, 320, true);
        colorMode(HSB, 360, 100, 100, 100);
        noStroke();
        fill(noteHue(this.note), 70, 100, 35);
        circle(hand.thumb_tip.x, hand.thumb_tip.y, size);
        colorMode(RGB, 255);
      }

      noStroke();
      for (let i = 0; i < this.fingers.length; i++) {
        let tip = hand[this.fingers[i] + "_tip"];
        if (i == this.noteIndex) {
          fill(255);
          circle(tip.x, tip.y, 22);
        } else {
          fill(180, 20, 220, 180);
          circle(tip.x, tip.y, 12);
        }
      }
      fill(240, 160, 0);
      circle(hand.thumb_tip.x, hand.thumb_tip.y, 20);
    }
  }
}

class Ripple {
  constructor(_x, _y, _hue, _size, _speed) {
    this.x = _x;
    this.y = _y;
    this.hue = _hue;
    this.size = _size;
    this.speed = _speed;
    this.alpha = 100;
  }

  update() {
    this.size += this.speed;
    this.alpha -= 2;
  }

  render() {
    colorMode(HSB, 360, 100, 100, 100);
    noFill();
    stroke(this.hue, 70, 100, this.alpha);
    strokeWeight(3);
    circle(this.x, this.y, this.size);
    colorMode(RGB, 255);
  }

  isDone() {
    return this.alpha <= 0;
  }
}

async function setup() {
  createCanvas(windowWidth, windowHeight);

  video = createCapture(VIDEO, { flipped: true });
  video.size(640, 480);
  video.hide();

  handPose = await ml5.handPose({ flipped: true });
  handPose.detectStart(video, gotHands);

  chordHand = new ChordHand();
  melodyHand = new MelodyHand();
  fft = new p5.FFT();
  for (let i = 0; i < chordHand.oscs.length; i++) {
    chordHand.oscs[i].connect(fft);
  }
  melodyHand.osc.connect(fft);
}

function draw() {
  background(0);

  videoScale = max(width / video.width, height / video.height);
  videoX = (width - video.width * videoScale) / 2;
  videoY = (height - video.height * videoScale) / 2;
  image(
    video,
    videoX,
    videoY,
    video.width * videoScale,
    video.height * videoScale,
  );

  noStroke();
  if (playing && !chordHand.isMajor) {
    fill(10, 20, 60, 150);
  } else {
    fill(50, 25, 10, 150);
  }
  rect(0, 0, width, height);

  if (!playing) {
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(24);
    text("click to start the sound", width / 2, height / 2);
    return;
  }

  let leftHand = null;
  let rightHand = null;
  if (hands.length >= 2) {
    if (hands[0].wrist.x < hands[1].wrist.x) {
      leftHand = hands[0];
      rightHand = hands[1];
    } else {
      leftHand = hands[1];
      rightHand = hands[0];
    }
  } else if (hands.length == 1) {
    if (hands[0].wrist.x < width / 2) {
      leftHand = hands[0];
    } else {
      rightHand = hands[0];
    }
  }

  if (leftHand != null) {
    chordHand.read(leftHand);
  }
  chordHand.play(leftHand != null);
  chordHand.render();

  if (rightHand != null) {
    melodyHand.play(rightHand, chordHand.tones);
  } else {
    melodyHand.silence();
  }
  melodyHand.render(chordHand.tones.length);

  for (let i = ripples.length - 1; i >= 0; i--) {
    ripples[i].update();
    ripples[i].render();
    if (ripples[i].isDone()) {
      ripples.splice(i, 1);
    }
  }

  drawWaveform();
}

function drawWaveform() {
  let wave = fft.waveform();
  noFill();
  stroke(255);
  strokeWeight(2);
  beginShape();
  for (let i = 0; i < wave.length; i++) {
    let x = map(i, 0, wave.length, 0, width);
    let y = map(wave[i], -1, 1, height * 0.75, height * 0.25);
    vertex(x, y);
  }
  endShape();
}

function fingerIsOut(hand, fingerName) {
  let tip = hand[fingerName + "_tip"];
  let joint = hand[fingerName + "_pip"];
  let tipDist = dist(tip.x, tip.y, hand.wrist.x, hand.wrist.y);
  let jointDist = dist(joint.x, joint.y, hand.wrist.x, hand.wrist.y);
  return tipDist > jointDist;
}

function thumbIsOut(hand) {
  let base = hand.pinky_finger_mcp;
  let tipDist = dist(hand.thumb_tip.x, hand.thumb_tip.y, base.x, base.y);
  let jointDist = dist(hand.thumb_ip.x, hand.thumb_ip.y, base.x, base.y);
  return tipDist > jointDist;
}

function noteHue(m) {
  return (m % 12) * 30;
}

function midiToHz(m) {
  return 440 * pow(2, (m - 69) / 12);
}

function gotHands(results) {
  hands = [];
  for (let i = 0; i < results.length; i++) {
    if (results[i].confidence > minConfidence) {
      let hand = {};
      for (let j = 0; j < results[i].keypoints.length; j++) {
        let point = results[i].keypoints[j];
        hand[point.name] = {
          x: point.x * videoScale + videoX,
          y: point.y * videoScale + videoY,
        };
      }
      hands.push(hand);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
  if (getAudioContext().state === "suspended") {
    getAudioContext().resume();
  }

  if (playing) {
    for (let i = 0; i < chordHand.oscs.length; i++) {
      chordHand.oscs[i].amp(0);
      chordHand.oscs[i].stop();
    }
    melodyHand.osc.amp(0);
    melodyHand.osc.stop();
  } else {
    for (let i = 0; i < chordHand.oscs.length; i++) {
      chordHand.oscs[i].amp(0);
      chordHand.oscs[i].start();
    }
    melodyHand.osc.amp(0);
    melodyHand.osc.start();
  }
  playing = !playing;
}
