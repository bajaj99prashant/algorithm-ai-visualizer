import React, { useState, useRef } from 'react';
import { Play, RotateCcw, Info, Search } from 'lucide-react';
import { PRIMARY_COLOR, SECONDARY_COLOR, TERTIARY_COLOR } from '../constants';
import { explainAlgorithm } from '../services/geminiService';
import { AlgorithmType } from '../types';

interface Props {
  onOpenInfo: (info: string) => void;
  setInfoLoading: (loading: boolean) => void;
}

const TABLE_SIZE = 11; // Prime number size for simple hashing

const HashingVisualizer: React.FC<Props> = ({ onOpenInfo, setInfoLoading }) => {
  // Array to store values. null = empty.
  const [table, setTable] = useState<(number | null)[]>(Array(TABLE_SIZE).fill(null));
  const [inputValue, setInputValue] = useState<string>('');
  const [message, setMessage] = useState<string>('Enter a number to insert or search.');
  const [processing, setProcessing] = useState(false);
  
  // Animation refs
  const cellRefs = useRef<(HTMLDivElement | null)[]>([]);

  const hashFunction = (key: number) => {
    return key % TABLE_SIZE;
  };

  const clearColors = () => {
    cellRefs.current.forEach(cell => {
      if (cell) {
        cell.style.backgroundColor = 'rgb(31, 41, 55)'; // bg-gray-800
        cell.style.borderColor = 'rgb(55, 65, 81)'; // border-gray-700
      }
    });
  };

  const animateProbe = async (index: number, isCollision: boolean, isFound: boolean = false) => {
    const cell = cellRefs.current[index];
    if (!cell) return;
    
    // Highlight
    cell.style.borderColor = isFound ? TERTIARY_COLOR : (isCollision ? SECONDARY_COLOR : PRIMARY_COLOR);
    cell.style.backgroundColor = isFound ? 'rgba(16, 185, 129, 0.2)' : (isCollision ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)');
    
    await new Promise(r => setTimeout(r, 600));
    
    if (!isFound) {
       // Reset if just probing
       if (isCollision) {
          // Keep red tint briefly then reset or keep standard
          cell.style.backgroundColor = 'rgb(31, 41, 55)';
          cell.style.borderColor = 'rgb(55, 65, 81)';
       }
    }
  };

  const handleInsert = async () => {
    if (processing) return;
    const value = parseInt(inputValue);
    if (isNaN(value)) {
      setMessage("Please enter a valid integer.");
      return;
    }
    
    setProcessing(true);
    setMessage(`Hashing: ${value} % ${TABLE_SIZE} = ${value % TABLE_SIZE}`);
    clearColors();

    let index = hashFunction(value);
    let attempts = 0;
    const initialIndex = index;

    // Linear Probing
    while (attempts < TABLE_SIZE) {
      const currentVal = table[index];
      
      if (currentVal === null) {
        // Found empty slot
        await animateProbe(index, false);
        const newTable = [...table];
        newTable[index] = value;
        setTable(newTable);
        setMessage(`Inserted ${value} at index ${index}.`);
        
        // Success color
        const cell = cellRefs.current[index];
        if(cell) {
             cell.style.borderColor = TERTIARY_COLOR;
             cell.style.backgroundColor = 'rgba(16, 185, 129, 0.2)';
        }
        
        setInputValue('');
        setProcessing(false);
        return;
      } else if (currentVal === value) {
         setMessage(`${value} already exists at index ${index}.`);
         await animateProbe(index, true, true);
         setProcessing(false);
         return;
      } else {
        // Collision
        setMessage(`Collision at index ${index}. Probing next...`);
        await animateProbe(index, true);
        index = (index + 1) % TABLE_SIZE;
        attempts++;
      }
    }

    setMessage("Table is full! Cannot insert.");
    setProcessing(false);
  };

  const handleSearch = async () => {
    if (processing) return;
    const value = parseInt(inputValue);
    if (isNaN(value)) {
      setMessage("Please enter a valid integer.");
      return;
    }
    
    setProcessing(true);
    setMessage(`Searching for ${value}...`);
    clearColors();

    let index = hashFunction(value);
    let attempts = 0;

    while (attempts < TABLE_SIZE) {
      const currentVal = table[index];
      
      if (currentVal === null) {
        // Not found (hit empty slot)
        await animateProbe(index, false);
        setMessage(`${value} not found.`);
        setProcessing(false);
        return;
      } else if (currentVal === value) {
        // Found
        await animateProbe(index, false, true);
        setMessage(`Found ${value} at index ${index}!`);
        setProcessing(false);
        return;
      } else {
        // Keep looking
        await animateProbe(index, true);
        index = (index + 1) % TABLE_SIZE;
        attempts++;
      }
    }

    setMessage(`${value} not found.`);
    setProcessing(false);
  };

  const handleReset = () => {
      setTable(Array(TABLE_SIZE).fill(null));
      clearColors();
      setMessage("Table cleared.");
  };

  const handleExplain = async () => {
      setInfoLoading(true);
      // We can use a custom prompt or map it to a type
      // Using a string description since there isn't an enum for Generic Hashing yet, or strictly mapped
      // But we can add a simple explanation via AI directly
      try {
        const text = await explainAlgorithm("Hash Table (Linear Probing)" as AlgorithmType);
        onOpenInfo(text);
      } catch(e) {
          console.error(e);
      }
      setInfoLoading(false);
  };

  return (
    <div className="flex flex-col items-center h-full w-full p-8 max-w-5xl mx-auto">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-8 bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700 w-full justify-center">
         <input
           type="number"
           value={inputValue}
           onChange={(e) => setInputValue(e.target.value)}
           placeholder="Value"
           className="bg-gray-700 text-white p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
           onKeyDown={(e) => e.key === 'Enter' && handleInsert()}
         />
         
         <button
           onClick={handleInsert}
           disabled={processing}
           className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-bold text-white transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
         >
           <Play size={18} /> Insert
         </button>
         
         <button
           onClick={handleSearch}
           disabled={processing}
           className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md font-bold text-white transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
         >
           <Search size={18} /> Search
         </button>

         <button
            onClick={handleReset}
            disabled={processing}
            className="flex items-center gap-2 px-4 py-2 rounded-md font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors"
         >
            <RotateCcw size={18} /> Clear
         </button>

         <button
            onClick={handleExplain}
            className="ml-auto flex items-center gap-2 px-3 py-2 rounded-md text-blue-400 border border-blue-400/30 hover:bg-blue-400/10 transition-colors"
        >
            <Info size={18} /> Explain
        </button>
      </div>

      {/* Message Area */}
      <div className="mb-8 h-8 text-lg font-medium text-blue-300 animate-pulse">
          {message}
      </div>

      {/* Visualizer - Hash Table Array */}
      <div className="flex gap-2">
          {table.map((val, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2">
                  <span className="text-gray-500 font-mono text-sm">{idx}</span>
                  <div
                    ref={el => { cellRefs.current[idx] = el }}
                    className="w-16 h-16 border-2 border-gray-700 bg-gray-800 rounded-lg flex items-center justify-center text-xl font-bold text-white transition-colors duration-300 shadow-md"
                  >
                      {val !== null ? val : ''}
                  </div>
              </div>
          ))}
      </div>
      
      <div className="mt-12 text-gray-400 text-sm max-w-lg text-center">
          <p>This visualization uses <strong>Linear Probing</strong> for collision resolution.</p>
          <p>Hash Function: <code>key % 11</code></p>
          <p>If an index is occupied, it checks the next index (looping back to start) until an empty slot is found.</p>
      </div>
    </div>
  );
};

export default HashingVisualizer;
