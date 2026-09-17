import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  TTTBoard, 
  TTTPlayer, 
  Language, 
  TTTMoveEval 
} from '../types';
import { 
  checkTTTWinner, 
  getInstantTTTMove, 
  TTT_SOLVED_TRAPS 
} from '../engines/tictactoe';
import { AlgorithmThoughtVisualizer } from './AlgorithmThoughtVisualizer';
import { soundFx } from '../utils/sound';
import confetti from 'canvas-confetti';
import { 
  RotateCcw, 
  ShieldCheck, 
  User, 
  Lightbulb,
  Cpu,
  Zap
} from 'lucide-react';

interface Props {
  lang: Language;
}

export const TicTacToeGame: React.FC<Props> = ({ lang }) => {
  const [board, setBoard] = useState<TTTBoard>(Array(9).fill(null));
  const [turn, setTurn] = useState<TTTPlayer>('X');
  const [humanPlayer, setHumanPlayer] = useState<TTTPlayer>('O'); // Algorithm takes 'X' by default
  const [gameMode, setGameMode] = useState<'pve' | 'eve' | 'pvp'>('pve');
  const [history, setHistory] = useState<TTTBoard[]>([Array(9).fill(null)]);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const [stats, setStats] = useState({ algoWins: 0, humanWins: 0, draws: 0 });

  const algoPlayer = humanPlayer === 'X' ? 'O' : 'X';
  const { winner, line: winningLine } = useMemo(() => checkTTTWinner(board), [board]);
  const isGameOver = winner !== null;

  // Instant 0ms Pre-Calculated Decision Tree Evaluation
  const analysis = useMemo(() => {
    if (isGameOver) return { bestMove: -1, score: 0, moveEvaluations: [] as TTTMoveEval[], lookupTimeMs: 0 };
    return getInstantTTTMove([...board], turn);
  }, [board, turn, isGameOver]);

  // Contextual Ideal Recommendation for the exact current board state
  const idealRecommendation = useMemo(() => {
    if (isGameOver || analysis.bestMove === -1) return null;
    const num = analysis.bestMove + 1;
    const opp: TTTPlayer = turn === 'X' ? 'O' : 'X';

    // Immediate win
    const tempBoardWin = [...board];
    tempBoardWin[analysis.bestMove] = turn;
    if (checkTTTWinner(tempBoardWin).winner === turn) {
      return {
        cellNum: num,
        reasonHe: `שחק במשבצת #${num} כדי להשלים שלישייה מנצחת ולנצח את המשחק מיד! 🏆`,
        reasonEn: `Play Cell #${num} to complete a winning line and win immediately! 🏆`
      };
    }

    // Immediate block
    const tempBoardBlock = [...board];
    tempBoardBlock[analysis.bestMove] = opp;
    if (checkTTTWinner(tempBoardBlock).winner === opp) {
      return {
        cellNum: num,
        reasonHe: `חיוני! שחק במשבצת #${num} כדי לחסום ניצחון מיידי של היריב! 🛡️`,
        reasonEn: `Critical! Play Cell #${num} to block opponent's immediate winning move! 🛡️`
      };
    }

    // Center dominance
    if (analysis.bestMove === 4) {
      return {
        cellNum: num,
        reasonHe: `שחק במשבצת #5 (מרכז הלוח). שליטה במרכז מעניקה גמישות טקטית ומבטיחה ניצחון/תיקו. 🎯`,
        reasonEn: `Play Cell #5 (Center). Center control gives optimal tactical flexibility and guarantees draw/win. 🎯`
      };
    }

    // Corner tactical play
    if ([0, 2, 6, 8].includes(analysis.bestMove)) {
      return {
        cellNum: num,
        reasonHe: `שחק במשבצת #${num} (פינת הלוח) ליצירת איום כפול (Fork) ומציאת פרצה בקווי היריב. ⚡`,
        reasonEn: `Play Cell #${num} (Corner) to build dual threats and exploit opponent weak lines. ⚡`
      };
    }

    return {
      cellNum: num,
      reasonHe: `שחק במשבצת #${num} - המהלך המדויק ביותר לשמירה על שיווי משקל אופטימלי בלוח. ✨`,
      reasonEn: `Play Cell #${num} - mathematically optimal move maintaining balance. ✨`
    };
  }, [board, turn, isGameOver, analysis.bestMove]);

  const evalMap = useMemo(() => {
    const map = new Map<number, TTTMoveEval>();
    analysis.moveEvaluations.forEach(ev => map.set(ev.index, ev));
    return map;
  }, [analysis]);

  // Convert move evaluations into candidate thought steps for the live visualizer
  const candidateThoughtSteps = useMemo(() => {
    return analysis.moveEvaluations.map(ev => {
      let detailHe = 'משבצת רגילה';
      let detailEn = 'Standard Cell';
      let status: 'scanning' | 'pruned' | 'optimal' | 'evaluating' = 'evaluating';

      if (ev.isBest) {
        status = 'optimal';
        detailHe = 'מסלול ניצחון/תיקו אופטימלי';
        detailEn = 'Optimal Win/Draw Path';
      } else if (ev.score < 0) {
        status = 'pruned';
        detailHe = 'ענף מפסיד - נגזם';
        detailEn = 'Losing Branch - Pruned';
      }

      return {
        id: `cell-${ev.index}`,
        labelHe: `משבצת #${ev.index + 1}`,
        labelEn: `Cell #${ev.index + 1}`,
        status,
        score: ev.score > 0 ? `+${ev.score}` : ev.score,
        detailHe,
        detailEn
      };
    });
  }, [analysis]);

  // Handle Win/Draw celebrations
  useEffect(() => {
    if (winner === 'X' || winner === 'O') {
      soundFx.playWin();
      confetti({ particleCount: 65, spread: 75, origin: { y: 0.6 } });
      setStats(prev => ({
        ...prev,
        algoWins: winner === algoPlayer ? prev.algoWins + 1 : prev.algoWins,
        humanWins: winner === humanPlayer ? prev.humanWins + 1 : prev.humanWins
      }));
    } else if (winner === 'draw') {
      soundFx.playDraw();
      setStats(prev => ({ ...prev, draws: prev.draws + 1 }));
    }
  }, [winner, algoPlayer, humanPlayer]);

  // Make move
  const makeMove = useCallback((index: number) => {
    if (board[index] !== null || isGameOver) return;

    soundFx.playMove(turn);
    const newBoard = [...board];
    newBoard[index] = turn;
    
    setBoard(newBoard);
    setHistory(prev => [...prev, newBoard]);
    setTurn(prev => (prev === 'X' ? 'O' : 'X'));
    setShowHint(false);
  }, [board, isGameOver, turn]);

  // Instant Algorithmic Execution
  useEffect(() => {
    if (isGameOver) return;

    const isAlgoTurn = gameMode === 'eve' || (gameMode === 'pve' && turn === algoPlayer);
    if (!isAlgoTurn) return;

    const timer = setTimeout(() => {
      const { bestMove } = getInstantTTTMove([...board], turn);
      if (bestMove !== -1 && board[bestMove] === null) {
        makeMove(bestMove);
      }
    }, gameMode === 'eve' ? 500 : 150);

    return () => clearTimeout(timer);
  }, [board, turn, isGameOver, gameMode, algoPlayer, makeMove]);

  // Reset Board
  const resetGame = () => {
    const empty = Array(9).fill(null);
    setBoard(empty);
    setHistory([empty]);
    setTurn('X');
  };

  // Undo Move
  const undoMove = () => {
    if (history.length <= 1) return;
    const stepsBack = gameMode === 'pve' && history.length >= 3 ? 2 : 1;
    const newHistory = history.slice(0, -stepsBack);
    const targetBoard = newHistory[newHistory.length - 1];
    setBoard(targetBoard);
    setHistory(newHistory);
    const xCount = targetBoard.filter(c => c === 'X').length;
    const oCount = targetBoard.filter(c => c === 'O').length;
    setTurn(xCount === oCount ? 'X' : 'O');
  };

  // Load a theoretical trap
  const loadTrap = (trap: typeof TTT_SOLVED_TRAPS[0]) => {
    const newBoard: TTTBoard = Array(9).fill(null);
    let currentTurn: TTTPlayer = 'X';
    
    for (const move of trap.initialMoves) {
      newBoard[move] = currentTurn;
      currentTurn = currentTurn === 'X' ? 'O' : 'X';
    }
    setBoard(newBoard);
    setHistory([Array(9).fill(null), newBoard]);
    setTurn(currentTurn);
    setHumanPlayer(currentTurn);
    setGameMode('pve');
    setShowHint(true);
  };

  const evalScore = analysis.score;
  const evalPercentage = isGameOver 
    ? (winner === 'X' ? 100 : winner === 'O' ? 0 : 50)
    : turn === 'X'
      ? (evalScore > 0 ? 95 : evalScore < 0 ? 5 : 50)
      : (evalScore > 0 ? 5 : evalScore < 0 ? 95 : 50);

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-100">
                {lang === 'he' ? 'אלגוריתם דטרמיניסטי פתור (מחושב מראש 0ms)' : 'Deterministic Pre-Computed Engine (0ms)'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                <span>0ms Latency</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === 'he' 
                ? 'עץ האלגוריתמיקה מקודד מראש בזיכרון. תגובה מיידית ב-0 מילישניות שמבטיחה ניצחון בכל טעות של המשתמש.'
                : 'Decision tree precomputed in memory. 0ms lookup latency enforcing maximum win strategy.'}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
            <button
              onClick={() => { setGameMode('pve'); resetGame(); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                gameMode === 'pve' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>{lang === 'he' ? 'אתגר את האלגוריתם' : 'Play Vs Algorithm'}</span>
            </button>
            <button
              onClick={() => { setGameMode('eve'); resetGame(); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                gameMode === 'eve' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>{lang === 'he' ? 'סימולציית אלגוריתם' : 'Auto Play'}</span>
            </button>
          </div>

          {gameMode === 'pve' && (
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1 text-xs">
              <span className="text-slate-500 px-2">{lang === 'he' ? 'אתה משחק:' : 'You Play:'}</span>
              <button
                onClick={() => { setHumanPlayer('O'); resetGame(); }}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  humanPlayer === 'O' ? 'bg-pink-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                O (אלגוריתם פותח)
              </button>
              <button
                onClick={() => { setHumanPlayer('X'); resetGame(); }}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  humanPlayer === 'X' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                X (אתה פותח)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Board & Realtime Precomputed Evaluation */}
        <div className="lg:col-span-6 flex flex-col items-center gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-3xl shadow-2xl">
          
          <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 font-bold text-sm">
                <span className="text-slate-400">{lang === 'he' ? 'תור:' : 'Turn:'}</span>
                <span className={`px-3 py-1 rounded-lg flex items-center gap-1.5 ${
                  turn === 'X' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'bg-pink-500/10 text-pink-400 border border-pink-500/30'
                }`}>
                  <span className="font-mono text-base">{turn === 'X' ? '✕' : '◯'}</span>
                  <span>{turn === algoPlayer ? (lang === 'he' ? 'אלגוריתם (מנצח)' : 'Algorithm (Unbeatable)') : (lang === 'he' ? 'אתה' : 'You')}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-800/40">
              <Zap className="w-3.5 h-3.5" />
              <span>Lookup: {analysis.lookupTimeMs}ms</span>
            </div>
          </div>

          {/* Evaluation Bar */}
          <div className="w-full bg-slate-950 border border-slate-800 p-3 rounded-2xl flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-cyan-400">X (Player 1)</span>
              <span className="text-slate-400 font-mono">
                {isGameOver 
                  ? (winner === 'draw' ? 'Draw!' : `${winner} Wins!`) 
                  : (evalScore === 0 ? (lang === 'he' ? 'עמדת תיקו כפויה' : 'Forced Draw') : evalScore > 0 ? 'X Forced Win' : 'O Forced Win')}
              </span>
              <span className="text-pink-400">O (Player 2)</span>
            </div>
            
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex relative" dir="ltr">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-300"
                style={{ width: `${evalPercentage}%` }}
              />
              <div 
                className="h-full bg-gradient-to-r from-pink-400 to-pink-500 transition-all duration-300"
                style={{ width: `${100 - evalPercentage}%` }}
              />
            </div>
          </div>

          {/* Ideal Player Recommendation Banner */}
          {idealRecommendation && (
            <div className={`w-full p-3.5 rounded-2xl border transition-all flex items-start gap-3 text-xs shadow-lg ${
              showHint 
                ? 'bg-amber-950/80 border-amber-500 text-amber-200 ring-2 ring-amber-400/50 animate-pulse' 
                : 'bg-slate-950/90 border-slate-800 text-slate-200'
            }`}>
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-400">
                    {lang === 'he' ? `המלצה אידיאלית לתורך (${turn}):` : `Ideal Recommendation for Turn (${turn}):`}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-mono font-bold text-[11px]">
                    {lang === 'he' ? `משבצת #${idealRecommendation.cellNum}` : `Cell #${idealRecommendation.cellNum}`}
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed font-medium">
                  {lang === 'he' ? idealRecommendation.reasonHe : idealRecommendation.reasonEn}
                </p>
              </div>
            </div>
          )}

          {/* 3x3 Grid */}
          <div className="relative p-3 bg-slate-950 rounded-3xl border-2 border-slate-800 shadow-inner">
            <div className="grid grid-cols-3 gap-3 w-64 h-64 sm:w-72 sm:h-72">
              {board.map((cell, idx) => {
                const isWinningSquare = winningLine?.includes(idx);
                const evalInfo = evalMap.get(idx);
                const isBestMove = evalInfo?.isBest && !isGameOver;
                const isSuggested = showHint && isBestMove;

                return (
                  <button
                    key={idx}
                    onClick={() => makeMove(idx)}
                    disabled={cell !== null || isGameOver}
                    className={`relative rounded-2xl font-bold flex flex-col items-center justify-center transition-all duration-200 select-none group ${
                      cell === null 
                        ? 'bg-slate-900/90 hover:bg-slate-800/90 hover:scale-[1.03] cursor-pointer border border-slate-800' 
                        : 'bg-slate-900 border border-slate-700/50 cursor-default'
                    } ${isWinningSquare ? 'ring-4 ring-emerald-500 bg-emerald-950/40' : ''} ${
                      isSuggested ? 'ring-4 ring-amber-400 ring-offset-2 ring-offset-slate-950 animate-pulse' : ''
                    }`}
                  >
                    {cell === 'X' && (
                      <span className="text-4xl sm:text-5xl font-mono text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.6)]">
                        ✕
                      </span>
                    )}
                    {cell === 'O' && (
                      <span className="text-4xl sm:text-5xl font-mono text-pink-400 drop-shadow-[0_0_12px_rgba(244,114,182,0.6)]">
                        ◯
                      </span>
                    )}

                    {cell === null && !isGameOver && showHeatmap && evalInfo && (
                      <div className="absolute inset-0 flex flex-col items-center justify-between p-2 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
                        <div className="w-full flex justify-between items-center text-[10px] font-mono">
                          {isBestMove ? (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                              ⭐ BEST
                            </span>
                          ) : (
                            <span className="text-slate-600">#{idx}</span>
                          )}
                          <span className={`font-bold ${
                            evalInfo.score > 0 ? 'text-emerald-400' : evalInfo.score === 0 ? 'text-blue-400' : 'text-rose-400'
                          }`}>
                            {evalInfo.score > 0 ? `+${evalInfo.score}` : evalInfo.score}
                          </span>
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 flex-wrap justify-center mt-2">
            <button
              onClick={resetGame}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{lang === 'he' ? 'משחק חדש' : 'Reset'}</span>
            </button>

            <button
              onClick={undoMove}
              disabled={history.length <= 1}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-all"
            >
              <span>{lang === 'he' ? 'בטל מהלך' : 'Undo'}</span>
            </button>

            <button
              onClick={() => setShowHint(prev => !prev)}
              disabled={isGameOver}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-all"
            >
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>{lang === 'he' ? 'מהלך אופטימלי' : 'Best Move'}</span>
            </button>
          </div>
        </div>

        {/* Right: Live Algorithm Thought Process Visualizer & Traps */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          
          {/* Animated Thought Visualizer Component */}
          <AlgorithmThoughtVisualizer
            gameType="tictactoe"
            lang={lang}
            currentTurnPlayer={turn}
            isAlgorithmTurn={gameMode === 'eve' || turn === algoPlayer}
            activeCandidates={candidateThoughtSteps}
            lookupTimeMs={analysis.lookupTimeMs}
            totalNodesAnalyzed={analysis.moveEvaluations.length}
            decisionExplanationHe={
              analysis.score > 0
                ? 'נמצא מסלול ניצחון כפוי! האלגוריתם ינצל את תפיסת הפינה/מרכז להכרעה.'
                : analysis.score === 0
                  ? 'עמדת תיקו מושלמת. האלגוריתם חוסם כל מלכודת ושומר על שיווי משקל.'
                  : 'עמדת נחיתות זמנית - האלגוריתם מגן במטרה לכפות שגיאה.'
            }
            decisionExplanationEn={
              analysis.score > 0
                ? 'Forced win sequence discovered!'
                : 'Perfect draw state maintained.'
            }
          />

          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl shadow-xl flex flex-col gap-3">
            <div className="flex items-center gap-2 text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="font-bold text-sm text-slate-200">
                {lang === 'he' ? 'עץ מלכודות מחושב מראש' : 'Pre-Calculated Solved Traps'}
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              {TTT_SOLVED_TRAPS.map(trap => (
                <div 
                  key={trap.id} 
                  onClick={() => loadTrap(trap)}
                  className="p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-xl cursor-pointer transition-all"
                >
                  <div className="font-bold text-slate-200 text-xs mb-1">
                    {lang === 'he' ? trap.titleHe : trap.titleEn}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {lang === 'he' ? trap.descHe : trap.descEn}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
