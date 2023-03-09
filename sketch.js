// Simulation constant variables
let populationSize = 50;
let elitism = 0.05;
let minMutationRate = 0.02;
let maxMutationRate = 0.1;
let timePerGeneration = 20;
let simulationSpeed = 1;

let drawRays = false;
let showCheckPoints = true;

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

let checkpointSize = 90;
let clickedPoints = [];
let checkpoints = [
  {
    x: 807.5,
    y: 631.5,
  },
  {
    x: 851.5,
    y: 538.5,
  },
  {
    x: 810.5,
    y: 462.5,
  },
  {
    x: 757.5,
    y: 418.5,
  },
  {
    x: 773.5,
    y: 317.5,
  },
  {
    x: 873.5,
    y: 230.5,
  },
  {
    x: 908.5,
    y: 139.5,
  },
  {
    x: 848.5,
    y: 68.5,
  },
  {
    x: 744.5,
    y: 56.5,
  },
  {
    x: 626.5,
    y: 48.5,
  },
  {
    x: 502.5,
    y: 88.5,
  },
  {
    x: 436.5,
    y: 148.5,
  },
  {
    x: 411.5,
    y: 248.5,
  },
  {
    x: 405.5,
    y: 350.5,
  },
  {
    x: 316.5,
    y: 408.5,
  },
  {
    x: 193.5,
    y: 426.5,
  },
  {
    x: 132.5,
    y: 495.5,
  },
  {
    x: 125.5,
    y: 635.5,
  },
  {
    x: 223.5,
    y: 684.5,
  },
  {
    x: 356.5,
    y: 675.5,
  },
  {
    x: 491.5,
    y: 688.5,
  },
  {
    x: 654.5,
    y: 675.5,
  },
];
let wallPoints = [
  [
    {
      x: 149.5,
      y: 740.5,
    },
    {
      x: 831.5,
      y: 736.5,
    },
    {
      x: 912.5,
      y: 719.5,
    },
    {
      x: 958.5,
      y: 680.5,
    },
    {
      x: 986.5,
      y: 618.5,
    },
    {
      x: 986.5,
      y: 518.5,
    },
    {
      x: 952.5,
      y: 453.5,
    },
    {
      x: 897.5,
      y: 432.5,
    },
    {
      x: 837.5,
      y: 403.5,
    },
    {
      x: 832.5,
      y: 353.5,
    },
    {
      x: 875.5,
      y: 318.5,
    },
    {
      x: 972.5,
      y: 234.5,
    },
    {
      x: 992.5,
      y: 127.5,
    },
    {
      x: 974.5,
      y: 65.5,
    },
    {
      x: 925.5,
      y: 38.5,
    },
    {
      x: 833.5,
      y: 10.5,
    },
    {
      x: 683.5,
      y: 8.5,
    },
    {
      x: 447.5,
      y: 30.5,
    },
    {
      x: 335.5,
      y: 158.5,
    },
    {
      x: 335.5,
      y: 269.5,
    },
    {
      x: 315.5,
      y: 315.5,
    },
    {
      x: 257.5,
      y: 359.5,
    },
    {
      x: 142.5,
      y: 379.5,
    },
    {
      x: 78.5,
      y: 406.5,
    },
    {
      x: 36.5,
      y: 445.5,
    },
    {
      x: 16.5,
      y: 522.5,
    },
    {
      x: 20.5,
      y: 630.5,
    },
    {
      x: 41.5,
      y: 698.5,
    },
    {
      x: 91.5,
      y: 731.5,
    },
    {
      x: 149.5,
      y: 740.5,
    },
  ],
  [
    {
      x: 320.5,
      y: 616.5,
    },
    {
      x: 683.5,
      y: 629.5,
    },
    {
      x: 766.5,
      y: 592.5,
    },
    {
      x: 783.5,
      y: 539.5,
    },
    {
      x: 683.5,
      y: 472.5,
    },
    {
      x: 673.5,
      y: 384.5,
    },
    {
      x: 707.5,
      y: 277.5,
    },
    {
      x: 808.5,
      y: 200.5,
    },
    {
      x: 819.5,
      y: 133.5,
    },
    {
      x: 751.5,
      y: 113.5,
    },
    {
      x: 567.5,
      y: 150.5,
    },
    {
      x: 495.5,
      y: 227.5,
    },
    {
      x: 488.5,
      y: 367.5,
    },
    {
      x: 472.5,
      y: 424.5,
    },
    {
      x: 413.5,
      y: 457.5,
    },
    {
      x: 244.5,
      y: 493.5,
    },
    {
      x: 197.5,
      y: 530.5,
    },
    {
      x: 189.5,
      y: 576.5,
    },
    {
      x: 205.5,
      y: 609.5,
    },
    {
      x: 320.5,
      y: 616.5,
    },
  ],
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
  // var canvas = createCanvas(
  //   windowWidth,
  //   document.getElementById("sketch-holder").offsetHeight
  // );
  var canvas = createCanvas(1000, 750);
  canvas.parent("sketch-holder");

  /*
  This one line increases the speed of the simulation by 2-3x. 

  CPU is dramatically faster than webgl in this case because my models are extremely small and 
  the overhead of transferring data to the GPU is surprisingly large.
  */
  tf.setBackend("cpu");

  imageMode(CENTER);
  rectMode(CORNERS);

  createBoxRaceTrack(0);
  //createBoxRaceTrack(150);

  for (let i = 0; i < wallPoints.length; i++) {
    for (let j = 0; j < wallPoints[i].length - 1; j++) {
      walls.push(
        new Wall(
          wallPoints[i][j].x,
          wallPoints[i][j].y,
          wallPoints[i][j + 1].x,
          wallPoints[i][j + 1].y
        )
      );
    }
  }

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

    if (showCheckPoints) {
      push();
      textSize(20);
      textAlign(CENTER);
      noStroke();
      checkpoints.map((c, i) => {
        fill(255, 125);
        circle(c.x, c.y, checkpointSize * 2);
        fill(0);
        text(i + 1, c.x, c.y);
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

function createBoxRaceTrack(z) {
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

function raceSavedVehicle() {
  if (!saved_nn) {
    console.log("No saved vehicle!");
    updateAlert("No saved vehicle!");
  } else {
    state = "race";
    population = [];
    player = new PlayerVehicle();
    population.push(new AIVehicle(saved_nn));
    chosen_vehicles = getChosenVehicles();
    populationAlive = 1;
  }
}

function mouseClicked() {
  padding = 5;
  if (mouseX < padding) {
    mouseX = 0;
  }
  if (mouseX > width - padding) {
    mouseX = width;
  }
  if (mouseY < padding) {
    mouseY = 0;
  }
  if (mouseY > height - padding) {
    mouseY = height;
  }

  console.log(mouseX, mouseY);

  clickedPoints.push({ x: mouseX, y: mouseY });
  wallPoints.push({ x: mouseX, y: mouseY });

  // if (wallPoints.length >= 2) {
  //   walls.push(
  //     new Wall(
  //       wallPoints[wallPoints.length - 1].x,
  //       wallPoints[wallPoints.length - 1].y,
  //       wallPoints[wallPoints.length - 2].x,
  //       wallPoints[wallPoints.length - 2].y
  //     )
  //   );
  // }
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
