import Vehicle from "./Vehicle";
import NeuralNetwork from "./NeuralNetwork";
import { checkpoints } from "./Points";
import { FORWARD_PASS_SKIP_FRAMES, LAYER_SIZES } from "../constants";

export default class AIVehicle extends Vehicle {
  constructor(p5, nn) {
    super(p5);

    this.layerSizes = LAYER_SIZES;
    this.nn = nn ? nn : new NeuralNetwork(...this.layerSizes);
    this.inputs = new Float32Array(this.layerSizes[0]);

    this.fitness = 0;
    this.currentCheckpoint = 0;
    this.action = "left";
  }

  /**
   * Updates the vehicle's position and rotation using steering physics, detects collisions with walls, forward pass
   * through neural network to predict steering, and calculates fitness based on checkpoints passed.
   * @param p5
   * @param {Wall[]} walls array of Walls that the vehicle can collide with.
   * @param {boolean} drawRays if true, draw the rays from the car to the walls.
   * @param {number} CHECKPOINT_SIZE size of the checkpoints.
   */
  update(p5, walls, drawRays, CHECKPOINT_SIZE) {
    if (!this.alive) return;

    // Shoot rays from car and calculate the length of each ray from car to the wall
    const hitWall = this.look(p5, walls, drawRays);

    if (hitWall) {
      this.kill(p5);
      return;
    }

    const shouldPredict = p5.frameCount % FORWARD_PASS_SKIP_FRAMES === 0;

    if (shouldPredict) {
      this.think();
    }

    // Rotate based on action
    if (this.action === "left") {
      this.rotateLeft();
    } else if (this.action === "right") {
      this.rotateRight();
    }

    this.drive(p5);
    this.steeringPhysicsUpdate(p5);
    this.fitness += this.checkCheckpoint(p5, CHECKPOINT_SIZE);
  }

  checkCheckpoint(p5, CHECKPOINT_SIZE) {
    // Check if the player's position is within the radius of the current checkpoint
    let d = p5.dist(
      this.d.x,
      this.d.y,
      checkpoints[this.currentCheckpoint].x,
      checkpoints[this.currentCheckpoint].y
    );
    if (d < CHECKPOINT_SIZE) {
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
    const output = this.nn.predict(this.inputs);

    // const predictedAction = output.indexOf(Math.max(...output));

    let maxVal = -Infinity;
    let predictedAction = -1;
    for (let i = 0; i < output.length; i++) {
      if (output[i] > maxVal) {
        maxVal = output[i];
        predictedAction = i;
      }
    }

    // Set the action based on prediction
    if (predictedAction === 0) {
      this.action = "left";
    } else if (predictedAction === 1) {
      this.action = "right";
    }
  }
}
