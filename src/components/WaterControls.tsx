import React from 'react';
import {
  EnvironmentPresetId,
  ToolMode,
  CameraView,
  FloatingObjectType,
  WaterPhysicsConfig
} from '../types';
import { ENVIRONMENTS } from '../utils/environments';
import {
  Droplets,
  Waves,
  Sun,
  Camera,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Zap,
  Activity,
  Sliders,
  Box,
  Compass
} from 'lucide-react';

interface WaterControlsProps {
  currentEnv: EnvironmentPresetId;
  onSelectEnv: (env: EnvironmentPresetId) => void;
  toolMode: ToolMode;
  onSelectTool: (mode: ToolMode) => void;
  cameraView: CameraView;
  onSelectCamera: (view: CameraView) => void;
  spawnType: FloatingObjectType;
  onSelectSpawnType: (type: FloatingObjectType) => void;
  physicsConfig: WaterPhysicsConfig;
  onUpdatePhysics: (config: Partial<WaterPhysicsConfig>) => void;
  rainRate: number;
  onUpdateRainRate: (rate: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onResetWater: () => void;
  lang: 'he' | 'en';
  onToggleLang: () => void;
}

export const WaterControls: React.FC<WaterControlsProps> = ({
  currentEnv,
  onSelectEnv,
  toolMode,
  onSelectTool,
  cameraView,
  onSelectCamera,
  spawnType,
  onSelectSpawnType,
  physicsConfig,
  onUpdatePhysics,
  rainRate,
  onUpdateRainRate,
  isMuted,
  onToggleMute,
  onResetWater,
  lang,
  onToggleLang
}) => {
  const [activeTab, setActiveTab] = React.useState<'presets' | 'tools' | 'physics' | 'camera'>('presets');

  return (
    <div
      id="water-controls-panel"
      className="absolute bottom-5 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl bg-slate-900/85 backdrop-blur-xl border border-white/15 rounded-2xl p-4 shadow-2xl z-20 text-white select-none transition-all duration-300"
      dir={lang === 'he' ? 'rtl' : 'ltr'}
    >
      {/* Top Bar: Navigation Tabs & Global Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-white/10">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-white/5 rounded-xl border border-white/10">
          <button
            id="tab-presets-btn"
            onClick={() => setActiveTab('presets')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'presets' ? 'bg-cyan-500 text-slate-950 shadow-md font-semibold' : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{lang === 'he' ? 'סביבות תאורה' : 'Environments'}</span>
          </button>

          <button
            id="tab-tools-btn"
            onClick={() => setActiveTab('tools')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'tools' ? 'bg-cyan-500 text-slate-950 shadow-md font-semibold' : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{lang === 'he' ? 'כלי אינטראקציה' : 'Tools & Objects'}</span>
          </button>

          <button
            id="tab-physics-btn"
            onClick={() => setActiveTab('physics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'physics' ? 'bg-cyan-500 text-slate-950 shadow-md font-semibold' : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{lang === 'he' ? 'פרמטרים פיזיקליים' : 'Physics Config'}</span>
          </button>

          <button
            id="tab-camera-btn"
            onClick={() => setActiveTab('camera')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'camera' ? 'bg-cyan-500 text-slate-950 shadow-md font-semibold' : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{lang === 'he' ? 'מצלמה וזוויות' : 'Camera Views'}</span>
          </button>
        </div>

        {/* Global Utilities */}
        <div className="flex items-center gap-2">
          {/* Reset Water Surface */}
          <button
            id="reset-water-btn"
            onClick={onResetWater}
            title={lang === 'he' ? 'איפוס פני המים' : 'Calm Water'}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{lang === 'he' ? 'הרגעת מים' : 'Calm'}</span>
          </button>

          {/* Sound Toggle */}
          <button
            id="toggle-audio-btn"
            onClick={onToggleMute}
            title={isMuted ? 'הפעל שמע' : 'השתק'}
            className={`p-2 rounded-lg border transition-all ${
              isMuted
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Language Switch */}
          <button
            id="toggle-lang-btn"
            onClick={onToggleLang}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-colors"
          >
            {lang === 'he' ? 'EN' : 'עב'}
          </button>
        </div>
      </div>

      {/* Tab 1: Environment Presets */}
      {activeTab === 'presets' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {(Object.keys(ENVIRONMENTS) as EnvironmentPresetId[]).map((envKey) => {
            const env = ENVIRONMENTS[envKey];
            const isSelected = currentEnv === envKey;
            return (
              <button
                key={envKey}
                id={`env-preset-${envKey}`}
                onClick={() => onSelectEnv(envKey)}
                className={`p-2.5 rounded-xl border text-start transition-all flex flex-col gap-1.5 ${
                  isSelected
                    ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-lg ring-1 ring-cyan-400/40'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs tracking-wide">
                    {lang === 'he' ? env.nameHe : env.nameEn}
                  </span>
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-white/30 shadow-inner"
                    style={{ backgroundColor: env.waterColorSurface }}
                  />
                </div>
                <span className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {lang === 'he' ? env.descriptionHe : env.descriptionEn}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Tab 2: Interactive Tools & Spawning */}
      {activeTab === 'tools' && (
        <div className="flex flex-col gap-3">
          {/* Main Action Tools */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="tool-ripple"
              onClick={() => onSelectTool('ripple')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-medium transition-all ${
                toolMode === 'ripple'
                  ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-md'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
              }`}
            >
              <Waves className="w-4 h-4" />
              <span>{lang === 'he' ? 'מגע / אדוות' : 'Touch / Ripples'}</span>
            </button>

            <button
              id="tool-spawn"
              onClick={() => onSelectTool('spawn_object')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-medium transition-all ${
                toolMode === 'spawn_object'
                  ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-md'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
              }`}
            >
              <Box className="w-4 h-4" />
              <span>{lang === 'he' ? 'הטלת גוף צף' : 'Drop Floating Object'}</span>
            </button>

            <button
              id="tool-oscillator"
              onClick={() => onSelectTool('wave_generator')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-medium transition-all ${
                toolMode === 'wave_generator'
                  ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-md'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>{lang === 'he' ? 'מתנד גלים מחזורי' : 'Wave Oscillator'}</span>
            </button>

            <button
              id="tool-tsunami"
              onClick={() => onSelectTool('tsunami')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-medium transition-all ${
                toolMode === 'tsunami'
                  ? 'bg-rose-500 text-white font-bold border-rose-400 shadow-md'
                  : 'bg-white/5 border-white/10 text-rose-300 hover:bg-rose-500/20'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>{lang === 'he' ? 'גל הדף / צונאמי' : 'Shockwave Splash'}</span>
            </button>
          </div>

          {/* Sub-Selector for Floating Objects */}
          {toolMode === 'spawn_object' && (
            <div className="flex flex-wrap items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10">
              <span className="text-xs text-slate-400">{lang === 'he' ? 'בחר אובייקט:' : 'Select Object:'}</span>
              {[
                { type: 'duck' as FloatingObjectType, labelHe: '🦆 ברווז גומי', labelEn: '🦆 Rubber Duck' },
                { type: 'sphere' as FloatingObjectType, labelHe: '🔴 כדור הצלה', labelEn: '🔴 Nautical Sphere' },
                { type: 'wood_block' as FloatingObjectType, labelHe: '🪵 תיבת עץ', labelEn: '🪵 Wood Crate' },
                { type: 'buoy' as FloatingObjectType, labelHe: '⚓ מצוף ניווט', labelEn: '⚓ Navigation Buoy' },
                { type: 'lotus' as FloatingObjectType, labelHe: '🌸 פרח לוטוס', labelEn: '🌸 Lotus Flower' }
              ].map((item) => (
                <button
                  key={item.type}
                  onClick={() => onSelectSpawnType(item.type)}
                  className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                    spawnType === item.type
                      ? 'bg-cyan-400 text-slate-950 font-bold shadow'
                      : 'bg-white/10 text-slate-300 hover:bg-white/20'
                  }`}
                >
                  {lang === 'he' ? item.labelHe : item.labelEn}
                </button>
              ))}
              <span className="text-[11px] text-cyan-300/80 mr-auto">
                {lang === 'he' ? 'לחץ על המים כדי להטיל' : 'Click on water to drop'}
              </span>
            </div>
          )}

          {/* Rain Intensity Slider */}
          <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/10">
            <Droplets className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-xs text-slate-300 whitespace-nowrap">
              {lang === 'he' ? 'גשם / טיפות מים:' : 'Rain Drops:'}
            </span>
            <input
              id="rain-slider"
              type="range"
              min="0"
              max="70"
              step="5"
              value={rainRate}
              onChange={(e) => onUpdateRainRate(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            />
            <span className="text-xs font-mono text-cyan-300 min-w-[3rem] text-end">
              {rainRate} d/s
            </span>
          </div>
        </div>
      )}

      {/* Tab 3: Deep Physics Sliders */}
      {activeTab === 'physics' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {/* Wave Speed */}
          <div className="bg-white/5 p-2.5 rounded-xl border border-white/10 flex flex-col gap-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">{lang === 'he' ? 'מהירות התפשטות גל (c)' : 'Wave Speed (c)'}</span>
              <span className="font-mono text-cyan-400">{physicsConfig.waveSpeed.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.8"
              step="0.1"
              value={physicsConfig.waveSpeed}
              onChange={(e) => onUpdatePhysics({ waveSpeed: parseFloat(e.target.value) })}
              className="accent-cyan-400 h-1 bg-slate-700 rounded cursor-pointer"
            />
          </div>

          {/* Wave Damping */}
          <div className="bg-white/5 p-2.5 rounded-xl border border-white/10 flex flex-col gap-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">{lang === 'he' ? 'שימור אנרגיה / ריסון' : 'Wave Damping'}</span>
              <span className="font-mono text-cyan-400">{(physicsConfig.damping * 100).toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min="0.94"
              max="0.998"
              step="0.002"
              value={physicsConfig.damping}
              onChange={(e) => onUpdatePhysics({ damping: parseFloat(e.target.value) })}
              className="accent-cyan-400 h-1 bg-slate-700 rounded cursor-pointer"
            />
          </div>

          {/* Surface Tension */}
          <div className="bg-white/5 p-2.5 rounded-xl border border-white/10 flex flex-col gap-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">{lang === 'he' ? 'מתח פנים (Tension)' : 'Surface Tension'}</span>
              <span className="font-mono text-cyan-400">{physicsConfig.surfaceTension.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="0.3"
              step="0.02"
              value={physicsConfig.surfaceTension}
              onChange={(e) => onUpdatePhysics({ surfaceTension: parseFloat(e.target.value) })}
              className="accent-cyan-400 h-1 bg-slate-700 rounded cursor-pointer"
            />
          </div>

          {/* Refraction Index */}
          <div className="bg-white/5 p-2.5 rounded-xl border border-white/10 flex flex-col gap-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">{lang === 'he' ? 'מקדם שבירה (Snell IOR)' : 'Refraction Index (IOR)'}</span>
              <span className="font-mono text-cyan-400">{physicsConfig.refractionIndex.toFixed(3)}</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="1.55"
              step="0.01"
              value={physicsConfig.refractionIndex}
              onChange={(e) => onUpdatePhysics({ refractionIndex: parseFloat(e.target.value) })}
              className="accent-cyan-400 h-1 bg-slate-700 rounded cursor-pointer"
            />
          </div>

          {/* Fluid Viscosity */}
          <div className="bg-white/5 p-2.5 rounded-xl border border-white/10 flex flex-col gap-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">{lang === 'he' ? 'צמיגות הנוזל (Viscosity)' : 'Fluid Viscosity'}</span>
              <span className="font-mono text-cyan-400">{(physicsConfig.viscosity * 10).toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0.01"
              max="0.2"
              step="0.01"
              value={physicsConfig.viscosity}
              onChange={(e) => onUpdatePhysics({ viscosity: parseFloat(e.target.value) })}
              className="accent-cyan-400 h-1 bg-slate-700 rounded cursor-pointer"
            />
          </div>

          {/* Water Clarity */}
          <div className="bg-white/5 p-2.5 rounded-xl border border-white/10 flex flex-col gap-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">{lang === 'he' ? 'צלילות מים וקאוסטיקה' : 'Clarity & Caustics'}</span>
              <span className="font-mono text-cyan-400">{(physicsConfig.clarity * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="1.0"
              step="0.05"
              value={physicsConfig.clarity}
              onChange={(e) => onUpdatePhysics({ clarity: parseFloat(e.target.value) })}
              className="accent-cyan-400 h-1 bg-slate-700 rounded cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Tab 4: Camera Perspectives */}
      {activeTab === 'camera' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { id: 'perspective_3d' as CameraView, labelHe: 'תלת-ממד פרספקטיבי', labelEn: '3D Perspective', descHe: 'מבט חופשי עם עומק' },
            { id: 'top_down' as CameraView, labelHe: 'מבט-על (קאוסטיקה)', labelEn: 'Top-Down View', descHe: 'מיקוד ברשת האור בקרקעית' },
            { id: 'side_tank' as CameraView, labelHe: 'חתך צד (אקווריום)', labelEn: 'Side Tank Cross', descHe: 'הבחנה בגובה הגל ובציפה' },
            { id: 'underwater' as CameraView, labelHe: 'מצלמה תת-מימית', labelEn: 'Underwater Angle', descHe: 'מבט מעומק המים לפני השטח' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectCamera(item.id)}
              className={`p-3 rounded-xl border text-start transition-all flex flex-col gap-1 ${
                cameraView === item.id
                  ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-lg ring-1 ring-cyan-400/40'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
              }`}
            >
              <span className="text-xs font-semibold">{lang === 'he' ? item.labelHe : item.labelEn}</span>
              <span className="text-[11px] text-slate-400">{item.descHe}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
