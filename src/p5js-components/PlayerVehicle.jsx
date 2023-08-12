import Vehicle from "./Vehicle";

export default class PlayerVehicle extends Vehicle {
  constructor(p5) {
    super(p5);
  }

  /**
   * Updates the vehicle's position and rotation using steering physics, detects collisions with walls, and handles user input.
   * @param p5
   * @param {Wall[]} walls array of Walls that the vehicle can collide with.
   * @param {boolean} drawRays if true, draw the rays from the car to the walls.
   */
  update(p5, walls, drawRays) {
    if (!this.alive) return;

    // Shoot rays from car and calculate the length of each ray from car to the wall
    const hitWall = this.look(p5, walls, drawRays);

    if (hitWall) {
      this.kill(p5);
    }

    this.drive(p5);

    if (p5.keyIsDown(p5.LEFT_ARROW)) this.rotateLeft();
    else if (p5.keyIsDown(p5.RIGHT_ARROW)) this.rotateRight();

    this.steeringPhysicsUpdate(p5);
  }
}
