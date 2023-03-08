let populationSize = 50;
let elitePercent = 0.1;
let minMutationRate = 0.01;
let maxMutationRate = 0.1;
let simulationSpeed = 2;

let state = "player-drive";
let generation_num = 1;
let populationAlive = populationSize;
let drawRays = false;

let saved_nn;

let population = [];
let walls = [];

let stats_padding, stats_x1, stats_y1, stats_x2, stats_y2;
let fps = 0;
let averageSpeed = 0;
let totalSpeed = 0;

let timePerGeneration = 20;
let timer = timePerGeneration;

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

  // Draw outer walls
  // z = 50;
  // walls.push(new Wall(z, z, width - z, z));
  // walls.push(new Wall(z, height - z, width - z, height - z));
  // walls.push(new Wall(width - z, z, width - z, height - z));
  // walls.push(new Wall(z, z, z, height - z));

  // Draw inner walls
  //z = 300;
  // walls.push(new Wall(z, z, width - z, z));
  // walls.push(new Wall(z, height - z, width - z, height - z));
  // walls.push(new Wall(width - z, z, width - z, height - z));
  // walls.push(new Wall(z, z, z, height - z));

  // let topLeft = createVector(z, z);
  // let topRight = createVector(width - z, z);
  // let bottomLeft = createVector(z, height - z);
  // let bottomRight = createVector(width - z, height - z);

  // Outer walls
  z = 50;
  let topLeft = createVector(z, z);
  let topRight = createVector(width - z, z);
  let bottomLeft = createVector(z + 150, height - z + 50);
  let bottomRight = createVector(width - z, height - z);

  walls.push(new Wall(topLeft.x, topLeft.y, topRight.x, topRight.y));
  walls.push(new Wall(topRight.x, topRight.y, bottomRight.x, bottomRight.y));
  walls.push(
    new Wall(bottomRight.x, bottomRight.y, bottomLeft.x, bottomLeft.y)
  );
  walls.push(new Wall(bottomLeft.x, bottomLeft.y, topLeft.x, topLeft.y));

  // Inner walls
  z = 300;
  topLeft = createVector(z - 50, z - 90);
  topRight = createVector(width - z + 122, z - 100);
  bottomLeft = createVector(z + 35, height - z + 75);
  bottomRight = createVector(width - z + 120, height - z + 130);

  walls.push(new Wall(topLeft.x, topLeft.y, topRight.x, topRight.y));
  walls.push(new Wall(topRight.x, topRight.y, bottomRight.x, bottomRight.y));
  walls.push(
    new Wall(bottomRight.x, bottomRight.y, bottomLeft.x, bottomLeft.y)
  );
  walls.push(new Wall(bottomLeft.x, bottomLeft.y, topLeft.x, topLeft.y));

  // walls.push(new Wall(z, z, width - z, z));
  // walls.push(new Wall(z, height - z, width - z, height - z));
  // walls.push(new Wall(width - z, z, width - z, height - z));
  // walls.push(new Wall(z, z, z, height - z));

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
    background(60);
    if (frameCount % 60 == 0 && timer > 0) timer--;

    if (walls.length == 8 && timer > timePerGeneration - 4) {
      let w = width * 0.73;
      let h = height * 0.85;
      walls.push(new Wall(w, h - 50, w, h + 50));
    }

    if (walls.length == 9 && timer < timePerGeneration - 4) {
      walls.pop();
    }

    for (let wall of walls) {
      wall.show();
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

  if (frameCount % 50 == 0) fps = round(frameRate());

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
    for (let i = 0; i < populationSize * elitePercent; i++) {
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
  state = "generation_training";
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

// function mouseClicked() {
//   if (state == "generation_training") {
//     for (let i = 0; i < populationSize; i++) {
//       population[i].checkIfMouseOver();
//     }
//   }

//   if (state == "race") {
//     population[0].checkIfMouseOver();
//   }
// }

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
