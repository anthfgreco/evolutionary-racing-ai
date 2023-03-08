const LAYER_SIZES = [10, 15, 4];

class AIVehicle extends Vehicle {
  constructor(nn, showTrail = false) {
    super();
    if (nn) this.nn = nn;
    else this.nn = new NeuralNetwork(...LAYER_SIZES);
    this.fitness = 0;
    this.showTrail = showTrail;
  }

  update() {
    if (!this.alive) return;

    // Shoot rays from car and calculate the length of each ray from car to the wall
    this.rayDistanceArray = this.look(walls);

    // Check if car is in collision using distance to walls
    let hitWall = this.rayDistanceArray.filter((x) => x < 16).length > 0;

    if (hitWall) {
      this.kill();
      populationAlive--;
    }

    this.think();
    //if (this.showTrail) this.drawTrail();

    this.fitness += this.steeringPhysicsUpdate();
  }

  getNeuralNetwork() {
    return this.nn.copy();
  }

  think() {
    if (this.nn) {
      let inputs = [];

      inputs = inputs.concat(this.rayDistanceArray);

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
          // do nothing
          break;
        case 3:
          this.drive();
          break;
        // case 4:
        //   this.brake();
        //   break;
      }
    }
  }
}
