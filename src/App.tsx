import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Timer, 
  RotateCcw, 
  Play, 
  Pause, 
  X, 
  ChevronRight,
  Target,
  Zap
} from 'lucide-react';
import { useGameLogic } from './hooks/useGameLogic';
import { GameMode, GameStatus } from './types';
import { GRID_COLS, GRID_ROWS, TIME_LIMIT } from './constants';
import { cn } from './utils';

export default function App() {
  const {
    status,
    mode,
    blocks,
    score,
    target,
    selectedIds,
    timeLeft,
    level,
    initGame,
    handleSelect,
    setStatus,
  } = useGameLogic();

  const [isPaused, setIsPaused] = useState(false);

  // Calculate current sum
  const currentSum = blocks
    .filter(b => selectedIds.includes(b.id))
    .reduce((acc, b) => acc + b.value, 0);

  if (status === GameStatus.MENU) {
    return (
      <div className="min-h-screen bg-[#F0F4FF] flex items-center justify-center p-4 font-sans text-[#141414]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white border-4 border-[#141414] rounded-[2.5rem] shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] p-10 relative overflow-hidden"
        >
          {/* Decorative shapes */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-300 rounded-full opacity-50 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-300 rounded-full opacity-50 blur-2xl" />

          <div className="text-center mb-10 relative z-10">
            <h1 className="text-6xl font-black uppercase tracking-tighter mb-2 italic font-serif text-[#141414]">
              SumStack
            </h1>
            <div className="inline-block px-4 py-1 bg-indigo-600 text-white rounded-full text-[10px] uppercase tracking-[0.3em] font-bold">
              The Math Elimination Challenge
            </div>
          </div>

          <div className="space-y-6 relative z-10">
            <button 
              onClick={() => initGame(GameMode.CLASSIC)}
              className="w-full group flex items-center justify-between p-6 border-4 border-[#141414] rounded-3xl bg-emerald-400 hover:bg-emerald-500 shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] hover:translate-y-1 hover:shadow-none transition-all duration-200"
            >
              <div className="text-left">
                <span className="block font-black text-xl uppercase tracking-tight">Classic Mode</span>
                <span className="block text-[10px] opacity-80 uppercase font-mono font-bold">Add row on success • Endless</span>
              </div>
              <div className="bg-white p-2 rounded-full border-2 border-[#141414]">
                <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            <button 
              onClick={() => initGame(GameMode.TIME)}
              className="w-full group flex items-center justify-between p-6 border-4 border-[#141414] rounded-3xl bg-amber-400 hover:bg-amber-500 shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] hover:translate-y-1 hover:shadow-none transition-all duration-200"
            >
              <div className="text-left">
                <span className="block font-black text-xl uppercase tracking-tight">Time Mode</span>
                <span className="block text-[10px] opacity-80 uppercase font-mono font-bold">10s per turn • High Pressure</span>
              </div>
              <div className="bg-white p-2 rounded-full border-2 border-[#141414]">
                <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>

          <div className="mt-12 pt-8 border-t-2 border-dashed border-[#141414]/20 text-center relative z-10">
            <p className="text-[11px] uppercase tracking-[0.15em] font-bold opacity-50 leading-relaxed">
              Select numbers to match the target sum.<br/>Don't let the stack reach the top.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F4FF] flex flex-col items-center justify-center p-4 font-sans text-[#141414]">
      {/* Game Header */}
      <div className="max-w-md w-full mb-6 grid grid-cols-3 gap-4">
        <div className="bg-white border-4 border-[#141414] p-3 rounded-2xl shadow-[6px_6px_0px_0px_rgba(20,20,20,1)]">
          <span className="block text-[10px] uppercase font-mono font-bold opacity-50 mb-1">Score</span>
          <span className="text-xl font-black font-mono">{score.toLocaleString()}</span>
        </div>
        
        <div className="bg-indigo-600 text-white p-3 rounded-2xl shadow-[6px_6px_0px_0px_rgba(20,20,20,0.3)] flex flex-col items-center justify-center relative overflow-hidden border-4 border-[#141414]">
          <span className="block text-[10px] uppercase font-mono font-bold opacity-50 mb-1">Target</span>
          <span className="text-3xl font-black font-mono relative z-10">{target}</span>
          <Target className="absolute -right-2 -bottom-2 w-12 h-12 opacity-20" />
        </div>

        <div className="bg-white border-4 border-[#141414] p-3 rounded-2xl shadow-[6px_6px_0px_0px_rgba(20,20,20,1)]">
          <span className="block text-[10px] uppercase font-mono font-bold opacity-50 mb-1">
            {mode === GameMode.TIME ? 'Time' : 'Level'}
          </span>
          <div className="flex items-center gap-2">
            {mode === GameMode.TIME ? (
              <>
                <Timer className={cn("w-4 h-4", timeLeft <= 3 && "text-red-500 animate-pulse")} />
                <span className={cn("text-xl font-black font-mono", timeLeft <= 3 && "text-red-500")}>
                  {timeLeft}s
                </span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-xl font-black font-mono">{level}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Game Board */}
      <div className="relative max-w-md w-full aspect-[6/10] bg-white border-4 border-[#141414] rounded-[2.5rem] shadow-[16px_16px_0px_0px_rgba(20,20,20,1)] overflow-hidden">
        {/* Grid Background Lines */}
        <div className="absolute inset-0 grid grid-cols-6 pointer-events-none">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="border-r-2 border-[#141414]/5" />
          ))}
        </div>

        {/* Blocks */}
        <div className="absolute inset-0 p-2">
          <AnimatePresence mode="popLayout">
            {blocks.map((block) => (
              <motion.button
                key={block.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  left: (block.col * 100 / GRID_COLS) + '%',
                  top: ((GRID_ROWS - 1 - block.row) * 100 / GRID_ROWS) + '%',
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                onClick={() => handleSelect(block.id)}
                className={cn(
                  "absolute p-1",
                  "w-[16.666%] h-[10%]"
                )}
              >
                <div 
                  style={{ backgroundColor: selectedIds.includes(block.id) ? '#141414' : block.color }}
                  className={cn(
                    "w-full h-full border-2 border-[#141414] rounded-2xl flex items-center justify-center text-xl font-black font-mono transition-all duration-100 shadow-[3px_3px_0px_0px_rgba(20,20,20,1)]",
                    selectedIds.includes(block.id) 
                      ? "text-white scale-95 shadow-inner" 
                      : "text-[#141414] hover:brightness-110",
                    block.isRemoving && "bg-green-500 border-green-600 text-white scale-110 rotate-12"
                  )}
                >
                  {block.value}
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {/* Pause Overlay */}
        <AnimatePresence>
          {isPaused && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-8"
            >
              <h2 className="text-5xl font-black uppercase italic mb-8 text-[#141414]">Paused</h2>
              <button 
                onClick={() => setIsPaused(false)}
                className="flex items-center gap-3 px-10 py-5 bg-indigo-600 text-white font-black uppercase tracking-widest rounded-3xl border-4 border-[#141414] shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] hover:translate-y-1 hover:shadow-none transition-all"
              >
                <Play className="w-6 h-6 fill-current" /> Resume
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Over Overlay */}
        <AnimatePresence>
          {status === GameStatus.GAMEOVER && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 bg-[#141414] text-white z-30 flex flex-col items-center justify-center p-10 text-center"
            >
              <div className="bg-yellow-400 p-6 rounded-full border-4 border-white mb-6">
                <Trophy className="w-16 h-16 text-[#141414]" />
              </div>
              <h2 className="text-5xl font-black uppercase italic mb-2">Game Over</h2>
              <p className="text-lg font-mono opacity-80 uppercase mb-10 tracking-widest">Score: {score}</p>
              
              <div className="space-y-4 w-full">
                <button 
                  onClick={() => initGame(mode)}
                  className="w-full flex items-center justify-center gap-3 p-5 bg-white text-[#141414] rounded-3xl border-4 border-white hover:bg-transparent hover:text-white transition-all font-black uppercase tracking-widest"
                >
                  <RotateCcw className="w-6 h-6" /> Try Again
                </button>
                <button 
                  onClick={() => setStatus(GameStatus.MENU)}
                  className="w-full flex items-center justify-center gap-2 p-4 opacity-60 hover:opacity-100 transition-all font-bold uppercase text-xs tracking-[0.2em]"
                >
                  <X className="w-4 h-4" /> Back to Menu
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Controls */}
      <div className="max-w-md w-full mt-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-white border-4 border-[#141414] px-6 py-3 rounded-2xl shadow-[6px_6px_0px_0px_rgba(20,20,20,1)]">
            <span className="text-[10px] uppercase font-mono font-bold opacity-50 mr-3">Current Sum</span>
            <span className={cn(
              "text-xl font-black font-mono",
              currentSum > target ? "text-red-500" : "text-indigo-600"
            )}>
              {currentSum} <span className="text-[#141414]/30">/</span> {target}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => setIsPaused(!isPaused)}
            className="p-4 bg-white border-4 border-[#141414] rounded-2xl shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] hover:translate-y-1 hover:shadow-none transition-all"
          >
            {isPaused ? <Play className="w-6 h-6 fill-current" /> : <Pause className="w-6 h-6 fill-current" />}
          </button>
          <button 
            onClick={() => setStatus(GameStatus.MENU)}
            className="p-4 bg-white border-4 border-[#141414] rounded-2xl shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] hover:translate-y-1 hover:shadow-none transition-all"
          >
            <RotateCcw className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Visual Feedback for Summing */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 pointer-events-none">
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="px-6 py-2 bg-[#141414] text-white text-xs font-mono uppercase tracking-widest border-2 border-white shadow-xl"
            >
              Selected: {selectedIds.length} blocks
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
