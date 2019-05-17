class Node {
  constructor(x, y, name, marked, forbidden, starting) {
    this.pos = createVector(x, y);
    this.controllable = true;
    this.highlight = false;
    // this.index = 0;
    this.name = name;
    this.forbidden = forbidden || false;
    this.marked = marked || false;
    this.starting = starting || false;
    this.in = [];
    this.out = [];
    this.radius = 22;
  }

  show() {
    push();
    fill(255);
    strokeWeight(1);
    if (this.marked) strokeWeight(3);
    stroke(30);
    if (this.highlight) stroke(255, 100, 50);
    circle(this.pos.x, this.pos.y, this.radius * 2);
    strokeWeight(1);
    fill(10);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(16);
    text(this.name, this.pos.x, this.pos.y);
    if (this.forbidden) {
      stroke(10);
      line(this.pos.x - this.radius,
        this.pos.y - this.radius,
        this.pos.x + this.radius,
        this.pos.y + this.radius);
      line(this.pos.x - this.radius,
        this.pos.y + this.radius,
        this.pos.x + this.radius,
        this.pos.y - this.radius);
    }
    if (this.starting) {
      stroke(10);
      translate(this.pos.x - 30, this.pos.y - 30);
      rotate(QUARTER_PI);
      let endPos = 30 * cos(QUARTER_PI);
      line(0, 0, endPos, 0);
      triangle(endPos - 10, -5, endPos - 10, 5, endPos, 0);
    }
    pop();
  }

  checkControllability() {
    this.controllable = true;
    for (let arc of this.out) {
      if (!arc.controllable) this.controllable = false;
    }
    return this.controllable;
  }

  changePos(newX, newY) {
    this.pos.x = newX;
    this.pos.y = newY;
  }
}