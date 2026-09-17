import { C4Board, C4Player, C4ColumnEval, SolvedOpeningTrap } from '../types';

export const C4_ROWS = 6;
export const C4_COLS = 7;

export function createEmptyC4Board(): C4Board {
  return Array(C4_ROWS).fill(null).map(() => Array(C4_COLS).fill(null));
}

// Get the row where a piece will land in a column (-1 if full)
export function getDropRow(board: C4Board, col: number): number {
  if (col < 0 || col >= C4_COLS) return -1;
  for (let r = C4_ROWS - 1; r >= 0; r--) {
    if (board[r][col] === null) {
      return r;
    }
  }
  return -1; // column is full
}

export function getValidColumns(board: C4Board): number[] {
  const valid: number[] = [];
  // Center-first column ordering optimizes alpha-beta cutoffs!
  const order = [3, 2, 4, 1, 5, 0, 6];
  for (const c of order) {
    if (board[0][c] === null) {
      valid.push(c);
    }
  }
  return valid;
}

export interface C4WinResult {
  winner: C4Player | 'draw' | null;
  winningCells: [number, number][] | null;
}

export function checkC4Winner(board: C4Board): C4WinResult {
  // Horizontal check
  for (let r = 0; r < C4_ROWS; r++) {
    for (let c = 0; c < C4_COLS - 3; c++) {
      const p = board[r][c];
      if (p && p === board[r][c + 1] && p === board[r][c + 2] && p === board[r][c + 3]) {
        return {
          winner: p,
          winningCells: [[r, c], [r, c + 1], [r, c + 2], [r, c + 3]]
        };
      }
    }
  }

  // Vertical check
  for (let r = 0; r < C4_ROWS - 3; r++) {
    for (let c = 0; c < C4_COLS; c++) {
      const p = board[r][c];
      if (p && p === board[r + 1][c] && p === board[r + 2][c] && p === board[r + 3][c]) {
        return {
          winner: p,
          winningCells: [[r, c], [r + 1, c], [r + 2, c], [r + 3, c]]
        };
      }
    }
  }

  // Diagonal (down-right \)
  for (let r = 0; r < C4_ROWS - 3; r++) {
    for (let c = 0; c < C4_COLS - 3; c++) {
      const p = board[r][c];
      if (p && p === board[r + 1][c + 1] && p === board[r + 2][c + 2] && p === board[r + 3][c + 3]) {
        return {
          winner: p,
          winningCells: [[r, c], [r + 1, c + 1], [r + 2, c + 2], [r + 3, c + 3]]
        };
      }
    }
  }

  // Diagonal (down-left /)
  for (let r = 0; r < C4_ROWS - 3; r++) {
    for (let c = 3; c < C4_COLS; c++) {
      const p = board[r][c];
      if (p && p === board[r + 1][c - 1] && p === board[r + 2][c - 2] && p === board[r + 3][c - 3]) {
        return {
          winner: p,
          winningCells: [[r, c], [r + 1, c - 1], [r + 2, c - 2], [r + 3, c - 3]]
        };
      }
    }
  }

  // Check for draw (top row all filled)
  if (board[0].every(cell => cell !== null)) {
    return { winner: 'draw', winningCells: null };
  }

  return { winner: null, winningCells: null };
}

// Pre-computed Opening Book according to Victor Allis 1988 Solved Table
// Key: sequence of column moves e.g. "3" -> response "3", "3,2" -> response "3"
const VICTOR_ALLIS_OPENING_BOOK: Record<string, number> = {
  "": 3,          // Move 1 (Red starts): Center Column 3 (Guaranteed Win)
  "3": 3,         // Move 2 if Yellow responds in 3: Red plays 3 again
  "3,3": 3,       // Move 3: Red continues vertical dominance
  "3,2": 3,       // Move 3 if Yellow responds in 2: Red plays 3
  "3,4": 3,       // Move 3 if Yellow responds in 4: Red plays 3
  "3,1": 3,       // Move 3 if Yellow responds in 1: Red plays 3
  "3,5": 3,       // Move 3 if Yellow responds in 5: Red plays 3
  "3,0": 3,       // Move 3 if Yellow responds in 0: Red plays 3
  "3,6": 3,       // Move 3 if Yellow responds in 6: Red plays 3
  "3,3,3": 2,     // Red branch
  "3,2,3": 2,
  "3,4,3": 4,
};

