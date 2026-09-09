// change the quotes in this array. Be mindful of the quotation marks!
// this is the only part of the file you need to edit!

const quotes = [
  { text: "programming techniques combined with artistic expression", source: "SMU Meadows" },
  { text: "software literacy in the visual arts, and visual literacy in technology", source: "Processing Foundation" },
  { text: "a loosely defined term for practices that use code as a medium", source: "Raphaël de Courville" },
  { text: "programming where the goal is to make something expressive instead of something functional", source: "Wikipedia" },
  { text: "code in the contexts of art, play, and self-expression", source: "The Guidebook" },
  { text: "a way of thinking, not a technical skill", source: "Casey Reas" },
  { text: "abstracting aesthetic processes into executable computer code", source: "Marius Watz" },
  { text: "artworks articulated as code", source: "Awesome Creative Coding" }
];
// no need to edit anything below this line! 
// if you have made an error, you can check your history to see what might have gone wrong

// a variable that holds the current quote
let current = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  // Seed with millis() so each page load gives a different quote.
  randomSeed(millis());
  textSize(32);
  fill(10, 255, 10);
  // calls the function to pick a quote
  pickQuote();
}

function pickQuote() {
  // take a random number and use that to identify what quote to use
  current = quotes[floor(random(quotes.length))];
}
c
function draw() {
  background(255, 20, 250); // set the background color
  drawQuote();  // draw the quote on screen
}

function drawQuote() {   // draw text
  textAlign(CENTER, CENTER);
  text("Creative Coding is.....", width / 2, height / 2 - 48);
  textStyle(BOLD);
  text("'" + current.text + "'", width / 2, height / 2);
  textAlign(RIGHT, CENTER);
  text("-" + current.source, width - 100, height - 100);

}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function newQuote() {
  pickQuote();
  redraw();
}

function mousePressed() {
  newQuote();
}
