class Automata {
  constructor(stateSet, alphabet, current, deltaf, marked, forbidden) {
    this.stateSet = stateSet || [];
    this.alphabet = alphabet || "";
    this.starting = stateSet[0];
    this.current = current;
    this.deltaf = deltaf; // deltaf is a matrix with 1 if the #col node is linked to the #row node
    this.marked = marked || stateSet;
    this.forbidden = forbidden || [];
    this.nodes = [];
    this.arcs = [];

    this.init();
  }

  init(x, y) {
    let oldNodes = this.nodes.slice(0);
    this.nodes = [];
    this.arcs = [];
    // set nodes based on stateSet, marked and forbidden parameters
    for (let state of this.stateSet) {
      // check if marked
      let mk = this.marked.find(el => el == state) != undefined;
      // check if forbidden
      let fb = this.forbidden.find(el => el == state) != undefined;
      // check if starting
      let st = this.starting == state;

      let oldNode = oldNodes.find(el => el.name == state);
      if (oldNode != undefined) {
        oldNode.starting = st;
        oldNode.marked = mk;
        oldNode.forbidden = fb;
        this.nodes.push(oldNode);
      } else {
        let xn = x || random(60, 600);
        let yn = y || random(100, 600);
        this.nodes.push(new Node(xn, yn, state, mk, fb, st));
      }
    }

    //set arcs based on deltaf
    for (let x = 0; x < this.stateSet.length; x++) {
      for (let y = 0; y < this.stateSet.length; y++) {
        //start: this.nodes[x] - end: this.nodes[y]
        if (this.deltaf[y][x] != 0) {
          // create a new arc going from the start node to the end node
          let newArc = new Arc(this.nodes[x], this.nodes[y], this.deltaf[y][x]);
          //set it to the start node.out
          this.nodes[x].out.push(newArc);
          // set the out node.in to the created arc;
          newArc.end.in.push(newArc);
          this.arcs.push(newArc);
        }
      }
    }
  }

  show() {
    for (let arc of this.arcs) {
      arc.show();
    }
    for (let node of this.nodes) {
      node.show();
    }
  }

  addNode(x, y) {
    let i = this.stateSet.length + 1;
    this.stateSet.push("q" + i);
    for (let y = 0; y < this.deltaf.length; y++) {
      this.deltaf[y].push(0);
    }
    this.deltaf.push(this.deltaf[0].slice().map(el => el = 0));
    this.init(x, y);
  }

  removeNode(index) {
    // find the index of the node to remove in the stateSet
    let i = this.stateSet.indexOf(this.nodes[index].name);
    this.stateSet.splice(i, 1);
    // remove the corresponding row
    this.deltaf.splice(i);
    //remove the corresponding col
    this.deltaf.map(row => row.splice(i, 1));

    this.init();
  }

  addArc(start, end) {
    let startIndex = this.stateSet.indexOf(start.name);
    let endIndex = this.stateSet.indexOf(end.name);
    this.deltaf[endIndex][startIndex] = "a";
    this.init();
  }

  removeClosestNode(x, y) {
    let k = this.findClosestNode(x, y);
    this.removeNode(k);
  }

  findClosestNode(x, y) {
    let k = 0;
    let min = Infinity;
    let ms = createVector(x, y);
    for (let i = 0; i < this.nodes.length; i++) {
      let distSq = p5.Vector.sub(this.nodes[i].pos, ms).magSq();
      if (distSq < min && distSq < threshold * threshold) {
        min = distSq;
        k = i;
      }
    }
    if (min != Infinity) return k;
  }

  findClosestArc(x, y) {
    let k = 0;
    let min = Infinity;
    let ms = createVector(x, y);
    for (let i = 0; i < this.arcs.length; i++) {
      let arcPos = this.arcs[i].getPos();
      let distSq = p5.Vector.sub(arcPos, ms).magSq();
      if (distSq < min && distSq < threshold * threshold) {
        min = distSq;
        k = i;
      }
    }
    if (min != Infinity) return k;
  }

  findClosestElem(x, y) {
    let kn = this.findClosestNode(x, y);
    let ka = this.findClosestArc(x, y);
    let closestNode, closestArc;
    let nodeDist = Infinity;
    // console.log(kn, ka);
    if (kn != undefined) {
      closestNode = this.nodes[kn];
      nodeDist = p5.Vector.sub(closestNode.pos, createVector(x, y)).magSq();
    }
    if (ka != undefined) {
      closestArc = this.arcs[ka];
      let arcDist = p5.Vector.sub(closestArc.getPos(), createVector(x, y)).magSq();
      if (arcDist < nodeDist) return closestArc;
    }
    return closestNode;
  }

  changePosClosestNode(x, y) {
    let k = this.findClosestNode(x, y);
    if (k != undefined) this.nodes[k].changePos(x, y);
  }

  changeNodeName(node, newName) {
    let mi = this.marked.indexOf(node.name);
    if (mi != -1) this.marked.splice(mi, 1);
    let fi = this.forbidden.indexOf(node.name);
    if (fi != -1) this.forbidden.splice(fi, 1);
    let i = this.stateSet.indexOf(node.name);
    this.stateSet[i] = newName;
    node.name = newName;
    this.changeMarking(node);
    this.changeForbidden(node);
    this.changeStart(node);
    this.init();
  }

  changeMarking(node) {
    let mi = this.marked.indexOf(node.name);
    if (mi != -1) this.marked.splice(mi, 1);
    else this.marked.push(node.name);
    this.init();
  }

  changeForbidden(node) {
    let fi = this.forbidden.indexOf(node.name);
    if (fi != -1) this.forbidden.splice(fi, 1);
    else this.forbidden.push(node.name);
    this.init();
  }

  changeStart(node) {
    if (this.starting != node.name) this.starting = node.name;
    else this.starting = "";
    this.init();
  }

  changeArcName(arc, newName) {
    let ctr = arc.controllable;
    let starti = this.stateSet.indexOf(arc.start.name);
    let endi = this.stateSet.indexOf(arc.end.name);
    this.deltaf[endi][starti] = newName;
    this.init();
    this.arcs.find(el => el.name == newName).controllable = ctr;
  }

  logData() {
    console.log(this.alphabet);
    console.log(this.stateSet);
    console.log(this.marked);
    console.log(this.forbidden);
    console.log(this.deltaf);
  }
}