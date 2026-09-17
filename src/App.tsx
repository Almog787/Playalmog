import React, { useState, useEffect } from 'react';
import { GameType, ActiveTab, Language } from './types';
import { TicTacToeGame } from './components/TicTacToeGame';
import { Connect4Game } from './components/Connect4Game';
import { NimGame } from './components/NimGame';
import { GameTheoryAcademy } from './components/GameTheoryAcademy';
import { GameTreeVisualizer } from './components/GameTreeVisualizer';
import { soundFx } from './utils/sound';
import { 
  Gamepad2, 
  BookOpen, 
  GitBranch, 
  Volume2, 
  VolumeX, 
  Globe, 
  Brain, 
  Grid3X3, 
  CircleDot,
  Calculator
} from 'lucide-react';

export function App() {
  const [game, setGame] = useState<GameType>('tictactoe');
  const [tab, setTab] = useState<ActiveTab>('play');
  const [lang, setLang] = useState<Language>('he');
  const [isMuted, setIsMuted] = useState(false);

  // Set document dir and lang based on chosen language
  useEffect(() => {
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleSound = () => {
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950 font-sans">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Brain className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  {lang === 'he' ? 'תורת המשחקים: מנוע הפתרונות המלא' : 'Game Theory Solved Suite'}
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  UNBEATABLE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {lang === 'he' ? 'איקס-עיגול, 4 בשורה ומשחק נים פתורים מתמטית ב-0ms' : 'Unbeatable Tic-Tac-Toe, Connect 4 & Nim Solvers'}
              </p>
            </div>
          </div>

          {/* Primary Game Selector Switcher (3 Solved Games) */}
          <div className="bg-slate-950 p-1 rounded-2xl border border-slate-800 flex items-center gap-1 shadow-inner">
            <button
              onClick={() => { setGame('tictactoe'); setTab('play'); }}
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                game === 'tictactoe'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
              <span>{lang === 'he' ? 'איקס-עיגול' : 'Tic-Tac-Toe'}</span>
            </button>
            <button
              onClick={() => { setGame('connect4'); setTab('play'); }}
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                game === 'connect4'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CircleDot className="w-4 h-4" />
              <span>{lang === 'he' ? '4 בשורה' : 'Connect 4'}</span>
            </button>
            <button
              onClick={() => { setGame('nim'); setTab('play'); }}
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                game === 'nim'
                  ? 'bg-purple-500 text-slate-950 shadow-md shadow-purple-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>{lang === 'he' ? 'משחק נים' : 'Nim Game'}</span>
            </button>
          </div>

          {/* Utility Tools (Language & Audio) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(l => (l === 'he' ? 'en' : 'he'))}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition-all"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>{lang === 'he' ? 'English' : 'עברית'}</span>
            </button>

            <button
              onClick={toggleSound}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-all"
              title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
          </div>

        </div>
      </header>

      {/* Sub-Header Navigation Tabs */}
      <div className="bg-slate-900/40 border-b border-slate-800/60 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-center sm:justify-start gap-2 overflow-x-auto">
          <button
            onClick={() => setTab('play')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              tab === 'play'
                ? 'bg-slate-800 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gamepad2 className="w-4 h-4 text-cyan-400" />
            <span>{lang === 'he' ? 'לוח משחק וניתוח חי' : 'Interactive Board & Solver'}</span>
          </button>

          <button
            onClick={() => setTab('theory')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              tab === 'theory'
                ? 'bg-slate-800 text-amber-300 border border-amber-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>{lang === 'he' ? 'אקדמיית תורת המשחקים' : 'Game Theory Academy'}</span>
          </button>

          <button
            onClick={() => setTab('tree')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              tab === 'tree'
                ? 'bg-slate-800 text-emerald-300 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitBranch className="w-4 h-4 text-emerald-400" />
            <span>{lang === 'he' ? 'חוקר עץ החלטות (Tree)' : 'Decision Tree Explorer'}</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
        {tab === 'play' && (
          game === 'tictactoe' ? (
            <TicTacToeGame lang={lang} />
          ) : game === 'connect4' ? (
            <Connect4Game lang={lang} />
          ) : (
            <NimGame lang={lang} />
          )
        )}

        {tab === 'theory' && <GameTheoryAcademy lang={lang} />}

        {tab === 'tree' && <GameTreeVisualizer lang={lang} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500">
        <p>
          {lang === 'he' 
            ? 'מנוע מתמטי דטרמיניסטי בלתי מנוצח לתורת המשחקים | פתרון מלא ב-0ms לאיקס-עיגול, 4 בשורה ומשחק נים'
            : 'Unbeatable Game-Theoretic Solver | Strongly Solved Tic-Tac-Toe, Connect 4 & Nim Engine'}
        </p>
      </footer>

    </div>
  );
}

export default App;
