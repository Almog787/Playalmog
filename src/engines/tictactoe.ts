import { TTTBoard, TTTPlayer, TTTMoveEval, MinimaxTreeNode, SolvedOpeningTrap, PrecomputedNode } from '../types';

export const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

export function checkTTTWinner(board: TTTBoard): { winner: TTTPlayer | 'draw' | null; line: number[] | null } {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a] as TTTPlayer, line };
    }
  }
  if (board.every(cell => cell !== null)) {
    return { winner: 'draw', line: null };
  }
  return { winner: null, line: null };
}

export function getAvailableMoves(board: TTTBoard): number[] {
  const moves: number[] = [];
  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) moves.push(i);
  }
  return moves;
}

export function boardToKey(board: TTTBoard, turn: TTTPlayer): string {
  return board.map(c => c || '.').join('') + ':' + turn;
}

// Global Pre-Calculated Decision Tree Lookup Table (O(1) Memory Cache)
const PRECOMPUTED_TTT_MAP = new Map<string, { bestMove: number; score: number; moveEvaluations: TTTMoveEval[] }>();

// Pre-compute all states recursively at initialization
function rawMinimax(
  board: TTTBoard,
  depth: number,
  isMaximizing: boolean,
  activePlayer: TTTPlayer
): { score: number; bestMove: number } {
  const opponent: TTTPlayer = activePlayer === 'X' ? 'O' : 'X';
  const { winner } = checkTTTWinner(board);
  
  if (winner === activePlayer) return { score: 10 - depth, bestMove: -1 };
  if (winner === opponent) return { score: depth - 10, bestMove: -1 };
  if (winner === 'draw') return { score: 0, bestMove: -1 };

  const availableMoves = getAvailableMoves(board);
  let bestMove = availableMoves[0];

  if (isMaximizing) {
    let maxScore = -Infinity;
    for (const move of availableMoves) {
      board[move] = activePlayer;
      const { score } = rawMinimax(board, depth + 1, false, activePlayer);
      board[move] = null;
      if (score > maxScore) {
        maxScore = score;
        bestMove = move;
      }
    }
    return { score: maxScore, bestMove };
  } else {
    let minScore = Infinity;
    for (const move of availableMoves) {
      board[move] = opponent;
      const { score } = rawMinimax(board, depth + 1, true, activePlayer);
      board[move] = null;
      if (score < minScore) {
        minScore = score;
        bestMove = move;
      }
    }
    return { score: minScore, bestMove };
  }
}

