class AIVehicle extends Vehicle {
  constructor(nn) {
    super();

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

  update() {
    if (!this.alive) return;

    // Shoot rays from car and calculate the length of each ray from car to the wall
    const hitWall = this.look(walls);

    if (hitWall) {
      this.kill();
      populationAlive--;
      return;
    }

    // Kill the car if it's not moving
    if (this.getVel() <= 0.1 && timer < timePerGeneration - 1) {
      this.kill();
      populationAlive--;
      return;
    }

    this.drive();

    this.think();

    // Old fitness function, not ideal because AI learns to drive in circles
    //this.fitness += this.steeringPhysicsUpdate();

    this.steeringPhysicsUpdate();
    this.fitness += this.checkCheckpoint();
  }

  checkCheckpoint() {
    // Check if the player's position is within the radius of the current checkpoint
    let d = dist(
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
