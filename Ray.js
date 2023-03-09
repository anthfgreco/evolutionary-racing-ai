class Ray {
  constructor(pos, angle) {
    this.pos = pos;
    this.dir = p5.Vector.fromAngle(angle);
  }

  cast(wall) {
    const x1 = wall.a.x;
    const y1 = wall.a.y;
    const x2 = wall.b.x;
    const y2 = wall.b.y;

    const x3 = this.pos.x;
    const y3 = this.pos.y;
    const x4 = this.pos.x + this.dir.x;
    const y4 = this.pos.y + this.dir.y;

    // const den1 = (x1 - x2) * (y3 - y4);
    // const den2 = (y1 - y2) * (x3 - x4);
    const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (den === 0) return null;

    // const t1 = (x1 - x3) * (y3 - y4);
    // const t2 = (y1 - y3) * (x3 - x4);
    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;

    if (t < 0 || t > 1) {
      return createVector(2000, 2000);
    }

    // const u1 = (x1 - x2) * (y1 - y3);
    // const u2 = (y1 - y2) * (x1 - x3);
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;

    if (u > 0 && t > 0 && t < 1) {
      return createVector(x1 + t * (x2 - x1), y1 + t * (y2 - y1));
    } else {
      return createVector(2000, 2000);
    }
  }
}
