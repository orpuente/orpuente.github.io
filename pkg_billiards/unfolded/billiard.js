class PhaseSpacePoint {
  constructor(e, s, theta) {
    this.e = e;
    this.s = s;
    this.theta = theta;
  }
}

class EuclideanCoord {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

function phaseSpaceToCoords(sq_x, sq_y, sq_s, p) {
  let V = new Array(
    new EuclideanCoord(sq_x, sq_y + sq_s),
    new EuclideanCoord(sq_x + sq_s, sq_y + sq_s),
    new EuclideanCoord(sq_x + sq_s, sq_y),
    new EuclideanCoord(sq_x, sq_y)
  );

  let p1 = V[p.e];
  let p2 = V[(p.e + 1) % 4];

  let x = map(p.s, 0, 1, p1.x, p2.x);
  let y = map(p.s, 0, 1, p1.y, p2.y);

  return new EuclideanCoord(x, y);
}

class TrailPoint {
  constructor(p, e) {
    this.x = p.x;
    this.y = p.y;
    this.d = 0;
    this.e = e;
  }
  
  getColor() {
    switch (this.e) {
      case 0:
        return C0;
      case 1:
        return C1;
      case 2:
        return C2;
      case 3:
        return C3;
    }
  }

  update_d(d) {
    this.d = d;
  }
}

class BilliardTrail {
  constructor(trailLength) {
    this.trail = [];
    this.trailLength = trailLength;
  }

  updateHead(p, e) {
    this.trail[this.trail.length - 1] = new TrailPoint(p, e);
    this.updateDistances();
  }

  updateDistances() {
    for (let i = this.trail.length - 2; i >= 0; i--) {
      let p1 = this.trail[i];
      let p2 = this.trail[i + 1];
      let d = dist(p1.x, p1.y, p2.x, p2.y);
      this.trail[i].d = this.trail[i + 1].d + d;
    }

    while (this.trail.length > 2 && this.trail[1].d > this.trailLength) {
      this.popTail();
    }
  }

  pushHead(p, e) {
    this.trail.push(new TrailPoint(p, e));
  }

  popTail() {
    this.trail.shift();
  }

  draw(context, sq_x, sq_y, sq_s, headColor, tailColor) {
    for (let i = 0; i < this.trail.length - 1; i++) {
      let ph = this.trail[i + 1];
      let pt = this.trail[i];
      let t_ph = map(ph.d, 0, this.trailLength, 0, 1);
      let t_pt = map(pt.d, 0, this.trailLength, 0, 1);
      // let phColor = lerpColor(headColor, tailColor, t_ph);
      // let ptColor = lerpColor(headColor, tailColor, t_pt);
      let phColor = lerpColor(pt.getColor(), BC, t_ph);
      let ptColor = lerpColor(pt.getColor(), BC, t_ph);

      let x1 = map(ph.x, 0, 1, sq_x, sq_x + sq_s);
      let y1 = map(ph.y, 0, 1, sq_y, sq_y + sq_s);
      let x2 = map(pt.x, 0, 1, sq_x, sq_x + sq_s);
      let y2 = map(pt.y, 0, 1, sq_y, sq_y + sq_s);

      gradientLine(context, x1, y1, x2, y2, phColor, ptColor);
      // stroke(0);
      // line(x1, y1, x2, y2);
    }
  }
}

class SquareRepresentation {
  constructor(p, trailLength) {
    // initialize state
    this.p = p;
    this.np = p;
    this.t = 1;
    this.dt = 0;

    // initialize squareTrail
    let coord = phaseSpaceToCoords(0, 0, 1, this.p);
    this.squareTrail = new BilliardTrail(trailLength);
    this.squareTrail.pushHead(coord, this.p.e);
    this.squareTrail.pushHead(coord, this.p.e);

    // create draw buffer
    this.square_view = createGraphics(300, 300);

    this.bouncedDistance = 0;
  }

  next() {
    if (this.t < 1) {
      this.t += this.dt;
      let coord1 = phaseSpaceToCoords(0, 0, 1, this.p);
      let coord2 = phaseSpaceToCoords(0, 0, 1, this.np);
      let x = map(this.t, 0, 1, coord1.x, coord2.x);
      let y = map(this.t, 0, 1, coord1.y, coord2.y);
      let coord = new EuclideanCoord(x, y);
      this.squareTrail.updateHead(coord, this.np.e);
      return false;
    }
    return true;
  }

