class PlayerVehicle extends Vehicle {
  constructor() {
    super();
  }

  update() {
    if (!this.alive) return;

    // Shoot rays from car and calculate the length of each ray from car to the wall
    this.dist_array = this.look(walls);

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
}
