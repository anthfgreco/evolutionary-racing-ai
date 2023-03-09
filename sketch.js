// Simulation constant variables
let populationSize = 60;
let elitism = 0.1;
let minMutationRate = 0.01;
let maxMutationRate = 0.2;
let timePerGeneration = 15;
let simulationSpeed = 1;

let drawRays = false;

let saved_nn;

let stats_padding, stats_x1, stats_y1, stats_x2, stats_y2;

// Simulation variables
let generation_num = 1;
let state = "player-drive";
let population = [];
let walls = [];
let fps = 60;
let averageSpeed = 0;
let totalSpeed = 0;
let populationAlive = populationSize;
let timer = timePerGeneration;

let showCheckPoints = true;
let checkpointSize = 180;
let pointList = [];
let checkpoints = [
  { x: 1411, y: 735 },
  { x: 1419, y: 505 },
  { x: 1417, y: 324 },
  { x: 1418, y: 126 },
  { x: 1194, y: 115 },
  { x: 947, y: 106 },
  { x: 747, y: 114 },
  { x: 510, y: 97 },
  { x: 296, y: 100 },
  { x: 137, y: 108 },
  { x: 112, y: 276 },
  { x: 108, y: 476 },
  { x: 107, y: 732 },
  { x: 318, y: 738 },
  { x: 575, y: 741 },
  { x: 872, y: 751 },
  { x: 1183, y: 746 },
];

/********************************************************************
 *********************************************************************
 *********************************************************************/

function preload() {
  yellowCarImg = loadImage("img/yellowcar.png");
  redCarImg = loadImage("img/redcar.png");
  blueCarImg = loadImage("img/bluecar.png");
  whiteCarImg = loadImage("img/whitecar.png");
}

// Setup is ran once at the beginning of the page being loaded
function setup() {
  var canvas = createCanvas(
    windowWidth,
    document.getElementById("sketch-holder").offsetHeight
  );
  canvas.parent("sketch-holder");

  /*
  This one line increases the speed of the simulation by 2-3x. 

  CPU is dramatically faster than webgl in this case because my models are extremely small and 
  the overhead of transferring data to the GPU is surprisingly large.
  */
  tf.setBackend("cpu");

  imageMode(CENTER);
  rectMode(CORNERS);
  frameRate(60);

  createBoxRaceTrack(50, 225);

  // Dimensions for stats box when training
  stats_padding = 10;
  stats_x1 = 25;
  stats_y1 = height - 160;
  stats_x2 = stats_x1 + 200;
  stats_y2 = stats_y1 + 140;

  player = new PlayerVehicle();
}

/********************************************************************
 *********************************************************************
 *********************************************************************/

// Draw is ran every frame
function draw() {
  for (let n = 0; n < simulationSpeed; n++) {
    background(40);
    if (frameCount % 60 == 0 && timer > 0) timer--;

    for (let wall of walls) {
      wall.show();
    }

    // Debug checkpoints
    if (showCheckPoints) {
      push();
      checkpoints.map((c, i) => {
        fill(255);
        circle(c.x, c.y, checkpointSize);
        noStroke();
        fill(0);
        textSize(20);
        textAlign(CENTER);
        text(i, c.x, c.y);
      });
      pop();
    }

    if (state == "player-drive") {
      player.update();
      player.show();
    }

    if (state == "generation_training") {
      let totalSpeed = 0;

      for (let i = 0; i < populationSize; i++) {
        population[i].update();
        population[i].show();
        totalSpeed += population[i].getVel();
      }

      if (populationAlive == 0) averageSpeed = 0;
      else averageSpeed = totalSpeed / populationAlive;

      drawStatsBox();

      if (timer == 0) {
        newGeneration();
      }
      if (averageSpeed <= 0.02 && timer < timePerGeneration - 2) {
        newGeneration();
      }
    }

    if (state == "race") {
      population[0].update();
      population[0].show();
      player.update();
      player.show();
    }
  }
}

/********************************************************************
 *********************************************************************
 *********************************************************************/

function createBoxRaceTrack(a, b) {
  const args = [...arguments];

  args.forEach((z) => {
    let topLeft = createVector(z, z);
    let topRight = createVector(width - z, z);
    let bottomLeft = createVector(z, height - z);
    let bottomRight = createVector(width - z, height - z);
    walls.push(
      new Wall(topLeft.x, topLeft.y, topRight.x, topRight.y),
      new Wall(topRight.x, topRight.y, bottomRight.x, bottomRight.y),
      new Wall(bottomRight.x, bottomRight.y, bottomLeft.x, bottomLeft.y),
      new Wall(bottomLeft.x, bottomLeft.y, topLeft.x, topLeft.y)
    );
  });
}

