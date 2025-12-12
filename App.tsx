import React, { useState } from 'react';
import SortingVisualizer from './components/SortingVisualizer';
import PathfindingVisualizer from './components/PathfindingVisualizer';
import HashingVisualizer from './components/HashingVisualizer';
import { AppMode } from './types';
import { BarChart3, Route, X, Sparkles, Loader2, Database } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.SORTING);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [infoContent, setInfoContent] = useState("");
  const [infoLoading, setInfoLoading] = useState(false);

  const handleOpenInfo = (content: string) => {
    setInfoContent(content);
    setInfoModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col font-sans text-gray-100">
      {/* Navbar */}
      <header className="bg-gray-900 border-b border-gray-800 p-4 sticky top-0 z-20 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-gray-700 to-gray-500 p-2 rounded-lg">
                <Sparkles className="text-white w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-wide">
              AlgoVision
            </h1>
          </div>

          <div className="flex bg-gray-800 p-1 rounded-lg border border-gray-700 overflow-x-auto">
            <button
              onClick={() => setMode(AppMode.SORTING)}
              className={`flex items-center gap-2 px-6 py-2 rounded-md transition-all whitespace-nowrap font-medium ${
                mode === AppMode.SORTING
                  ? 'bg-gray-100 text-gray-900 shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <BarChart3 size={18} /> Sorting
            </button>
            <button
              onClick={() => setMode(AppMode.PATHFINDING)}
              className={`flex items-center gap-2 px-6 py-2 rounded-md transition-all whitespace-nowrap font-medium ${
                mode === AppMode.PATHFINDING
                  ? 'bg-gray-100 text-gray-900 shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Route size={18} /> Pathfinding
            </button>
            <button
              onClick={() => setMode(AppMode.HASHING)}
              className={`flex items-center gap-2 px-6 py-2 rounded-md transition-all whitespace-nowrap font-medium ${
                mode === AppMode.HASHING
                  ? 'bg-gray-100 text-gray-900 shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Database size={18} /> Hashing
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <div className="flex-1 overflow-auto">
            {mode === AppMode.SORTING && (
              <SortingVisualizer 
                  onOpenInfo={handleOpenInfo} 
                  setInfoLoading={setInfoLoading}
              />
            )}
            {mode === AppMode.PATHFINDING && (
              <PathfindingVisualizer 
                  onOpenInfo={handleOpenInfo}
                  setInfoLoading={setInfoLoading}
              />
            )}
            {mode === AppMode.HASHING && (
              <HashingVisualizer
                  onOpenInfo={handleOpenInfo}
                  setInfoLoading={setInfoLoading}
              />
            )}
        </div>
      </main>

      {/* Info Modal */}
      {(infoModalOpen || infoLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h3 className="text-xl font-semibold flex items-center gap-2 text-white">
                <Sparkles className="w-5 h-5 text-gray-400" />
                AI Explanation
              </h3>
              {!infoLoading && (
                <button 
                    onClick={() => setInfoModalOpen(false)}
                    className="p-1 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white"
                >
                    <X size={24} />
                </button>
              )}
            </div>
            <div className="p-6 overflow-y-auto text-gray-300 leading-relaxed">
               {infoLoading ? (
                   <div className="flex flex-col items-center justify-center py-12 gap-4">
                       <Loader2 className="w-10 h-10 text-white animate-spin" />
                       <p className="text-gray-400">Generating explanation with Gemini...</p>
                   </div>
               ) : (
                   <div className="prose prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-gray-100 prose-strong:text-white">
                       <ReactMarkdown>{infoContent}</ReactMarkdown>
                   </div>
               )}
            </div>
            {!infoLoading && (
                <div className="p-4 border-t border-gray-800 bg-gray-900/50 rounded-b-2xl flex justify-end">
                <button 
                    onClick={() => setInfoModalOpen(false)}
                    className="px-4 py-2 bg-white hover:bg-gray-200 text-black font-medium rounded-lg transition-colors"
                >
                    Close
                </button>
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;