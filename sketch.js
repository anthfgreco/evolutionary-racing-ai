const TURNING_SPEED = 3;
const MAX_SPEED = 9;
const DRIVING_ACCEL = 0.1;
const BRAKING_ACCEL = 0.1;
const FRICTION_ACCEL = 0.03;
const POPULATION_SIZE = 10;
const MUTATION_RATE = 0.02;
const STARTING_X = 500;
const STARTING_Y = 125;
const nn_options = {
  inputs: 5,
  outputs: ["left", "right", "drive"],
  task: "classification",
  noTraining: true,
};
const trained_nn_details = {
  model: "trainedModel/model.json",
  metadata: "trainedModel/model_meta.json",
  weights: "trainedModel/model.weights.bin",
};
const trained_nn = ml5.neuralNetwork(nn_options);
trained_nn.load(trained_nn_details);
//const points = [[25, 35], [402, 49],[645, 49],[726, 219],[949, 70],[1219, 78],[1254, 855],[865, 847],[872, 704],[1011, 626],[849, 510],[608, 673],[579, 881],[74, 886], [25, 35]];
//const points2 = [[136, 161],[539, 168],[703, 341],[983, 194],[1118, 196],[1132, 755],[1027, 755],[1103, 631],[1045, 484],[841, 358], [501, 540], [443, 780], [184, 782], [139, 161]];
var stats_padding, stats_x1, stats_y1, stats_x2, stats_y2;
var state = "player-drive";
var walls;
var generation_num = 0;
var population_alive = POPULATION_SIZE;
var saved_nn;

// Setup is ran once at the beginning of the page being loaded
function setup() {
  var canvas = createCanvas(
    windowWidth,
    document.getElementById("sketch-holder").offsetHeight
  );
  canvas.parent("sketch-holder");
  angleMode(DEGREES);
  imageMode(CENTER);
  rectMode(CORNERS);

  walls = [];
  // Draw outer walls
  x = 50;
  walls.push(new Boundary(x, x, width - x, x));
  walls.push(new Boundary(x, height - x, width - x, height - x));
  walls.push(new Boundary(width - x, x, width - x, height - x));
  walls.push(new Boundary(x, x, x, height - x));

  // Draw inner walls
  x = 175;
  walls.push(new Boundary(x, x, width - x, x));
  walls.push(new Boundary(x, height - x, width - x, height - x));
  walls.push(new Boundary(width - x, x, width - x, height - x));
  walls.push(new Boundary(x, x, x, height - x));

  yellowCarImg = loadImage("img/yellowcar.png");
  redCarImg = loadImage("img/redcar.png");
  blueCarImg = loadImage("img/bluecar.png");

  // Dimensions for stats box when training
  stats_padding = 10;
  stats_x1 = 25;
  stats_y1 = height - 140;
  stats_x2 = 225;
  stats_y2 = height - 20;

  /*
  for (let i=0; i < points.length; i+=1) {
    if (i != points.length - 1) {
      walls.push(new Boundary(points[i][0], points[i][1], points[i+1][0], points[i+1][1]));
    }
  } 

  for (let i=0; i < points2.length; i+=1) {
    if (i != points2.length - 1) {
      walls.push(new Boundary(points2[i][0], points2[i][1], points2[i+1][0], points2[i+1][1]));
    }
  } 
  */

  // Population is a list of all vehicle objects
  population = [];

  player = new Vehicle(STARTING_X, STARTING_Y);
}

var frame = 0;
var logEveryFrame = 10;

// Draw is ran every frame
function draw() {
  background(50);
  frame++;
  if (frame % logEveryFrame == 0) console.log("fps: ", round(frameRate()));

  for (let wall of walls) {
    wall.show();
  }

  if (state == "player-drive") {
    if (keyIsDown(LEFT_ARROW)) player.rotateLeft();
    else if (keyIsDown(RIGHT_ARROW)) player.rotateRight();
    else if (keyIsDown(UP_ARROW)) player.drive();
    else if (keyIsDown(DOWN_ARROW)) player.brake();
    player.update();
  }

  if (state == "generation_training") {
    let total_speed = 0;

    // This for loop is the main source of extreme lag, especially as POPULATION_SIZE grows
    // Can be tracked to population update -> classifySync, basically the neural net forward prop
    for (let i = 0; i < POPULATION_SIZE; i++) {
      population[i].update();
      total_speed += population[i].getCurrentSpeed();
    }

    // Draw box around stats
    fill(0, 75);
    noStroke();
    rect(
      stats_x1 - stats_padding,
      stats_y1 - stats_padding,
      stats_x2 + stats_padding,
      stats_y2 + stats_padding
    );

    // Draw stats at bottom left of screen
    if (population_alive == 0) average_speed = 0;
    else average_speed = total_speed / population_alive;
    textSize(20);
    fill(255);
    textAlign(LEFT);
    noStroke();
    let s =
      `Generation: ${generation_num}\n` +
      `Population: ${POPULATION_SIZE}\n` +
      `Alive: ${population_alive}\n` +
      `Average Speed: ${round(average_speed, 2)}\n` +
      `Mutation Rate: ${MUTATION_RATE * 100}%`;
    text(s, stats_x1, stats_y1, stats_x2, stats_y2);
  }

  if (state == "race") {
    if (keyIsDown(LEFT_ARROW)) player.rotateLeft();
    else if (keyIsDown(RIGHT_ARROW)) player.rotateRight();
    else if (keyIsDown(UP_ARROW)) player.drive();
    else if (keyIsDown(DOWN_ARROW)) player.brake();
    population[0].update();
    player.update();
  }
}

