import { useState, useEffect } from 'react';
import { 
  Activity, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Database,
  Cpu,
  Github,
  Zap,
  HelpCircle,
  Globe
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface SystemState {
  current_T: number;
  zeros_found: number;
  zeros_per_sec: number;
  last_update: string;
  system_status: string;
  runner_budget_remaining_hrs: number;
}

interface Experiment {
  run_id: string;
  commit: string;
  t_start: number;
  t_end: number;
  cpu_time_sec: number;
  peak_ram_mb: number;
  zeros_found: number;
  status: string;
  type: string;
}

const DICT = {
  en: {
    title: "Riemann Hypothesis Autonomous Tracker",
    subtitle: "Closed-Loop Automated Verification via GitHub Actions",
    init: "INITIALIZING PIPELINE DATA...",
    updated: "Updated",
    kpi_t: "Current Scan Height (T)",
    kpi_t_desc: "The current height on the critical line Re(s)=0.5 being checked. The system searches for roots (zeros) along this imaginary axis.",
    kpi_t_sub: "Critical line Re(s) = 0.5",
    kpi_zeros: "Verified Zeros Found",
    kpi_zeros_desc: "Total number of non-trivial zeros identified that perfectly match Hardy's Z(t) function.",
    kpi_zeros_sub: "100% matched Hardy's Z(t)",
    kpi_rate: "Compute Rate",
    kpi_rate_desc: "The number of zeros discovered and verified per second across all active GitHub Action runners.",
    kpi_rate_sub: "Dynamic Step Sizing Active",
    kpi_budget: "Runner Budget (Job)",
    kpi_budget_desc: "Remaining time before GitHub Actions force-kills the worker. The orchestrator triggers a state save (checkpoint) before this hits 0.",
    kpi_budget_sub: "Max 5.5h threshold before checkpoint",
    chart_title: "Zero Density Distribution",
    chart_desc: "Visualizes the distance between consecutive zeros. Sudden drops or spikes might indicate a Gram's Law violation or a counterexample.",
    chart_sub: "Density per range segment (Δt = 10,000)",
    orchestration: "Actions Orchestration",
    orch_desc: "Live status of the CI/CD pipelines managing the computation loop.",
    orch_1: "orchestrator.yml",
    orch_1_sub: "Scheduled matrix generator. Allocates ranges to workers.",
    orch_2: "worker_execution.yml",
    orch_2_sub: "C++20 & Lean 4 parallel workers performing the actual math.",
    orch_3: "dashboard_deploy.yml",
    orch_3_sub: "Artifact aggregation & React UI static deployment.",
    mem_check: "Memory Constraint Check",
    mem_peak: "Peak",
    mem_max: "Max",
    journal_title: "Experiment Journal (state.json)",
    journal_desc: "Historical log of all parallel jobs, both numerical calculations and formal Lean 4 proofs.",
    filter_all: "All",
    filter_num: "Numerical",
    filter_form: "Formal (Lean 4)",
    th_run: "Run ID",
    th_type: "Type",
    th_range: "T_start ➔ T_end",
    th_zeros: "Zeros",
    th_perf: "Perf (CPU / RAM)",
    th_status: "Status",
    status_success: "Success",
    status_recovered: "Recovered",
    status_anomaly: "Anomaly",
    na: "N/A (Prover)"
  },
  he: {
    title: "מערכת מעקב אוטונומית - השערת רימן",
    subtitle: "אימות אוטומטי במעגל סגור מבוסס GitHub Actions",
    init: "מאתחל נתוני מערכת...",
    updated: "עודכן לאחרונה",
    kpi_t: "גובה סריקה נוכחי (T)",
    kpi_t_desc: "הגובה הנוכחי על הישר הקריטי (Re(s)=0.5) שנבדק. המערכת מחפשת את שורשי פונקציית הזטא לאורך ציר זה.",
    kpi_t_sub: "הישר הקריטי Re(s) = 0.5",
    kpi_zeros: "אפסים מאומתים",
    kpi_zeros_desc: "מספר האפסים הלא-טריוויאליים שנמצאו ואומתו כתואמים באופן מושלם לפונקציית Z(t) של הארדי.",
    kpi_zeros_sub: "100% התאמה ל-Hardy's Z(t)",
    kpi_rate: "קצב חישוב",
    kpi_rate_desc: "מספר האפסים שמתגלים ומאומתים בכל שנייה על פני כל העובדים (Runners) הפעילים.",
    kpi_rate_sub: "מנגנון צעד דינמי פעיל",
    kpi_budget: "תקציב זמן הרצה",
    kpi_budget_desc: "הזמן שנותר ל-GitHub Actions לפני סגירה כפויה. המערכת דואגת לשמור מצב (Checkpoint) בטוח לפני סיום הזמן.",
    kpi_budget_sub: "סף בטיחות של 5.5 שעות להרצה",
    chart_title: "התפלגות צפיפות האפסים",
    chart_desc: "ממחיש את הצפיפות והמרחק בין אפסים עוקבים. צניחה חדה או קפיצה עשויה להעיד על הפרה של חוק גראם או מציאת דוגמה נגדית.",
    chart_sub: "צפיפות למקטע בטווח (Δt = 10,000)",
    orchestration: "ניהול משימות Actions",
    orch_desc: "סטטוס חי של צינורות ה-CI/CD המנהלים את לולאת החישוב.",
    orch_1: "orchestrator.yml (המנהל)",
    orch_1_sub: "מייצר את מטריצת העבודה ומקצה טווחים לעובדים באופן דינמי.",
    orch_2: "worker_execution.yml (עובדים)",
    orch_2_sub: "מנועי C++20 ו-Lean 4 המבצעים את המתמטיקה בפועל במקביל.",
    orch_3: "dashboard_deploy.yml (פריסה)",
    orch_3_sub: "איסוף תוצרים (Artifacts) ופריסה אוטומטית של דף ה-React הזה.",
    mem_check: "בדיקת מגבלת זיכרון",
    mem_peak: "שיא",
    mem_max: "מקסימום",
    journal_title: "יומן ניסיונות ומשימות",
    journal_desc: "תיעוד היסטורי של כל המשימות המקבילות, הכולל חישובים נומריים והוכחות פורמליות (Lean 4).",
    filter_all: "הכל",
    filter_num: "חישוב נומרי",
    filter_form: "הוכחות (Lean 4)",
    th_run: "מזהה הרצה",
    th_type: "סוג",
    th_range: "טווח סריקה",
    th_zeros: "אפסים",
    th_perf: "ביצועים",
    th_status: "סטטוס",
    status_success: "הצלחה",
    status_recovered: "שוחזר",
    status_anomaly: "חריגה",
    na: "לא זמין (הוכחה)"
  }
};

export default function App() {
  const [systemState, setSystemState] = useState<SystemState | null>(null);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [distributionData, setDistributionData] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [lang, setLang] = useState<'he' | 'en'>('he');

  useEffect(() => {
    Promise.all([
      fetch('/data/state.json').then(res => res.json()),
      fetch('/data/experiments.json').then(res => res.json()),
      fetch('/data/zeros_distribution.json').then(res => res.json())
    ]).then(([stateData, experimentsData, distData]) => {
      setSystemState(stateData);
      setExperiments(experimentsData);
      setDistributionData(distData);
    }).catch(err => console.error("Failed to load dashboard data:", err));
  }, []);

  if (!systemState) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center font-mono">
        <div className="flex flex-col items-center gap-4">
          <Activity className="w-8 h-8 text-cyan-400 animate-pulse" />
          <p>{lang === 'en' ? 'INITIALIZING PIPELINE DATA...' : 'מאתחל נתוני מערכת...'}</p>
        </div>
      </div>
    );
  }

  const filteredExperiments = filterType === 'ALL' 
    ? experiments 
    : experiments.filter(e => e.type.includes(filterType));

  const t = DICT[lang];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-mono p-4 md:p-8" dir={lang === 'he' ? 'rtl' : 'ltr'}>
      
      {/* Header */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <Database className="text-cyan-400 w-6 h-6" />
            {t.title}
          </h1>
          <p className="text-slate-500 text-sm mt-1">{t.subtitle}</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center gap-4">
          <button 
            onClick={() => setLang(lang === 'he' ? 'en' : 'he')}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors text-sm"
          >
            <Globe className="w-4 h-4" />
            {lang === 'he' ? 'English' : 'עברית'}
          </button>
          
          <div className="flex items-center gap-3 bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-emerald-400 font-semibold text-sm">
              {systemState.system_status}
            </span>
            <span className={`text-slate-500 text-xs ${lang === 'he' ? 'mr-2 border-r pr-2' : 'ml-2 border-l pl-2'} border-slate-700`}>
              {t.updated}: {new Date(systemState.last_update).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        {/* KPI: Current T */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute top-0 opacity-20" style={{ [lang === 'he' ? 'left' : 'right']: '1rem', top: '1rem' }}>
            <Activity className="w-16 h-16 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-slate-500 text-xs uppercase font-bold tracking-wider">{t.kpi_t}</h3>
              <div className="relative cursor-help">
                <HelpCircle className="w-3.5 h-3.5 text-slate-600 hover:text-cyan-400" />
                <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-slate-200 text-xs p-2 rounded w-48 z-10 shadow-xl pointer-events-none border border-slate-700 top-full mt-1">
                  {t.kpi_t_desc}
                </div>
              </div>
            </div>
            <div className="text-3xl font-bold text-cyan-400 font-sans tracking-tight">
              {systemState.current_T.toLocaleString(undefined, { minimumFractionDigits: 1 })}
            </div>
          </div>
          <div className="mt-2 text-xs text-slate-400">{t.kpi_t_sub}</div>
        </div>

        {/* KPI: Zeros Found */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute top-0 opacity-20" style={{ [lang === 'he' ? 'left' : 'right']: '1rem', top: '1rem' }}>
            <CheckCircle2 className="w-16 h-16 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-slate-500 text-xs uppercase font-bold tracking-wider">{t.kpi_zeros}</h3>
              <div className="relative cursor-help">
                <HelpCircle className="w-3.5 h-3.5 text-slate-600 hover:text-emerald-400" />
                <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-slate-200 text-xs p-2 rounded w-48 z-10 shadow-xl pointer-events-none border border-slate-700 top-full mt-1">
                  {t.kpi_zeros_desc}
                </div>
              </div>
            </div>
            <div className="text-3xl font-bold text-emerald-400 font-sans tracking-tight">
              {systemState.zeros_found.toLocaleString()}
            </div>
          </div>
          <div className="mt-2 text-xs text-emerald-500/70">{t.kpi_zeros_sub}</div>
        </div>

        {/* KPI: Speed */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute top-0 opacity-20" style={{ [lang === 'he' ? 'left' : 'right']: '1rem', top: '1rem' }}>
            <Zap className="w-16 h-16 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-slate-500 text-xs uppercase font-bold tracking-wider">{t.kpi_rate}</h3>
              <div className="relative cursor-help">
                <HelpCircle className="w-3.5 h-3.5 text-slate-600 hover:text-amber-400" />
                <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-slate-200 text-xs p-2 rounded w-48 z-10 shadow-xl pointer-events-none border border-slate-700 top-full mt-1">
                  {t.kpi_rate_desc}
                </div>
              </div>
            </div>
            <div className="text-3xl font-bold text-amber-400 font-sans tracking-tight">
              {systemState.zeros_per_sec.toLocaleString()} <span className="text-lg">Z/s</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-slate-400">{t.kpi_rate_sub}</div>
        </div>

        {/* KPI: Budget */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute top-0 opacity-20" style={{ [lang === 'he' ? 'left' : 'right']: '1rem', top: '1rem' }}>
            <Clock className="w-16 h-16 text-rose-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-slate-500 text-xs uppercase font-bold tracking-wider">{t.kpi_budget}</h3>
              <div className="relative cursor-help">
                <HelpCircle className="w-3.5 h-3.5 text-slate-600 hover:text-rose-400" />
                <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-slate-200 text-xs p-2 rounded w-48 z-10 shadow-xl pointer-events-none border border-slate-700 top-full mt-1">
                  {t.kpi_budget_desc}
                </div>
              </div>
            </div>
            <div className="text-3xl font-bold text-rose-400 font-sans tracking-tight">
              {systemState.runner_budget_remaining_hrs.toFixed(1)} <span className="text-lg">hrs</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-slate-400">{t.kpi_budget_sub}</div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Zeros Distribution Chart */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg lg:col-span-2 group">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-slate-200 font-bold">{t.chart_title}</h3>
                <div className="relative cursor-help">
                  <HelpCircle className="w-4 h-4 text-slate-600 hover:text-cyan-400" />
                  <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-slate-200 text-xs p-3 rounded w-64 z-10 shadow-xl pointer-events-none border border-slate-700 top-full mt-1">
                    {t.chart_desc}
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-1">{t.chart_sub}</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={distributionData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="t_range" stroke="#475569" fontSize={12} tickMargin={10} />
                <YAxis stroke="#475569" fontSize={12} domain={['auto', 'auto']} orientation={lang === 'he' ? 'right' : 'left'} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#22d3ee' }}
                />
                <Line type="monotone" dataKey="density" stroke="#22d3ee" strokeWidth={2} dot={{ r: 4, fill: '#0f172a', strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Engine Pipeline Info */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg flex flex-col justify-between group">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Github className="w-5 h-5 text-slate-400" /> 
              <h3 className="text-slate-200 font-bold">{t.orchestration}</h3>
              <div className="relative cursor-help">
                <HelpCircle className="w-4 h-4 text-slate-600 hover:text-slate-300" />
                <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-slate-200 text-xs p-2 rounded w-48 z-10 shadow-xl pointer-events-none border border-slate-700 top-full mt-1">
                  {t.orch_desc}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1.5 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] flex-shrink-0"></div>
                <div>
                  <div className="text-sm font-bold text-slate-300">{t.orch_1}</div>
                  <div className="text-xs text-slate-500">{t.orch_1_sub}</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="mt-1.5 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] flex-shrink-0"></div>
                <div>
                  <div className="text-sm font-bold text-slate-300">{t.orch_2}</div>
                  <div className="text-xs text-slate-500">{t.orch_2_sub}</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="mt-1.5 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] flex-shrink-0"></div>
                <div>
                  <div className="text-sm font-bold text-slate-300">{t.orch_3}</div>
                  <div className="text-xs text-slate-500">{t.orch_3_sub}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-3 bg-slate-950/50 border border-slate-800 rounded-lg">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{t.mem_check}</div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden" dir="ltr">
              <div className="h-full bg-amber-400 w-[85%]"></div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>{t.mem_peak}: 3400 MB</span>
              <span>{t.mem_max}: 3500 MB</span>
            </div>
          </div>
        </div>

      </div>

      {/* Experiment Journal */}
      <div className="bg-slate-900 border border-slate-800 p-4 md:p-6 rounded-xl shadow-lg group">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-slate-200 font-bold text-lg">{t.journal_title}</h3>
              <div className="relative cursor-help">
                <HelpCircle className="w-4 h-4 text-slate-600 hover:text-slate-300" />
                <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-slate-200 text-xs p-3 rounded w-64 z-10 shadow-xl pointer-events-none border border-slate-700 top-full mt-1">
                  {t.journal_desc}
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1">Logs of recent execution workers and artifacts.</p>
          </div>
          
          <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
            <button 
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${filterType === 'ALL' ? 'bg-slate-800 text-slate-200' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {t.filter_all}
            </button>
            <button 
              onClick={() => setFilterType('Numerical')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${filterType === 'Numerical' ? 'bg-slate-800 text-slate-200' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {t.filter_num}
            </button>
            <button 
              onClick={() => setFilterType('Formal')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${filterType === 'Formal' ? 'bg-slate-800 text-slate-200' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {t.filter_form}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ textAlign: lang === 'he' ? 'right' : 'left' }}>
            <thead className="text-xs text-slate-500 uppercase bg-slate-950/50">
              <tr>
                <th className={`px-4 py-3 ${lang === 'he' ? 'rounded-tr-lg' : 'rounded-tl-lg'}`}>{t.th_run}</th>
                <th className="px-4 py-3">{t.th_type}</th>
                <th className="px-4 py-3 text-center">{t.th_range}</th>
                <th className="px-4 py-3">{t.th_zeros}</th>
                <th className="px-4 py-3">{t.th_perf}</th>
                <th className={`px-4 py-3 ${lang === 'he' ? 'rounded-tl-lg' : 'rounded-tr-lg'}`}>{t.th_status}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredExperiments.map((exp, idx) => (
                <tr key={idx} className="hover:bg-slate-800/20 transition-colors">
                  <td className="px-4 py-4 font-mono text-cyan-400">
                    {exp.run_id}
                    <div className="text-[10px] text-slate-600 mt-0.5" dir="ltr">commit: {exp.commit}</div>
                  </td>
                  <td className="px-4 py-4 text-slate-300">
                    <div className="flex items-center gap-2">
                      {exp.type.includes('Formal') ? <Terminal className="w-4 h-4 text-fuchsia-400" /> : <Cpu className="w-4 h-4 text-cyan-400" />}
                      <span dir="ltr">{exp.type}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-400 font-mono text-xs text-center" dir="ltr">
                    {exp.t_start > 0 ? `${exp.t_start.toLocaleString()} ➔ ${exp.t_end.toLocaleString()}` : t.na}
                  </td>
                  <td className="px-4 py-4 text-slate-300 font-mono">
                    {exp.zeros_found > 0 ? exp.zeros_found.toLocaleString() : '-'}
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-slate-300 text-xs" dir="ltr">{exp.cpu_time_sec}s</div>
                    <div className="text-slate-500 text-[10px]" dir="ltr">{exp.peak_ram_mb} MB Peak</div>
                  </td>
                  <td className="px-4 py-4">
                    {exp.status === 'SUCCESS' && (
                      <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-xs font-bold uppercase">{t.status_success}</span>
                    )}
                    {exp.status === 'RECOVERED' && (
                      <span className="px-2 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded text-xs font-bold uppercase">{t.status_recovered}</span>
                    )}
                    {exp.status === 'ANOMALY' && (
                      <span className="px-2 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded text-xs font-bold uppercase flex items-center gap-1 w-fit">
                        <AlertTriangle className="w-3 h-3" /> {t.status_anomaly}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}
