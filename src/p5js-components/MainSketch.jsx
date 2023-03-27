import Sketch from "react-p5";

let numChampions = 2;

let drawRays = false;
let drawCheckpoints = false;

let maxCanvasWidth = 1000;
let maxCanvasHeight = 750;
let scale;
let yellowCarImg, blueCarImg, sportsCarImg;
let extraCanvas;
let player;
let state = "player-drive";
let populationAlive;
let pretrained_nn;
let timer;
let checkpointSize = 80;
let generation_num;

let walls = [];
let population = [];

let canvasWidth, canvasHeight;

export default function MainSketch({
  populationSize,
  mutationProbability,
  mutationAmount,
  timePerGeneration,
}) {
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  function preload(p5) {
    yellowCarImg = p5.loadImage("img/yellowcar.png");
    blueCarImg = p5.loadImage("img/bluecar.png");
    sportsCarImg = p5.loadImage("img/SportsRacingCar_1.png");
    loadPretrainedModel();
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  function setup(p5, canvasParentRef) {
    // Create a 1000x750 canvas, scaled down if the screen is smaller
    scale = p5.constrain(window.innerWidth / maxCanvasWidth, 0, 1);
    canvasWidth = maxCanvasWidth * scale;
    canvasHeight = maxCanvasHeight * scale;

    p5.createCanvas(canvasWidth, canvasHeight).parent(canvasParentRef);

    extraCanvas = p5
      .createGraphics(canvasWidth, canvasHeight)
      .parent(canvasParentRef);

    // This one line increases the speed of the simulation by 2-3x.
    // CPU is dramatically faster than webgl in this case because my models are extremely small and
    // the overhead of transferring data to the GPU is surprisingly large.
    tf.setBackend("cpu");

    //createBoxRaceTrack(p5, 0);

    // Draw racetrack from points in Points.js
    // Each inner for loop is a continuous line
    for (let i = 0; i < wallPoints.length; i++) {
      for (let j = 0; j < wallPoints[i].length - 1; j++) {
        walls.push(
          new Wall(
            p5,
            wallPoints[i][j].x,
            wallPoints[i][j].y,
            wallPoints[i][j + 1].x,
            wallPoints[i][j + 1].y
          )
        );
      }
    }

    timer = timePerGeneration;
    player = new PlayerVehicle(p5);
    newGeneration(p5);
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  function draw(p5) {
    p5.scale(scale);
    p5.background("#CCC9C0");
    p5.image(extraCanvas, 0, 0);

    if (p5.frameCount % 60 == 0 && timer > 0) timer--;

    // Draw the walls
    for (let i = 0; i < walls.length; i++) {
      walls[i].show(p5);
    }

    // Draw the checkpoints
    if (drawCheckpoints) {
      p5.push();
      p5.textSize(20);
      p5.textAlign(p5.CENTER);
      p5.noStroke();
      for (let i = 0; i < checkpoints.length; i++) {
        p5.fill(25, 50);
        p5.circle(checkpoints[i].x, checkpoints[i].y, checkpointSize * 2);
        p5.fill(255);
        p5.text(i + 1, checkpoints[i].x, checkpoints[i].y);
      }
      p5.pop();
    }

    if (state == "player-drive") {
      player.update(p5, walls, drawRays);
      player.show(p5, yellowCarImg, sportsCarImg, extraCanvas);
    }

    if (state == "race") {
      player.update(p5, walls, drawRays);
      player.show(p5, yellowCarImg, sportsCarImg, extraCanvas);
      population[0].update(
        p5,
        walls,
        drawRays,
        timer,
        timePerGeneration,
        checkpointSize
      );
      population[0].show(p5, yellowCarImg, sportsCarImg, extraCanvas);
    }

    if (state == "training") {
      for (let i = 0; i < population.length; i++) {
        population[i].update(
          p5,
          walls,
          drawRays,
          timer,
          timePerGeneration,
          checkpointSize
        );
        population[i].show(p5, yellowCarImg, sportsCarImg, extraCanvas);
      }

      if (timer == 0) {
        newGeneration(p5);
      }
    }
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  function keyPressed(p5) {
    let key = p5.key.toUpperCase();
    switch (key) {
      // case "G":
      //   newGeneration();
      //   break;
      // case "R":
      //   raceBestVehicle();
      //   break;
      case "L":
        racePretrainedVehicle(p5);
        break;
    }
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  function newGeneration(p5) {
    timer = timePerGeneration;
    populationAlive = populationSize;

    if (population.length == 0) {
      generation_num = 1;
      population = [];
      for (let i = 0; i < populationSize; i++) {
        population.push(new AIVehicle(p5));
      }
      state = "training";
      return;
    }

    sortPopulationByFitness();

    console.log(
      "Gen " + generation_num + ": " + population[0].fitness + " fitness"
    );

    // Population length is 1 after a race
    let numUnaltered = Math.min(numChampions, population.length);
    let unalteredPopulation = [];

    // Carry over to the next generation with no mutations (0 to numUnaltered)
    for (let i = 0; i < numUnaltered; i++) {
      unalteredPopulation[i] = new AIVehicle(
        p5,
        population[i].getNeuralNetwork()
      );
    }

    population = unalteredPopulation;

    // The rest of the population will be mutations of the champions (numUnaltered to populationSize)
    for (let i = numUnaltered; i < populationSize; i++) {
      let championIndex = Math.floor(Math.random() * numUnaltered);
      let nn = population[championIndex].getNeuralNetwork();
      nn.mutate(mutationProbability, mutationAmount);
      population[i] = new AIVehicle(p5, nn);
    }

    state = "training";
    generation_num++;
  }

  function sortPopulationByFitness() {
    population.sort(function (a, b) {
      return b.fitness - a.fitness;
    });
  }

  /**
   * Creates four Wall objects that form a rectangle around the canvas.
   * @param p5
   * @param {number} z distance from the edge of the canvas to the walls
   */
  function createBoxRaceTrack(p5, z) {
    let topLeft = p5.createVector(z, z);
    let topRight = p5.createVector(canvasWidth - z, z);
    let bottomLeft = p5.createVector(z, canvasHeight - z);
    let bottomRight = p5.createVector(canvasWidth - z, canvasHeight - z);
    walls.push(
      new Wall(p5, topLeft.x, topLeft.y, topRight.x, topRight.y),
      new Wall(p5, topRight.x, topRight.y, bottomRight.x, bottomRight.y),
      new Wall(p5, bottomRight.x, bottomRight.y, bottomLeft.x, bottomLeft.y),
      new Wall(p5, bottomLeft.x, bottomLeft.y, topLeft.x, topLeft.y)
    );
  }

  async function loadPretrainedModel() {
    let pretrainedModel = await tf.loadLayersModel(
      "https://raw.githubusercontent.com/anthfgreco/evolutionary-self-driving/main/pretrained-model/model.json"
    );
    pretrained_nn = new NeuralNetwork(pretrainedModel, 8, 6, 2);
  }

  function racePretrainedVehicle(p5) {
    state = "race";
    player = new PlayerVehicle(p5);
    population = [];
    population[0] = new AIVehicle(p5, pretrained_nn);
    populationAlive = 1;
    timer = Infinity;
  }

  return (
    <Sketch
      preload={preload}
      setup={setup}
      draw={draw}
      keyPressed={keyPressed}
    />
  );
}
