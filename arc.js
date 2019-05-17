class Arc {
  constructor(start, end, name) {
    this.start = start;
    this.end = end;
    this.name = name;
    this.controllable = true;
    this.highlight = false;
  }

  show() {
    push();
    stroke(0);
    if (this.highlight) stroke(255, 200, 50);
    line(this.start.pos.x, this.start.pos.y, this.end.pos.x, this.end.pos.y);
    if (!this.controllable) fill(255, 100, 50);
    else fill(0);
    noStroke();
    textSize(16);
    let textPos = this.getPos();
    textPos.y -= 10;
    textPos.x += 10;
    text(this.name, textPos.x, textPos.y);
    let dir = p5.Vector.sub(this.end.pos, this.start.pos);
    let perc = this.start.radius / dir.mag();
    let arrowPos = p5.Vector.sub(this.end.pos, dir.mult(perc));
    translate(arrowPos.x, arrowPos.y)
    rotate(dir.heading());
    triangle(-10, -5, -10, 5, 0, 0);
    pop();
  }

  getPos() {
    return p5.Vector.sub(this.end.pos, this.start.pos).mult(0.5).add(this.start.pos);
  }
}