import Sketch from "react-p5";

let x = 0;
let width = 1000;
let height = 750;
let scale;

function Canvas({ xspeed }) {
  function setup(p5, canvasParentRef) {
    // Canvas resizing, mainly for mobile and small screens
    scale = p5.constrain(screen.width / width, 0, 1);
    p5.createCanvas(width * scale, height * scale).parent(canvasParentRef);
  }

  function draw(p5) {
    p5.scale(scale);
    p5.background(255, 130, 20);
    p5.ellipse(x, 300, 100);
    p5.ellipse(300, 100, 100);
    x += xspeed;
  }

  return <Sketch setup={setup} draw={draw} />;
}

export default Canvas;