  getTotalDistance() {
    let p1 = phaseSpaceToCoords(0, 0, 1, this.p);
    let p2 = phaseSpaceToCoords(0, 0, 1, this.np);
    let x = map(this.t, 0, 1, p1.x, p2.x);
    let y = map(this.t, 0, 1, p1.y, p2.y);
    let fromBounce = dist(p1.x, p1.y, x, y);
    return this.bouncedDistance + fromBounce;
  }

  pushBounce(p) {
    let p1 = phaseSpaceToCoords(0, 0, 1, this.p);
    let p2 = phaseSpaceToCoords(0, 0, 1, this.np);
    this.bouncedDistance += dist(p1.x, p1.y, p2.x, p2.y);

    this.p = this.np;
    this.np = p;
    this.t = 0;
    this.dt = this.updateDt(this.p, this.np);
    let coord = phaseSpaceToCoords(0, 0, 1, this.p);
    this.squareTrail.pushHead(coord, this.p.e);
  }

  updateDt(p, np) {
    let p1 = phaseSpaceToCoords(0, 0, 1, p);
    let p2 = phaseSpaceToCoords(0, 0, 1, np);
    let d = dist(p1.x, p1.y, p2.x, p2.y);
    return SPEED / d;
  }

  draw(sq_x, sq_y, sq_s) {
    // draw label
    push();
    fill(0);
    textAlign(CENTER);
    textSize(16);
    noStroke();
    text("Billiards trajectory", (sq_x + sq_x + sq_s) / 2, sq_y - 10);
    pop();

    this.square_view.background(BC);

    // draw trail
    this.squareTrail.draw(
      this.square_view,
      0,
      0,
      sq_s,
      color("red"),
      color(BC)
    );

    // draw ball
    let coord1 = phaseSpaceToCoords(0, 0, sq_s, this.p);
    let coord2 = phaseSpaceToCoords(0, 0, sq_s, this.np);
    let x = map(this.t, 0, 1, coord1.x, coord2.x);
    let y = map(this.t, 0, 1, coord1.y, coord2.y);
    this.square_view.fill(200, 0, 0);
    this.square_view.circle(x, y, 5);

    // draw square
    this.square_view.push();
    this.square_view.noFill();
    this.square_view.stroke(0);
    this.square_view.strokeWeight(2);
    coloredSquare(this.square_view, 0, 0, sq_s, C0, C1, C2, C3);
    this.square_view.pop();

    // draw buffer
    image(this.square_view, sq_x, sq_y);
  }
}

class LatticeRepresentation {
  constructor(p, trailLength) {
    // initialize state
    this.p = p;
    this.np = p;
    this.t = 1;
    this.dt = 0;

    // initialize latticeTrail
    this.trailLength = trailLength;

    this.coord0 = phaseSpaceToCoords(0, 0, 1, this.p);
    this.theta0 = p.theta;
    this.totalDistance = 0;

    // create draw buffer
    this.lattice_view = createGraphics(300, 300);
  }

  next(totalDistance) {
    this.totalDistance = totalDistance;
    return true;
  }

  getCoord(distance) {
    let d = max(0, distance);
    let x = this.coord0.x + d * cos(this.theta0);
    let y = this.coord0.y + d * sin(this.theta0);
    return new EuclideanCoord(x, y);
  }

  pushBounce(p) {}

