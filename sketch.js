let a;
let gui;
let addingArc = false;
let selected;
let threshold = 60;

let states = ["q1", "q2", "q3"];
let events = "abc";
let uncontrollableEvents = "c";
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
  a = new Automata(states, events, uncontrollableEvents, startingState, deltaf, markedStates, forbiddenStates);
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
    if (selected != undefined) {
      selected.highlight = true;
      gui.setStats(selected);
    }
  }
}

function keyPressed() {
  if (!gui.checkFocus()) {
    switch (keyCode) {
      case 32: // SPACE
        // a.logData();
        console.log(a);
        break;
      case 78: // n
        a.addNode(mouseX, mouseY);
        break;
      case 46: // canc
        a.removeClosestNode(mouseX, mouseY);
        break;
      case 73: // i
        gui.legend = !gui.legend;
        break;
      case 76: // l
        a.importModel("automata.json");
        break;
      case 83: // s
        a.exportModel();
        break;
      case 84: // t
        a.trim();
        break;
      default:
        console.log(key, keyCode);
    }
  }
}

function mouseReleased() {
  addingArc = false;
  if (keyIsPressed && key === 'a' && selected instanceof Node) {
    let k = a.findClosestNode(mouseX, mouseY);
    if (k == undefined) return;
    a.addArc(selected, a.nodes[k]);
  }
}