class Particle {
  constructor() {
    this.pos = createVector(width / 2, height / 2);
    this.rays = [];
    this.dist_array = [];
    this.angle = 0;
  }

  update(x, y, angle) {
    this.pos.set(x, y);
    this.angle = angle;
  }

  look(walls) {
    // Reset distance array
    this.dist_array = [0, 0, 0, 0, 0];
    let i = 0;

    this.rays[0] = (new Ray(this.pos, radians(this.angle)));
    this.rays[1] = (new Ray(this.pos, radians(this.angle + 90)));
    this.rays[2] = (new Ray(this.pos, radians(this.angle - 90)));
    this.rays[3] = (new Ray(this.pos, radians(this.angle + 45)));
    this.rays[4] = (new Ray(this.pos, radians(this.angle - 45)));

    for (let ray of this.rays) {
      let closest = null;
      let record = Infinity;

      for (let wall of walls) {
        let pt = ray.cast(wall);
        if (pt) {
          const d = p5.Vector.dist(this.pos, pt);
          if (d < record) {
            closest = pt;
            record = d;
          }
        }
      }

      if (closest) {
        stroke(255, 100);
        strokeWeight(4);
        line(this.pos.x, this.pos.y, closest.x, closest.y);
        
        this.dist_array[i] = dist(this.pos.x, this.pos.y, closest.x, closest.y);
      } 
      i = i + 1;
    }

    this.rays = [];
    return this.dist_array;
  }

  show() {
    noStroke();
    fill(255);
    ellipse(this.pos.x, this.pos.y, 16);
  }
}
