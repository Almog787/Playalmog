import React from 'react';
import { Language } from '../types';
import { 
  Brain, 
  ShieldCheck, 
  GitCommit, 
  Compass, 
  CheckCircle2, 
  HelpCircle, 
  Zap, 
  Target, 
  Sparkles,
  BookOpen,
  Calculator
} from 'lucide-react';

interface Props {
  lang: Language;
}

export const GameTheoryAcademy: React.FC<Props> = ({ lang }) => {
  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">
              {lang === 'he' ? 'אקדמיית תורת המשחקים: מפת הפתרונות המלאה' : 'Game Theory Academy: Solved Game Science'}
            </h2>
            <p className="text-sm text-slate-400">
              {lang === 'he' 
                ? 'כיצד אלגוריתמיקה, עצי החלטה ומשפטים מתמטיים (Bouton, Allis, Minimax) פותרים משחקים באופן מוחלט ב-0ms'
                : 'How decision trees and mathematical theorems (Bouton, Allis, Minimax) solve games deterministically.'}
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Key Concepts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Concept 1: What is a Solved Game */}
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl shadow-lg flex flex-col gap-3">
          <div className="flex items-center gap-2 text-cyan-400">
            <ShieldCheck className="w-6 h-6" />
            <h3 className="font-bold text-base text-slate-200">
              {lang === 'he' ? 'דרגות פתרון משחקים מתמטיות' : 'Tiers of Solved Games'}
            </h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {lang === 'he' 
              ? 'בתורת המשחקים הקומבינטורית, משחק בעל מידע מושלם מוגדר כ"פתור" באחת משלוש רמות:'
              : 'In combinatorial game theory, a deterministic game is solved in 3 tiers:'}
          </p>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="font-bold text-cyan-400 mb-0.5">
                {lang === 'he' ? '1. פתור חזק (Strongly Solved - איקס-עיגול, נים)' : '1. Strongly Solved (Tic-Tac-Toe, Nim)'}
              </div>
              <div className="text-slate-400">
                {lang === 'he' 
                  ? 'האלגוריתם יודע את המהלך האופטימלי המושלם מכל עמדה חוקית אפשרית בלוח ב-0ms.'
                  : 'Optimal move is known from EVERY legal reachable state.'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="font-bold text-amber-400 mb-0.5">
                {lang === 'he' ? '2. פתור חלש (Weakly Solved - 4 בשורה)' : '2. Weakly Solved (Connect 4)'}
              </div>
              <div className="text-slate-400">
                {lang === 'he' 
                  ? 'קיים אלגוריתם שיודע לשחק ממהלך הפתיחה עד לניצחון ודאי מול כל יריב (הוכחת ויקטור אליס 1988).'
                  : 'An efficient algorithm can secure a win/draw from the initial starting board against any opponent.'}
              </div>
            </div>
          </div>
        </div>

        {/* Concept 2: Bouton Theorem (Nim) */}
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl shadow-lg flex flex-col gap-3">
          <div className="flex items-center gap-2 text-purple-400">
            <Calculator className="w-6 h-6" />
            <h3 className="font-bold text-base text-slate-200">
              {lang === 'he' ? 'משפט בוטון (Bouton Theorem 1901) - משחק נים' : 'Bouton Theorem (1901) - Nim'}
            </h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {lang === 'he' 
              ? 'צ\'ארלס בוטון הוכיח ב-1901 שמשחק נים פתור לחלוטין באמצעות פעולת XOR בינארית של גדלי הערימות:'
              : 'Charles L. Bouton proved in 1901 that Nim is completely solved via bitwise XOR sum:'}
          </p>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-purple-300 text-center">
            S = P_1 ⊕ P_2 ⊕ ... ⊕ P_n
          </div>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                {lang === 'he' 
                  ? 'אם S ≠ 0: השחקן הנוכחי נמצא בעמדת ניצחון בטוחה (P-Position) וקיים מהלך שמביא את S ל-0.'
                  : 'If S ≠ 0: Current player has a guaranteed forced win strategy.'}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                {lang === 'he' 
                  ? 'אם S = 0: העמדה היא עמדת נחיתות, וכל מהלך של השחקן יחזיר את S לערך שונה מ-0 לטובת היריב.'
                  : 'If S = 0: Any move converts S to non-zero, handing the winning path to the opponent.'}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Comparison Table */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col gap-4">
        <div className="flex items-center gap-2 text-emerald-400">
          <Target className="w-6 h-6" />
          <h3 className="font-bold text-base text-slate-200">
            {lang === 'he' ? 'טבלת פתרונות מתמטיים של משחקי המערכת' : 'Mathematical Solved Matrix'}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono">
              <tr>
                <th className="p-3">{lang === 'he' ? 'משחק' : 'Game'}</th>
                <th className="p-3">{lang === 'he' ? 'שיטת פתרון' : 'Solution Method'}</th>
                <th className="p-3">{lang === 'he' ? 'סטטוס פתרון' : 'Solved Status'}</th>
                <th className="p-3">{lang === 'he' ? 'תוצאת משחק מושלם' : 'Outcome under Perfect Play'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              
              <tr className="hover:bg-slate-800/30">
                <td className="p-3 font-bold text-cyan-400">איקס עיגול (Tic-Tac-Toe)</td>
                <td className="p-3 font-mono text-slate-300">Minimax Memory Table (0ms)</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                    Strongly Solved
                  </span>
                </td>
                <td className="p-3 text-slate-200 font-semibold">{lang === 'he' ? 'תיקו כפוי (0.0)' : 'Forced Draw (0.0)'}</td>
              </tr>

              <tr className="hover:bg-slate-800/30">
                <td className="p-3 font-bold text-amber-400">4 בשורה (Connect 4)</td>
                <td className="p-3 font-mono text-slate-300">Victor Allis 1988 & Alpha-Beta</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold">
                    Weakly Solved
                  </span>
                </td>
                <td className="p-3 text-rose-400 font-semibold">{lang === 'he' ? 'ניצחון לשחקן 1 (אדום)' : 'Player 1 (Red) Win'}</td>
              </tr>

              <tr className="hover:bg-slate-800/30">
                <td className="p-3 font-bold text-purple-400">משחק נים (Nim Game)</td>
                <td className="p-3 font-mono text-slate-300">Bouton Theorem 1901 (Bitwise XOR)</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                    Strongly Solved
                  </span>
                </td>
                <td className="p-3 text-emerald-400 font-semibold">{lang === 'he' ? 'ניצחון כפוי לפי XOR' : 'Forced Win if S ≠ 0'}</td>
              </tr>

            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
