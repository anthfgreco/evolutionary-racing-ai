// Simulation variables - to be able to be changed by user in future
let populationSize = 50;
let mutationProbability = 0.1;
let mutationAmount = 0.5;
let numChampions = 2;
let timePerGeneration = 10;
let simulationSpeed = 1;
let drawRays = false;
let drawCheckpoints = false;

let generation_num = 1;
let state = "player-drive";
let stats_padding, stats_x1, stats_y1, stats_x2, stats_y2;
let population = []; // population is an array of AIVehicle objects, sorted by greatest to least fitness
let walls = []; // walls is an array that holds an array of Walls objects, each array is a continuous line
let fps = 60;
let averageSpeed = 0;
let populationAlive = populationSize;
let timer = timePerGeneration;
let saved_nn;
let checkpointSize = 110;
let clickedPoints = [];

function preload() {
  yellowCarImg = loadImage("img/yellowcar.png");
  redCarImg = loadImage("img/redcar.png");
  blueCarImg = loadImage("img/bluecar.png");
  whiteCarImg = loadImage("img/whitecar.png");
}

// Setup is ran once at the beginning of the page being loaded
function setup() {
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

// Draw is ran every frame
function draw() {
  for (let n = 0; n < simulationSpeed; n++) {
    background(40);
    if (frameCount % 60 == 0 && timer > 0) timer--;

    walls.forEach((w) => {
      w.show();
    });

    if (drawCheckpoints) {
      push();
      textSize(20);
      textAlign(CENTER);
      noStroke();
      checkpoints.map((c, i) => {
        fill(255, 50);
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
      if (averageSpeed <= 0.05 && timer < timePerGeneration - 2) {
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

function newGeneration() {
  updateAlert("");
  timer = timePerGeneration;
  populationAlive = populationSize;

  if (state == "player-drive") {
    generation_num = 1;
    population = [];
    for (let i = 0; i < populationSize; i++) {
      population.push(new AIVehicle());
    }
    state = "generation_training";
    return;
  }

  sortPopulationByFitness();
  console.log(
    "Gen " + generation_num + ": " + population[0].fitness + " fitness"
  );

  // Population length is 1 after a race
  let numUnaltered = min(numChampions, population.length);

  // Carry over to the next generation with no mutations (0 to numUnaltered)
  for (let i = 0; i < numUnaltered; i++) {
    population[i] = new AIVehicle(population[i].getNeuralNetwork());
  }

  // The rest of the population will be mutations of the champions (numUnaltered to populationSize)
  for (let i = numUnaltered; i < populationSize; i++) {
    let championIndex = Math.floor(Math.random() * numUnaltered);
    let nn = population[championIndex].getNeuralNetwork();
    // let variableMutation = map(
    //   i,
    //   numUnaltered,
    //   populationSize - 1,
    //   mutationRateRange[0],
    //   mutationRateRange[1]
    // );
    nn.mutate(mutationProbability, mutationAmount);
    population[i] = new AIVehicle(nn);
  }

  state = "generation_training";
  generation_num++;
}

function saveBestVehicle() {
  if (state == "player-drive") {
    console.log("Initialize a population first!");
    updateAlert("Initialize a population first!");
  }

  if (state == "generation_training" || state == "race") {
    sortPopulationByFitness();
    saved_nn = population[0].getNeuralNetwork();
    updateAlert("");
  }
}

function raceSavedVehicle() {
  if (!saved_nn) {
    console.log("No saved vehicle!");
    updateAlert("No saved vehicle!");
  } else {
    state = "race";
    player = new PlayerVehicle();
    population = [];
    population[0] = new AIVehicle(saved_nn, true);
    populationAlive = 1;
    timer = Infinity;
  }
}

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

function sortPopulationByFitness() {
  population.sort(function (a, b) {
    return b.fitness - a.fitness;
  });
}

function updateAlert(text) {
  $("#alert-div").text(text);
}

function getRandomInt(min, max) {
  // The maximum is exclusive and the minimum is inclusive
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

function mouseClicked() {
  padding = 5;
  if (mouseX < padding) mouseX = 0;
  if (mouseX > width - padding) mouseX = width;
  if (mouseY < padding) mouseY = 0;
  if (mouseY > height - padding) mouseY = height;

  console.log(mouseX, mouseY);

  clickedPoints.push({ x: mouseX, y: mouseY });

  // if (clickedPoints.length >= 2) {
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
