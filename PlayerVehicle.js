class PlayerVehicle extends Vehicle {
  constructor() {
    super();
    this.trail = [];
    this.trailLength = 100;
  }

  update() {
    if (!this.alive) return;

    // Shoot rays from car and calculate the length of each ray from car to the wall
    this.dist_array = this.look(walls, false);

    if (keyIsDown(LEFT_ARROW)) this.rotateLeft();
    else if (keyIsDown(RIGHT_ARROW)) this.rotateRight();
    else if (keyIsDown(UP_ARROW)) this.drive();
    else if (keyIsDown(DOWN_ARROW)) this.brake();

    // Check if car is in collision using distance to walls
    let hitWall = this.dist_array.filter((x) => x < 16).length > 0;

    if (hitWall) {
      this.kill();
    }

    this.steeringPhysicsUpdate();
    this.drawTrail();
  }

  drawTrail() {
    let nowDrifting = this.isDrift();
    this.trail.push({
      position: this.getPos(), // A vector(x,y)
      drifting: nowDrifting, // true / false
    });

    if (this.trail.length > this.trailLength) this.trail.splice(0, 1);

    // Render the car's trail. Change color of trail depending on whether
    // drifting or not.
    stroke(255);
    strokeWeight(4);
    noFill();
    for (let p of this.trail) {
      // Colour the trail to show when drifting
      if (p.drifting) {
        stroke(100, 100, 100);
      } else {
        stroke(255);
      }
      let offset = 7;
      point(p.position.x - offset, p.position.y - offset);
      point(p.position.x + offset, p.position.y + offset);
      point(p.position.x + offset, p.position.y - offset);
      point(p.position.x - offset, p.position.y + offset);
    }
  }
}
