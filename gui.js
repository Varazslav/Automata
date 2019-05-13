class Gui {
  constructor() {
    this.color = [50, 50, 50];
    this.h = 200;
    this.pos = createVector(0, height - this.h);
    this.nodeStats = new NodeStats(this.pos);
    this.arcStats = new ArcStats(this.pos);
  }

  show(aut, elem) {
    if (elem != undefined) {
      push();
      noStroke();
      fill(...this.color);
      rect(this.pos.x, this.pos.y, width, this.h);
      pop();
      if (elem instanceof Node) this.nodeStats.show(aut, elem);
      if (elem instanceof Arc) this.arcStats.show(aut, elem);
    } else {
      this.nodeStats.hide();
      this.arcStats.hide();
    }
  }

  isInsideGui(x, y) {
    return (x > this.pos.x && x < this.pos.x + width &&
      y > this.pos.y && y < this.pos.y + this.h);
  }

}

class NodeStats {
  constructor(absPosVector) {
    this.absPosVector = absPosVector;
    this.nameBox = new TextBox(absPosVector, 100, 30, 50, 20);
    this.mkCheck = createCheckbox("Marked", false).position(this.absPosVector.x + 55, this.absPosVector.y + 70)
      .style("color", "#F0F0F0").style('visibility', "hidden");
    this.forbCheck = createCheckbox("Forbidden", false).position(this.absPosVector.x + 55, this.absPosVector.y + 90)
      .style("color", "#F0F0F0").style('visibility', "hidden");
    this.starting = createCheckbox("Starting", false).position(this.absPosVector.x + 55, this.absPosVector.y + 110)
      .style("color", "#F0F0F0").style('visibility', "hidden");

    this.changedValue = false;

    this.mkCheck.changed(this.changeValues);
    this.forbCheck.changed(this.changeValues);
    this.starting.changed(this.changeValues);
  }

  show(aut, node) {
    push();
    translate(this.absPosVector.x, this.absPosVector.y);
    fill(220);
    text("x: " + node.pos.x + "\ny: " + node.pos.y, 20, 40);

    let newName = this.nameBox.setParams("Name", node.name);
    if (node.name != newName && this.nameBox.hasFocus() == false) {
      aut.changeNode(node.name, newName);
    }
    this.nameBox.show();

    //console.log(this.changedValue);
    // for now is not modifiable because changedValue does not update
    if (this.changedValue) {
      node.marked = this.mkCheck.checked();
      node.forbidden = this.forbCheck.checked();
      node.starting = this.starting.checked();
      // this.changedValue = false;
    }

    this.mkCheck.style('visibility', "visible").checked(node.marked);
    this.forbCheck.style('visibility', "visible").checked(node.forbidden);
    this.starting.style('visibility', "visible").checked(node.starting);

    pop();
  }

  hide() {
    this.nameBox.hide();
    this.mkCheck.style('visibility', "hidden").checked(false);
    this.forbCheck.style('visibility', "hidden").checked(false);
    this.starting.style('visibility', "hidden").checked(false);
  }

  changeValues() {
    this.changedValue = true;
    //console.log(this.changedValue);
  }
}

class ArcStats {
  constructor(absPosVector) {
    this.absPosVector = absPosVector;
    this.nameBox = new TextBox(absPosVector, 20, 30, 50, 20);
    this.controllable = createCheckbox("Controllable", true)
      .position(this.absPosVector.x + 150, this.absPosVector.y + 40)
      .style('visibility', "hidden").style("color", "#F0F0F0");
  }

  show(aut, arc) {
    push();
    translate(this.absPosVector.x, this.absPosVector.y);
    arc.name = this.nameBox.setParams("Name", arc.name);
    this.nameBox.show();

    arc.controllable = this.controllable.style('visibility', "visible").checked();
    pop();
  }

  hide() {
    this.controllable.style('visibility', "hidden").checked(true);
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
    this.title = "";
    this.text = createInput().position(this.x + this.w - 5, this.absPos.y + this.y).size(this.w, this.h).style('visibility', "hidden");
  }

  setParams(title, text) {
    this.title = title;
    if (!this.hasFocus()) { //check if the textBox is focused
      this.text.value(text);
    }
    return this.text.value();
  }

  show() {
    push();
    stroke(0);
    fill(230);
    text(this.title, this.x, this.y - 5);
    this.text.style('visibility', "visible");
    pop();
  }

  hide() {
    this.text.style('visibility', "hidden");
  }

  hasFocus() {
    return document.activeElement == this.text.elt;
  }
}