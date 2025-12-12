export enum AlgorithmType {
  BUBBLE_SORT = 'Bubble Sort',
  MERGE_SORT = 'Merge Sort',
  QUICK_SORT = 'Quick Sort',
  HEAP_SORT = 'Heap Sort',
  DIJKSTRA = 'Dijkstra',
  BFS = 'Breadth-First Search',
  DFS = 'Depth-First Search',
  A_STAR = 'A* Search'
}

export enum AppMode {
  SORTING = 'Sorting',
  PATHFINDING = 'Pathfinding',
  HASHING = 'Hashing'
}

export type SortingAnimationStep = {
  indices: [number, number];
  type: 'compare' | 'swap' | 'overwrite';
  value?: number; // Used for merge sort overwrite or updates
};

export interface GridNode {
  row: number;
  col: number;
  isStart: boolean;
  isFinish: boolean;
  distance: number;
  totalDistance: number; // For A* (f = g + h)
  heuristicDistance: number; // For A* (h)
  isVisited: boolean;
  isWall: boolean;
  previousNode: GridNode | null;
}