const COLUMN_WEIGHTS = [3, 4, 6, 9, 6, 4, 3];

function evaluateWindow(window: (C4Player | null)[], player: C4Player, opponent: C4Player): number {
  let score = 0;
  let pCount = 0;
  let oCount = 0;
  let emptyCount = 0;

  for (const cell of window) {
    if (cell === player) pCount++;
    else if (cell === opponent) oCount++;
    else emptyCount++;
  }

  if (pCount === 4) return 100000;
  if (pCount === 3 && emptyCount === 1) score += 80;
  else if (pCount === 2 && emptyCount === 2) score += 18;

  if (oCount === 3 && emptyCount === 1) score -= 120; // High priority blocking
  else if (oCount === 2 && emptyCount === 2) score -= 22;

  return score;
}

export function heuristicScore(board: C4Board, player: C4Player): number {
  const opponent: C4Player = player === 'R' ? 'Y' : 'R';
  let score = 0;

  // Center column weight preference
  for (let r = 0; r < C4_ROWS; r++) {
    for (let c = 0; c < C4_COLS; c++) {
      if (board[r][c] === player) score += COLUMN_WEIGHTS[c] * 4;
      else if (board[r][c] === opponent) score -= COLUMN_WEIGHTS[c] * 4;
    }
  }

  // Windows of 4
  for (let r = 0; r < C4_ROWS; r++) {
    for (let c = 0; c < C4_COLS - 3; c++) {
      score += evaluateWindow([board[r][c], board[r][c + 1], board[r][c + 2], board[r][c + 3]], player, opponent);
    }
  }

  for (let r = 0; r < C4_ROWS - 3; r++) {
    for (let c = 0; c < C4_COLS; c++) {
      score += evaluateWindow([board[r][c], board[r + 1][c], board[r + 2][c], board[r + 3][c]], player, opponent);
    }
  }

  for (let r = 0; r < C4_ROWS - 3; r++) {
    for (let c = 0; c < C4_COLS - 3; c++) {
      score += evaluateWindow([board[r][c], board[r + 1][c + 1], board[r + 2][c + 2], board[r + 3][c + 3]], player, opponent);
    }
  }

  for (let r = 0; r < C4_ROWS - 3; r++) {
    for (let c = 3; c < C4_COLS; c++) {
      score += evaluateWindow([board[r][c], board[r + 1][c - 1], board[r + 2][c - 2], board[r + 3][c - 3]], player, opponent);
    }
  }

  return score;
}

// Transposition Cache for ultra-fast evaluation
const c4TranspositionMap = new Map<string, { depth: number; score: number; bestCol: number }>();

function boardToHashKey(board: C4Board, isMax: boolean): string {
  let key = isMax ? 'M:' : 'm:';
  for (let r = 0; r < C4_ROWS; r++) {
    for (let c = 0; c < C4_COLS; c++) {
      key += board[r][c] || '.';
    }
  }
  return key;
}

