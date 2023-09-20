let graph;
let searchFn;
let highlightedPath;
let start;
let goal;

let START_COLOR, GOAL_COLOR, BACKGROUND_COLOR;
let A, B, C, S, M;
let nodesMap;
let sortFnMap;
let booleanMap;

function setup() {
  createCanvas(400, 400);
  START_COLOR = color(3, 144, 252);
  GOAL_COLOR = color(252, 190, 3);
  BACKGROUND_COLOR = color(250);
  
  A = new Node('A', 100, 250);
  B = new Node('B', 200, 250);
  C = new Node('C', 300, 250);
  S = new Node('S', 200, 150);
  M = new Node('M', 200, 350);
  
  let edges = [
    [0, 1, 3], [0, 3, 1], [0, 4, 100],
    [1, 2, 4], [1, 3, 7],
    [2, 3, 10], [2, 4, 10],
  ];
  
  graph = new Graph([A, B, C, S, M], edges);
  
  nodesMap = { 'A':A, 'B':B, 'C':C , 'S':S, 'M':M };
  sortFnMap = {
    'do_nothing' : doNothing,
    'heuristic' : sortByHeuristic,
    'path_length' : sortByPathLength,
    'heuristic + path_length' : sortByHeuristicPlusPathLength,
    'beam_sort' : beamSort,
  }
  booleanMap = { 'False':false, 'True':true };
  
  let comboXPos = 116;
  let comboYPos = 12;
  
  start = createSelect();
  start.position(336, 12);
  start.option('A');
  start.option('B');
  start.option('C');
  start.option('S');
  start.option('M');
  start.selected('S');
  start.changed(selectEvent);
  
  goal = createSelect();
  goal.position(336, 36);
  goal.option('A');
  goal.option('B');
  goal.option('C');
  goal.option('S');
  goal.option('M');
  goal.selected('M');
  goal.changed(selectEvent);
  
  sortExtendedPathsFn = createSelect();
  sortExtendedPathsFn.position(comboXPos, comboYPos);
  sortExtendedPathsFn.option('do_nothing');
  sortExtendedPathsFn.option('heuristic');  
  sortExtendedPathsFn.changed(selectEvent);
  
  addPathsToFrontOfAgenda = createSelect();
  addPathsToFrontOfAgenda.position(comboXPos, comboYPos + 24);
  addPathsToFrontOfAgenda.option('False');
  addPathsToFrontOfAgenda.option('True');
  addPathsToFrontOfAgenda.changed(selectEvent);
  
  sortAgendaFn = createSelect();
  sortAgendaFn.position(comboXPos, comboYPos + 48);
  sortAgendaFn.option('do_nothing');
  sortAgendaFn.option('heuristic');
  sortAgendaFn.option('path_length');
  sortAgendaFn.option('heuristic + path_length');
  // sortAgendaFn.selected('path_length');
  sortAgendaFn.changed(selectEvent);
  
  useExtendedSet = createSelect();
  useExtendedSet.position(comboXPos, comboYPos + 72);
  useExtendedSet.option('False');
  useExtendedSet.option('True');
  useExtendedSet.changed(selectEvent);
  
  selectEvent();
}

function draw() {
  background(BACKGROUND_COLOR);
  
  textSize(14);
  text('generic_search(', 12, 24);
  text(',', 204, 98 - 72);
  text(',', 172, 98 - 48);
  text(',', 276, 98 - 24);
  text(')', 172, 98);
  
  text('start:', 300, 24);
  text('goal:', 300, 50);
  
  graph.draw();
}

function selectEvent() {
  searchFn = genericSearch(
    sortFnMap[sortExtendedPathsFn.value()],
    booleanMap[addPathsToFrontOfAgenda.value()],
    sortFnMap[sortAgendaFn.value()],
    booleanMap[useExtendedSet.value()]
  );
  
  let s = nodesMap[start.value()];
  let g = nodesMap[goal.value()];
  highlightedPath = searchFn(graph, s, g);
  graph.highlightPath(highlightedPath);
}

class Node {
  constructor(name, x, y) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.neighbors = [];
  }
  
  pushNeighbor(node, distance) {
    if (this.name !== node.name) {
      this.neighbors.push(new Neighbor(node, distance));
      node.neighbors.push(new Neighbor(this, distance));
    }
  }
}

class Neighbor {
  constructor(node, distance) {
    this.node = node;
    this.distance = distance;
  }
}

class Graph {
  constructor(nodes, edges) {
    this.nodes = nodes;
    this.edges = edges;
    this.edgesWeights = {};
    this.highlightedPath = null;
    
    for (const e of edges) {
      let n1 = this.nodes[e[0]];
      let n2 = this.nodes[e[1]];
      n1.pushNeighbor(n2);
      this.edgesWeights[[n1.name, n2.name]] = e[2];
      this.edgesWeights[[n2.name, n1.name]] = e[2];
    }
  }
  
