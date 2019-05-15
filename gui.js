class Gui {
  constructor() {
    this.color = [50, 50, 50];
    this.h = 200;
    this.pos = createVector(0, height - this.h);
    this.nodeStats = new NodeStats(this.pos);
    this.arcStats = new ArcStats(this.pos);
  }

  show(element, aut) {
    push();
    if (element != undefined) {
      translate(this.pos.x, this.pos.y);
      fill(...this.color);
      noStroke();
      rect(0, 0, width, this.h);
      if (element instanceof Node) this.nodeStats.show(element, aut);
      if (element instanceof Arc) this.arcStats.show(element, aut);
    } else {
      this.nodeStats.hide();
      this.arcStats.hide();
    }
    pop();
  }

  setStats(elem) {
    if (elem instanceof Node) this.nodeStats.setStats(elem);
    if (elem instanceof Arc) this.arcStats.setStats(elem);
  }

  isInsideGui(x, y) {
    return (x > this.pos.x && x < this.pos.x + width &&
      y > this.pos.y && y < this.pos.y + this.h);
  }

}

class NodeStats {
  constructor(absPosVector) {
    this.nameBox = new TextBox(absPosVector, 100, 30, 50, 20);
    this.mkCheck = createCheckbox("Marked", false).position(absPosVector.x + 55, absPosVector.y + 70)
      .style("color", "#F0F0F0");
    this.forbCheck = createCheckbox("Forbidden", false).position(absPosVector.x + 55, absPosVector.y + 90)
      .style("color", "#F0F0F0");
    this.starting = createCheckbox("Starting", false).position(absPosVector.x + 55, absPosVector.y + 110)
      .style("color", "#F0F0F0");

    this.hide();
  }

  show(node, aut) {
    push();
    fill(230);
    text("x: " + node.pos.x, 20, 30);
    text("y: " + node.pos.y, 20, 50);
    pop();
    this.starting.style('visibility', "visible");
    this.mkCheck.style('visibility', "visible");
    this.forbCheck.style('visibility', "visible");
    let newName = this.nameBox.show(node, aut);
    if (this.mkCheck.checked() != node.marked) aut.changeMarking(node);
    if (this.forbCheck.checked() != node.forbidden) aut.changeForbidden(node);
    if (this.starting.checked() != node.starting) aut.changeStart(node);
    if (newName != undefined) aut.changeNodeName(node, newName);
  }

  setStats(node) {
    this.nameBox.setName(node.name);
    this.mkCheck.checked(node.marked);
    this.forbCheck.checked(node.forbidden);
    this.starting.checked(node.starting);
  }

  hide() {
    this.nameBox.hide();
    this.mkCheck.style('visibility', "hidden");
    this.forbCheck.style('visibility', "hidden");
    this.starting.style('visibility', "hidden");
  }
}

class ArcStats {
  constructor(absPosVector) {
    this.nameBox = new TextBox(absPosVector, 20, 30, 50, 20);
    this.controllable = createCheckbox("Controllable", true)
      .position(absPosVector.x + 150, absPosVector.y + 40)
      .style('visibility', "hidden").style("color", "#F0F0F0");
  }

  show(arc, aut) {
    this.controllable.style('visibility', "visible");
    let newName = this.nameBox.show(arc, aut);
    arc.controllable = this.controllable.checked();
    if (newName != undefined) aut.changeArcName(arc, newName);
  }

  setStats(arc) {
    this.controllable.checked(arc.controllable);
    this.nameBox.setName(arc.name);
  }

  hide() {
    this.controllable.style('visibility', "hidden");
    this.nameBox.hide();
  }
}

class TextBox {
  constructor(absPos, x, y, w, h) {
    this.absPos = absPos;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.title = "Name: ";
    this.text = createInput().position(this.x + this.w - 5, this.absPos.y + this.y).size(this.w, this.h);

    this.hide();
  }

  show(elem) {
    push();
    stroke(0);
    fill(230);
    text(this.title, this.x, this.y - 5);
    this.text.style('visibility', "visible");
    if (this.text.value() != elem.name) return this.text.value();
    pop();
  }

  setName(name) {
    this.text.value(name);
  }

  hide() {
    this.text.style('visibility', "hidden");
  }

  hasFocus() {
    return document.activeElement == this.text.elt;
  }
}