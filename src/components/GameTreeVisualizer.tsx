import React, { useState, useMemo } from 'react';
import { Language, TTTBoard, MinimaxTreeNode } from '../types';
import { buildTTTGameTree } from '../engines/tictactoe';
import { GitBranch, ChevronRight, ChevronDown, Sparkles, Layers, ShieldCheck } from 'lucide-react';

interface Props {
  lang: Language;
}

export const GameTreeVisualizer: React.FC<Props> = ({ lang }) => {
  const [boardState, setBoardState] = useState<TTTBoard>([
    'X', null, null,
    null, 'O', null,
    null, null, null
  ]);
  const [depthLimit, setDepthLimit] = useState<number>(2);

  const tree = useMemo(() => {
    return buildTTTGameTree([...boardState], 'X', depthLimit, 0);
  }, [boardState, depthLimit]);

  const setPreset = (preset: 'corner' | 'center' | 'fork' | 'empty') => {
    if (preset === 'empty') {
      setBoardState(Array(9).fill(null));
    } else if (preset === 'corner') {
      setBoardState(['X', null, null, null, 'O', null, null, null, null]);
    } else if (preset === 'center') {
      setBoardState([null, null, null, null, 'X', null, null, null, null]);
    } else if (preset === 'fork') {
      setBoardState(['X', null, null, null, 'O', null, null, null, 'X']);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-xl backdrop-blur-md flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <GitBranch className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">
              {lang === 'he' ? 'חוקר עץ ההחלטות (Minimax Game Tree)' : 'Minimax Decision Tree Explorer'}
            </h2>
            <p className="text-sm text-slate-400">
              {lang === 'he' 
                ? 'צפייה חיה בענפי החיפוש, ערכי הגיזום וחישובי המחשב מכל עמדה'
                : 'Live inspection of recursive decision tree branches and evaluation outcomes.'}
            </p>
          </div>
        </div>

        {/* Depth & Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-2 text-xs">
            <span className="text-slate-400">{lang === 'he' ? 'עומק עץ:' : 'Depth:'}</span>
            <select
              value={depthLimit}
              onChange={e => setDepthLimit(Number(e.target.value))}
              className="bg-slate-900 text-cyan-400 font-mono font-bold rounded px-2 py-0.5 border border-slate-700 outline-none cursor-pointer"
            >
              <option value={1}>Depth 1</option>
              <option value={2}>Depth 2</option>
              <option value={3}>Depth 3</option>
            </select>
          </div>

          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1 text-xs">
            <button
              onClick={() => setPreset('empty')}
              className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-all"
            >
              {lang === 'he' ? 'ריק' : 'Empty'}
            </button>
            <button
              onClick={() => setPreset('corner')}
              className="px-2.5 py-1 rounded-lg text-cyan-400 hover:bg-slate-900 transition-all font-semibold"
            >
              {lang === 'he' ? 'פינה (X0)' : 'Corner'}
            </button>
            <button
              onClick={() => setPreset('fork')}
              className="px-2.5 py-1 rounded-lg text-amber-400 hover:bg-slate-900 transition-all font-semibold"
            >
              {lang === 'he' ? 'איום מזלג' : 'Fork Threat'}
            </button>
          </div>
        </div>
      </div>

      {/* Visual Tree Node Component */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl shadow-xl overflow-x-auto">
        <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>{lang === 'he' ? 'מבנה העץ והערכות המינימקס של הצמתים:' : 'Tree Structure & Node Minimax Values:'}</span>
        </h3>
        
        <div className="min-w-[600px]">
          <TreeNodeView node={tree} lang={lang} isRoot={true} />
        </div>
      </div>
    </div>
  );
};

interface NodeProps {
  node: MinimaxTreeNode;
  lang: Language;
  isRoot?: boolean;
}

const TreeNodeView: React.FC<NodeProps> = ({ node, lang, isRoot = false }) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className={`flex flex-col my-1 ${isRoot ? '' : 'ml-6 pl-4 border-l-2 border-slate-800'}`}>
      <div className="flex items-center gap-2 py-1.5">
        {hasChildren && (
          <button 
            onClick={() => setExpanded(!expanded)} 
            className="p-1 rounded bg-slate-800 text-slate-400 hover:text-slate-200"
          >
            {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        )}

        <div className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-2.5 transition-all ${
          node.isBestMove 
            ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-950/40'
            : node.score > 0
              ? 'bg-cyan-950/40 border-cyan-800 text-cyan-300'
              : node.score < 0
                ? 'bg-rose-950/40 border-rose-800 text-rose-300'
                : 'bg-slate-950 border-slate-800 text-slate-300'
        }`}>
          {node.isBestMove && (
            <span className="px-1 py-0.2 rounded bg-emerald-500 text-slate-950 font-bold text-[10px]">
              ⭐ OPTIMAL
            </span>
          )}
          {node.move !== undefined && (
            <span className="text-slate-400">
              Move: <b className="text-slate-200">#{node.move}</b>
            </span>
          )}
          <span className="font-bold">
            Score: {node.score > 0 ? `+${node.score}` : node.score}
          </span>
          <span className="text-[11px] text-slate-500">
            {node.score > 0 
              ? (lang === 'he' ? '(ניצחון כפוי)' : '(Forced Win)') 
              : node.score === 0 
                ? (lang === 'he' ? '(תיקו)' : '(Draw)') 
                : (lang === 'he' ? '(הפסד)' : '(Loss)')}
          </span>
        </div>
      </div>

      {hasChildren && expanded && (
        <div className="flex flex-col">
          {node.children!.map((child, idx) => (
            <TreeNodeView key={child.id || idx} node={child} lang={lang} />
          ))}
        </div>
      )}
    </div>
  );
};
