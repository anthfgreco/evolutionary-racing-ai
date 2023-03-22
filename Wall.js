class Wall {
  constructor(x1, y1, x2, y2) {
    this.a = createVector(x1, y1);
    this.b = createVector(x2, y2);
  }

  show() {
    push();
    strokeWeight(7);
    stroke("#1F2022");
    line(this.a.x, this.a.y, this.b.x, this.b.y);
    pop();
  }
}
