import React, { useState, useEffect } from 'react';
import { AlgorithmType, GridNode } from '../types';
import { dijkstra, bfs, dfs, astar, getNodesInShortestPathOrder } from '../algorithms/pathfinding';
import { getRecursiveDivisionMazeWalls } from '../algorithms/maze';
import { GRID_ROWS, GRID_COLS, START_NODE_ROW, START_NODE_COL, FINISH_NODE_ROW, FINISH_NODE_COL } from '../constants';
import { Play, RotateCcw, Info, Trash2, Grid } from 'lucide-react';
import { explainAlgorithm } from '../services/geminiService';

interface Props {
  onOpenInfo: (info: string) => void;
  setInfoLoading: (loading: boolean) => void;
}

const PathfindingVisualizer: React.FC<Props> = ({ onOpenInfo, setInfoLoading }) => {
  const [grid, setGrid] = useState<GridNode[][]>([]);
  const [isMousePressed, setIsMousePressed] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [algorithm, setAlgorithm] = useState<AlgorithmType>(AlgorithmType.DIJKSTRA);

  useEffect(() => {
    const initialGrid = getInitialGrid();
    setGrid(initialGrid);
  }, []);

  const getInitialGrid = (): GridNode[][] => {
    const grid = [];
    for (let row = 0; row < GRID_ROWS; row++) {
      const currentRow = [];
      for (let col = 0; col < GRID_COLS; col++) {
        currentRow.push(createNode(col, row));
      }
      grid.push(currentRow);
    }
    return grid;
  };

  const createNode = (col: number, row: number): GridNode => {
    return {
      col,
      row,
      isStart: row === START_NODE_ROW && col === START_NODE_COL,
      isFinish: row === FINISH_NODE_ROW && col === FINISH_NODE_COL,
      distance: Infinity,
      totalDistance: Infinity,
      heuristicDistance: Infinity,
      isVisited: false,
      isWall: false,
      previousNode: null,
    };
  };

  const handleMouseDown = (row: number, col: number) => {
    if (isRunning) return;
    const newGrid = getNewGridWithWallToggled(grid, row, col);
    setGrid(newGrid);
    setIsMousePressed(true);
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (!isMousePressed || isRunning) return;
    const newGrid = getNewGridWithWallToggled(grid, row, col);
    setGrid(newGrid);
  };

  const handleMouseUp = () => {
    setIsMousePressed(false);
  };

  const getNewGridWithWallToggled = (grid: GridNode[][], row: number, col: number) => {
    const newGrid = grid.slice();
    const node = newGrid[row][col];
    // Don't make start/finish nodes walls
    if (node.isStart || node.isFinish) return newGrid;
    const newNode = {
      ...node,
      isWall: !node.isWall,
    };
    newGrid[row][col] = newNode;
    return newGrid;
  };

  const animateAlgorithm = (visitedNodesInOrder: GridNode[], nodesInShortestPathOrder: GridNode[]) => {
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          animateShortestPath(nodesInShortestPathOrder);
        }, 10 * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        if (!node.isStart && !node.isFinish) {
          const element = document.getElementById(`node-${node.row}-${node.col}`);
          if (element) element.className = 'node node-visited w-6 h-6 border border-blue-900/20 inline-block';
        }
      }, 10 * i);
    }
  };

  const animateShortestPath = (nodesInShortestPathOrder: GridNode[]) => {
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      setTimeout(() => {
        const node = nodesInShortestPathOrder[i];
        if (!node.isStart && !node.isFinish) {
            const element = document.getElementById(`node-${node.row}-${node.col}`);
            if (element) element.className = 'node node-shortest-path w-6 h-6 border border-blue-900/20 inline-block';
        }
      }, 50 * i);
    }
    setTimeout(() => {
        setIsRunning(false);
    }, 50 * nodesInShortestPathOrder.length);
  };

  const visualizeAlgorithm = async () => {
    if (isRunning) return;
    setIsRunning(true);
    
    // Clear previous animations visually (without full reset)
    clearVisuals();

    // Deep copy grid to avoid state mutation issues during calc
    const gridCopy = grid.map(row => row.map(node => ({
        ...node, 
        distance: Infinity, 
        totalDistance: Infinity, 
        isVisited: false, 
        previousNode: null
    })));
    const startNodeCopy = gridCopy[START_NODE_ROW][START_NODE_COL];
    const finishNodeCopy = gridCopy[FINISH_NODE_ROW][FINISH_NODE_COL];

    let visitedNodesInOrder: GridNode[] = [];
    
    if (algorithm === AlgorithmType.DIJKSTRA) {
        visitedNodesInOrder = dijkstra(gridCopy, startNodeCopy, finishNodeCopy);
    } else if (algorithm === AlgorithmType.BFS) {
        visitedNodesInOrder = bfs(gridCopy, startNodeCopy, finishNodeCopy);
    } else if (algorithm === AlgorithmType.DFS) {
        visitedNodesInOrder = dfs(gridCopy, startNodeCopy, finishNodeCopy);
    } else if (algorithm === AlgorithmType.A_STAR) {
        visitedNodesInOrder = astar(gridCopy, startNodeCopy, finishNodeCopy);
    }

    const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNodeCopy);
    animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder);
  };

  const generateMaze = () => {
      if (isRunning) return;
      clearBoard(); // Clear existing walls
      
      const newGrid = getInitialGrid();
      // Temporarily set all walls to false
      const walls: GridNode[] = [];
      getRecursiveDivisionMazeWalls(newGrid, 0, GRID_ROWS - 1, 0, GRID_COLS - 1, "horizontal", walls);
      
      // Animate wall creation
      for (let i = 0; i < walls.length; i++) {
          setTimeout(() => {
             const node = walls[i];
             const element = document.getElementById(`node-${node.row}-${node.col}`);
             if (element && !node.isStart && !node.isFinish) {
                 element.className = 'node w-6 h-6 border border-gray-700/50 bg-gray-400 animate-pulse select-none inline-block';
             }
          }, 10 * i);
      }
      
      // Update state after animation
      setTimeout(() => {
           const finalGrid = newGrid.map(row => row.map(node => {
               if (walls.some(w => w.row === node.row && w.col === node.col)) {
                   return { ...node, isWall: true };
               }
               return node;
           }));
           setGrid(finalGrid);
      }, 10 * walls.length);
  };

  const clearBoard = () => {
    if (isRunning) return;
    setGrid(getInitialGrid());
    clearVisuals();
  };

  const clearVisuals = () => {
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const node = grid[row][col];
        if (!node.isStart && !node.isFinish && !node.isWall) {
             const element = document.getElementById(`node-${row}-${col}`);
             if (element) element.className = 'node w-6 h-6 border border-gray-700 inline-block bg-gray-800';
        }
      }
    }
  };

  const handleExplain = async () => {
    setInfoLoading(true);
    const text = await explainAlgorithm(algorithm);
    onOpenInfo(text);
    setInfoLoading(false);
  };

  return (
    <div className="flex flex-col h-full w-full p-4 items-center">
        {/* Controls */}
        <div className="w-full flex flex-wrap items-center gap-4 mb-6 bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700">
            <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value as AlgorithmType)}
                disabled={isRunning}
                className="bg-gray-700 text-white p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value={AlgorithmType.DIJKSTRA}>Dijkstra's Algorithm</option>
                <option value={AlgorithmType.A_STAR}>A* Search</option>
                <option value={AlgorithmType.BFS}>Breadth-First Search (BFS)</option>
                <option value={AlgorithmType.DFS}>Depth-First Search (DFS)</option>
            </select>

            <button
                onClick={visualizeAlgorithm}
                disabled={isRunning}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold text-white transition-colors ${
                    isRunning ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
                <Play size={18} /> Visualize
            </button>
            
            <button
                onClick={generateMaze}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-2 rounded-md font-medium text-white bg-purple-600 hover:bg-purple-700 transition-colors"
            >
                <Grid size={18} /> Generate Maze
            </button>

            <button
                onClick={clearBoard}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-2 rounded-md font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors"
            >
                <Trash2 size={18} /> Clear Board
            </button>

             <button
                onClick={handleExplain}
                className="ml-auto flex items-center gap-2 px-3 py-2 rounded-md text-blue-400 border border-blue-400/30 hover:bg-blue-400/10 transition-colors"
            >
                <Info size={18} /> Explain with AI
            </button>
        </div>
        
        {/* Grid Info */}
        <div className="flex gap-6 mb-4 text-sm text-gray-300">
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-500 rounded-full"></div> Start Node</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-500 rounded-full"></div> Finish Node</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-400"></div> Wall</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[rgba(0,190,218,0.75)]"></div> Visited</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[rgb(255,254,106)]"></div> Shortest Path</div>
        </div>

        {/* Grid Container */}
        <div 
            className="grid bg-gray-900 border border-gray-700 p-2 rounded-lg shadow-xl"
            onMouseLeave={handleMouseUp}
            style={{
                gridTemplateColumns: `repeat(${GRID_COLS}, 1.5rem)`
            }}
        >
            {grid.map((row, rowIdx) => (
                row.map((node, nodeIdx) => {
                    const { row, col, isFinish, isStart, isWall } = node;
                    let extraClass = 'bg-gray-800';
                    if (isFinish) extraClass = 'bg-red-500 scale-75 rounded-full';
                    else if (isStart) extraClass = 'bg-green-500 scale-75 rounded-full';
                    else if (isWall) extraClass = 'bg-gray-400'; // animate-pulse removed for static wall look after generation

                    return (
                        <div
                            id={`node-${row}-${col}`}
                            key={`${row}-${col}`}
                            className={`node w-6 h-6 border border-gray-700/50 ${extraClass} select-none inline-block`}
                            onMouseDown={() => handleMouseDown(row, col)}
                            onMouseEnter={() => handleMouseEnter(row, col)}
                            onMouseUp={() => handleMouseUp()}
                        ></div>
                    );
                })
            ))}
        </div>
    </div>
  );
};

export default PathfindingVisualizer;
