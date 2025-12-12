import React, { useState, useEffect, useRef } from 'react';
import { AlgorithmType, SortingAnimationStep } from '../types';
import { getBubbleSortAnimations, getMergeSortAnimations, getQuickSortAnimations, getHeapSortAnimations } from '../algorithms/sorting';
import { PRIMARY_COLOR, SECONDARY_COLOR, TERTIARY_COLOR } from '../constants';
import { Play, RotateCcw, Info } from 'lucide-react';
import { explainAlgorithm } from '../services/geminiService';

interface Props {
  onOpenInfo: (info: string) => void;
  setInfoLoading: (loading: boolean) => void;
}

const SortingVisualizer: React.FC<Props> = ({ onOpenInfo, setInfoLoading }) => {
  const [array, setArray] = useState<number[]>([]);
  const [algorithm, setAlgorithm] = useState<AlgorithmType>(AlgorithmType.BUBBLE_SORT);
  const [sorting, setSorting] = useState(false);
  const [speed, setSpeed] = useState(10); // Lower is faster wait time
  const [size, setSize] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Initialize array
  useEffect(() => {
    resetArray();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size]);

  const resetArray = () => {
    if (sorting) return;
    const newArray = [];
    for (let i = 0; i < size; i++) {
      newArray.push(randomIntFromInterval(5, 100));
    }
    setArray(newArray);
    
    // Reset bar colors
    const arrayBars = document.getElementsByClassName('array-bar') as HTMLCollectionOf<HTMLElement>;
    for (let i = 0; i < arrayBars.length; i++) {
      arrayBars[i].style.backgroundColor = PRIMARY_COLOR;
    }
  };

  const randomIntFromInterval = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  const handleRun = async () => {
    if (sorting) return;
    setSorting(true);

    let animations: SortingAnimationStep[] = [];
    if (algorithm === AlgorithmType.BUBBLE_SORT) animations = getBubbleSortAnimations(array);
    if (algorithm === AlgorithmType.MERGE_SORT) animations = getMergeSortAnimations(array);
    if (algorithm === AlgorithmType.QUICK_SORT) animations = getQuickSortAnimations(array);
    if (algorithm === AlgorithmType.HEAP_SORT) animations = getHeapSortAnimations(array);

    await animate(animations);
    setSorting(false);
  };

  const animate = async (animations: SortingAnimationStep[]) => {
    const arrayBars = document.getElementsByClassName('array-bar') as HTMLCollectionOf<HTMLElement>;
    
    // Delay factor based on speed state
    const delay = Math.max(1, 100 - speed); 

    for (let i = 0; i < animations.length; i++) {
      const { indices, type, value } = animations[i];
      const [barOneIdx, barTwoIdx] = indices;
      const barOneStyle = arrayBars[barOneIdx]?.style;
      const barTwoStyle = arrayBars[barTwoIdx]?.style;

      if (!barOneStyle) continue;

      if (type === 'compare') {
        // Change color to secondary to show comparison
        barOneStyle.backgroundColor = SECONDARY_COLOR;
        if (barTwoStyle) barTwoStyle.backgroundColor = SECONDARY_COLOR;

        await new Promise(r => setTimeout(r, delay));

        // Revert color
        barOneStyle.backgroundColor = PRIMARY_COLOR;
        if (barTwoStyle) barTwoStyle.backgroundColor = PRIMARY_COLOR;
      } else if (type === 'swap') {
        if (!barTwoStyle) continue;
        const heightOne = barOneStyle.height;
        barOneStyle.height = barTwoStyle.height;
        barTwoStyle.height = heightOne;
        await new Promise(r => setTimeout(r, delay));
      } else if (type === 'overwrite') {
        // Merge sort specific
        if (value !== undefined) {
          barOneStyle.height = `${value}%`;
          barOneStyle.backgroundColor = SECONDARY_COLOR;
          await new Promise(r => setTimeout(r, delay));
          barOneStyle.backgroundColor = PRIMARY_COLOR;
        }
      }
    }

    // Success animation
    for (let i = 0; i < arrayBars.length; i++) {
        arrayBars[i].style.backgroundColor = TERTIARY_COLOR;
        await new Promise(r => setTimeout(r, 10));
    }
    setTimeout(() => {
        for (let i = 0; i < arrayBars.length; i++) {
            arrayBars[i].style.backgroundColor = PRIMARY_COLOR;
        }
    }, 1000);
  };

  const handleExplain = async () => {
    setInfoLoading(true);
    const text = await explainAlgorithm(algorithm);
    onOpenInfo(text);
    setInfoLoading(false);
  };

  return (
    <div className="flex flex-col h-full w-full p-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-6 bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700">
        <select
          value={algorithm}
          onChange={(e) => setAlgorithm(e.target.value as AlgorithmType)}
          disabled={sorting}
          className="bg-gray-700 text-white p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={AlgorithmType.BUBBLE_SORT}>Bubble Sort</option>
          <option value={AlgorithmType.MERGE_SORT}>Merge Sort</option>
          <option value={AlgorithmType.QUICK_SORT}>Quick Sort</option>
          <option value={AlgorithmType.HEAP_SORT}>Heap Sort</option>
        </select>

        <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Size</span>
            <input 
                type="range" 
                min="10" 
                max="100" 
                value={size} 
                onChange={(e) => setSize(Number(e.target.value))}
                disabled={sorting}
                className="w-24 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
        </div>

        <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Speed</span>
            <input 
                type="range" 
                min="1" 
                max="100" 
                value={speed} 
                onChange={(e) => setSpeed(Number(e.target.value))}
                disabled={sorting}
                className="w-24 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
        </div>

        <button
          onClick={handleRun}
          disabled={sorting}
          className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold text-white transition-colors ${
            sorting ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          <Play size={18} /> Run
        </button>

        <button
          onClick={resetArray}
          disabled={sorting}
          className="flex items-center gap-2 px-4 py-2 rounded-md font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors"
        >
          <RotateCcw size={18} /> Reset
        </button>

        <button
            onClick={handleExplain}
            className="ml-auto flex items-center gap-2 px-3 py-2 rounded-md text-blue-400 border border-blue-400/30 hover:bg-blue-400/10 transition-colors"
        >
            <Info size={18} /> Explain with AI
        </button>
      </div>

      {/* Visualizer Area */}
      <div 
        ref={containerRef}
        className="flex-1 flex items-end justify-center gap-1 bg-gray-900/50 rounded-xl p-4 min-h-[400px]"
      >
        {array.map((value, idx) => (
          <div
            key={idx}
            className="array-bar bg-blue-500 rounded-t-sm"
            style={{
              height: `${value}%`,
              width: `${Math.max(2, 600 / size)}px`
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default SortingVisualizer;
