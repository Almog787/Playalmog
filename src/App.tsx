import React, { useState, useEffect } from 'react';
import {
  EnvironmentPresetId,
  ToolMode,
  CameraView,
  FloatingObjectType,
  WaterPhysicsConfig,
  PhysicsTelemetry
} from './types';
import { ENVIRONMENTS } from './utils/environments';
import { WaterCanvas3D } from './components/WaterCanvas3D';
import { WaterControls } from './components/WaterControls';
import { PhysicsHUD } from './components/PhysicsHUD';
import { waterAudio } from './utils/waterAudio';
import { Waves, ExternalLink, Github } from 'lucide-react';

export function App() {
  const [lang, setLang] = useState<'he' | 'en'>('he');
  const [currentEnv, setCurrentEnv] = useState<EnvironmentPresetId>('tropical');
  const [toolMode, setToolMode] = useState<ToolMode>('ripple');
  const [cameraView, setCameraView] = useState<CameraView>('perspective_3d');
  const [spawnType, setSpawnType] = useState<FloatingObjectType>('duck');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [rainRate, setRainRate] = useState<number>(0);

  // Physics Configuration State
  const [physicsConfig, setPhysicsConfig] = useState<WaterPhysicsConfig>({
    waveSpeed: 1.6,
    damping: 0.985,
    surfaceTension: 0.08,
    viscosity: 0.04,
    gravity: 9.8,
    depth: 1.8,
    refractionIndex: 1.333,
    clarity: 0.85,
    foamThreshold: 0.045
  });

  // Telemetry state
  const [telemetry, setTelemetry] = useState<PhysicsTelemetry>({
    fps: 60,
    simTimeMs: 16.6,
    activeWavesEnergy: 0,
    peakWaveHeight: 0,
    rmsWaveHeight: 0,
    objectCount: 3,
    rainDropsPerSec: 0
  });

  // Key to force reset / calm water
  const [waterKey, setWaterKey] = useState<number>(0);

  useEffect(() => {
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // When environment changes, sync default rain rate
  const handleSelectEnv = (envKey: EnvironmentPresetId) => {
    setCurrentEnv(envKey);
    const env = ENVIRONMENTS[envKey];
    setRainRate(env.defaultRainRate);
    if (envKey === 'storm') {
      setPhysicsConfig((prev) => ({ ...prev, waveSpeed: 2.2, damping: 0.99, foamThreshold: 0.03 }));
    } else if (envKey === 'luxury_pool') {
      setPhysicsConfig((prev) => ({ ...prev, waveSpeed: 1.5, damping: 0.982, clarity: 0.95 }));
    }
  };

  const handleUpdatePhysics = (updates: Partial<WaterPhysicsConfig>) => {
    setPhysicsConfig((prev) => ({ ...prev, ...updates }));
  };

  const handleToggleMute = () => {
    const muted = waterAudio.toggleMute();
    setIsMuted(muted);
  };

  const handleResetWater = () => {
    setWaterKey((k) => k + 1);
    waterAudio.playSplash(0.3);
  };

  const currentEnvConfig = ENVIRONMENTS[currentEnv];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans text-slate-100 flex flex-col">
      {/* Top Header Bar */}
      <header
        id="app-header"
        className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-2.5 bg-gradient-to-b from-slate-950/80 to-transparent pointer-events-auto"
        dir={lang === 'he' ? 'rtl' : 'ltr'}
      >
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center shadow-lg shadow-cyan-500/20 backdrop-blur-md">
            <Waves className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-black tracking-tight text-white">
                {lang === 'he' ? 'הדמיית מים מציאותית' : 'Realistic Water Simulation'}
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
                3D Wave Physics
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              {lang === 'he'
                ? 'משוואת הגלים, שבירת סנל, אפקט פרנל, קאוסטיקה וכוח ציפה'
                : 'Wave equation, Snell refraction, Fresnel, caustics & Archimedes buoyancy'}
            </p>
          </div>
        </div>

        {/* GitHub Pages Live Link */}
        <div className="flex items-center gap-2">
          <a
            href="https://almog787.github.io/Playalmog/"
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub Pages Live URL"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs text-slate-200 transition-all shadow-md backdrop-blur-md"
          >
            <Github className="w-3.5 h-3.5" />
            <span className="hidden md:inline font-mono">almog787/Playalmog</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>
      </header>

      {/* Physics HUD & Educational Modal */}
      <PhysicsHUD telemetry={telemetry} lang={lang} />

      {/* 3D Realistic Water Canvas Stage */}
      <main className="flex-1 w-full h-full relative">
        <WaterCanvas3D
          key={waterKey}
          physicsConfig={physicsConfig}
          envConfig={currentEnvConfig}
          toolMode={toolMode}
          cameraView={cameraView}
          selectedSpawnType={spawnType}
          rainRate={rainRate}
          onTelemetryUpdate={setTelemetry}
          lang={lang}
        />
      </main>

      {/* Interactive Floating Controls Bar */}
      <WaterControls
        currentEnv={currentEnv}
        onSelectEnv={handleSelectEnv}
        toolMode={toolMode}
        onSelectTool={setToolMode}
        cameraView={cameraView}
        onSelectCamera={setCameraView}
        spawnType={spawnType}
        onSelectSpawnType={setSpawnType}
        physicsConfig={physicsConfig}
        onUpdatePhysics={handleUpdatePhysics}
        rainRate={rainRate}
        onUpdateRainRate={setRainRate}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onResetWater={handleResetWater}
        lang={lang}
        onToggleLang={() => setLang((l) => (l === 'he' ? 'en' : 'he'))}
      />
    </div>
  );
}

export default App;