function initialize_random_population() {
  update_alert("");
  state = "generation_training";
  population = [];
  for (let i = 0; i < POPULATION_SIZE; i++) {
    population.push(
      new Vehicle(STARTING_X, STARTING_Y, ml5.neuralNetwork(nn_options))
    );
  }
  population_alive = POPULATION_SIZE;
}

// I didn't realize you can just use the new generation function
function initialize_from_saved() {
  if (!saved_nn) {
    console.log("No saved vehicle!");
    update_alert("No saved vehicle!");
  } else {
    update_alert("");
    state = "generation_training";
    population = [];
    for (let i = 0; i < POPULATION_SIZE; i++) {
      let child_nn = saved_nn.copy();
      child_nn.mutate(MUTATION_RATE);
      population.push(new Vehicle(STARTING_X, STARTING_Y, child_nn));
    }
    population_alive = POPULATION_SIZE;
  }
}

function race_saved_vehicle() {
  if (!saved_nn) {
    console.log("No saved vehicle!");
    update_alert("No saved vehicle!");
  } else {
    state = "race";
    population = [];
    player = new Vehicle(STARTING_X, STARTING_Y);
    population.push(new Vehicle(STARTING_X, STARTING_Y, saved_nn));
    population_alive = 1;
  }
}

function load_trained_model() {
  if (!trained_nn) {
    console.log("Trained model files missing!");
    update_alert("Trained model files missing!");
  } else {
    update_alert("");
    state = "race";
    population = [];
    player = new Vehicle(STARTING_X, STARTING_Y);
    population.push(new Vehicle(STARTING_X, STARTING_Y, trained_nn));
    saved_nn = trained_nn;
    population_alive = 1;
  }
}

function get_chosen_vehicles() {
  // Get list of user selected vehicles
  chosen_vehicles = [];
  if (state == "player-drive") {
    console.log("Initialize population first!");
    update_alert("Initialize population first!");
  }
  if (state == "generation_training") {
    for (let i = 0; i < POPULATION_SIZE; i++) {
      if (population[i].selected) {
        chosen_vehicles.push(population[i]);
      }
    }
  }
  if (state == "race") {
    if (population[0].selected) chosen_vehicles.push(population[0]);
  }
  return chosen_vehicles;
}

function new_generation() {
  if (state == "player-drive") {
    console.log("Initialize population first!");
    update_alert("Initialize a population first!");
    return;
  }

  chosen_vehicles = get_chosen_vehicles();

  // User did not select any vehicles
  if (chosen_vehicles.length == 0) {
    console.log("No cars selected!");
    update_alert("Select the best performing cars first!");
    return;
  }
  // If only one vehicle is selected, copy and mutate its neural network for the entire population
  // The chosen parent lives unmutated in the next generation (elitism)
  else if (chosen_vehicles.length == 1) {
    population[0] = new Vehicle(
      STARTING_X,
      STARTING_Y,
      chosen_vehicles[0].getNeuralNetwork()
    );
    for (let i = 1; i < POPULATION_SIZE; i++) {
      let child_nn = chosen_vehicles[0].getNeuralNetwork();
      child_nn.mutate(MUTATION_RATE);
      population[i] = new Vehicle(STARTING_X, STARTING_Y, child_nn);
    }
  }
  // If two or more vehicles are selected, randomly pick two chosen vehicles and cross and mutate their neural networks
  // Two of the chosen parents live unmutated in the next generation (elitism)
  else {
    population[0] = new Vehicle(
      STARTING_X,
      STARTING_Y,
      chosen_vehicles[0].getNeuralNetwork()
    );
    population[1] = new Vehicle(
      STARTING_X,
      STARTING_Y,
      chosen_vehicles[1].getNeuralNetwork()
    );
    for (let i = 2; i < POPULATION_SIZE; i++) {
      let parent_1 =
        chosen_vehicles[Math.floor(Math.random() * chosen_vehicles.length)];
      let parent_2 =
        chosen_vehicles[Math.floor(Math.random() * chosen_vehicles.length)];
      let new_nn = parent_1
        .getNeuralNetwork()
        .crossover(parent_2.getNeuralNetwork());
      new_nn.mutate(MUTATION_RATE);
      population[i] = new Vehicle(STARTING_X, STARTING_Y, new_nn);
    }
  }
  update_alert("");
  state = "generation_training";
  generation_num++;
  population_alive = POPULATION_SIZE;
}

