// Drift physics from https://github.com/michaelruppe/drift-car

class Vehicle {
  constructor(p5) {
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
    this.d = p5.createVector(500, 675); // displacement (position)
    this.lastd = this.d.copy(); // last displacement (position)
    this.v = p5.createVector(0, 0); // velocity (world-referenced)
    this.a = p5.createVector(0, 0); // acceleration (world-referenced)
    this.angle = -p5.PI / 2; // heading - the direction the car faces
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
    else return Math.abs(this.v.mag());
  }

  isDrift() {
    return this.isDrifting;
  }

  show(p5, yellowCarImg, sportsCarImg, extraCanvas) {
    if (!this.visible) return;

    if (this.isDrift()) {
      extraCanvas.push();

      let offset = (this.w * this.carScale) / 3;
      extraCanvas.strokeWeight(2);
      extraCanvas.stroke(0, 50);

      extraCanvas.point(this.d.x + offset, this.d.y + offset);
      extraCanvas.point(this.d.x + offset, this.d.y - offset);
      extraCanvas.point(this.d.x - offset, this.d.y + offset);
      extraCanvas.point(this.d.x - offset, this.d.y - offset);

      extraCanvas.pop();
    }

    this.lastd = this.d.copy();

    p5.push();

    // Center on the car, rotate
    p5.imageMode(p5.CENTER);
    p5.rectMode(p5.CENTER);
    p5.translate(this.d.x, this.d.y);
    p5.rotate(this.angle);
    p5.stroke(0);
    p5.strokeWeight(1);
    p5.scale(this.carScale);

    if (this.nn) {
      p5.image(yellowCarImg, 0, 0);
    } else {
      p5.image(sportsCarImg, 0, 0);
    }

    p5.pop();
  }

  rotateLeft() {
    this.angle -= this.turnRate;
  }

  rotateRight() {
    this.angle += this.turnRate;
  }

  drive(p5) {
    let bodyAcc = p5.createVector(0, this.f);
    let worldAcc = this.vectBodyToWorld(p5, bodyAcc, this.angle);
    this.a.add(worldAcc);
  }

  brake() {
    let bodyAcc = createVector(0, -this.f);
    let worldAcc = this.vectBodyToWorld(p5, bodyAcc, this.angle);
    this.a.add(worldAcc);
  }

  kill(p5) {
    this.alive = false;
    this.isDrifting = false;
    this.v = p5.createVector(0, 0);
    this.a = p5.createVector(0, 0);
  }

  getCurrentSpeed() {
    return this.currentSpeed;
  }

  /**
   * For each ray, cast it out and find the closest wall. Then, set the distance of that ray to the distance between the car and the wall.
   * @param p5
   * @param {Wall[]} walls array of walls to check for collisions
   * @param {boolean} drawRays if true, draw the rays from the car to the walls.
   * @returns {boolean} true if the car is colliding with a wall, false otherwise.
   */
  look(p5, walls, drawRays) {
    for (let i = 0; i < this.numRays; i++) {
      let angleOffset = p5.map(i, 0, this.numRays - 1, 0, p5.PI);
      const ray = this.rays[i];
      ray.setPos(this.d);
      ray.setAngle(this.angle + angleOffset);

      let closestPt = null;
      let shortestDist = Infinity;

      for (let j = 0; j < walls.length; j++) {
        const wall = walls[j];
        const pt = ray.cast(p5, wall);
        if (pt) {
          const distSq = (this.d.x - pt.x) ** 2 + (this.d.y - pt.y) ** 2;
          if (distSq < shortestDist) {
            closestPt = pt;
            shortestDist = distSq;
          }
        }
      }

      // Update the distance array
      if (closestPt) {
        this.rayDistanceArray[i] = Math.sqrt(shortestDist);
      } else {
        this.rayDistanceArray[i] = 2000;
      }

      if (closestPt && drawRays) {
        p5.push();
        p5.stroke(255, 75);
        p5.strokeWeight(3);
        p5.line(this.d.x, this.d.y, closestPt.x, closestPt.y);
        p5.pop();
      }
    }

    // Check if car is in collision using distance to walls
    return this.rayDistanceArray.filter((x) => x < this.hitboxSize).length > 0;
  }

  steeringPhysicsUpdate(p5) {
    let driftTime = 0;
    // Car steering and drifting physics

    // Rotate the global velocity vector into a body-fixed one. x = sideways velocity, y = forward/backwards
    let vB = this.vectWorldToBody(p5, this.v, this.angle);

    let bodyFixedDrag;
    let grip;
    if (Math.abs(vB.x) < this.DRIFT_CONSTANT) {
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
    bodyFixedDrag = p5.createVector(vB.x * -this.gripDynamic, vB.y * 0.05);

    // Rotate body fixed forces into world fixed and add to acceleration
    let worldFixedDrag = this.vectBodyToWorld(p5, bodyFixedDrag, this.angle);
    this.a.add(worldFixedDrag.div(this.m)); // Include inertia

    // Physics Engine
    this.angle = this.angle % p5.TWO_PI; // Restrict angle to one revolution
    this.v.add(this.a);
    this.d.add(this.v);
    this.a = p5.createVector(0, 0); // Reset acceleration for next frame

    return driftTime;
  }

  vectBodyToWorld(p5, vect, ang) {
    // Body to world rotation
    let v = vect.copy();
    let vn = p5.createVector(
      v.x * Math.cos(ang) - v.y * Math.sin(ang),
      v.x * Math.sin(ang) + v.y * Math.cos(ang)
    );
    return vn;
  }

  vectWorldToBody(p5, vect, ang) {
    // World to body rotation
    let v = vect.copy();
    let vn = p5.createVector(
      v.x * Math.cos(ang) + v.y * Math.sin(ang),
      v.x * Math.sin(ang) - v.y * Math.cos(ang)
    );
    return vn;
  }
}
