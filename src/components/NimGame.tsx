import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Language } from '../types';
import { calculateNimSum, getBestNimMove, DEFAULT_NIM_PRESETS } from '../engines/nim';
import { AlgorithmThoughtVisualizer } from './AlgorithmThoughtVisualizer';
import { soundFx } from '../utils/sound';
import confetti from 'canvas-confetti';
import { 
  RotateCcw, 
  User, 
  Lightbulb, 
  Zap, 
  Calculator, 
  CheckCircle2
} from 'lucide-react';

interface Props {
  lang: Language;
}

export const NimGame: React.FC<Props> = ({ lang }) => {
  const [piles, setPiles] = useState<number[]>([3, 5, 7]);
  const [mode, setMode] = useState<'normal' | 'misere'>('normal');
  const [turn, setTurn] = useState<'human' | 'algo'>('human');
  const [history, setHistory] = useState<number[][]>([[3, 5, 7]]);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [stats, setStats] = useState({ algoWins: 0, humanWins: 0 });

  const totalMatchesRemaining = useMemo(() => piles.reduce((a, b) => a + b, 0), [piles]);
  const isGameOver = totalMatchesRemaining === 0;

  // Real-time XOR Math Analysis
  const mathAnalysis = useMemo(() => {
    const { nimSum, binaryPiles, binarySum } = calculateNimSum(piles);
    const bestMoveInfo = getBestNimMove(piles, mode);
    return { nimSum, binaryPiles, binarySum, bestMoveInfo };
  }, [piles, mode]);

  const bestMove = mathAnalysis.bestMoveInfo.move;

  // Contextual Ideal Recommendation for Nim Game
  const idealRecommendation = useMemo(() => {
    if (isGameOver || !bestMove || bestMove.pileIndex === -1) return null;
    const pNum = bestMove.pileIndex + 1;
    const count = bestMove.count;

    if (mathAnalysis.nimSum !== 0) {
      return {
        pileNum: pNum,
        count,
        reasonHe: `קח בדיוק ${count} פריט/ים מערימה #${pNum}. פעולה זו תאפס את סכום ה-XOR ל-0 ותביא אותך לעמדת ניצחון כפויה (100%)! 🏆`,
        reasonEn: `Take exactly ${count} item(s) from Pile #${pNum}. This zeros out the XOR sum (Nim-Sum = 0) locking a 100% forced win! 🏆`
      };
    } else {
      return {
        pileNum: pNum,
        count,
        reasonHe: `עמדת נחיתות זמנית (XOR שווה ל-0). קח ${count} פריט/ים מערימה #${pNum} והמתן לשגיאה של היריב כדי להחזיר את היוזמה! 🛡️`,
        reasonEn: `Defensive state (XOR sum = 0). Take ${count} item(s) from Pile #${pNum} awaiting opponent blunder! 🛡️`
      };
    }
  }, [isGameOver, bestMove, mathAnalysis.nimSum]);

  // Candidate thought steps for Nim visualizer
  const candidateThoughtSteps = useMemo(() => {
    return piles.map((count, idx) => {
      const isTargetPile = bestMove?.pileIndex === idx;
      let status: 'scanning' | 'pruned' | 'optimal' | 'evaluating' = 'evaluating';
      let detailHe = `גודל: ${count}`;
      let detailEn = `Size: ${count}`;

      if (isTargetPile) {
        status = 'optimal';
        detailHe = `הורד ${bestMove?.count} לאיפוס XOR`;
        detailEn = `Remove ${bestMove?.count} to zero XOR`;
      } else if (count === 0) {
        status = 'pruned';
        detailHe = 'ערימה ריקה';
        detailEn = 'Empty Pile';
      }

      return {
        id: `pile-${idx}`,
        labelHe: `ערימה #${idx + 1}`,
        labelEn: `Pile #${idx + 1}`,
        status,
        score: count,
        detailHe,
        detailEn
      };
    });
  }, [piles, bestMove]);

  // Determine Winner when game ends
  useEffect(() => {
    if (isGameOver) {
      const lastPlayerToMove = turn === 'human' ? 'algo' : 'human';
      const actualWinner = mode === 'normal' ? lastPlayerToMove : turn;

      if (actualWinner === 'algo') {
        soundFx.playWin();
        confetti({ particleCount: 75, spread: 80, origin: { y: 0.6 } });
        setStats(prev => ({ ...prev, algoWins: prev.algoWins + 1 }));
      } else {
        soundFx.playWin();
        confetti({ particleCount: 75, spread: 80, origin: { y: 0.6 } });
        setStats(prev => ({ ...prev, humanWins: prev.humanWins + 1 }));
      }
    }
  }, [isGameOver, turn, mode]);

  // Apply a move
  const executeMove = useCallback((pileIndex: number, count: number) => {
    if (isGameOver || pileIndex < 0 || pileIndex >= piles.length) return;
    if (count <= 0 || count > piles[pileIndex]) return;

    soundFx.playDrop(pileIndex);
    const newPiles = [...piles];
    newPiles[pileIndex] -= count;

    setPiles(newPiles);
    setHistory(prev => [...prev, newPiles]);
    setShowHint(false);
    setTurn(prev => (prev === 'human' ? 'algo' : 'human'));
  }, [isGameOver, piles]);

  // Instant 0ms Algorithm Execution
  useEffect(() => {
    if (isGameOver || turn !== 'algo') return;

    const timer = setTimeout(() => {
      const { move } = getBestNimMove(piles, mode);
      if (move && move.pileIndex !== -1) {
        executeMove(move.pileIndex, move.count);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [piles, turn, isGameOver, mode, executeMove]);

  // Reset Game
  const resetGame = (initialPiles: number[] = piles) => {
    setPiles(initialPiles);
    setHistory([initialPiles]);
    setTurn('human');
  };

  // Undo Move
  const undoMove = () => {
    if (history.length <= 1) return;
    const stepsBack = history.length >= 3 ? 2 : 1;
    const newHistory = history.slice(0, -stepsBack);
    const targetPiles = newHistory[newHistory.length - 1];
    setPiles(targetPiles);
    setHistory(newHistory);
    setTurn('human');
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-100">
                {lang === 'he' ? 'משחק נים: משפט בוטון (Bouton Theorem 1901)' : 'Nim Game: Bouton XOR Theorem'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                <span>Strongly Solved (XOR)</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === 'he' 
                ? 'משחק מתמטי פתור לחלוטין. האלגוריתם מנצל את סכום ה-XOR של ערימות המשחק כדי לכפות ניצחון 100%.'
                : 'Completely solved math game. Algorithm uses XOR Nim-Sum to guarantee a 100% forced win.'}
            </p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
            <button
              onClick={() => { setMode('normal'); resetGame(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 'normal' ? 'bg-purple-500 text-slate-950 shadow-md shadow-purple-500/20' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lang === 'he' ? 'רגיל (מי שלוקח אחרון מנצח)' : 'Normal (Last takes wins)'}
            </button>
            <button
              onClick={() => { setMode('misere'); resetGame(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 'misere' ? 'bg-purple-500 text-slate-950 shadow-md shadow-purple-500/20' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lang === 'he' ? 'הפוך (Misère - מי שלוקח מפסיד)' : 'Misère (Last takes loses)'}
            </button>
          </div>

          {/* Presets */}
          <div className="bg-slate-950 px-2 py-1 rounded-xl border border-slate-800 flex items-center gap-1 text-xs">
            <span className="text-slate-500 text-[11px]">{lang === 'he' ? 'ערימות:' : 'Piles:'}</span>
            {DEFAULT_NIM_PRESETS.map(preset => (
              <button
                key={preset.id}
                onClick={() => resetGame(preset.piles)}
                className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-purple-300 text-[11px] font-mono border border-slate-800"
              >
                {lang === 'he' ? preset.nameHe : preset.nameEn}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Game & Math Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Interactive Piles */}
        <div className="lg:col-span-6 flex flex-col items-center gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-3xl shadow-2xl">
          
          <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 font-bold text-sm">
                <span className="text-slate-400">{lang === 'he' ? 'תור:' : 'Turn:'}</span>
                <span className={`px-3 py-1 rounded-lg flex items-center gap-2 ${
                  turn === 'human' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                }`}>
                  <User className="w-4 h-4" />
                  <span>{turn === 'human' ? (lang === 'he' ? 'אתה' : 'You') : (lang === 'he' ? 'אלגוריתם בוטון (XOR)' : 'Bouton Algorithm')}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
              <span className="text-cyan-400">{lang === 'he' ? 'אתה' : 'You'}: {stats.humanWins}</span>
              <span className="text-slate-500">|</span>
              <span className="text-purple-400">{lang === 'he' ? 'אלגוריתם' : 'Algo'}: {stats.algoWins}</span>
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
                    {lang === 'he' ? 'המלצה אידיאלית עבורך:' : 'Ideal Recommendation:'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-mono font-bold text-[11px]">
                    {lang === 'he' ? `ערימה #${idealRecommendation.pileNum} (קח ${idealRecommendation.count})` : `Pile #${idealRecommendation.pileNum} (Take ${idealRecommendation.count})`}
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed font-medium">
                  {lang === 'he' ? idealRecommendation.reasonHe : idealRecommendation.reasonEn}
                </p>
              </div>
            </div>
          )}

          {/* Interactive Match Piles View */}
          <div className="w-full flex flex-col gap-4 bg-slate-950 p-6 rounded-3xl border-2 border-slate-800 shadow-inner min-h-[280px]">
            {piles.map((count, pIdx) => {
              const isTargetOfHint = showHint && bestMove?.pileIndex === pIdx;

              return (
                <div 
                  key={pIdx}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-center justify-between gap-4 ${
                    isTargetOfHint 
                      ? 'bg-amber-950/40 border-amber-500/80 ring-2 ring-amber-400 animate-pulse' 
                      : 'bg-slate-900/90 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-mono font-bold text-xs text-purple-400">
                      #{pIdx + 1}
                    </span>
                    
                    {/* Visual Matchsticks */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {Array.from({ length: count }).map((_, matchIdx) => (
                        <div
                          key={matchIdx}
                          onClick={() => {
                            if (turn !== 'human' || isGameOver) return;
                            executeMove(pIdx, count - matchIdx);
                          }}
                          className="w-4 h-12 sm:w-5 sm:h-14 rounded-full bg-gradient-to-t from-amber-600 via-amber-400 to-rose-500 shadow-md shadow-amber-500/20 cursor-pointer hover:scale-110 hover:brightness-125 transition-all flex items-start justify-center pt-1"
                          title={`Click to take ${count - matchIdx} items from pile #${pIdx + 1}`}
                        >
                          <div className="w-2 h-2 rounded-full bg-rose-400" />
                        </div>
                      ))}
                      {count === 0 && (
                        <span className="text-xs text-slate-600 italic">{lang === 'he' ? 'ערימה ריקה' : 'Empty Pile'}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions for human turn */}
                  {turn === 'human' && count > 0 && !isGameOver && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {Array.from({ length: count }).map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => executeMove(pIdx, i + 1)}
                          className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-purple-600 text-purple-300 hover:text-slate-950 border border-purple-500/30 text-xs font-mono font-bold transition-all"
                        >
                          -{i + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-3 flex-wrap justify-center mt-2">
            <button
              onClick={() => resetGame()}
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
              <span>{lang === 'he' ? 'הצג מהלך XOR אופטימלי' : 'Show Optimal XOR Move'}</span>
            </button>
          </div>
        </div>

        {/* Right: Animated Thought Process & Live Math Matrix */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          
          <AlgorithmThoughtVisualizer
            gameType="nim"
            lang={lang}
            currentTurnPlayer={turn}
            isAlgorithmTurn={turn === 'algo'}
            activeCandidates={candidateThoughtSteps}
            lookupTimeMs={0.1}
            totalNodesAnalyzed={piles.length}
            decisionExplanationHe={
              mathAnalysis.nimSum !== 0
                ? `סכום XOR שונה מאפס (${mathAnalysis.nimSum}). האלגוריתם מוריד פריטים מערימה #${(bestMove?.pileIndex ?? 0) + 1} לאיפוס XOR וכפיית ניצחון.`
                : 'סכום XOR שווה ל-0. עמדת נחיתות - האלגוריתם מגן וממתין לטעות משתמש.'
            }
            decisionExplanationEn={
              mathAnalysis.nimSum !== 0
                ? 'Non-zero Nim-sum detected. Zeroing XOR sum to lock forced victory.'
                : 'Zero Nim-sum. Playing defensive counter.'
            }
          />

          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl shadow-xl flex flex-col gap-3">
            <div className="flex items-center gap-2 text-purple-400">
              <Calculator className="w-5 h-5" />
              <h3 className="font-bold text-sm text-slate-200">
                {lang === 'he' ? 'מחשב ה-XOR הדינמי (Bouton Theorem)' : 'Dynamic XOR Math Engine'}
              </h3>
            </div>

            {/* Binary Bitwise Matrix */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col gap-2 font-mono text-xs">
              <div className="text-slate-500 border-b border-slate-800 pb-1 text-[11px] flex justify-between">
                <span>{lang === 'he' ? 'ערימה' : 'Pile'}</span>
                <span>{lang === 'he' ? 'ייצוג בינארי (Binary)' : 'Binary Bit Representation'}</span>
              </div>

              {piles.map((count, idx) => (
                <div key={idx} className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">Pile #{idx + 1} ({count}):</span>
                  <span className="text-purple-300 font-bold tracking-widest">
                    {mathAnalysis.binaryPiles[idx]}
                  </span>
                </div>
              ))}

              <div className="border-t border-slate-800 pt-2 mt-1 flex justify-between items-center">
                <span className="text-amber-400 font-bold">Nim-Sum (XOR ⊕):</span>
                <span className={`font-bold tracking-widest px-2 py-0.5 rounded ${
                  mathAnalysis.nimSum !== 0 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-900 text-slate-500'
                }`}>
                  {mathAnalysis.binarySum} (Dec: {mathAnalysis.nimSum})
                </span>
              </div>
            </div>

            {/* Tactical Commentary */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="flex items-start gap-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{lang === 'he' ? mathAnalysis.bestMoveInfo.explanationHe : mathAnalysis.bestMoveInfo.explanationEn}</span>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
