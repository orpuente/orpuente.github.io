var particles;

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);  
  particles = Array.from({ length: 16 }, (_, i) => new Particle());
}

function draw() {
  background(255);  
  for (const p of particles) {
    p.update();
  }  
  for (const p1 of particles) {
    for (const p2 of particles) {
      drawEdge(p1, p2);
    }
  }
}

class Particle {
  constructor() {
    this.x = random(0, window.innerWidth);
    this.y = random(0, window.innerHeight);
    this.vx = random(1, 5) / 4;
    this.vy = random(1, 5) / 4;
    this.color = color(128);
    // this.color = randomColor();
  }
  
  draw() {
    fill(this.color);
    circle(this.x, this.y, 4);
  }
  
  update() {
    let next_x = this.x + this.vx;    
    if (0 <= next_x && next_x < window.innerWidth) {
      this.x = next_x;
    } else {
      this.vx = - this.vx;
    }
    
    let next_y = this.y + this.vy;
    if (0 <= next_y && next_y < window.innerHeight) {
      this.y = next_y;
    } else {
      this.vy = - this.vy;
    }
  }

  clamp() {
    this.x = constrain(this.x, 0, window.innerWidth);
    this.y = constrain(this.y, 0, window.innerHeight);
  }
}

function drawEdge(p1, p2) {
  if (p1 !== p2) {
    let edgeLength = dist(p1.x, p1.y, p2.x, p2.y);
    let edgeCenterX = (p1.x + p2.x) / 2;
    let edgeCenterY = (p1.y + p2.y) / 2;
    let edgeRelevance = dist(edgeCenterX, edgeCenterY, window.innerWidth / 2, window.innerHeight / 2);
    if (edgeLength > 200) {
      edgeRelevance = 0;
    }
    edgeRelevance = map(edgeRelevance, 0, window.innerWidth / 2, 0, 1);

    let a = map(edgeLength, 0, 100, 0, 1, true);
    let c = lerpColor(p1.color, p2.color, 0.5);
    
    c.setAlpha(255 * (1 - sqrt(a)) * sigmoid(edgeRelevance));
    stroke(c);
    line(p1.x, p1.y, p2.x, p2.y);
  }
}

function sigmoid(x) {
  return 1 / (1 + exp(-10*(x - 0.8)));
}

function randomColor() {
  return color(random(0, 255), random(0, 255), random(0, 255));
}