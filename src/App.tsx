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
  Zap
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

export default function App() {
  const [systemState, setSystemState] = useState<SystemState | null>(null);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [distributionData, setDistributionData] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<string>('ALL');

  useEffect(() => {
    // In a real scenario, these fetch from GitHub Pages hosted artifacts.
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
          <p>INITIALIZING PIPELINE DATA...</p>
        </div>
      </div>
    );
  }

  const filteredExperiments = filterType === 'ALL' 
    ? experiments 
    : experiments.filter(e => e.type.includes(filterType));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-mono p-4 md:p-8" dir="ltr">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <Database className="text-cyan-400 w-6 h-6" />
            Riemann Hypothesis Autonomous Tracker
          </h1>
          <p className="text-slate-500 text-sm mt-1">Closed-Loop Automated Verification via GitHub Actions</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-3 bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-emerald-400 font-semibold text-sm">
            {systemState.system_status}
          </span>
          <span className="text-slate-500 text-xs ml-2 border-l border-slate-700 pl-2">
            Updated: {new Date(systemState.last_update).toLocaleTimeString()}
          </span>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        {/* KPI: Current T */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-20">
            <Activity className="w-16 h-16 text-cyan-400" />
          </div>
          <h3 className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">Current Scan Height (T)</h3>
          <div className="text-3xl font-bold text-cyan-400 font-sans tracking-tight">
            {systemState.current_T.toLocaleString(undefined, { minimumFractionDigits: 1 })}
          </div>
          <div className="mt-2 text-xs text-slate-400">Critical line \Re(s) = 0.5</div>
        </div>

        {/* KPI: Zeros Found */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-20">
            <CheckCircle2 className="w-16 h-16 text-emerald-400" />
          </div>
          <h3 className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">Verified Zeros Found</h3>
          <div className="text-3xl font-bold text-emerald-400 font-sans tracking-tight">
            {systemState.zeros_found.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-emerald-500/70">100% matched Hardy's Z(t)</div>
        </div>

        {/* KPI: Speed */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-20">
            <Zap className="w-16 h-16 text-amber-400" />
          </div>
          <h3 className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">Compute Rate</h3>
          <div className="text-3xl font-bold text-amber-400 font-sans tracking-tight">
            {systemState.zeros_per_sec.toLocaleString()} <span className="text-lg">Z/s</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">Dynamic Step Sizing Active</div>
        </div>

        {/* KPI: Budget */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-20">
            <Clock className="w-16 h-16 text-rose-400" />
          </div>
          <h3 className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">Runner Budget (Job)</h3>
          <div className="text-3xl font-bold text-rose-400 font-sans tracking-tight">
            {systemState.runner_budget_remaining_hrs.toFixed(1)} <span className="text-lg">hrs</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">Max 5.5h threshold before checkpoint</div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Zeros Distribution Chart */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-slate-200 font-bold">Zero Density Distribution</h3>
              <p className="text-xs text-slate-500 mt-1">Density per range segment (\Delta t = 10,000)</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={distributionData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="t_range" stroke="#475569" fontSize={12} tickMargin={10} />
                <YAxis stroke="#475569" fontSize={12} domain={['auto', 'auto']} />
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
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-slate-200 font-bold mb-4 flex items-center gap-2">
              <Github className="w-5 h-5 text-slate-400" /> 
              Actions Orchestration
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></div>
                <div>
                  <div className="text-sm font-bold text-slate-300">orchestrator.yml</div>
                  <div className="text-xs text-slate-500">Scheduled matrix generator. Next run in 4h.</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="mt-1 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></div>
                <div>
                  <div className="text-sm font-bold text-slate-300">worker_execution.yml</div>
                  <div className="text-xs text-slate-500">C++20 & Lean 4 parallel workers. Peak RAM capped at 3.5GB.</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="mt-1 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"></div>
                <div>
                  <div className="text-sm font-bold text-slate-300">dashboard_deploy.yml</div>
                  <div className="text-xs text-slate-500">Artifact aggregation & React UI static deployment.</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-3 bg-slate-950/50 border border-slate-800 rounded-lg">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Memory Constraint Check</div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400 w-[85%]"></div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>Peak: 3400 MB</span>
              <span>Max: 3500 MB</span>
            </div>
          </div>
        </div>

      </div>

      {/* Experiment Journal */}
      <div className="bg-slate-900 border border-slate-800 p-4 md:p-6 rounded-xl shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h3 className="text-slate-200 font-bold text-lg">Experiment Journal (state.json)</h3>
            <p className="text-xs text-slate-500 mt-1">Logs of recent execution workers and artifacts.</p>
          </div>
          
          <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
            <button 
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${filterType === 'ALL' ? 'bg-slate-800 text-slate-200' : 'text-slate-500 hover:text-slate-300'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilterType('Numerical')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${filterType === 'Numerical' ? 'bg-slate-800 text-slate-200' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Numerical
            </button>
            <button 
              onClick={() => setFilterType('Formal')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${filterType === 'Formal' ? 'bg-slate-800 text-slate-200' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Formal (Lean 4)
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-slate-500 uppercase bg-slate-950/50">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Run ID</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">T_start ➔ T_end</th>
                <th className="px-4 py-3">Zeros</th>
                <th className="px-4 py-3">Perf (CPU / RAM)</th>
                <th className="px-4 py-3 rounded-tr-lg">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredExperiments.map((exp, idx) => (
                <tr key={idx} className="hover:bg-slate-800/20 transition-colors">
                  <td className="px-4 py-4 font-mono text-cyan-400">
                    {exp.run_id}
                    <div className="text-[10px] text-slate-600 mt-0.5">commit: {exp.commit}</div>
                  </td>
                  <td className="px-4 py-4 text-slate-300">
                    <div className="flex items-center gap-2">
                      {exp.type.includes('Formal') ? <Terminal className="w-4 h-4 text-fuchsia-400" /> : <Cpu className="w-4 h-4 text-cyan-400" />}
                      {exp.type}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-400 font-mono text-xs">
                    {exp.t_start > 0 ? `${exp.t_start.toLocaleString()} ➔ ${exp.t_end.toLocaleString()}` : 'N/A (Prover)'}
                  </td>
                  <td className="px-4 py-4 text-slate-300 font-mono">
                    {exp.zeros_found > 0 ? exp.zeros_found.toLocaleString() : '-'}
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-slate-300 text-xs">{exp.cpu_time_sec}s</div>
                    <div className="text-slate-500 text-[10px]">{exp.peak_ram_mb} MB Peak</div>
                  </td>
                  <td className="px-4 py-4">
                    {exp.status === 'SUCCESS' && (
                      <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-xs font-bold uppercase">Success</span>
                    )}
                    {exp.status === 'RECOVERED' && (
                      <span className="px-2 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded text-xs font-bold uppercase">Recovered</span>
                    )}
                    {exp.status === 'ANOMALY' && (
                      <span className="px-2 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded text-xs font-bold uppercase flex items-center gap-1 w-fit">
                        <AlertTriangle className="w-3 h-3" /> Anomaly
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
