import { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import {
  FileText,
  CheckCircle2,
  Copy,
  Check,
  Edit3,
  Eye,
  Save,
  RotateCcw,
  Sparkles,
  GitBranch,
  Clock,
} from 'lucide-react';

export default function App() {
  const [content, setContent] = useState<string>('');
  const [initialContent, setInitialContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Fetch README from server
  const fetchReadme = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/readme');
      if (res.ok) {
        const data = await res.json();
        setContent(data.content || '');
        setInitialContent(data.content || '');
      }
    } catch (err) {
      console.error('Failed to fetch README:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadme();
  }, []);

  // Save README
  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch('/api/readme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        setInitialContent(content);
        setIsEditing(false);
        setSaveMessage('נשמר בהצלחה! (Saved successfully)');
        setTimeout(() => setSaveMessage(null), 3000);
      }
    } catch (err) {
      console.error('Failed to save README:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setContent(initialContent);
    setIsEditing(false);
  };

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const lineCount = content.split('\n').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-500 flex items-center justify-center shadow-md shadow-amber-600/20 text-slate-950 font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
                README.md
              </h1>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-medium border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                מאגר מאופס (Reset)
              </span>
            </div>
            <p className="text-xs text-slate-400">
              המאגר אופס בהצלחה • נשמר קובץ README בלבד
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            id="copy-readme-button"
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition flex items-center gap-1.5 shadow-sm"
            title="העתק תוכן (Copy to clipboard)"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? 'הועתק!' : 'העתק'}</span>
          </button>

          {isEditing ? (
            <div className="flex items-center gap-1.5">
              <button
                id="cancel-edit-button"
                onClick={handleReset}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 transition flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>ביטול</span>
              </button>
              <button
                id="save-readme-button"
                onClick={handleSave}
                disabled={saving}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'שומר...' : 'שמור שינויים'}</span>
              </button>
            </div>
          ) : (
            <button
              id="edit-readme-button"
              onClick={() => setIsEditing(true)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>ערוך README</span>
            </button>
          )}
        </div>
      </header>

      {/* Status Banner */}
      <div className="bg-slate-900/40 border-b border-slate-800/60 px-4 sm:px-8 py-2 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-slate-300">
            <GitBranch className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono">main</span>
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{lineCount} שורות • {wordCount} מילים</span>
          </span>
          {saveMessage && (
            <span className="text-emerald-400 font-medium animate-fade-in flex items-center gap-1">
              <Check className="w-3 h-3" />
              {saveMessage}
            </span>
          )}
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/60 text-xs">
          <button
            onClick={() => setIsEditing(false)}
            className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${
              !isEditing
                ? 'bg-slate-700 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>תצוגה מקדימה</span>
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${
              isEditing
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>עריכה</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
            <p className="text-sm text-slate-400">טוען את קובץ ה-README...</p>
          </div>
        ) : isEditing ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
              <span>עורך Markdown</span>
              <span className="font-mono text-[11px]">README.md</span>
            </div>
            <textarea
              id="readme-markdown-editor"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="# הכנס תוכן README כאן..."
              className="w-full h-[65vh] bg-slate-950 text-slate-200 font-mono text-xs sm:text-sm p-4 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500 leading-relaxed resize-y"
              dir="auto"
            />
          </div>
        ) : (
          <article
            className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 sm:p-10 shadow-2xl backdrop-blur-sm"
            dir="auto"
          >
            <div className="markdown-body prose prose-invert prose-slate max-w-none space-y-4">
              <Markdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white border-b border-slate-800 pb-3 mb-6 tracking-tight flex items-center gap-2">
                      <Sparkles className="w-6 h-6 text-amber-400 shrink-0 inline-block" />
                      <span>{children}</span>
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-100 border-b border-slate-800/60 pb-2 mt-8 mb-4">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-lg font-semibold text-amber-300 mt-6 mb-3">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-4">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside space-y-2 text-slate-300 text-sm sm:text-base my-4 pr-2 pl-2">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside space-y-2 text-slate-300 text-sm sm:text-base my-4 pr-2 pl-2">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-slate-300 leading-relaxed">
                      {children}
                    </li>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-amber-500 bg-slate-850/60 px-4 py-2 rounded-r-lg my-4 text-slate-300 italic">
                      {children}
                    </blockquote>
                  ),
                  code: ({ children }) => (
                    <code className="bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded text-xs sm:text-sm font-mono border border-slate-700/60">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto my-4 text-xs sm:text-sm text-slate-200 font-mono">
                      {children}
                    </pre>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-amber-400 hover:text-amber-300 underline underline-offset-4 decoration-amber-500/40 hover:decoration-amber-400 transition"
                    >
                      {children}
                    </a>
                  ),
                  hr: () => <hr className="border-slate-800 my-8" />,
                }}
              >
                {content}
              </Markdown>
            </div>
          </article>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-4 text-center text-xs text-slate-500">
        <p>Repository Cleaned & Reset • README.md</p>
      </footer>
    </div>
  );
}
