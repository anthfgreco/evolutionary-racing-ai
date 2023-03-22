// Drift physics from https://github.com/michaelruppe/drift-car

class Vehicle {
  constructor() {
    this.alive = true;
    this.numRays = 6;

    this.rays = [];
    this.rayDistanceArray = new Float32Array(this.numRays);
    for (let i = 0; i < this.numRays; i++) {
      this.rays[i] = new Ray();
      this.rayDistanceArray[i] = 0;
    }

    this.carScale = 0.5;
    this.visible = true;

    // Turning parameters. Tune these as you see fit.
    this.turnRateStatic = 0.1; // The normal turning-rate (static friction => not sliding)
    this.turnRateDynamic = 0.08; // The turning-rate when drifting
    this.turnRate = this.turnRateStatic; // initialise turn-rate
    this.gripStatic = 2; // sliding friction while gripping
    this.gripDynamic = 0.5; // sliding friction while drifting
    this.DRIFT_CONSTANT = 3; // sets the x-velocity threshold for no-drift <=> drift. Lower = drift sooner

    // Physical properties
    this.d = createVector(width * 0.5, height * 0.9); // displacement (position)
    this.lastd = this.d.copy(); // last displacement (position)
    this.v = createVector(0, 0); // velocity (world-referenced)
    this.a = createVector(0, 0); // acceleration (world-referenced)
    this.angle = -PI / 2; // heading - the direction the car faces
    this.m = 10; // mass
    this.w = 22; // width of body (for animation)
    this.l = 50; // length of body (for animation)
    this.f = 0.1; // Acceleration / braking force
    this.isDrifting = false; // Drift state

    this.hitboxSize = (this.l * this.carScale) / 3;
  }

  getPos() {
    return this.d.copy();
  }

  getVel() {
    if (!this.alive) return 0;
    else return abs(this.v.mag());
  }

  isDrift() {
    return this.isDrifting;
  }

  show() {
    if (!this.visible) return;

    if (this.isDrift()) {
      extraCanvas.push();

      let offset = (this.w * this.carScale) / 3;
      extraCanvas.strokeWeight(2);
      extraCanvas.stroke(0, 50);

      // extraCanvas.line(
      //   this.lastd.x + offset,
      //   this.lastd.y + offset,
      //   this.d.x + offset,
      //   this.d.y + offset
      // );
      // extraCanvas.line(
      //   this.lastd.x - offset,
      //   this.lastd.y - offset,
      //   this.d.x - offset,
      //   this.d.y - offset
      // );
      // extraCanvas.line(
      //   this.lastd.x - offset,
      //   this.lastd.y + offset,
      //   this.d.x - offset,
      //   this.d.y + offset
      // );
      // extraCanvas.line(
      //   this.lastd.x + offset,
      //   this.lastd.y - offset,
      //   this.d.x + offset,
      //   this.d.y - offset
      // );

      extraCanvas.point(this.d.x + offset, this.d.y + offset);
      extraCanvas.point(this.d.x + offset, this.d.y - offset);
      extraCanvas.point(this.d.x - offset, this.d.y + offset);
      extraCanvas.point(this.d.x - offset, this.d.y - offset);

      extraCanvas.pop();
    }

    this.lastd = this.d.copy();

    push();

    // Center on the car, rotate
    imageMode(CENTER);
    rectMode(CENTER);
    translate(this.d.x, this.d.y);
    rotate(this.angle);
    stroke(0);
    strokeWeight(1);
    scale(this.carScale);
    // Draw car
    //rect(0, 0, this.w, this.l); // Car body
    //rect(0, this.l / 2, 4, 4); // Indicate front side

    if (this.nn) {
      image(yellowCarImg, 0, 0);
    } else {
      image(sportsCarImg, 0, 0);
    }

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
    this.isDrifting = false;
    this.v = createVector(0, 0);
    this.a = createVector(0, 0);
  }

  getCurrentSpeed() {
    return this.currentSpeed;
  }

  look(walls) {
    for (let i = 0; i < this.numRays; i++) {
      let angleOffset = map(i, 0, this.numRays - 1, 0, PI);
      const ray = this.rays[i];
      ray.setPos(this.d);
      ray.setAngle(this.angle + angleOffset);

      let closestPt = null;
      let shortestDist = Infinity;

      for (let j = 0; j < walls.length; j++) {
        const wall = walls[j];
        const pt = ray.cast(wall);
        if (pt) {
          const distSq = (this.d.x - pt.x) ** 2 + (this.d.y - pt.y) ** 2;
          if (distSq < shortestDist) {
            closestPt = pt;
            shortestDist = distSq;
          }
        }
      }

      if (closestPt) {
        this.rayDistanceArray[i] = Math.sqrt(shortestDist);
      } else {
        this.rayDistanceArray[i] = 2000;
      }

      if (closestPt && drawRays) {
        push();
        stroke(255, 75);
        strokeWeight(3);
        line(this.d.x, this.d.y, closestPt.x, closestPt.y);
        pop();
      }
    }

    // Check if car is in collision using distance to walls
    return this.rayDistanceArray.filter((x) => x < this.hitboxSize).length > 0;
  }

  steeringPhysicsUpdate() {
    let driftTime = 0;
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
      driftTime += 1;
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

    return driftTime;
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
