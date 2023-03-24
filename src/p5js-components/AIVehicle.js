class AIVehicle extends Vehicle {
  constructor(p5, nn) {
    super(p5);

    /*
    The AI evolves extremely quickly with this configuration
    AI is forced to have foot on gas to encourage fast driving + drifting, makes evolution dramatically faster

    Input: 
    x velocity, 
    y velocity, 
    6 ray distances

    Hidden:
    6

    Output: 
    steer left, 
    steer right
    */
    this.LAYER_SIZES = [8, 6, 2];
    if (nn) this.nn = nn;
    else this.nn = new NeuralNetwork(...this.LAYER_SIZES);
    this.inputs = new Float32Array(this.LAYER_SIZES[0]);

    this.fitness = 0;
    this.currentCheckpoint = 0;
  }

  /**
   * Updates the vehicle's position and rotation using steering physics, detects collisions with walls, forward pass
   * through neural network to predict steering, and calculates fitness based on checkpoints passed.
   * @param p5
   * @param {Wall[]} walls array of Walls that the vehicle can collide with.
   * @param {boolean} drawRays if true, draw the rays from the car to the walls.
   * @param {number} timer current timer value.
   * @param {number} timePerGeneration maximum timer value.
   * @param {number} checkpointSize size of the checkpoints.
   */
  update(p5, walls, drawRays, timer, timePerGeneration, checkpointSize) {
    if (!this.alive) return;

    // Shoot rays from car and calculate the length of each ray from car to the wall
    const hitWall = this.look(p5, walls, drawRays);

    if (hitWall) {
      this.kill(p5);
      return;
    }

    // Kill the car if it's not moving
    if (this.getVel() <= 0.1 && timer < timePerGeneration - 1) {
      this.kill(p5);
      return;
    }

    this.drive(p5);

    this.think();

    // Old fitness function, not ideal because AI learns to drive in circles
    //this.fitness += this.steeringPhysicsUpdate();

    this.steeringPhysicsUpdate(p5);
    this.fitness += this.checkCheckpoint(p5, checkpointSize);
  }

  checkCheckpoint(p5, checkpointSize) {
    // Check if the player's position is within the radius of the current checkpoint
    let d = p5.dist(
      this.d.x,
      this.d.y,
      checkpoints[this.currentCheckpoint].x,
      checkpoints[this.currentCheckpoint].y
    );
    if (d < checkpointSize) {
      this.currentCheckpoint =
        (this.currentCheckpoint + 1) % checkpoints.length;
      return 1;
    }
    return 0;
  }

  getNeuralNetwork() {
    return this.nn.copy();
  }

  think() {
    this.inputs[0] = this.v.x;
    this.inputs[1] = this.v.y;

    for (let i = 0; i < this.rayDistanceArray.length; i++) {
      this.inputs[i + 2] = this.rayDistanceArray[i];
    }

    // Argmax
    let output = this.nn.predict(this.inputs);
    let predictedAction = output.indexOf(Math.max(...output));

    switch (predictedAction) {
      case 0:
        this.rotateLeft();
        break;
      case 1:
        this.rotateRight();
        break;
    }
  }
}