// Populate the complete pre-computed decision lookup tree
export function buildPrecomputedTTTDatabase(): void {
  if (PRECOMPUTED_TTT_MAP.size > 0) return; // Already initialized

  function traverseAndBuild(board: TTTBoard, currentTurn: TTTPlayer) {
    const key = boardToKey(board, currentTurn);
    if (PRECOMPUTED_TTT_MAP.has(key)) return;

    const { winner } = checkTTTWinner(board);
    if (winner !== null) return; // Game over

    const availableMoves = getAvailableMoves(board);
    const opponent: TTTPlayer = currentTurn === 'X' ? 'O' : 'X';
    const moveEvaluations: TTTMoveEval[] = [];

    let bestScore = -Infinity;
    let bestMove = availableMoves[0];

    for (const move of availableMoves) {
      board[move] = currentTurn;
      // Evaluate outcome after this move from perspective of currentTurn
      const { score } = rawMinimax(board, 0, false, currentTurn);
      board[move] = null;

      let outcome: 'win' | 'draw' | 'loss' = 'draw';
      if (score > 0) outcome = 'win';
      else if (score < 0) outcome = 'loss';

      moveEvaluations.push({
        index: move,
        score,
        outcome,
        depth: 10 - Math.abs(score),
        isBest: false
      });

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    // Mark all optimal moves
    moveEvaluations.forEach(ev => {
      if (ev.score === bestScore) ev.isBest = true;
    });

    PRECOMPUTED_TTT_MAP.set(key, { bestMove, score: bestScore, moveEvaluations });

    // Recurse for all sub-states
    for (const move of availableMoves) {
      board[move] = currentTurn;
      traverseAndBuild(board, opponent);
      board[move] = null;
    }
  }

  // Build tree starting from empty board
  traverseAndBuild(Array(9).fill(null), 'X');
  traverseAndBuild(Array(9).fill(null), 'O');
}

// Execute pre-calculated database build immediately
buildPrecomputedTTTDatabase();

// Instant O(1) Move Engine Lookup (0ms calculation latency)
export function getInstantTTTMove(
  board: TTTBoard,
  currentTurn: TTTPlayer
): { bestMove: number; score: number; moveEvaluations: TTTMoveEval[]; lookupTimeMs: number } {
  const startTime = performance.now();
  const key = boardToKey(board, currentTurn);
  
  const precomputed = PRECOMPUTED_TTT_MAP.get(key);
  const lookupTimeMs = Number((performance.now() - startTime).toFixed(3));

  if (precomputed) {
    return {
      bestMove: precomputed.bestMove,
      score: precomputed.score,
      moveEvaluations: precomputed.moveEvaluations,
      lookupTimeMs
    };
  }

  // Fallback if state somehow missing from precomputation map
  const fallback = rawMinimax(board, 0, true, currentTurn);
  return {
    bestMove: fallback.bestMove,
    score: fallback.score,
    moveEvaluations: [],
    lookupTimeMs
  };
}

// Build a subtree for visualization
export function buildTTTGameTree(
  board: TTTBoard,
  currentPlayer: TTTPlayer,
  depthLimit: number = 2,
  currentDepth: number = 0
): MinimaxTreeNode {
  const { winner } = checkTTTWinner(board);
  const opponent: TTTPlayer = currentPlayer === 'X' ? 'O' : 'X';

  if (winner || currentDepth >= depthLimit) {
    let score = 0;
    if (winner === currentPlayer) score = 10 - currentDepth;
    else if (winner === opponent) score = currentDepth - 10;
    return {
      id: `node-${Math.random().toString(36).substr(2, 6)}`,
      name: winner ? `End: ${winner}` : `Depth ${currentDepth}`,
      player: currentPlayer,
      score,
      depth: currentDepth,
      children: []
    };
  }

  const availableMoves = getAvailableMoves(board);
  const children: MinimaxTreeNode[] = [];
  let bestScore = -Infinity;

  for (const move of availableMoves) {
    board[move] = currentPlayer;
    const childNode = buildTTTGameTree(board, opponent, depthLimit, currentDepth + 1);
    childNode.move = move;
    
    // Instant lookup from precomputed table
    const precomputed = getInstantTTTMove(board, currentPlayer);
    childNode.score = precomputed.score;
    board[move] = null;

    if (childNode.score > bestScore) {
      bestScore = childNode.score;
    }
    children.push(childNode);
  }

  children.forEach(c => {
    if (c.score === bestScore) {
      c.isBestMove = true;
    }
  });

  return {
    id: `root-${currentDepth}`,
    name: `Player ${currentPlayer} (Val: ${bestScore > 0 ? '+1 Win' : bestScore === 0 ? '0 Draw' : '-1 Loss'})`,
    player: currentPlayer,
    score: bestScore,
    depth: currentDepth,
    children
  };
}

// Solved Openings and Classic Traps Encyclopedia
export const TTT_SOLVED_TRAPS: SolvedOpeningTrap[] = [
  {
    id: 'corner-opposite-corner',
    titleEn: 'Opposite Corners Trap',
    titleHe: 'מלכודת הפינות הנגדיות',
    descEn: 'Player X plays Corner (0), O plays Center, X plays Opposite Corner (8). If O plays any corner, X gets a double fork win!',
    descHe: 'שחקן X משחק בפינה, O במרכז, ו-X עונה בפינה הנגדית. אם O ישחק בכל פינה אחרת, X יוצר "מזלג כפול" ומנצח מיד!',
    game: 'tictactoe',
    initialMoves: [0, 4, 8],
    recommendedMove: 1,
    whyEn: 'O MUST play an EDGE (1, 3, 5, or 7). Playing a corner creates two winning lines for X on move 5.',
    whyHe: 'שחקן O חייב לשחק בצלע (משבצות 1, 3, 5 או 7). בחירה בפינה תעניק ל-X ניצחון כפול בלתי ניתן לחסימה.',
    dangerLevel: 'high'
  },
  {
    id: 'triangle-fork',
    titleEn: 'Triangle Fork Trap',
    titleHe: 'מלכודת המשולש (פינה וצלע סמוכה)',
    descEn: 'X plays Corner (0) and adjacent Edge (5 or 7). Creates asymmetric double-attack.',
    descHe: 'X משחק בפינה 0 ובצלע 5 או 7. נוצרת התקפה דו-כיוונית שדורשת מענה מדויק.',
    game: 'tictactoe',
    initialMoves: [0, 4, 5],
    recommendedMove: 2,
    whyEn: 'Block the imminent diagonal threat immediately while claiming corner territory.',
    whyHe: 'חסימת האיום האלכסוני המיידי תוך תפיסת הפינה הנגדית שוברת את המלכודת ומבטיחה תיקו.',
    dangerLevel: 'high'
  },
  {
    id: 'center-opening-draw',
    titleEn: 'Center Opening Perfect Defense',
    titleHe: 'הגנה מושלמת מול פתיחת מרכז',
    descEn: 'X starts in the Center (4). O must respond in a Corner (0, 2, 6, 8).',
    descHe: 'X פותח במרכז (4). שחקן O חייב לענות באחת מ-4 הפינות כדי לא להפסיד.',
    game: 'tictactoe',
    initialMoves: [4],
    recommendedMove: 0,
    whyEn: 'Responding with an Edge gives X a forced win on Move 3 through a corner diagonal trap.',
    whyHe: 'מענה בצלע נותן ל-X ניצחון כפוי תוך 3 מהלכים באמצעות מלכודת אלכסונית.',
    dangerLevel: 'high'
  }
];
