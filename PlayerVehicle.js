class PlayerVehicle extends Vehicle {
  constructor() {
    super();
  }

  update() {
    if (!this.alive) return;

    // Shoot rays from car and calculate the length of each ray from car to the wall
    const hitWall = this.look(walls);

    if (hitWall) {
      this.kill();
    }

    if (keyIsDown(LEFT_ARROW)) this.rotateLeft();
    else if (keyIsDown(RIGHT_ARROW)) this.rotateRight();
    else if (keyIsDown(UP_ARROW)) this.drive();
    else if (keyIsDown(DOWN_ARROW)) this.brake();

    this.steeringPhysicsUpdate();
    this.drawTrail();
  }
}