  heuristic(n1, n2) {
    return Math.sqrt(Math.pow(n1.x - n2.x, 2) + Math.pow(n1.y - n2.y, 2));
  }
  
  pathLength(path) {
    let pathLength = 0;
    for (let i = 0; i < path.length - 1; i++) {
      let n1 = path[i];
      let n2 = path[i+1];
      pathLength += this.edgesWeights[[n1.name, n2.name]];
    }
    return pathLength;
  }
  
  highlightPath(highlightedPath) {
    this.highlightedPath = highlightedPath;
  }
  
  draw() {
    for (const e of this.edges) {
      let n1 = this.nodes[e[0]];
      let n2 = this.nodes[e[1]];
      line(n1.x, n1.y, n2.x, n2.y);
    }
    
    push();
    textAlign(CENTER, CENTER);
    for (const n of this.nodes) {
      circle(n.x, n.y, 36);
      text(n.name, n.x, n.y);
    }
    pop();
    
    if (this.highlightedPath !== null) {
      push();
      textAlign(CENTER, CENTER);
      for (let i = 0; i < this.highlightedPath.length - 1; i++) {
        let n1 = this.highlightedPath[i];
        let n2 = this.highlightedPath[i+1];
        stroke(255, 0, 0);
        line(n1.x, n1.y, n2.x, n2.y);
        noStroke();
        circle(n1.x, n1.y, 36);
        text(n1.name, n1.x, n1.y);
      }
      pop();
      
      let s = this.highlightedPath.at(0);
      let g = this.highlightedPath.at(-1);
      push();
      fill(START_COLOR);
      circle(s.x, s.y, 36);
      fill(GOAL_COLOR);
      circle(g.x, g.y, 36);
      pop();
      
      push();
      textAlign(CENTER, CENTER);
      text(s.name, s.x, s.y);
      text(g.name, g.x, g.y);
      pop();
    }
    
    push();
    textAlign(CENTER, CENTER);
    
    for (const e of this.edges) {
      let n1 = this.nodes[e[0]];
      let n2 = this.nodes[e[1]];
      let x = (n1.x + n2.x) / 2;
      let y = (n1.y + n2.y) / 2;
      
      push();
      noStroke();
      fill(BACKGROUND_COLOR);
      let a = 8;
      square(x - a, y - a, 2 * a);
      pop();      
      
      text(this.edgesWeights[[n1.name, n2.name]].toString(), x, y);
    }
    pop();
  }  
}

function doNothing(graph, goal, paths) {
  return paths;
}

function sortByHeuristic(graph, goal, paths) {
  return paths.toSorted((a, b) => {
    let ha = graph.heuristic(a.at(-1), goal);
    let hb = graph.heuristic(b.at(-1), goal);
    return ha - hb;
  });
}

function sortByPathLength(graph, goal, paths) {
  return paths.toSorted((a, b) => {
    let plA = graph.pathLength(a);
    let plB = graph.pathLength(b);
    return plA - plB;
  });
}

function sortByHeuristicPlusPathLength(graph, goal, paths) {
  return paths.toSorted((a, b) => {
    let hA = graph.heuristic(a.at(-1), goal);
    let hB = graph.heuristic(b.at(-1), goal);
    let plA = graph.pathLength(a);
    let plB = graph.pathLength(b);
    return (hA + plA) - (hB + plB);
  });
}

function allEqual(lst) {
  if (lst.length === 0) {
    return true;
  } else {
    let first = lst[0];
    for (const elt of lst) {
      if (elt !== first) {
        return false;
      }
    }
    return true;
  }
}

function beamSort(graph, goal, paths) {
  let lengths = paths.map((path) => path.length);
  let is_whole_level_extended = allEqual(lenghts);
  return is_whole_level_extended ? sortByHeuristic(graph, paths).slice(0, 2) : paths;
}

function extensions(graph, path) {
  let extPaths = [];
  let lastNode = path.at(-1);
  for (const neighbor of lastNode.neighbors) {
    extPaths.push(path.concat(neighbor.node));
  }
  return extPaths;
}

function genericSearch(
  sortExtendedPathsFn, addPathsToFrontOfAgenda, sortAgendaFn, useExtendedSet
)
{
  function search(graph, start, goal) {
    let Q = [[start]];
    let extendedSet = new Set();
    
    while (Q.length !== 0) {
      let path = Q.shift(0);
      
      // guard against infinte loops
      // TODO: make this program async and cancel
      // execution when combo box options change.
      if (path.length > 100) {
        return null;
      }
      
      let lastNode = path.at(-1);
      if (lastNode === goal) {
        return path;
      }
      if (useExtendedSet) {
        if (extendedSet.has(lastNode)) {
          continue;
        }
        extendedSet.add(lastNode);
      }
      let extPaths = sortExtendedPathsFn(graph, goal, extensions(graph, path));
      Q = addPathsToFrontOfAgenda ? extPaths.concat(Q) : Q.concat(extPaths);
      Q = sortAgendaFn(graph, goal, Q);
    }
  }
    
  return search;
}