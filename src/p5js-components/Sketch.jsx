import ReactP5Sketch from "react-p5";

import AIVehicle from "./AIVehicle";
import NeuralNetwork from "./NeuralNetwork";
import PlayerVehicle from "./PlayerVehicle";
import Wall from "./Wall";
import { checkpoints, wallPoints } from "./Points";

import yellowCarImgURL from "/img/yellowcar.png";
import blueCarImgURL from "/img/bluecar.png";
import sportsCarImgURL from "/img/SportsRacingCar_1.png";

import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  CHECKPOINT_SIZE,
  ATTEMPT_FRAMERATE,
  DRAW_RAYS,
  DRAW_CHECKPOINTS,
  NUM_OF_ELITES,
} from "../constants";

let canvasScale;
let yellowCarImg, blueCarImg, sportsCarImg;
let extraCanvas;
let player;
let gameState;
let pretrained_nn;

let walls = [];
let population = [];

let scaledCanvasWidth, scaledCanvasHeight;

let lastFrameTime = Date.now();

let summedFrameMs = 0;
let lastXFrames = 0;

export default function Sketch({
  populationSize,
  mutationProbability,
  mutationAmount,
  timePerGeneration,
  timeRemaining,
  setTimeRemaining,
  totalTime,
  setTotalTime,
  generationNum,
  setGenerationNum,
  // addData,
}) {
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  function preload(p5) {
    yellowCarImg = p5.loadImage(yellowCarImgURL);
    blueCarImg = p5.loadImage(blueCarImgURL);
    sportsCarImg = p5.loadImage(sportsCarImgURL);
    loadPretrainedModel();
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  function setup(p5, canvasParentRef) {
    // Create a 1000x750 canvas, scaled down if the screen is smaller
    canvasScale = p5.constrain(window.innerWidth / CANVAS_WIDTH, 0, 1);
    scaledCanvasWidth = CANVAS_WIDTH * canvasScale;
    scaledCanvasHeight = CANVAS_HEIGHT * canvasScale;

    p5.createCanvas(scaledCanvasWidth, scaledCanvasHeight).parent(
      canvasParentRef
    );

    // Attempt to maintain 60fps
    p5.frameRate(ATTEMPT_FRAMERATE);

    extraCanvas = p5
      .createGraphics(CANVAS_WIDTH, CANVAS_HEIGHT)
      .parent(canvasParentRef);

    // extraCanvas.background(55);

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

    player = new PlayerVehicle(p5);
    newGeneration(p5);
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  function draw(p5) {
    const currentFrameTime = Date.now();

    // Calculate frame duration.
    const frameDuration = currentFrameTime - lastFrameTime;

    // print the difference in time between the last frame and the current frame
    // console.log("Frame duration: " + frameDuration + "ms");

    // Add the current frame duration to the summed frame duration.
    summedFrameMs += frameDuration;

    if (lastXFrames === 60) {
      const framesPerSecond = Math.round(1000 / (summedFrameMs / 60));
      console.log("Average frame rate: " + framesPerSecond + "fps");
      summedFrameMs = 0;
      lastXFrames = 0;
    }

    lastXFrames += 1;
    lastFrameTime = currentFrameTime;

    if (p5.frameCount % ATTEMPT_FRAMERATE === 0) {
      setTimeRemaining(timeRemaining - 1);
      setTotalTime(totalTime + 1);
    }

    p5.scale(canvasScale);
    // p5.background("#CCC9C0");
    p5.background("#FFFFFF");
    p5.image(extraCanvas, 0, 0);

    // Draw the walls
    for (let i = 0; i < walls.length; i++) {
      walls[i].show(p5);
    }

    // Draw the checkpoints
    if (DRAW_CHECKPOINTS) {
      p5.push();
      p5.textSize(20);
      p5.textAlign(p5.CENTER);
      p5.noStroke();
      for (let i = 0; i < checkpoints.length; i++) {
        p5.fill(25, 50);
        p5.circle(checkpoints[i].x, checkpoints[i].y, CHECKPOINT_SIZE * 2);
        p5.fill(255);
        p5.text(i + 1, checkpoints[i].x, checkpoints[i].y);
      }
      p5.pop();
    }

    if (gameState == "player-drive") {
      player.update(p5, walls, DRAW_RAYS);
      player.show(p5, yellowCarImg, sportsCarImg, extraCanvas);
    }

    if (gameState == "race") {
      player.update(p5, walls, DRAW_RAYS);
      player.show(p5, yellowCarImg, sportsCarImg, extraCanvas);
      population[0].update(p5, walls, DRAW_RAYS, CHECKPOINT_SIZE);
      population[0].show(p5, yellowCarImg, sportsCarImg, extraCanvas);
    }

    if (gameState == "training") {
      for (let i = 0; i < population.length; i++) {
        population[i].update(p5, walls, DRAW_RAYS, CHECKPOINT_SIZE);
        population[i].show(p5, yellowCarImg, sportsCarImg, extraCanvas);
      }

      if (timeRemaining === 0) {
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
    if (population.length == 0) {
      population = [];
      for (let i = 0; i < populationSize; i++) {
        population.push(new AIVehicle(p5));
      }
      gameState = "training";
      return;
    }

    sortPopulationByFitness();

    // addData(population[0].fitness);

    console.log(
      "Gen " + generationNum + ": " + population[0].fitness + " fitness"
    );

    // Population length is 1 after a race
    let numUnaltered = Math.min(NUM_OF_ELITES, population.length);
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

    gameState = "training";
    setTimeRemaining(timePerGeneration);
    setGenerationNum(generationNum + 1);
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
    let topRight = p5.createVector(scaledCanvasWidth - z, z);
    let bottomLeft = p5.createVector(z, scaledCanvasHeight - z);
    let bottomRight = p5.createVector(
      scaledCanvasWidth - z,
      scaledCanvasHeight - z
    );
    walls.push(
      new Wall(p5, topLeft.x, topLeft.y, topRight.x, topRight.y),
      new Wall(p5, topRight.x, topRight.y, bottomRight.x, bottomRight.y),
      new Wall(p5, bottomRight.x, bottomRight.y, bottomLeft.x, bottomLeft.y),
      new Wall(p5, bottomLeft.x, bottomLeft.y, topLeft.x, topLeft.y)
    );
  }

  async function loadPretrainedModel() {
    let pretrainedModel = await tf.loadLayersModel(
      "https://raw.githubusercontent.com/anthfgreco/evolutionary-racing-ai/main/pretrained-model/model.json"
    );
    pretrained_nn = new NeuralNetwork(pretrainedModel, 8, 6, 2);
  }

  function racePretrainedVehicle(p5) {
    gameState = "race";
    player = new PlayerVehicle(p5);
    population = [];
    population[0] = new AIVehicle(p5, pretrained_nn);
  }

  return (
    <ReactP5Sketch
      preload={preload}
      setup={setup}
      draw={draw}
      keyPressed={keyPressed}
    />
  );
}
