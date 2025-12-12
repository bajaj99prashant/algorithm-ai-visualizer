import { GridNode } from "../types";

export const getRecursiveDivisionMazeWalls = (
  grid: GridNode[][],
  rowStart: number,
  rowEnd: number,
  colStart: number,
  colEnd: number,
  orientation: "horizontal" | "vertical",
  walls: GridNode[]
) => {
  if (rowEnd < rowStart || colEnd < colStart) {
    return;
  }

  if (orientation === "horizontal") {
    const possibleRows = [];
    for (let number = rowStart; number <= rowEnd; number += 2) {
      possibleRows.push(number);
    }
    const possibleCols = [];
    for (let number = colStart - 1; number <= colEnd + 1; number += 2) {
      possibleCols.push(number);
    }

    if (possibleRows.length === 0 || possibleCols.length === 0) return;

    const randomRowIndex = Math.floor(Math.random() * possibleRows.length);
    const randomColIndex = Math.floor(Math.random() * possibleCols.length);

    const currentRow = possibleRows[randomRowIndex];
    const colRandom = possibleCols[randomColIndex];

    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[0].length; col++) {
        if (row === currentRow && col !== colRandom && col >= colStart - 1 && col <= colEnd + 1) {
            const node = grid[row][col];
            if (!node.isStart && !node.isFinish) {
                walls.push(node);
            }
        }
      }
    }

    if (currentRow - 2 - rowStart > colEnd - colStart) {
      getRecursiveDivisionMazeWalls(grid, rowStart, currentRow - 2, colStart, colEnd, "horizontal", walls);
    } else {
      getRecursiveDivisionMazeWalls(grid, rowStart, currentRow - 2, colStart, colEnd, "vertical", walls);
    }

    if (rowEnd - (currentRow + 2) > colEnd - colStart) {
      getRecursiveDivisionMazeWalls(grid, currentRow + 2, rowEnd, colStart, colEnd, "horizontal", walls);
    } else {
      getRecursiveDivisionMazeWalls(grid, currentRow + 2, rowEnd, colStart, colEnd, "vertical", walls);
    }
  } else {
    const possibleCols = [];
    for (let number = colStart; number <= colEnd; number += 2) {
      possibleCols.push(number);
    }
    const possibleRows = [];
    for (let number = rowStart - 1; number <= rowEnd + 1; number += 2) {
      possibleRows.push(number);
    }

    if (possibleCols.length === 0 || possibleRows.length === 0) return;

    const randomColIndex = Math.floor(Math.random() * possibleCols.length);
    const randomRowIndex = Math.floor(Math.random() * possibleRows.length);

    const currentCol = possibleCols[randomColIndex];
    const rowRandom = possibleRows[randomRowIndex];

    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[0].length; col++) {
        if (col === currentCol && row !== rowRandom && row >= rowStart - 1 && row <= rowEnd + 1) {
             const node = grid[row][col];
             if (!node.isStart && !node.isFinish) {
                walls.push(node);
             }
        }
      }
    }

    if (rowEnd - rowStart > currentCol - 2 - colStart) {
      getRecursiveDivisionMazeWalls(grid, rowStart, rowEnd, colStart, currentCol - 2, "horizontal", walls);
    } else {
      getRecursiveDivisionMazeWalls(grid, rowStart, rowEnd, colStart, currentCol - 2, "vertical", walls);
    }

    if (rowEnd - rowStart > colEnd - (currentCol + 2)) {
      getRecursiveDivisionMazeWalls(grid, rowStart, rowEnd, currentCol + 2, colEnd, "horizontal", walls);
    } else {
      getRecursiveDivisionMazeWalls(grid, rowStart, rowEnd, currentCol + 2, colEnd, "vertical", walls);
    }
  }
};
