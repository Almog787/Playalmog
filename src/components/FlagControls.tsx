import React, { useState } from 'react';
import {
  Sun,
  Sunset,
  Moon,
  Sunrise,
  Wind,
  Volume2,
  VolumeX,
  Camera,
  RotateCw,
  Maximize2,
  Minimize2,
  EyeOff,
  Eye,
  Sliders,
  Sparkles,
  Gauge,
} from 'lucide-react';
import { TimeOfDayPreset, CameraPreset, FlagSceneConfig } from './FlagScene';

interface FlagControlsProps {
  config: FlagSceneConfig;
  onChangeConfig: (newConfig: Partial<FlagSceneConfig>) => void;
  onSelectCameraPreset: (preset: CameraPreset) => void;
  audioEnabled: boolean;
  onToggleAudio: () => void;
}

export default function FlagControls({
  config,
  onChangeConfig,
  onSelectCameraPreset,
  audioEnabled,
  onToggleAudio,
}: FlagControlsProps) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState<boolean>(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const times: { id: TimeOfDayPreset; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'noon', label: 'שמש צהריים', icon: Sun },
    { id: 'sunset', label: 'שקיעת זהב', icon: Sunset },
    { id: 'night', label: 'לילה וזרקורים', icon: Moon },
    { id: 'sunrise', label: 'זריחה צלולה', icon: Sunrise },
  ];

  const cameraAngles: { id: CameraPreset; label: string }[] = [
    { id: 'hero', label: '👑 מבט מלכותי' },
    { id: 'closeup', label: '✡️ תקריב מגן דוד' },
    { id: 'side', label: '🌊 תנועת הגלים' },
    { id: 'wide', label: '🌐 מבט פנורמי' },
    { id: 'top', label: '🦅 מבט על' },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 sm:p-6 select-none font-['Rubik','Heebo',sans-serif]">
      {/* Top Header & Fast Actions */}
      <header className="flex items-center justify-between w-full">
        {/* Title Badge (Ultra minimalist glass) */}
        <div
          className={`pointer-events-auto transition-all duration-300 backdrop-blur-md bg-slate-900/40 border border-white/10 rounded-2xl px-4 py-2.5 shadow-2xl flex items-center gap-3 ${
            isCollapsed ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-400/40 flex items-center justify-center text-blue-300 font-bold text-sm shadow-inner">
            🇮🇱
          </div>
          <div>
            <h1 className="text-white text-base sm:text-lg font-bold tracking-tight leading-none flex items-center gap-2">
              דגל ישראל
              <span className="text-[10px] font-normal tracking-widest text-blue-300/80 bg-blue-500/20 border border-blue-400/30 px-1.5 py-0.5 rounded-full uppercase">
                4K Physics
              </span>
            </h1>
            <p className="text-slate-400 text-xs mt-0.5 font-light">סימולציית בד תלת-ממדית בזמן אמת</p>
          </div>
        </div>

        {/* Quick Floating Action Icons */}
        <div className="pointer-events-auto flex items-center gap-2 backdrop-blur-md bg-slate-900/50 border border-white/10 rounded-2xl p-1.5 shadow-2xl">
          {/* Sound Toggle */}
          <button
            onClick={onToggleAudio}
            title={audioEnabled ? 'השתק משב רוח' : 'הפעל צלילי רוח'}
            className={`p-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
              audioEnabled
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Settings Panel Toggle */}
          <button
            onClick={() => setShowSettingsPanel(!showSettingsPanel)}
            title="בקרת רוח ופיזיקה"
            className={`p-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
              showSettingsPanel
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            title="מסך מלא"
            className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Hide/Show HUD */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'הצג ממשק' : 'הסתר ממשק (תצוגה נקייה)'}
            className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            {isCollapsed ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Center Settings Floating Dialog (if opened) */}
      {showSettingsPanel && !isCollapsed && (
        <div className="pointer-events-auto self-end backdrop-blur-xl bg-slate-900/80 border border-white/15 rounded-2xl p-5 shadow-2xl w-80 max-w-[90vw] text-right space-y-4 my-auto transition-all animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <button
              onClick={() => setShowSettingsPanel(false)}
              className="text-xs text-slate-400 hover:text-white cursor-pointer px-2 py-1 rounded bg-white/5"
            >
              סגור ✕
            </button>
            <h3 className="text-white font-semibold text-sm flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-blue-400" />
              בקרת פיזיקה ורוח
            </h3>
          </div>

          {/* Wind Speed Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-blue-400 font-medium">{config.windSpeed} מ'/שנ'</span>
              <span className="text-slate-300">עוצמת רוח:</span>
            </div>
            <input
              type="range"
              min="2"
              max="30"
              step="1"
              value={config.windSpeed}
              onChange={(e) => onChangeConfig({ windSpeed: parseFloat(e.target.value) })}
              className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>סוער (30)</span>
              <span>גאה (16)</span>
              <span>בריזה קלה (2)</span>
            </div>
          </div>

          {/* Wind Turbulence Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-blue-400 font-medium">{Math.round(config.windTurbulence * 100)}%</span>
              <span className="text-slate-300">מערבולות ומשבים:</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.windTurbulence}
              onChange={(e) => onChangeConfig({ windTurbulence: parseFloat(e.target.value) })}
              className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg appearance-none"
            />
          </div>

          {/* Quick Switches */}
          <div className="pt-2 border-t border-white/10 space-y-2">
            <label className="flex items-center justify-between text-xs text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={config.slowMotion}
                onChange={(e) => onChangeConfig({ slowMotion: e.target.checked })}
                className="accent-blue-500 rounded"
              />
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                הילוך איטי (Cinematic Slow-Mo)
              </span>
            </label>

            <label className="flex items-center justify-between text-xs text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={config.autoRotate}
                onChange={(e) => onChangeConfig({ autoRotate: e.target.checked })}
                className="accent-blue-500 rounded"
              />
              <span className="flex items-center gap-1.5">
                <RotateCw className="w-3.5 h-3.5 text-blue-400" />
                סיבוב מצלמה אוטומטי 360°
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Bottom Bar: Lighting & Camera Presets */}
      <footer
        className={`pointer-events-auto transition-all duration-300 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-4xl mx-auto ${
          isCollapsed ? 'opacity-0 translate-y-6 pointer-events-none' : 'opacity-100 translate-y-0'
        }`}
      >
        {/* Atmosphere / Time Selector */}
        <div className="flex items-center gap-1.5 backdrop-blur-md bg-slate-900/60 border border-white/10 rounded-2xl p-1.5 shadow-2xl">
          {times.map((t) => {
            const Icon = t.icon;
            const isSelected = config.timeOfDay === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onChangeConfig({ timeOfDay: t.id })}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Camera Angles */}
        <div className="flex items-center gap-1 backdrop-blur-md bg-slate-900/60 border border-white/10 rounded-2xl p-1.5 shadow-2xl overflow-x-auto max-w-full">
          {cameraAngles.map((cam) => (
            <button
              key={cam.id}
              onClick={() => onSelectCameraPreset(cam.id)}
              className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-150 cursor-pointer whitespace-nowrap"
            >
              {cam.label}
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
}
