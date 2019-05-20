class Automata {
  constructor(stateSet, alphabet, uncontrollableEvents, current, deltaf, marked, forbidden) {
    this.stateSet = stateSet || [];
    this.alphabet = alphabet || "";
    this.uncontrollableEvents = uncontrollableEvents || "";
    this.current = current || stateSet[0];
    this.starting = current;
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
      this.nodes[x].out = [];
      for (let y = 0; y < this.stateSet.length; y++) {
        //start: this.nodes[x] - end: this.nodes[y]
        if (this.deltaf[y][x] != 0) {
          // create a new arc going from the start node to the end node
          let contr = this.uncontrollableEvents.indexOf(this.deltaf[y][x]) < 0;
          let newArc = new Arc(this.nodes[x], this.nodes[y], this.deltaf[y][x]);
          newArc.controllable = contr;
          //set it to the start node.out
          this.nodes[x].out.push(newArc);
          // set the out node.in to the created arc;
          newArc.end.in.push(newArc);
          this.arcs.push(newArc);
        }
      }
    }

    for (let node of this.nodes) {
      let c = node.checkControllability();
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

  static syncComp(a1, a2) {
    let states = [];
    for (let s1 of a1.stateSet) {
      for (let s2 of a2.stateSet) {
        states.push(s1 + "-" + s2);
      }
    }

    let alphabet = a1.alphabet;
    for (let i = 0; i < a2.alphabet.length; i++) {
      // add only events that are not already present
      if (alphabet.indexOf(a2.alphabet[i]) < 0) alphabet += a2.alphabet[i];
    }

    let uncEvents = a1.uncontrollableEvents;
    for (let i = 0; i < a2.uncontrollableEvents.length; i++) {
      // add only events that are not already present
      if (uncEvents.indexOf(a2.uncontrollableEvents[i]) < 0) uncEvents += a2.uncontrollableEvents[i];
    }

    let starting = a1.starting + "-" + a2.starting;

    let marked = [];
    for (let m1 of a1.marked) {
      for (let m2 of a2.marked) {
        marked.push(m1 + "-" + m2);
      }
    }

    let forbidden = [];
    for (let f1 of a1.forbidden) {
      for (let s2 of a2.stateSet) {
        forbidden.push(f1 + "-" + s2);
      }
    }
    for (let f2 of a2.forbidden) {
      for (let s1 of a1.stateSet) {
        forbidden.push(s1 + "-" + f2);
      }
    }

    let deltaf = [];
    // init deltaf with zeros
    for (let y = 0; y < states.length; y++) {
      deltaf[y] = [];
      for (let x = 0; x < states.length; x++) {
        deltaf[y][x] = 0;
      }
    }

    let currNode1 = a1.nodes.find(n => n.name == a1.starting);
    let currNode2 = a2.nodes.find(n => n.name == a2.starting);

    Automata.calculateDeltafSync(currNode1, currNode2, deltaf, states, a1, a2, []);

    let syncAut = new Automata(states, alphabet, uncEvents, starting, deltaf, marked, forbidden);
    syncAut.init();

    return syncAut;
  }

  static calculateDeltafSync(currNode1, currNode2, deltaf, states, a1, a2, visited) {
    let startIndex = states.indexOf(currNode1.name + "-" + currNode2.name);
    if (visited.indexOf(currNode1.name + "-" + currNode2.name) > -1) return deltaf;
    else visited.push(currNode1.name + "-" + currNode2.name);
    let addedEvents = [];

    let endIndex;
    if (currNode1.out.length == 0 && currNode2.out.length > 0) {
      for (let arc2 of currNode2.out) {
        if (a1.alphabet.indexOf(arc2.name) < 0) {
          endIndex = states.indexOf(currNode1.name + "-" + arc2.end.name);
          deltaf[endIndex][startIndex] = arc2.name;
          addedEvents.push(arc2.name);
        }
      }
    } else if (currNode1.out.length > 0 && currNode2.out.length == 0) {
      if (a2.alphabet.indexOf(arc1.name) < 0) {
        endIndex = states.indexOf(arc1.end.name + "-" + currNode2.name);
        deltaf[endIndex][startIndex] = arc1.name;
        addedEvents.push(arc1.name);
      }
    } else {
      for (let arc1 of currNode1.out) {
        for (let arc2 of currNode2.out) {
          if (arc1.name == arc2.name) {
            endIndex = states.indexOf(arc1.end.name + "-" + arc2.end.name);
            deltaf[endIndex][startIndex] = arc1.name;
            addedEvents.push(arc1.name);
          } else if (a2.alphabet.indexOf(arc1.name) < 0) {
            endIndex = states.indexOf(arc1.end.name + "-" + currNode2.name);
            deltaf[endIndex][startIndex] = arc1.name;
            addedEvents.push(arc1.name);
          } else if (a1.alphabet.indexOf(arc2.name) < 0) {
            endIndex = states.indexOf(currNode1.name + "-" + arc2.end.name);
            deltaf[endIndex][startIndex] = arc2.name;
            addedEvents.push(arc2.name);
          }
        }
      }
    }

    if (addedEvents.length == 0) return deltaf;
    for (let e of addedEvents) {
      let cn1 = Automata.getNextNode(currNode1, e);
      let cn2 = Automata.getNextNode(currNode2, e);

      return Automata.calculateDeltafSync(cn1, cn2, deltaf, states, a1, a2, visited);
    }
  }

  static getNextNode(currNode, event) {
    let nxtArc = currNode.out.find(arc => arc.name == event)
    if (nxtArc != undefined) return nxtArc.end;
    else return currNode;
  }

  trim() {
    let s = this.nodes.find(el => el.starting == true);
    if (s.forbidden) console.log("Null automata");
    let newState = this.getReachableTree(s);
    // find missing states
    let missingStates = this.stateSet.filter(el => newState.indexOf(el) < 0);
    // remove from the current state all the nodes that are not present in the new state
    for (let st of missingStates) {
      let n = this.nodes.find(el => el.name == st);
      this.removeNode(this.nodes.indexOf(n));
    }
  }

  extension() {
    let s = this.nodes.find(el => el.starting == true);
    if (s.forbidden) console.log("Null automata");
    let newState = this.getReachableTree(s);
    // find missing states
    let missingStates = this.stateSet.filter(el => newState.indexOf(el) < 0);
    // remove from the current state all the nodes that are not present in the new state
    // and the uncontrollable ones that lead to forbidden nodes
    for (let st of missingStates) {
      let n = this.nodes.find(el => el.name == st);
      if (n.forbidden) {
        // if the node to remove is forbidden then check where it came from, if it
        // came from an uncontrollable node, remove even that one
        for (let a of n.in) {
          if (!a.start.controllable) this.removeNode(this.nodes.indexOf(a.start));
        }
      }
    }

    this.trim();
  }

  getReachableTree(node, visited) {
    let vis = visited || [];
    // if no more outer nodes and is not already visited and is not forbidden return it
    if (!node.forbidden && vis.indexOf(node.name) == -1) {
      if (node.out.length == 0) {
        vis.push(node.name)
        return vis;
      }
      vis.push(node.name);
      for (let arc of node.out) {
        vis = this.getReachableTree(arc.end, vis);
      }
    }
    return vis;
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
    // find the index of the node to remove in the stateSet, in the marked and in the forbidden
    let i = this.stateSet.indexOf(this.nodes[index].name);
    let removed = this.stateSet.splice(i, 1);
    let mi = this.marked.indexOf(removed[0]);
    if (mi >= 0) this.marked.splice(mi, 1);
    let fi = this.forbidden.indexOf(removed[0]);
    if (fi >= 0) this.forbidden.splice(fi, 1);
    // remove the corresponding row
    this.deltaf.splice(i, 1);
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
    let starti = this.stateSet.indexOf(arc.start.name);
    let endi = this.stateSet.indexOf(arc.end.name);
    this.deltaf[endi][starti] = newName;
    this.init();
  }

  exportModel(name) {
    name = name || "automata.json"
    let json = {};
    json.stateSet = this.stateSet;
    json.alphabet = this.alphabet;
    json.uncontrollableEvents = this.uncontrollableEvents;
    json.starting = this.starting;
    json.deltaf = this.deltaf;
    json.marked = this.marked;
    json.forbidden = this.forbidden;
    let nodePos = [];
    this.nodes.map(node => nodePos.push({
      x: node.pos.x,
      y: node.pos.y
    }));
    json.nodePos = nodePos;
    saveJSON(json, name)
  }

  async importModel(automataFileName) {
    return httpDo(automataFileName)
      .then(json => this.statsFromJSON(json))
      .catch(err => console.log("ERROR: " + err));
  }

  statsFromJSON(json) {
    return new Promise((res, rej) => {
      this.stateSet = json.stateSet;
      this.alphabet = json.alphabet;
      this.uncontrollableEvents = json.uncontrollableEvents;
      this.starting = json.starting;
      this.deltaf = json.deltaf;
      this.marked = json.marked;
      this.forbidden = json.forbidden;
      this.init();
      for (let i = 0; i < this.nodes.length; i++) {
        this.nodes[i].pos.x = json.nodePos[i].x;
        this.nodes[i].pos.y = json.nodePos[i].y;
      }
      return res(this);
    });
  }

  logData() {
    console.log(this.alphabet);
    console.log(this.stateSet);
    console.log(this.marked);
    console.log(this.forbidden);
    console.log(this.deltaf);
  }
}