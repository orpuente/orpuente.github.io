const colors = ["#092327", "#447AD2", "#ec9a29", "#4eb78c", "#ecfeaa"];
var C0, C1, C2, C3;
var BC;
var billiard;
var SPEED = 0.01;

function setup() {
  createCanvas(640, 360);
  
  billiard = new UnitSquareBilliard(
    0,      // e
    0.5,    // s
    PI/3, // theta
    2       // trail length
  );
  
  C0 = color(colors[0]);
  C1 = color(colors[1]);
  C2 = color(colors[2]);
  C3 = color(colors[3]);
  BC = color(255);
}

function draw() {
  background(BC);
  billiard.next();
  billiard.drawAsSquare(10, 50, 300);
  billiard.drawAsLattice(330, 50, 300);
}
