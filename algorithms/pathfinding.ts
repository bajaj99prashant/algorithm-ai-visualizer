import { GridNode } from '../types';

function getAllNodes(grid: GridNode[][]): GridNode[] {
  const nodes: GridNode[] = [];
  for (const row of grid) {
    for (const node of row) {
      nodes.push(node);
    }
  }
  return nodes;
}

function getUnvisitedNeighbors(node: GridNode, grid: GridNode[][]): GridNode[] {
  const neighbors: GridNode[] = [];
  const { col, row } = node;
  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
  return neighbors.filter(neighbor => !neighbor.isVisited);
}

// --- Dijkstra ---
export const dijkstra = (grid: GridNode[][], startNode: GridNode, finishNode: GridNode): GridNode[] => {
  const visitedNodesInOrder: GridNode[] = [];
  startNode.distance = 0;
  const unvisitedNodes = getAllNodes(grid);

  while (unvisitedNodes.length > 0) {
    // Sort nodes by distance every time (Inefficient O(N^2) but fine for visualization size)
    unvisitedNodes.sort((nodeA, nodeB) => nodeA.distance - nodeB.distance);
    const closestNode = unvisitedNodes.shift();
    if (!closestNode) break;

    if (closestNode.isWall) continue;
    if (closestNode.distance === Infinity) return visitedNodesInOrder;

    closestNode.isVisited = true;
    visitedNodesInOrder.push(closestNode);
    if (closestNode === finishNode) return visitedNodesInOrder;

    updateUnvisitedNeighbors(closestNode, grid);
  }
  return visitedNodesInOrder;
};

function updateUnvisitedNeighbors(node: GridNode, grid: GridNode[][]) {
  const unvisitedNeighbors = getUnvisitedNeighbors(node, grid);
  for (const neighbor of unvisitedNeighbors) {
    neighbor.distance = node.distance + 1;
    neighbor.previousNode = node;
  }
}

// --- BFS ---
export const bfs = (grid: GridNode[][], startNode: GridNode, finishNode: GridNode): GridNode[] => {
  const visitedNodesInOrder: GridNode[] = [];
  const queue: GridNode[] = [startNode];
  startNode.isVisited = true;
  startNode.distance = 0;

  while (queue.length > 0) {
    const currentNode = queue.shift();
    if (!currentNode) break;
    if (currentNode.isWall) continue;

    visitedNodesInOrder.push(currentNode);
    if (currentNode === finishNode) return visitedNodesInOrder;

    const unvisitedNeighbors = getUnvisitedNeighbors(currentNode, grid);
    for (const neighbor of unvisitedNeighbors) {
      neighbor.isVisited = true;
      neighbor.previousNode = currentNode;
      neighbor.distance = currentNode.distance + 1;
      queue.push(neighbor);
    }
  }
  return visitedNodesInOrder;
};

// --- DFS ---
export const dfs = (grid: GridNode[][], startNode: GridNode, finishNode: GridNode): GridNode[] => {
  const visitedNodesInOrder: GridNode[] = [];
  const stack: GridNode[] = [startNode];
  
  // Reset for DFS specifically as we might revisit in different paths if not careful, 
  // but standard DFS visits once.
  
  while (stack.length > 0) {
    const currentNode = stack.pop();
    if (!currentNode) break;

    if (currentNode.isWall) continue;
    if (currentNode.isVisited) continue;

    currentNode.isVisited = true;
    visitedNodesInOrder.push(currentNode);

    if (currentNode === finishNode) return visitedNodesInOrder;

    // Push neighbors. Order affects the path direction.
    const neighbors = [];
    const { col, row } = currentNode;
    // Order: Up, Right, Down, Left to prefer typical direction
    if (row > 0) neighbors.push(grid[row - 1][col]);
    if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
    if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
    if (col > 0) neighbors.push(grid[row][col - 1]);

    for (const neighbor of neighbors) {
        if(!neighbor.isVisited) {
            neighbor.previousNode = currentNode;
            stack.push(neighbor);
        }
    }
  }
  return visitedNodesInOrder;
};

// --- A* ---
export const astar = (grid: GridNode[][], startNode: GridNode, finishNode: GridNode): GridNode[] => {
  const visitedNodesInOrder: GridNode[] = [];
  startNode.distance = 0; // g-score
  startNode.totalDistance = 0; // f-score
  
  const openSet: GridNode[] = [startNode];

  while (openSet.length > 0) {
    // Sort by f-score
    openSet.sort((a, b) => a.totalDistance - b.totalDistance);
    const closestNode = openSet.shift();
    if (!closestNode) break;

    if (closestNode.isWall) continue;

    closestNode.isVisited = true;
    visitedNodesInOrder.push(closestNode);

    if (closestNode === finishNode) return visitedNodesInOrder;

    const neighbors = getUnvisitedNeighbors(closestNode, grid);
    for (const neighbor of neighbors) {
       // Typically A* allows re-visiting if a better path is found, but for grid visualization
       // usually treating unvisited is sufficient for simple display or we check g-score
       const tentativeGScore = closestNode.distance + 1;
       
       // If neighbor is not visited or we found a shorter path to it (not strictly implemented here for simplicity as we filter !isVisited above)
       // For visualization standard:
       neighbor.previousNode = closestNode;
       neighbor.distance = tentativeGScore;
       neighbor.heuristicDistance = Math.abs(neighbor.col - finishNode.col) + Math.abs(neighbor.row - finishNode.row); // Manhattan
       neighbor.totalDistance = neighbor.distance + neighbor.heuristicDistance;
       
       // Since we filtered !isVisited in getUnvisitedNeighbors, we just push.
       // Note: A real robust A* should check if node is in openSet and update priority.
       // Because we are not using a real priority queue with update-key, duplicates might occur if we didn't check isVisited.
       // But we filter unvisited neighbors.
       
       // However, to be strictly correct with A*, we should allow re-evaluating nodes in OpenSet.
       // For this simple visualizer, standard "visited check" usually yields "Greedy Best First" or suboptimal A* if weights vary.
       // Since weights are 1, this works reasonably well as A*.
       
       // To prevent duplicates in openSet:
       if (!openSet.includes(neighbor)) {
           openSet.push(neighbor);
       }
    }
  }
  return visitedNodesInOrder;
};

export const getNodesInShortestPathOrder = (finishNode: GridNode): GridNode[] => {
  const nodesInShortestPathOrder: GridNode[] = [];
  let currentNode: GridNode | null = finishNode;
  while (currentNode !== null) {
    nodesInShortestPathOrder.unshift(currentNode);
    currentNode = currentNode.previousNode;
  }
  return nodesInShortestPathOrder;
};
