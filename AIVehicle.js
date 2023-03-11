class AIVehicle extends Vehicle {
  constructor(nn, showTrail = false) {
    super();

    // input: x velocity, y velocity, 6 ray distances
    // output: left, right (AI is forced to always have foot on gas to encourage drifting rather than slow driving)
    this.LAYER_SIZES = [8, 6, 2];
    if (nn) this.nn = nn;
    else this.nn = new NeuralNetwork(...this.LAYER_SIZES);

    this.fitness = 0;
    this.showTrail = showTrail;
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

    //if (this.showTrail) this.drawTrail();
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
    let inputs = [];

    inputs.push(this.v.x);
    inputs.push(this.v.y);
    inputs = inputs.concat(this.rayDistanceArray);

    // Argmax
    let output = this.nn.predict(inputs);
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
