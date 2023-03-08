// Drift physics from https://github.com/michaelruppe/drift-car

class Vehicle {
  constructor() {
    this.alive = true;
    this.selected = false;
    this.rays = [];
    this.numRays = 10;
    this.dist_array = [];

    // Turning parameters. Tune these as you see fit.
    this.turnRateStatic = 0.1; // The normal turning-rate (static friction => not sliding)
    this.turnRateDynamic = 0.08; // The turning-rate when drifting
    this.turnRate = this.turnRateStatic; // initialise turn-rate
    this.gripStatic = 2; // sliding friction while gripping
    this.gripDynamic = 0.5; // sliding friction while drifting
    this.DRIFT_CONSTANT = 3; // sets the x-velocity threshold for no-drift <=> drift. Lower = drift sooner

    // Physical properties
    this.d = createVector(width * 0.75, height * 0.85); // displacement (position)
    this.v = createVector(0, 0); // velocity (world-referenced)
    this.a = createVector(0, 0); // acceleration (world-referenced)
    this.angle = -PI / 2; // heading - the direction the car faces
    this.m = 10; // mass
    this.w = 18; // width of body (for animation)
    this.l = 30; // length of body (for animation)
    this.f = 0.15; // Acceleration / braking force
    this.isDrifting = false; // Drift state

    // Colour variable - in an example the car colour changes when it loses traction
    this.col = color(255, 255, 255);
  }

  getPos() {
    return this.d.copy();
  }

  getVel() {
    if (!this.alive) return 0;
    else return abs(this.v.x) + abs(this.v.y);
  }

  isDrift() {
    return this.isDrifting;
  }

  show() {
    // Centre on the car, rotate
    push();
    rectMode(CENTER);
    translate(this.d.x, this.d.y);
    rotate(this.angle);
    stroke(0);
    strokeWeight(1);
    fill(this.col);
    // Draw car
    if (this.selected) {
      image(redCarImg, 0, 0);
    } else if (!this.selected && this.nn == null) {
      image(blueCarImg, 0, 0);
    } else {
      image(yellowCarImg, 0, 0);
    }
    //rect(0, 0, this.w, this.l); // Car body
    //rect(0, this.l / 2, 4, 4); // Indicate front side
    pop();
  }

  rotateLeft() {
    this.angle -= this.turnRate;
  }

  rotateRight() {
    this.angle += this.turnRate;
  }

  drive() {
    let bodyAcc = createVector(0, this.f);
    let worldAcc = this.vectBodyToWorld(bodyAcc, this.angle);
    this.a.add(worldAcc);
  }

  brake() {
    let bodyAcc = createVector(0, -this.f);
    let worldAcc = this.vectBodyToWorld(bodyAcc, this.angle);
    this.a.add(worldAcc);
  }

  kill() {
    this.alive = false;
    this.v = createVector(0, 0);
    this.a = createVector(0, 0);
  }

  checkIfMouseOver() {
    if (dist(this.d.x, this.d.y, mouseX, mouseY) < 35) {
      this.selected = !this.selected;
    }
  }

  getCurrentSpeed() {
    return this.currentSpeed;
  }

  look(walls, drawRays = true) {
    this.dist_array = [];
    let i = 0;

    for (let i = 0; i < this.numRays; i++) {
      let angleOffset = map(i, 0, this.numRays - 1, 0, PI);
      this.rays[i] = new Ray(this.d, this.angle + angleOffset);
    }

    for (let ray of this.rays) {
      let closest = null;
      let record = Infinity;

      for (let wall of walls) {
        let pt = ray.cast(wall);
        if (pt) {
          const d = p5.Vector.dist(this.d, pt);
          if (d < record) {
            closest = pt;
            record = d;
          }
        }
      }

      if (closest) {
        this.dist_array[i] = dist(this.d.x, this.d.y, closest.x, closest.y);
      }
      if (closest && drawRays) {
        // stroke(255, 100);
        // strokeWeight(4);
        stroke(255, 75);
        strokeWeight(3);
        line(this.d.x, this.d.y, closest.x, closest.y);
      }
      i = i + 1;
    }

    this.rays = [];
    return this.dist_array;
  }

  steeringPhysicsUpdate() {
    // Car steering and drifting physics

    // Rotate the global velocity vector into a body-fixed one. x = sideways velocity, y = forward/backwards
    let vB = this.vectWorldToBody(this.v, this.angle);

    let bodyFixedDrag;
    let grip;
    if (abs(vB.x) < this.DRIFT_CONSTANT) {
      // Gripping
      grip = this.gripStatic;
      this.turnRate = this.turnRateStatic;
      this.isDrifting = false;
    } else {
      // Drifting
      grip = this.gripDynamic;
      this.turnRate = this.turnRateDynamic;
      this.isDrifting = true;
    }
    bodyFixedDrag = createVector(vB.x * -this.gripDynamic, vB.y * 0.05);

    // Rotate body fixed forces into world fixed and add to acceleration
    let worldFixedDrag = this.vectBodyToWorld(bodyFixedDrag, this.angle);
    this.a.add(worldFixedDrag.div(this.m)); // Include inertia

    // Physics Engine
    this.angle = this.angle % TWO_PI; // Restrict angle to one revolution
    this.v.add(this.a);
    this.d.add(this.v);
    this.a = createVector(0, 0); // Reset acceleration for next frame
  }

  vectBodyToWorld(vect, ang) {
    // Body to world rotation
    let v = vect.copy();
    let vn = createVector(
      v.x * cos(ang) - v.y * sin(ang),
      v.x * sin(ang) + v.y * cos(ang)
    );
    return vn;
  }

  vectWorldToBody(vect, ang) {
    // World to body rotation
    let v = vect.copy();
    let vn = createVector(
      v.x * cos(ang) + v.y * sin(ang),
      v.x * sin(ang) - v.y * cos(ang)
    );
    return vn;
  }
}
