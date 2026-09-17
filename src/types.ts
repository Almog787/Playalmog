export type GameType = 'tictactoe' | 'connect4' | 'nim';
export type ActiveTab = 'play' | 'encyclopedia' | 'theory' | 'tree';
export type Language = 'he' | 'en';

export type TTTPlayer = 'X' | 'O';
export type TTTBoard = (TTTPlayer | null)[];

export type C4Player = 'R' | 'Y'; // R = Red (Player 1), Y = Yellow (Player 2)
export type C4Board = (C4Player | null)[][]; // 6 rows x 7 cols

export interface NimMove {
  pileIndex: number;
  count: number;
}

export interface NimState {
  piles: number[];
  mode: 'normal' | 'misere';
}

export interface TTTMoveEval {
  index: number;
  score: number; // +10 = Win, 0 = Draw, -10 = Loss
  outcome: 'win' | 'draw' | 'loss';
  depth: number;
  isBest: boolean;
}

export interface C4ColumnEval {
  col: number;
  score: number;
  outcome: 'win' | 'draw' | 'loss' | 'neutral';
  depthFound: number;
  isBest: boolean;
  isValid: boolean;
  threatLevel: 'none' | 'critical' | 'winning' | 'blunder';
  commentary?: string;
}

export interface MinimaxTreeNode {
  id: string;
  name: string;
  move?: number;
  player: string;
  score: number;
  depth: number;
  isBestMove?: boolean;
  isPruned?: boolean;
  children?: MinimaxTreeNode[];
}

export interface PrecomputedNode {
  boardKey: string;
  bestMove: number;
  score: number;
  moveEvaluations: Record<number, number>;
}

export interface SolvedOpeningTrap {
  id: string;
  titleEn: string;
  titleHe: string;
  descEn: string;
  descHe: string;
  game: GameType;
  initialMoves: number[];
  recommendedMove: number;
  whyEn: string;
  whyHe: string;
  dangerLevel: 'high' | 'medium' | 'theoretical';
}
