const TURNING_SPEED = 3;
const MAX_SPEED = 10;
const DRIVING_ACCEL = 0.1;
const BRAKING_ACCEL = 0.1;
const FRICTION_ACCEL = 0.03;
const POPULATION_SIZE = 25;
const MUTATION_RATE = 0.05;
const CAR_X = 500;
const CAR_Y = 125;
const nn_options = {
  inputs: 5,
  outputs: ['left', 'right', 'drive'],
  task: "classification",
  noTraining: true
}
let stats_padding, stats_x1, stats_y1, stats_x2, stats_y2;
const points = [[25, 35], [402, 49],[645, 49],[726, 219],[949, 70],[1219, 78],[1254, 855],[865, 847],[872, 704],[1011, 626],[849, 510],[608, 673],[579, 881],[74, 886], [25, 35]];
const points2 = [[136, 161],[539, 168],[703, 341],[983, 194],[1118, 196],[1132, 755],[1027, 755],[1103, 631],[1045, 484],[841, 358], [501, 540], [443, 780], [184, 782], [139, 161]];
var walls = [];
var generation_num = 0;
var population_alive = POPULATION_SIZE;

// Setup is ran once at the beginning of the page being loaded
function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  imageMode(CENTER);
  rectMode(CORNERS);

  x = 50;
  walls.push(new Boundary(x, x, width - x, x));
  walls.push(new Boundary(x, height - x, width - x, height - x));
  walls.push(new Boundary(width - x, x, width - x, height - x));
  walls.push(new Boundary(x, x, x, height - x));

  x = 175;
  walls.push(new Boundary(x, x, width - x, x));
  walls.push(new Boundary(x, height - x, width - x, height - x));
  walls.push(new Boundary(width - x, x, width - x, height - x));
  walls.push(new Boundary(x, x, x, height - x));
  
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
  for (let i=0; i < POPULATION_SIZE; i++) {
    population.push(new Vehicle(CAR_X, CAR_Y, ml5.neuralNetwork(nn_options)));
  }

  yellowCarImg = loadImage("car.png");
  redCarImg = loadImage("redcar.png");

  stats_padding = 5;
  stats_x1 = 25;
  stats_y1 = height-130;
  stats_x2 = 225;
  stats_y2 = height-10;

  button = createButton('New Generation (G)');
  button.position(stats_x2+stats_padding, height-40);
  button.style("font-family", "Bodoni");
  button.style("font-size", "20px");
  button.mousePressed(new_generation);
}

// Draw is ran every frame
function draw() {
  background(50);
  let total_speed = 0;

  for (let wall of walls) {
    wall.show();
  }

  for (let i=0; i < POPULATION_SIZE; i++) {
    population[i].update();
    total_speed += population[i].getCurrentSpeed();
  }

  // Draw box around stats
  fill(0, 75);
  noStroke();
  rect( stats_x1-stats_padding, 
        stats_y1-stats_padding, 
        stats_x2+stats_padding, 
        stats_y2+stats_padding);
  // Draw stats at bottom left of screen
  textSize(20);
  fill(255);
  textAlign(LEFT);
  noStroke();
  let s =   `Generation: ${generation_num}\n` +
            `Population: ${POPULATION_SIZE}\n` +
            `Alive: ${population_alive}\n` +
            `Average Speed: ${round(total_speed/population_alive, 2)}\n` +
            `Mutation Rate: ${MUTATION_RATE*100}%`
  text(s, stats_x1, stats_y1, stats_x2, stats_y2);
}

function new_generation() {
  // Get list of user chosen vehicles
  chosen_vehicles = [];
  for (let i=0; i < POPULATION_SIZE; i++) {
    if (population[i].selected) {
      chosen_vehicles.push(population[i]);
    }
  }

  // User did not select any vehicles
  if (chosen_vehicles.length == 0) {
    console.log("no cars selected!");
    return;
  }
  // If only one vehicle is selected, copy and mutate its neural network for the entire population
  // The chosen parent lives unmutated in the next generation (elitism)
  else if (chosen_vehicles.length == 1) {
    population[0] = (new Vehicle(CAR_X, CAR_Y, chosen_vehicles[0].getNeuralNetwork()));
    for (let i=1; i < POPULATION_SIZE; i++) {
      let child_nn = chosen_vehicles[0].getNeuralNetwork();
      child_nn.mutate(MUTATION_RATE);
      population[i] = (new Vehicle(CAR_X, CAR_Y, child_nn));
    }
  }
  // If two or more vehicles are selected, randomly pick two chosen vehicles and cross and mutate their neural networks
  // Two of the chosen parents live unmutated in the next generation (elitism)
  else {
    population[0] = (new Vehicle(CAR_X, CAR_Y, chosen_vehicles[0].getNeuralNetwork()));
    population[1] = (new Vehicle(CAR_X, CAR_Y, chosen_vehicles[1].getNeuralNetwork()));
    for (let i=2; i < POPULATION_SIZE; i++) {
      let parent_1 = chosen_vehicles[Math.floor(Math.random()*chosen_vehicles.length)];
      let parent_2 = chosen_vehicles[Math.floor(Math.random()*chosen_vehicles.length)];
      let new_nn = parent_1.getNeuralNetwork().crossover(parent_2.getNeuralNetwork());
      new_nn.mutate(MUTATION_RATE);
      population[i] = (new Vehicle(CAR_X, CAR_Y, new_nn));
    }
  }
  generation_num++;
  population_alive = POPULATION_SIZE;
}

function mouseClicked() {
  //mouseX, mouseY
  for (let i=0; i < POPULATION_SIZE; i++) {
    population[i].checkIfMouseOver();
  }
}
  
function keyPressed() {
  if (key == 'g' || key == 'G') {
    new_generation();
  }
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
    if (dist(this.x, this.y, mouseX, mouseY) < 25) {
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
    // Draw car
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    if (this.selected) {
      image(redCarImg, 0, 0);
    }
    else {
      image(yellowCarImg, 0, 0);
    }
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

    // Shoot rays from car and calculate the length of each ray from car to the wall
    this.particle.update(this.x, this.y, this.angle);
    let dist_array = this.particle.look(walls);
    
    // Collision array, car is in collision if any of the values are less than the array: [26,  5,  5,  17,  17]
    // Check if car is in collision using distance to walls
    if (dist_array[0] < 26 || dist_array[1] < 5 || dist_array[2] < 5 || dist_array[3] < 17 | dist_array[4] < 17 ) {
      this.kill();
      population_alive--;
    }

    // Predict action to take using neural network of car
    let results = this.nn.classifySync(dist_array);
    let predictedAction = results[0].label;

    switch (predictedAction) {
      case 'left':
        this.rotateLeft();
        break;
      case 'right':
        this.rotateRight();
        break;
      case 'drive':    
        this.drive();
        break;
      case 'brake':
        this.brake();
        break;
    }
  }
}
