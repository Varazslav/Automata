let a;
let gui;
let addingArc = false;
let selected;
let threshold = 60;

let states = ["q1", "q2", "q3"];
let events = "abc";
let startingState = "q1";
let markedStates = [];
let forbiddenStates = ["q3"];

let deltaf = [
  [0, 0, 0],
  ['a', 0, 0],
  ['b', 0, 0]
];

function setup() {
  createCanvas(800, 900);
  randomSeed(8);
  a = new Automata(states, events, startingState, deltaf, markedStates, forbiddenStates);
  gui = new Gui();
}

function draw() {
  background(220);
  a.show();
  if (addingArc) {
    push();
    stroke(40, 100);
    line(selected.pos.x, selected.pos.y, mouseX, mouseY);
    pop();
  }
  gui.show(selected, a);
}

function mouseDragged() {
  if (!keyIsPressed) a.changePosClosestNode(mouseX, mouseY);
  else if (keyIsPressed && key == 'a' && selected instanceof Node) addingArc = true;
}

function mousePressed() {
  if (!gui.isInsideGui(mouseX, mouseY)) {
    gui.show();
    if (selected != undefined) selected.highlight = false;
    selected = a.findClosestElem(mouseX, mouseY);
    if (selected != undefined) selected.highlight = true;
  }
}

function keyPressed() {
  switch (keyCode) {
    case 32: // n
      a.logData();
      break;
    case 78: // n
      a.addNode(mouseX, mouseY);
      break;
    case 46: // canc
      a.removeClosestNode(mouseX, mouseY);
      break;
  }
  console.log(keyCode);
}

function mouseReleased() {
  addingArc = false;
  if (keyIsPressed && key === 'a' && selected instanceof Node) {
    let k = a.findClosestNode(mouseX, mouseY);
    if (k == undefined) return;
    a.addArc(selected, a.nodes[k]);
  }
}