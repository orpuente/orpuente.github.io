// initialize the program's state
var x=100, y=100, w=50, h=40, vx=1.0, vy=0.6;

function setup() {
  createCanvas(400, 300);
  fill(51, 204, 51);
  noStroke();
}

function draw() {
  // this statement handles the draw call, updates the box position
  // and "detects" collisions all the same time
  background(249);
  rect(
    abs((x+=vx) % (2*(width-w)) - (width-w) + 1),
    abs((y+=vy) % (2*(height-h)) - (height-h) + 1),
    w, h
  );
}