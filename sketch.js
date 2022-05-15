let carImg;
let turningSpeed = 3;
let maxSpeed = 7;
let drivingAccel = 0.1;
let brakingAccel = 0.1;
let frictionAccel = 0.03;
let walls = [];
let particle;
let nn;
//points = [[25, 35], [402, 49],[645, 49],[726, 219],[949, 70],[1219, 78],[1254, 855],[865, 847],[872, 704],[1011, 626],[849, 510],[608, 673],[579, 881],[74, 886], [25, 35]];
//points2 = [[136, 161],[539, 168],[703, 341],[983, 194],[1118, 196],[1132, 755],[1027, 755],[1103, 631],[1045, 484],[841, 358], [501, 540], [443, 780], [184, 782], [136, 161]]

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

  particle = new Particle();

  player = new Vehicle(100, 110);
  carImg = loadImage("car.png");

  let options = {
    task: "classification",
    debug: true,
  };
  nn = ml5.neuralNetwork(options);
}

function draw() {
  if (keyIsDown(LEFT_ARROW)) {
    player.rotateLeft();
  }
  else if (keyIsDown(RIGHT_ARROW)) {
    player.rotateRight();
  }
  else if (keyIsDown(UP_ARROW)) {
    player.drive();
  }
  else if (keyIsDown(32)) {
    player.brake();
  }
  //else {
  //  player.nothing();
  //}

  background(50);

  for (let wall of walls) {
    wall.show();
  }

  player.update();
}

function keyPressed() {
  //If T is pressed, train the neural network to use the training data you've given it.
  if (key == "t") {
    nn.normalizeData();
    let options = {
      epochs: 15,
    };
    nn.train(options, whileTraining, finishedTraining);
  }
}

function mouseClicked() {
  //points2.push([mouseX, mouseY]);
  //console.log(points2);
}

function whileTraining(epoch, loss) {
  //state = 'training';
  console.log(epoch);
}

function finishedTraining() {
  console.log("finished training!");
  //state = 'prediction'
  // Return the car to the starting point on the track and have it drive itself.
  player.turnOnSelfDrive();
}

function handleResults(error, result) {
  if (error) {
    console.error(error);
    return;
  }
  //console.log(result); // {label: 'red', confidence: 0.8};
  let predictedAction = result[0].label;
  console.log(predictedAction);
  
  switch (predictedAction) {
    case 'left':
      player.rotateLeft();
      break;
    case 'right':
      player.rotateRight();
      break;
    case 'drive':    
      player.drive();
      break;
    case 'brake':
      player.brake();
      break;
    //case 'nothing':
    //  player.nothing();
  }
}
  
// Class for vehicle display and control
// Vehicle begins pointing in the positive X direction
class Vehicle {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.currentSpeed = 0;
    this.action = "drive";
    this.canSelfDrive = false;
    this.angle = 0;
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
  
  turnOnSelfDrive() {
    this.currentSpeed = 0;
    this.canSelfDrive = true;
  }

  update() {
    // Draw car
    push();
    translate(this.position.x, this.position.y);
    rotate(this.angle);
    image(carImg, 0, 0);
    pop();

    // Update position of car
    this.position.x +=
      this.currentSpeed * Math.cos((this.angle * Math.PI) / 180);
    this.position.y +=
      this.currentSpeed * Math.sin((this.angle * Math.PI) / 180);

    // Don't allow car to go out of bounds
    if (this.position.x < 0) this.position.x = 0;
    if (this.position.x > width) this.position.x = width;
    if (this.position.y < 0) this.position.y = 0;
    if (this.position.y > height) this.position.y = height;
    
    // Velocity dampening from friction
    this.currentSpeed -= frictionAccel;
    if (this.currentSpeed < frictionAccel) {
      this.currentSpeed = 0;
    }

    particle.update(this.position.x, this.position.y, this.angle);
    let dist_array = particle.look(walls);
    //console.log(dist_array);

    // Don't add speed! For some reason it messes the NN up
    const inputs = dist_array;
    
    const output = {
      action: this.action,
    };
  
    //console.log(inputs); 
    //if (inputs[0] < 34) {
    //  console.log('dead');
    //}
    console.log(this.action);
    
    if (this.canSelfDrive) {
      nn.classify(inputs, handleResults);
    } 
    else {
      nn.addData(inputs, output);
      //console.log(nn.neuralNetworkData.data);
    }
  }
}
