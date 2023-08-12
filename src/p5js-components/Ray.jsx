export default class Ray {
  constructor() {
    this.pos;
    this.dir;
  }

  setPos(pos) {
    this.pos = pos;
  }

  setAngle(angle) {
    this.dir = p5.Vector.fromAngle(angle);
  }

  /**
   * Calculates the intersection point between a ray and a wall.
   * Algorithm from https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection
   * @param p5
   * @param {Wall} wall wall to cast ray against.
   * @returns {(p5.Vector|boolean)} The intersection point as a p5.Vector if it exists, or false if no intersection is found.
   */
  cast(p5, wall) {
    const x1 = wall.a.x;
    const y1 = wall.a.y;
    const x2 = wall.b.x;
    const y2 = wall.b.y;

    const x3 = this.pos.x;
    const y3 = this.pos.y;
    const x4 = this.pos.x + this.dir.x;
    const y4 = this.pos.y + this.dir.y;

    const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

    if (den === 0) return false;

    const invDen = 1 / den;

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) * invDen;

    if (t < 0 || t > 1) return false;

    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) * invDen;

    if (u > 0) {
      return p5.createVector(x1 + t * (x2 - x1), y1 + t * (y2 - y1));
    } else {
      return false;
    }
  }
}
