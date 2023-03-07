// Class for vehicle display and control
// Vehicle begins pointing in the positive X direction
class Vehicle {
  constructor(x, y, nn) {
    this.pos = createVector(x, y);
    this.currentSpeed = 0;
    this.angle = 0;
    this.action = "drive";
    this.alive = true;
    this.selected = false;
    this.rays = [];
    this.dist_array = [];
    this.nn = nn;
  }

  rotateLeft() {
    this.angle -= TURNING_SPEED;
    this.action = "left";
  }

  rotateRight() {
    this.angle += TURNING_SPEED;
    this.action = "right";
  }

  drive() {
    // Applies forward force to car, doesn't allow car to go over max speed
    this.currentSpeed += DRIVING_ACCEL;
    if (this.currentSpeed > MAX_SPEED) this.currentSpeed = MAX_SPEED;
    this.action = "drive";
  }

  brake() {
    // Applies braking (backwards) force to car, doesn't allow car to reverse
    this.currentSpeed -= BRAKING_ACCEL;
    if (this.currentSpeed < BRAKING_ACCEL) this.currentSpeed = 0;
    this.action = "brake";
  }

  kill() {
    this.alive = false;
    this.currentSpeed = 0;
  }

  checkIfMouseOver() {
    if (dist(this.pos.x, this.pos.y, mouseX, mouseY) < 35) {
      this.selected = !this.selected;
    }
  }

  getNeuralNetwork() {
    return this.nn.copy();
  }

  getCurrentSpeed() {
    return this.currentSpeed;
  }

  look(walls) {
    this.dist_array = [];
    let i = 0;

    this.rays[0] = new Ray(this.pos, radians(this.angle));
    this.rays[1] = new Ray(this.pos, radians(this.angle + 90));
    this.rays[2] = new Ray(this.pos, radians(this.angle - 90));
    this.rays[3] = new Ray(this.pos, radians(this.angle + 45));
    this.rays[4] = new Ray(this.pos, radians(this.angle - 45));

    for (let ray of this.rays) {
      let closest = null;
      let record = Infinity;

      for (let wall of walls) {
        let pt = ray.cast(wall);
        if (pt) {
          const d = p5.Vector.dist(this.pos, pt);
          if (d < record) {
            closest = pt;
            record = d;
          }
        }
      }

      if (closest) {
        stroke(255, 100);
        strokeWeight(4);
        line(this.pos.x, this.pos.y, closest.x, closest.y);

        this.dist_array[i] = dist(this.pos.x, this.pos.y, closest.x, closest.y);
      }
      i = i + 1;
    }

    this.rays = [];
    return this.dist_array;
  }

  think() {
    if (this.nn) {
      let inputs = [];
      //inputs.push(this.currentSpeed);
      //inputs.push(this.angle);
      inputs = inputs.concat(this.dist_array);

      let output = this.nn.predict(inputs);
      // Argmax
      let predictedAction = output.indexOf(Math.max(...output));

      switch (predictedAction) {
        case 0:
          this.rotateLeft();
          break;
        case 1:
          this.rotateRight();
          break;
        case 2:
          this.drive();
          break;
        case 3:
          this.brake();
          break;
      }
    }
  }

  update() {
    let dist_array;
    // Shoot rays from car and calculate the length of each ray from car to the wall
    if (this.alive) {
      dist_array = this.look(walls);
    }

    //console.log(dist_array);

    // Draw car
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.angle);
    if (this.selected) image(redCarImg, 0, 0);
    else if (!this.selected && this.nn == null) image(blueCarImg, 0, 0);
    else image(yellowCarImg, 0, 0);
    pop();

    if (this.alive == false) return;

    if (this.nn) this.drive();

    // Update position of car
    this.pos.x += this.currentSpeed * Math.cos((this.angle * Math.PI) / 180);
    this.pos.y += this.currentSpeed * Math.sin((this.angle * Math.PI) / 180);

    // Velocity dampening from friction
    this.currentSpeed -= FRICTION_ACCEL;
    if (this.currentSpeed < FRICTION_ACCEL) this.currentSpeed = 0;

    // Collision array, car is in collision if any of the values are less than the array: [26,  5,  5,  17,  17]
    // Check if car is in collision using distance to walls
    let hitWall =
      dist_array[0] < 26 ||
      dist_array[1] < 5 ||
      dist_array[2] < 5 ||
      dist_array[3] < 17 ||
      dist_array[4] < 17;

    if (hitWall) {
      this.kill();
      population_alive--;
    }

    this.think();
  }
}
