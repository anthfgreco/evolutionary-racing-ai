let turningSpeed = 3;
let maxSpeed = 7;
let drivingAccel = 0.1;
let brakingAccel = 0.1;
let frictionAccel = 0.03;
let walls = [];
let nn;
let state = 'player_input';
points = [[25, 35], [402, 49],[645, 49],[726, 219],[949, 70],[1219, 78],[1254, 855],[865, 847],[872, 704],[1011, 626],[849, 510],[608, 673],[579, 881],[74, 886], [25, 35]];
points2 = [[136, 161],[539, 168],[703, 341],[983, 194],[1118, 196],[1132, 755],[1027, 755],[1103, 631],[1045, 484],[841, 358], [501, 540], [443, 780], [184, 782], [139, 161]]
let nn_options = {
  inputs: 5,
  outputs: ['left', 'right', 'drive'],
  task: "classification",
  noTraining: true
};
let pop_size = 25;

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  imageMode(CENTER);
  rectMode(CORNERS);
  
  walls.push(new Boundary(0, 0, width, 0));
  walls.push(new Boundary(width, 0, width, height));
  walls.push(new Boundary(width, height, 0, height));
  walls.push(new Boundary(0, height, 0, 0));

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
  
  // List of all vehicle objects
  population = [];

  for (let i=0; i < pop_size; i++) {
    population.push(new Vehicle(100, 100, ml5.neuralNetwork(nn_options)));
  }

  yellowCarImg = loadImage("car.png");
  redCarImg = loadImage("redcar.png");
}

function new_generation() {
  chosen_vehicles = [];
  
  for (let i=0; i < pop_size; i++) {
    if (population[i].selected) {
      chosen_vehicles.push(population[i]);
    };
  }

  if (chosen_vehicles.length == 0) {
    console.log("no cars selected!");
    return;
  }

  // If only one vehicle is selected, copy and mutate its neural network for the
  // entire population
  if (chosen_vehicles.length == 1) {
    for (let i=0; i < pop_size; i++) {
      let new_nn = chosen_vehicles[0].getNeuralNetwork();
      new_nn.mutate(0.05);
      population[i] = (new Vehicle(100, 100, new_nn));
    }
  }
  else {
    for (let i=0; i < pop_size; i++) {
      let new_nn = chosen_vehicles[0].getNeuralNetwork().crossover(chosen_vehicles[1].getNeuralNetwork());
      new_nn.mutate(0.05);
      population[i] = (new Vehicle(100, 100, new_nn));
    }
  }
}

function draw() {
  background(50);

  for (let wall of walls) {
    wall.show();
  }

  for (let i=0; i < pop_size; i++) {
    population[i].update();
  }
}

function mouseClicked() {
  for (let i=0; i < pop_size; i++) {
    population[i].checkIfMouseOver();
  }
  //mouseX, mouseY
}
  
function keyPressed() {
  if (key == 'g') {
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
    this.angle -= turningSpeed;
    this.action = "left";
  }

  rotateRight() {
    this.angle += turningSpeed;
    this.action = "right";
  }

  drive() {
    // Applies forward force to car
    // Doesn't allow car to go over max speed
    if (this.currentSpeed + drivingAccel < maxSpeed) {
      this.currentSpeed += drivingAccel;
    }
    this.action = "drive";
  }

  brake() {
    // Applies braking (backwards) force to car
    // Doesn't allow car to reverse
    this.currentSpeed -= brakingAccel;
    if (this.currentSpeed < brakingAccel) {
      this.currentSpeed = 0;
    }
    this.action = "brake";
  }
  
  //nothing() {
  //  this.action = "nothing";
  //}

  kill() {
    this.alive = false;
  }

  checkIfMouseOver() {
    if (dist(this.x, this.y, mouseX, mouseY) < 25) {
      this.selected = true;
    }
  }

  getNeuralNetwork() {
    return this.nn.copy();
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
    this.x +=
      this.currentSpeed * Math.cos((this.angle * Math.PI) / 180);
    this.y +=
      this.currentSpeed * Math.sin((this.angle * Math.PI) / 180);

    // Don't allow car to go out of bounds
    //if (this.x < 0) this.x = 0;
    //if (this.x > width) this.x = width;
    //if (this.y < 0) this.y = 0;
    //if (this.y > height) this.y = height;
    
    // Velocity dampening from friction
    this.currentSpeed -= frictionAccel;
    if (this.currentSpeed < frictionAccel) {
      this.currentSpeed = 0;
    }

    this.particle.update(this.x, this.y, this.angle);
    let dist_array = this.particle.look(walls);
    //console.log(dist_array);

    // Collision array [26,  5,  5,  17,  17]
    // Check if collision
    if (dist_array[0] < 26 || dist_array[1] < 5 || dist_array[2] < 5 || dist_array[3] < 17 | dist_array[4] < 17 ){
      this.kill();
    }

    const results = this.nn.classifySync(dist_array);
    
    let predictedAction = results[0].label;
    //console.log(predictedAction);

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
