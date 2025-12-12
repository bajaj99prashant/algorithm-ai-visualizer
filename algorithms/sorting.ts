import { SortingAnimationStep } from '../types';

export const getBubbleSortAnimations = (array: number[]): SortingAnimationStep[] => {
  const animations: SortingAnimationStep[] = [];
  const auxArray = array.slice();
  const n = auxArray.length;

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      // Comparison
      animations.push({ indices: [j, j + 1], type: 'compare' });
      
      if (auxArray[j] > auxArray[j + 1]) {
        // Swap
        animations.push({ indices: [j, j + 1], type: 'swap' });
        const temp = auxArray[j];
        auxArray[j] = auxArray[j + 1];
        auxArray[j + 1] = temp;
      }
    }
  }
  return animations;
};

export const getQuickSortAnimations = (array: number[]): SortingAnimationStep[] => {
  const animations: SortingAnimationStep[] = [];
  const auxArray = array.slice();
  quickSortHelper(auxArray, 0, auxArray.length - 1, animations);
  return animations;
};

function quickSortHelper(
  mainArray: number[],
  startIdx: number,
  endIdx: number,
  animations: SortingAnimationStep[]
) {
  if (startIdx >= endIdx) return;
  const pivotIdx = startIdx;
  let leftIdx = startIdx + 1;
  let rightIdx = endIdx;

  while (rightIdx >= leftIdx) {
    animations.push({ indices: [leftIdx, rightIdx], type: 'compare' });
    animations.push({ indices: [pivotIdx, pivotIdx], type: 'compare' }); // Dummy compare to maintain timing

    if (mainArray[leftIdx] > mainArray[pivotIdx] && mainArray[rightIdx] < mainArray[pivotIdx]) {
      animations.push({ indices: [leftIdx, rightIdx], type: 'swap' });
      swap(mainArray, leftIdx, rightIdx);
    }
    if (mainArray[leftIdx] <= mainArray[pivotIdx]) leftIdx++;
    if (mainArray[rightIdx] >= mainArray[pivotIdx]) rightIdx--;
  }
  
  animations.push({ indices: [pivotIdx, rightIdx], type: 'swap' });
  swap(mainArray, pivotIdx, rightIdx);
  
  const leftSubarrayIsSmaller = rightIdx - 1 - startIdx < endIdx - (rightIdx + 1);
  if (leftSubarrayIsSmaller) {
    quickSortHelper(mainArray, startIdx, rightIdx - 1, animations);
    quickSortHelper(mainArray, rightIdx + 1, endIdx, animations);
  } else {
    quickSortHelper(mainArray, rightIdx + 1, endIdx, animations);
    quickSortHelper(mainArray, startIdx, rightIdx - 1, animations);
  }
}

function swap(array: number[], i: number, j: number) {
  const temp = array[i];
  array[i] = array[j];
  array[j] = temp;
}

export const getMergeSortAnimations = (array: number[]): SortingAnimationStep[] => {
  const animations: SortingAnimationStep[] = [];
  if (array.length <= 1) return animations;
  const auxiliaryArray = array.slice();
  mergeSortHelper(array, 0, array.length - 1, auxiliaryArray, animations);
  return animations;
};

function mergeSortHelper(
  mainArray: number[],
  startIdx: number,
  endIdx: number,
  auxiliaryArray: number[],
  animations: SortingAnimationStep[]
) {
  if (startIdx === endIdx) return;
  const middleIdx = Math.floor((startIdx + endIdx) / 2);
  mergeSortHelper(auxiliaryArray, startIdx, middleIdx, mainArray, animations);
  mergeSortHelper(auxiliaryArray, middleIdx + 1, endIdx, mainArray, animations);
  doMerge(mainArray, startIdx, middleIdx, endIdx, auxiliaryArray, animations);
}

function doMerge(
  mainArray: number[],
  startIdx: number,
  middleIdx: number,
  endIdx: number,
  auxiliaryArray: number[],
  animations: SortingAnimationStep[]
) {
  let k = startIdx;
  let i = startIdx;
  let j = middleIdx + 1;
  while (i <= middleIdx && j <= endIdx) {
    animations.push({ indices: [i, j], type: 'compare' });
    if (auxiliaryArray[i] <= auxiliaryArray[j]) {
      animations.push({ indices: [k, 0], type: 'overwrite', value: auxiliaryArray[i] });
      mainArray[k++] = auxiliaryArray[i++];
    } else {
      animations.push({ indices: [k, 0], type: 'overwrite', value: auxiliaryArray[j] });
      mainArray[k++] = auxiliaryArray[j++];
    }
  }
  while (i <= middleIdx) {
    animations.push({ indices: [i, i], type: 'compare' });
    animations.push({ indices: [k, 0], type: 'overwrite', value: auxiliaryArray[i] });
    mainArray[k++] = auxiliaryArray[i++];
  }
  while (j <= endIdx) {
    animations.push({ indices: [j, j], type: 'compare' });
    animations.push({ indices: [k, 0], type: 'overwrite', value: auxiliaryArray[j] });
    mainArray[k++] = auxiliaryArray[j++];
  }
}

export const getHeapSortAnimations = (array: number[]): SortingAnimationStep[] => {
  const animations: SortingAnimationStep[] = [];
  const auxArray = array.slice();
  const n = auxArray.length;

  // Build max heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(auxArray, n, i, animations);
  }

  // Extract elements from heap one by one
  for (let i = n - 1; i > 0; i--) {
    // Move current root to end
    animations.push({ indices: [0, i], type: 'swap' });
    swap(auxArray, 0, i);

    // Call max heapify on the reduced heap
    heapify(auxArray, i, 0, animations);
  }

  return animations;
};

function heapify(
  array: number[],
  n: number,
  i: number,
  animations: SortingAnimationStep[]
) {
  let largest = i;
  const left = 2 * i + 1;
  const right = 2 * i + 2;

  // Compare left child
  if (left < n) {
    animations.push({ indices: [largest, left], type: 'compare' });
    if (array[left] > array[largest]) {
      largest = left;
    }
  }

  // Compare right child
  if (right < n) {
    animations.push({ indices: [largest, right], type: 'compare' });
    if (array[right] > array[largest]) {
      largest = right;
    }
  }

  if (largest !== i) {
    animations.push({ indices: [i, largest], type: 'swap' });
    swap(array, i, largest);

    // Recursively heapify the affected sub-tree
    heapify(array, n, largest, animations);
  }
}
