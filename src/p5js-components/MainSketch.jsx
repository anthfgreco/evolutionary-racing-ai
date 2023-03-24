import Sketch from "react-p5";

let maxCanvasWidth = 1000;
let maxCanvasHeight = 750;
let scale;
let yellowCarImg, blueCarImg, sportsCarImg;
let extraCanvas;

let walls = [];

let width, height;

export default function MainSketch({ xspeed }) {
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  function preload(p5) {
    yellowCarImg = p5.loadImage("img/yellowcar.png");
    blueCarImg = p5.loadImage("img/bluecar.png");
    sportsCarImg = p5.loadImage("img/SportsRacingCar_1.png");
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  function setup(p5, canvasParentRef) {
    // Create a 1000x750 canvas, scaled down if the screen is smaller
    scale = p5.constrain(screen.width / maxCanvasWidth, 0, 1);
    width = maxCanvasWidth * scale;
    height = maxCanvasHeight * scale;
    p5.createCanvas(width, height).parent(canvasParentRef);
    extraCanvas = p5.createGraphics(width, height).parent(canvasParentRef);

    // This one line increases the speed of the simulation by 2-3x.
    // CPU is dramatically faster than webgl in this case because my models are extremely small and
    // the overhead of transferring data to the GPU is surprisingly large.
    tf.setBackend("cpu");

    createBoxRaceTrack(p5, 0);

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
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  function draw(p5) {
    p5.scale(scale);
    p5.background("#CCC9C0");
    p5.image(extraCanvas, 0, 0);

    // Draw the walls
    for (let wall of walls) {
      wall.show(p5);
    }
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  /**
   * Creates four Wall objects that form a rectangle around the canvas.
   * @param p5
   * @param {number} z distance from the edge of the canvas to the walls
   */
  function createBoxRaceTrack(p5, z) {
    let topLeft = p5.createVector(z, z);
    let topRight = p5.createVector(width - z, z);
    let bottomLeft = p5.createVector(z, height - z);
    let bottomRight = p5.createVector(width - z, height - z);
    walls.push(
      new Wall(p5, topLeft.x, topLeft.y, topRight.x, topRight.y),
      new Wall(p5, topRight.x, topRight.y, bottomRight.x, bottomRight.y),
      new Wall(p5, bottomRight.x, bottomRight.y, bottomLeft.x, bottomLeft.y),
      new Wall(p5, bottomLeft.x, bottomLeft.y, topLeft.x, topLeft.y)
    );
  }

  return <Sketch preload={preload} setup={setup} draw={draw} />;
}