function drawStatsBox() {
  // Draw box around stats
  fill(0, 99);
  noStroke();
  rect(
    stats_x1 - stats_padding,
    stats_y1 - stats_padding,
    stats_x2 + stats_padding,
    stats_y2 + stats_padding
  );

  if (frameCount % 10 == 0) fps = round(getFrameRate());

  push();
  textSize(20);
  fill(255);
  textAlign(LEFT);
  noStroke();
  let s =
    `Generation: ${generation_num}\n` +
    `Population: ${populationSize}\n` +
    `Alive: ${populationAlive}\n` +
    `Average Speed: ${round(averageSpeed, 2)}\n` +
    `Frame Rate: ${fps}\n` +
    `Generation Time: ${timer}s`;

  text(s, stats_x1, stats_y1, stats_x2, stats_y2);
  pop();
}

// `Mutation Rate: ${(MUTATION_RATE * 100).toFixed(2)}%\n` +

function initializeRandomPopulation() {
  updateAlert("");
  state = "generation_training";
  generation_num = 1;
  population = [];
  for (let i = 0; i < populationSize; i++) {
    population.push(new AIVehicle());
  }
  populationAlive = populationSize;
}

function raceSavedVehicle() {
  if (!saved_nn) {
    console.log("No saved vehicle!");
    updateAlert("No saved vehicle!");
  } else {
    state = "race";
    population = [];
    player = new PlayerVehicle();
    population.push(new AIVehicle(saved_nn));
    populationAlive = 1;
  }
}

function getChosenVehicles() {
  chosen_vehicles = [];
  if (state == "player-drive") {
    console.log("Initialize population first!");
    updateAlert("Initialize population first!");
  }
  if (state == "generation_training") {
    population.sort(function (a, b) {
      return b.fitness - a.fitness;
    });
    for (let i = 0; i < populationSize * elitism; i++) {
      chosen_vehicles.push(population[i]);
    }
  }
  if (state == "race") {
    if (population[0]) chosen_vehicles.push(population[0]);
  }
  return chosen_vehicles;
}

function newGeneration() {
  if (state == "player-drive") {
    console.log("Initialize population first!");
    updateAlert("Initialize a population first!");
    return;
  }

  timer = timePerGeneration;
  updateAlert("");
  generation_num++;
  populationAlive = populationSize;

  chosen_vehicles = getChosenVehicles();

  console.log(
    "Generation " + generation_num + " fitness: " + chosen_vehicles[0].fitness
  );

  // Copy and mutate its neural network for the entire population
  // The chosen parent lives unmutated in the next generation (elitism)
  if (chosen_vehicles.length == 1) {
    population[0] = new AIVehicle(chosen_vehicles[0].getNeuralNetwork(), true);
    for (let i = 1; i < populationSize; i++) {
      let child_nn = chosen_vehicles[0].getNeuralNetwork();
      variableMutation = map(
        i,
        1,
        populationSize - 1,
        minMutationRate,
        maxMutationRate
      );
      child_nn.mutate(variableMutation);
      population[i] = new AIVehicle(child_nn);
    }
  }
  // Randomly pick two chosen vehicles and cross and mutate their neural networks
  // Two of the chosen parents live unmutated in the next generation (elitism)
  else {
    population[0] = new AIVehicle(chosen_vehicles[0].getNeuralNetwork(), true);
    population[1] = new AIVehicle(chosen_vehicles[1].getNeuralNetwork());
    for (let i = 2; i < populationSize; i++) {
      let parent_1 =
        chosen_vehicles[Math.floor(Math.random() * chosen_vehicles.length)];
      let parent_2 =
        chosen_vehicles[Math.floor(Math.random() * chosen_vehicles.length)];
      let nn_1 = parent_1.getNeuralNetwork();
      let nn_2 = parent_2.getNeuralNetwork();
      nn_1.crossover(nn_2);
      variableMutation = map(
        i,
        2,
        populationSize - 1,
        minMutationRate,
        maxMutationRate
      );
      nn_1.mutate(variableMutation);
      population[i] = new AIVehicle(nn_1);
    }
  }

  state = "generation_training";
}

function saveBestVehicle() {
  if (state == "player-drive") {
    console.log("Initialize a population first!");
    updateAlert("Initialize a population first!");
  }

  if (state == "generation_training" || state == "race") {
    chosen_vehicles = getChosenVehicles();
    saved_nn = chosen_vehicles[0].getNeuralNetwork();
    updateAlert("");
  }
}

function mouseClicked() {
  pointList.push([mouseX, mouseY]);
  //   if (state == "generation_training") {
  //     for (let i = 0; i < populationSize; i++) {
  //       population[i].checkIfMouseOver();
  //     }
  //   }

  //   if (state == "race") {
  //     population[0].checkIfMouseOver();
  //   }
}

function keyPressed() {
  key = key.toUpperCase();
  switch (key) {
    case "I":
      initializeRandomPopulation();
      break;
    case "G":
      newGeneration();
      break;
    case "S":
      saveBestVehicle();
      break;
    case "R":
      raceSavedVehicle();
      break;
  }
}

function updateAlert(text) {
  $("#alert-div").text(text);
}
