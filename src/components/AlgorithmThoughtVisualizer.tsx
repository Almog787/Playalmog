import React, { useState, useEffect } from 'react';
import { Language, GameType } from '../types';
import { Cpu, Zap, GitBranch, Binary, ShieldAlert, Sparkles, CheckCircle2, RefreshCw } from 'lucide-react';

interface ThoughtStep {
  id: string;
  labelHe: string;
  labelEn: string;
  status: 'scanning' | 'pruned' | 'optimal' | 'evaluating';
  score?: number | string;
  detailHe?: string;
  detailEn?: string;
}

interface ThoughtVisualizerProps {
  gameType: GameType;
  lang: Language;
  currentTurnPlayer: string;
  isAlgorithmTurn: boolean;
  activeCandidates: ThoughtStep[];
  lookupTimeMs: number;
  totalNodesAnalyzed?: number;
  decisionExplanationHe?: string;
  decisionExplanationEn?: string;
}

export const AlgorithmThoughtVisualizer: React.FC<ThoughtVisualizerProps> = ({
  gameType,
  lang,
  currentTurnPlayer,
  isAlgorithmTurn,
  activeCandidates,
  lookupTimeMs,
  totalNodesAnalyzed = 1,
  decisionExplanationHe,
  decisionExplanationEn
}) => {
  const [pulseIndex, setPulseIndex] = useState(0);

  // Cycling scan animation
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseIndex(prev => (prev + 1) % (activeCandidates.length || 1));
    }, 400);
    return () => clearInterval(interval);
  }, [activeCandidates.length]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl shadow-xl flex flex-col gap-4 backdrop-blur-md relative overflow-hidden">
      
      {/* Background Subtle Radar Glow */}
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <span>{lang === 'he' ? 'דרך המחשבה של האלגוריתם' : 'Algorithm Thought Process'}</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              {lang === 'he' ? 'ניתוח ענפי החלטה, גיזום וציון כדאיות בזמן אמת' : 'Real-time branch traversal & pruning visualization'}
            </p>
          </div>
        </div>

        {/* Live Metrics Pill */}
        <div className="flex items-center gap-2 text-[11px] font-mono">
          <div className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-emerald-400 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span>{lookupTimeMs}ms</span>
          </div>
        </div>
      </div>

      {/* Live Scanning Simulation Bar */}
      <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1.5">
            <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
            <span>{lang === 'he' ? 'סריקת ענפי החלטה:' : 'Scanning Decision Branches:'}</span>
          </span>
          <span className="text-slate-500 font-mono text-[11px]">
            {lang === 'he' ? `צמתים: ${totalNodesAnalyzed.toLocaleString()}` : `Nodes: ${totalNodesAnalyzed.toLocaleString()}`}
          </span>
        </div>

        {/* Animated Candidate Steps Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
          {activeCandidates.map((step, idx) => {
            const isScanning = idx === pulseIndex && isAlgorithmTurn;
            const isOptimal = step.status === 'optimal';
            const isPruned = step.status === 'pruned';

            return (
              <div
                key={step.id || idx}
                className={`p-2 rounded-xl border text-xs font-mono transition-all duration-200 flex flex-col justify-between ${
                  isOptimal
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/50 shadow-md shadow-emerald-950/40'
                    : isScanning
                      ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 ring-2 ring-cyan-400/60 animate-pulse scale-102'
                      : isPruned
                        ? 'bg-slate-950/50 border-slate-800/60 text-slate-600 opacity-60'
                        : 'bg-slate-900/80 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[11px]">
                    {lang === 'he' ? step.labelHe : step.labelEn}
                  </span>
                  {isOptimal ? (
                    <span className="text-[10px] px-1 rounded bg-emerald-500 text-slate-950 font-bold">
                      ⭐ BEST
                    </span>
                  ) : isPruned ? (
                    <span className="text-[9px] text-rose-400 font-sans">✂️ Pruned</span>
                  ) : null}
                </div>

                <div className="mt-1 flex justify-between items-end text-[10px]">
                  <span className="text-slate-400 text-[10px]">
                    {lang === 'he' ? step.detailHe : step.detailEn}
                  </span>
                  {step.score !== undefined && (
                    <span className={`font-bold ${
                      typeof step.score === 'number' && step.score > 0
                        ? 'text-emerald-400'
                        : typeof step.score === 'number' && step.score < 0
                          ? 'text-rose-400'
                          : 'text-cyan-400'
                    }`}>
                      {typeof step.score === 'number' && step.score > 0 ? `+${step.score}` : step.score}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Decision Summary Banner */}
      <div className="bg-slate-950/90 p-3 rounded-2xl border border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-300">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold text-slate-100 block mb-0.5">
            {lang === 'he' ? 'מסקנת האלגוריתם:' : 'Algorithm Conclusion:'}
          </span>
          <span className="text-slate-300">
            {lang === 'he' ? (decisionExplanationHe || 'הבחירה מבטיחה את ניצול הטעויות או שמירה על תיקו מושלם') : (decisionExplanationEn || 'Guarantees punishment of suboptimal paths or forced draw maintenance')}
          </span>
        </div>
      </div>

    </div>
  );
};