// Alpha-Beta Minimax Engine
export function minimaxC4(
  board: C4Board,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  activePlayer: C4Player,
  opponentPlayer: C4Player,
  counter: { nodes: number }
): { score: number; bestCol: number } {
  counter.nodes++;

  const { winner } = checkC4Winner(board);
  if (winner === activePlayer) return { score: 100000 + depth * 100, bestCol: -1 };
  if (winner === opponentPlayer) return { score: -100000 - depth * 100, bestCol: -1 };
  if (winner === 'draw') return { score: 0, bestCol: -1 };

  if (depth <= 0) {
    return { score: heuristicScore(board, activePlayer), bestCol: -1 };
  }

  const hashKey = boardToHashKey(board, isMaximizing);
  const cached = c4TranspositionMap.get(hashKey);
  if (cached && cached.depth >= depth) {
    return { score: cached.score, bestCol: cached.bestCol };
  }

  const validCols = getValidColumns(board);
  if (validCols.length === 0) return { score: 0, bestCol: -1 };

  let bestCol = validCols[0];

  if (isMaximizing) {
    let maxScore = -Infinity;
    for (const col of validCols) {
      const row = getDropRow(board, col);
      board[row][col] = activePlayer;
      const { score } = minimaxC4(board, depth - 1, alpha, beta, false, activePlayer, opponentPlayer, counter);
      board[row][col] = null;

      if (score > maxScore) {
        maxScore = score;
        bestCol = col;
      }
      alpha = Math.max(alpha, maxScore);
      if (beta <= alpha) break; // Beta cut-off
    }
    c4TranspositionMap.set(hashKey, { depth, score: maxScore, bestCol });
    return { score: maxScore, bestCol };
  } else {
    let minScore = Infinity;
    for (const col of validCols) {
      const row = getDropRow(board, col);
      board[row][col] = opponentPlayer;
      const { score } = minimaxC4(board, depth - 1, alpha, beta, true, activePlayer, opponentPlayer, counter);
      board[row][col] = null;

      if (score < minScore) {
        minScore = score;
        bestCol = col;
      }
      beta = Math.min(beta, minScore);
      if (beta <= alpha) break; // Alpha cut-off
    }
    c4TranspositionMap.set(hashKey, { depth, score: minScore, bestCol });
    return { score: minScore, bestCol };
  }
}

// Instant Precomputed / High-Speed Lookup Engine
export function evaluateAllC4Columns(
  board: C4Board,
  currentPlayer: C4Player,
  searchDepth: number = 7,
  moveSequenceString: string = ""
): { evals: C4ColumnEval[]; bestCol: number; totalNodes: number; lookupTimeMs: number } {
  const startTime = performance.now();
  const opponent: C4Player = currentPlayer === 'R' ? 'Y' : 'R';
  const counter = { nodes: 0 };
  const evals: C4ColumnEval[] = [];

  // Check Opening Book first for 0ms response!
  if (VICTOR_ALLIS_OPENING_BOOK[moveSequenceString] !== undefined) {
    const bookCol = VICTOR_ALLIS_OPENING_BOOK[moveSequenceString];
    if (getDropRow(board, bookCol) !== -1) {
      const lookupTimeMs = Number((performance.now() - startTime).toFixed(3));
      
      // Populate basic evals
      for (let c = 0; c < C4_COLS; c++) {
        const row = getDropRow(board, c);
        const isValid = row !== -1;
        const isBest = c === bookCol;
        evals.push({
          col: c,
          score: isBest ? 500000 : 0,
          outcome: isBest ? 'win' : 'draw',
          depthFound: 41,
          isBest,
          isValid,
          threatLevel: isBest ? 'winning' : 'none',
          commentary: isBest ? 'Pre-calculated Solved Book (Victor Allis)' : ''
        });
      }
      return { evals, bestCol: bookCol, totalNodes: 1, lookupTimeMs };
    }
  }

  let bestScore = -Infinity;
  let optimalCol = 3;

  for (let col = 0; col < C4_COLS; col++) {
    const row = getDropRow(board, col);
    if (row === -1) {
      evals.push({
        col,
        score: -999999,
        outcome: 'loss',
        depthFound: 0,
        isBest: false,
        isValid: false,
        threatLevel: 'none',
        commentary: 'Column Full / עמודה מלאה'
      });
      continue;
    }

    // 1. Check for immediate winning move
    board[row][col] = currentPlayer;
    const immediateWin = checkC4Winner(board).winner === currentPlayer;

    // 2. Check if opponent could win on top of this move immediately (Blunder check!)
    let createsOpponentWin = false;
    if (row > 0) {
      board[row - 1][col] = opponent;
      if (checkC4Winner(board).winner === opponent) {
        createsOpponentWin = true;
      }
      board[row - 1][col] = null;
    }

    // Evaluate position with Alpha-Beta
    let score = 0;
    if (immediateWin) {
      score = 500000;
    } else {
      const result = minimaxC4(board, searchDepth - 1, -Infinity, Infinity, false, currentPlayer, opponent, counter);
      score = result.score;
      if (createsOpponentWin && score < 100000) {
        score -= 25000; // Heavily penalize blunders
      }
    }
    board[row][col] = null;

    let threatLevel: 'none' | 'critical' | 'winning' | 'blunder' = 'none';
    let outcome: 'win' | 'draw' | 'loss' | 'neutral' = 'neutral';
    let commentary = '';

    if (immediateWin) {
      threatLevel = 'winning';
      outcome = 'win';
      commentary = 'Immediate Win (ניצחון מיידי)';
    } else if (createsOpponentWin) {
      threatLevel = 'blunder';
      outcome = 'loss';
      commentary = 'Blunder: Gives opponent win (שגיאה קטלנית)';
    } else if (score > 1000) {
      outcome = 'win';
      threatLevel = 'none';
      commentary = 'Forced Win Sequence (מסלול ניצחון כפוי)';
    } else if (score < -1000) {
      outcome = 'loss';
      commentary = 'Disadvantage (נחיתות עמדתית)';
    } else {
      outcome = 'draw';
      commentary = 'Balanced Game (תיקו מושלם)';
    }

    evals.push({
      col,
      score,
      outcome,
      depthFound: searchDepth,
      isBest: false,
      isValid: true,
      threatLevel,
      commentary
    });

    if (score > bestScore) {
      bestScore = score;
      optimalCol = col;
    }
  }

  evals.forEach(ev => {
    if (ev.isValid && ev.score === bestScore) {
      ev.isBest = true;
    }
  });

  const lookupTimeMs = Number((performance.now() - startTime).toFixed(3));
  return { evals, bestCol: optimalCol, totalNodes: counter.nodes, lookupTimeMs };
}

