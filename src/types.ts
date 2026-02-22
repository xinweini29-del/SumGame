export enum GameMode {
  CLASSIC = 'CLASSIC',
  TIME = 'TIME'
}

export enum GameStatus {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAMEOVER = 'GAMEOVER'
}

export interface Block {
  id: string;
  value: number;
  row: number;
  col: number;
  color: string;
  isRemoving?: boolean;
}

export interface GameState {
  grid: Block[][];
  score: number;
  target: number;
  selectedIds: string[];
  status: GameStatus;
  mode: GameMode;
  timeLeft: number;
  level: number;
}