function save_selected_vehicle() {
  if (state == "player-drive") {
    console.log("Initialize population first!");
    update_alert("A car isn't selected!");
  }

  if (state == "generation_training" || state == "race") {
    chosen_vehicles = get_chosen_vehicles();

    if (chosen_vehicles.length == 0) {
      console.log("No vehicle selected!");
      update_alert("A car isn't selected!");
    } else {
      saved_nn = chosen_vehicles[0].getNeuralNetwork();
      update_alert("");
      //saved_nn.save();
    }
  }
}

function mouseClicked() {
  if (state == "generation_training") {
    for (let i = 0; i < POPULATION_SIZE; i++) {
      population[i].checkIfMouseOver();
    }
  }

  if (state == "race") {
    population[0].checkIfMouseOver();
  }
}

function keyPressed() {
  key = key.toUpperCase();
  switch (key) {
    case "I":
      initialize_random_population();
      break;
    case "G":
      new_generation();
      break;
    case "S":
      save_selected_vehicle();
      break;
    case "R":
      race_saved_vehicle();
      break;
    case "L":
      load_trained_model();
      break;
  }
}

function update_alert(text) {
  $("#alert-div").text(text);
}

// Class for vehicle display and control
// Vehicle begins pointing in the positive X direction
class Vehicle {
  constructor(x, y, nn) {
    this.x = x;
    this.y = y;
    this.currentSpeed = 0;
    this.action = "drive";
    this.alive = true;
    this.angle = 0;
    this.selected = false;
    this.particle = new Particle();
    this.nn = nn;
  }

  rotateLeft() {
    this.angle -= TURNING_SPEED;
    this.action = "left";
  }

  rotateRight() {
    this.angle += TURNING_SPEED;
    this.action = "right";
  }

  drive() {
    // Applies forward force to car, doesn't allow car to go over max speed
    this.currentSpeed += DRIVING_ACCEL;
    if (this.currentSpeed > MAX_SPEED) this.currentSpeed = MAX_SPEED;
    this.action = "drive";
  }

  brake() {
    // Applies braking (backwards) force to car, doesn't allow car to reverse
    this.currentSpeed -= BRAKING_ACCEL;
    if (this.currentSpeed < BRAKING_ACCEL) this.currentSpeed = 0;
    this.action = "brake";
  }

  kill() {
    this.alive = false;
    this.currentSpeed = 0;
  }

  checkIfMouseOver() {
    if (dist(this.x, this.y, mouseX, mouseY) < 35) {
      this.selected = !this.selected;
    }
  }

  getNeuralNetwork() {
    return this.nn.copy();
  }

  getCurrentSpeed() {
    return this.currentSpeed;
  }

  update() {
    let dist_array;
    // Shoot rays from car and calculate the length of each ray from car to the wall
    if (this.alive) {
      this.particle.update(this.x, this.y, this.angle);
      dist_array = this.particle.look(walls);
    }

    // Draw car
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    if (this.selected) image(redCarImg, 0, 0);
    else if (!this.selected && this.nn == null) image(blueCarImg, 0, 0);
    else image(yellowCarImg, 0, 0);
    pop();

    if (this.alive == false) {
      return;
    }

    // Update position of car
    this.x += this.currentSpeed * Math.cos((this.angle * Math.PI) / 180);
    this.y += this.currentSpeed * Math.sin((this.angle * Math.PI) / 180);

    // Velocity dampening from friction
    this.currentSpeed -= FRICTION_ACCEL;
    if (this.currentSpeed < FRICTION_ACCEL) this.currentSpeed = 0;

    // Collision array, car is in collision if any of the values are less than the array: [26,  5,  5,  17,  17]
    // Check if car is in collision using distance to walls
    if (
      dist_array[0] < 26 ||
      dist_array[1] < 5 ||
      dist_array[2] < 5 ||
      dist_array[3] < 17 ||
      dist_array[4] < 17
    ) {
      this.kill();
      population_alive--;
    }

    if (this.nn) {
      // Predict action to take using neural network of car
      // source of major lag, optimization necessary
      let results = this.nn.classifySync(dist_array);
      //let results = [{ label: "drive" }];

      let predictedAction = results[0].label;

      switch (predictedAction) {
        case "left":
          this.rotateLeft();
          break;
        case "right":
          this.rotateRight();
          break;
        case "drive":
          this.drive();
          break;
        case "brake":
          this.brake();
          break;
      }
    }
  }
}