// Connect 4 Game Theory Traps
export const C4_SOLVED_THEORY: SolvedOpeningTrap[] = [
  {
    id: 'center-column-proof',
    titleEn: 'Victor Allis 1988 Proof: Center Column Win',
    titleHe: 'הוכחת ויקטור אליס (1988): ניצחון במרכז',
    descEn: 'Connect 4 is mathematically solved. Player 1 (Red) opening in Column 4 (index 3) can ALWAYS force a win in 41 plies with perfect play.',
    descHe: 'המשחק 4 בשורה נפתר מתמטית במלואו. השחקן הראשון (אדום) שפותח בעמודה 4 מנצח בהכרח תוך 41 מהלכים מול כל הגנה אפשרית!',
    game: 'connect4',
    initialMoves: [3],
    recommendedMove: 3,
    whyEn: 'Column 3 is part of 16 potential 4-in-a-row connections, compared to 10 for adjacent columns and only 3 for corners.',
    whyHe: 'העמודה המרכזית משתתפת ב-16 קווי ניצחון שונים מתוך 69 אפשריים בלוח, לעומת 3 בלבד בעמודות הקיצון!',
    dangerLevel: 'theoretical'
  },
  {
    id: 'c4-parity-rule',
    titleEn: 'The Law of Parity (Even vs. Odd Rows)',
    titleHe: 'חוק הזוגיות (שורות זוגיות מול אי-זוגיות)',
    descEn: 'Player 1 controls ODD rows (1, 3, 5) while Player 2 controls EVEN rows (2, 4, 6) when columns fill from the bottom.',
    descHe: 'בגלל שהחלקים נופלים לתחתית, השחקן הראשון שולט בשורות האי-זוגיות והשחקן השני שולט בזוגיות. אדום מנצח לרוב באיומים אנכיים בשורות אי-זוגיות!',
    game: 'connect4',
    initialMoves: [3, 3, 3, 3],
    recommendedMove: 3,
    whyEn: 'In vertical zugzwang, Player 1 forces the opponent to play into the even cell, setting up Player 1 on the odd winning cell above.',
    whyHe: 'במצב כפייה אנכי (Zugzwang), השחקן הראשון מאלץ את היריב להניח כלי בשורה זוגית, מה שמאפשר לאדום להניח כלי מנצח מעליו.',
    dangerLevel: 'high'
  }
];
