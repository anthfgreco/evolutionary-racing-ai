export default class Wall {
  constructor(p5, x1, y1, x2, y2) {
    this.a = p5.createVector(x1, y1);
    this.b = p5.createVector(x2, y2);
  }

  show(p5) {
    p5.push();
    p5.strokeWeight(7);
    p5.stroke("#1F2022");
    p5.line(this.a.x, this.a.y, this.b.x, this.b.y);
    p5.pop();
  }
}
