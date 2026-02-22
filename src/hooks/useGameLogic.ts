import { useState, useEffect, useCallback, useRef } from 'react';
import { GameMode, GameStatus, Block } from '../types';
import { 
  GRID_COLS, 
  GRID_ROWS, 
  INITIAL_ROWS, 
  TIME_LIMIT, 
  TARGET_MIN, 
  TARGET_MAX, 
  BLOCK_MIN, 
  BLOCK_MAX 
} from '../constants';
import confetti from 'canvas-confetti';

export function useGameLogic() {
  const [status, setStatus] = useState<GameStatus>(GameStatus.MENU);
  const [mode, setMode] = useState<GameMode>(GameMode.CLASSIC);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [score, setScore] = useState(0);
  const [target, setTarget] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [level, setLevel] = useState(1);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const generateTarget = useCallback(() => {
    return Math.floor(Math.random() * (TARGET_MAX - TARGET_MIN + 1)) + TARGET_MIN;
  }, []);

  const generateRow = useCallback((rowIndex: number): Block[] => {
    const colors = [
      '#FF6B6B', // Red
      '#4ECDC4', // Teal
      '#45B7D1', // Blue
      '#96CEB4', // Sage
      '#FFEEAD', // Cream
      '#D4A5A5', // Rose
      '#9B59B6', // Purple
      '#F1C40F', // Yellow
      '#E67E22', // Orange
    ];

    return Array.from({ length: GRID_COLS }, (_, colIndex) => {
      const value = Math.floor(Math.random() * (BLOCK_MAX - BLOCK_MIN + 1)) + BLOCK_MIN;
      return {
        id: Math.random().toString(36).substr(2, 9) + Date.now(),
        value,
        row: rowIndex,
        col: colIndex,
        color: colors[(value - 1) % colors.length],
      };
    });
  }, []);

  const initGame = (selectedMode: GameMode) => {
    let initialBlocks: Block[] = [];
    for (let r = 0; r < INITIAL_ROWS; r++) {
      initialBlocks = [...initialBlocks, ...generateRow(r)];
    }
    setBlocks(initialBlocks);
    setScore(0);
    setTarget(generateTarget());
    setSelectedIds([]);
    setStatus(GameStatus.PLAYING);
    setMode(selectedMode);
    setTimeLeft(TIME_LIMIT);
    setLevel(1);
  };

  const addRow = useCallback(() => {
    setBlocks(prev => {
      // Check if any block is already at the top row
      const isFull = prev.some(b => b.row >= GRID_ROWS - 1);
      if (isFull) {
        setStatus(GameStatus.GAMEOVER);
        return prev;
      }

      // Shift all existing blocks up
      const shiftedBlocks = prev.map(block => ({ 
        ...block, 
        row: block.row + 1 
      }));
      
      // Add new row at the bottom
      const newRow = generateRow(0);
      return [...shiftedBlocks, ...newRow];
    });
    
    if (mode === GameMode.TIME) {
      setTimeLeft(TIME_LIMIT);
    }
  }, [generateRow, mode]);

  const handleSelect = (id: string) => {
    if (status !== GameStatus.PLAYING) return;

    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      }
      return [...prev, id];
    });
  };

  // Check sum
  useEffect(() => {
    if (status !== GameStatus.PLAYING) return;

    const selectedBlocks = blocks.filter(b => selectedIds.includes(b.id));
    const currentSum = selectedBlocks.reduce((acc, b) => acc + b.value, 0);

    if (currentSum === target) {
      // Success!
      const points = selectedBlocks.length * 10 * level;
      setScore(s => s + points);
      
      // Mark for removal animation
      setBlocks(prev => prev.map(block => 
        selectedIds.includes(block.id) ? { ...block, isRemoving: true } : block
      ));

      // Trigger confetti for big clears
      if (selectedBlocks.length >= 4) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      // Remove after animation and make blocks fall
      setTimeout(() => {
        setBlocks(prev => {
          // 1. Remove selected blocks
          const remaining = prev.filter(block => !selectedIds.includes(block.id));
          
          // 2. Group by column and sort by row to make them fall
          const newBlocks: Block[] = [];
          for (let c = 0; c < GRID_COLS; c++) {
            const colBlocks = remaining
              .filter(b => b.col === c)
              .sort((a, b) => a.row - b.row);
            
            // Re-assign row indices starting from 0
            colBlocks.forEach((block, index) => {
              newBlocks.push({ ...block, row: index });
            });
          }
          
          return newBlocks;
        });

        setSelectedIds([]);
        setTarget(generateTarget());
        
        if (mode === GameMode.CLASSIC) {
          addRow();
        }
      }, 200);
    } else if (currentSum > target) {
      // Fail - clear selection
      setSelectedIds([]);
    }
  }, [selectedIds, target, status, blocks, level, mode, generateTarget, addRow]);

  // Timer logic for Time Mode
  useEffect(() => {
    if (status === GameStatus.PLAYING && mode === GameMode.TIME) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            addRow();
            return TIME_LIMIT;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, mode, addRow]);

  // Level up logic
  useEffect(() => {
    const newLevel = Math.floor(score / 500) + 1;
    if (newLevel !== level) {
      setLevel(newLevel);
    }
  }, [score, level]);

  return {
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
  };
}
