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

    this.drive();

    if (keyIsDown(LEFT_ARROW)) this.rotateLeft();
    else if (keyIsDown(RIGHT_ARROW)) this.rotateRight();

    this.steeringPhysicsUpdate();
  }
}