  draw(sq_x, sq_y, sq_s) {
    // draw label
    push();
    fill(0);
    textAlign(CENTER);
    textSize(16);
    noStroke();
    text("Unfolded trajectory", (sq_x + sq_x + sq_s) / 2, sq_y - 10);
    pop();

    let S = 1 / 4; // scale

    let p1 = this.getCoord(this.totalDistance - this.trailLength);
    let p2 = this.getCoord(this.totalDistance);

    this.lattice_view.background(BC);
    this.lattice_view.push();
    this.lattice_view.translate(
      sq_s * (1 / 2 - S * p2.x),
      sq_s * (1 / 2 + S * p2.y)
    );

    this.lattice_view.scale(1, -1);

    // draw trail
    let d = this.totalDistance - this.trailLength;

    if (d < 0) {
      let t = map(-d, 0, this.trailLength, 0, 1);
      gradientLine(
        this.lattice_view,
        p1.x * sq_s * S,
        p1.y * sq_s * S,
        p2.x * sq_s * S,
        p2.y * sq_s * S,
        lerpColor(BC, color("red"), t),
        color("red")
      );
    } else {
      gradientLine(
        this.lattice_view,
        p1.x * sq_s * S,
        p1.y * sq_s * S,
        p2.x * sq_s * S,
        p2.y * sq_s * S,
        BC,
        color("red")
      );
    }

    // draw ball
    this.lattice_view.fill(200, 0, 0);
    this.lattice_view.circle(p2.x * sq_s * S, p2.y * sq_s * S, 5);

    // draw lattice
    // closest lattice point
    let x1 = int(p2.x);
    let y1 = int(p2.y);
    let r = 5;

    for (let x = x1 - r; x <= x1 + r; x++) {
      this.lattice_view.stroke(x % 2 === 0 ? C3 : C1);
      this.lattice_view.line(
        sq_s * S * x,
        sq_s * S * (y1 - r),
        sq_s * S * x,
        sq_s * S * (y1 + r)
      );
    }
    for (let y = y1 - r; y <= y1 + r; y++) {
      this.lattice_view.stroke(y % 2 === 0 ? C2 : C0);
      this.lattice_view.line(
        sq_s * S * (x1 - r),
        sq_s * S * y,
        sq_s * S * (x1 + r),
        sq_s * S * y
      );
    }

    this.lattice_view.scale(1, -1);
    coloredSquare(
      this.lattice_view,
      0,
      -2 * sq_s * S,
      sq_s * S,
      C0,
      C1,
      C2,
      C3
    );

    // lattice

    this.lattice_view.pop();

    // frame
    this.lattice_view.noFill();
    this.lattice_view.stroke(0);
    this.lattice_view.square(0, 0, sq_s);

    // draw buffer
    image(this.lattice_view, sq_x, sq_y);
  }
}

class UnitSquareBilliard {
  constructor(e, s, theta, trailLength) {
    this.p = new PhaseSpacePoint(e, s, theta);
    this.squareRepresentation = new SquareRepresentation(this.p, trailLength);
    this.latticeRepresentation = new LatticeRepresentation(this.p, trailLength);
    this.sequence = "";
  }

  T(p) {
    let ne = p.e;
    let ns = p.s;
    let ntheta = p.theta;

    if (p.theta < HALF_PI) {
      ns = (1 - p.s) * tan(p.theta);
      if (ns <= 1) {
        ntheta = HALF_PI - p.theta;
        ne = (p.e + 1) % 4;
      } else {
        ns = 1 - p.s - 1 / tan(p.theta);
        ntheta = PI - p.theta;
        ne = (p.e + 2) % 4;
      }
    } else {
      ns = 1 - p.s * tan(PI - p.theta);
      if (ns >= 0) {
        ntheta = 3 * HALF_PI - p.theta;
        ne = (p.e + 3) % 4;
      } else {
        ns = 1 - p.s + 1 / tan(PI - p.theta);
        ntheta = PI - p.theta;
        ne = (p.e + 2) % 4;
      }
    }

    return new PhaseSpacePoint(ne, ns, ntheta);
  }
  
  printState(label) {
    let p = this.p;
    print(label, p.e, p.s, p.theta);
  }  

  next() {
    this.sequence = this.sequence + this.p.e;
    
    let d = this.squareRepresentation.getTotalDistance();
    this.latticeRepresentation.next(d);
    if (this.squareRepresentation.next()) {
      this.p = this.T(this.p);
      this.squareRepresentation.pushBounce(this.p);
      this.latticeRepresentation.pushBounce(this.p);
    }
  }

  drawAsSquare(sq_x, sq_y, sq_s) {
    this.squareRepresentation.draw(sq_x, sq_y, sq_s);
  }

  drawAsLattice(sq_x, sq_y, sq_s) {
    this.latticeRepresentation.draw(sq_x, sq_y, sq_s);
  }
  
  drawSequence(x, y) {
    text(this.sequence, x, y);
  }
}
