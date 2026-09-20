import React, { useState } from 'react';
import {
  Sun,
  Sunset,
  Moon,
  Wind,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Layers,
  Camera,
  Info,
  X,
  Compass,
  Check,
  Building2,
  Utensils,
  ShoppingBag,
  Train,
  Bike,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { TimeOfDay, IsraeliPropsConfig, ViewPreset, CityHotspot } from '../types/city';
import { VIEW_PRESETS } from '../data/cityData';

interface UIOverlayProps {
  timeOfDay: TimeOfDay;
  setTimeOfDay: (time: TimeOfDay) => void;
  propsConfig: IsraeliPropsConfig;
  setPropsConfig: React.Dispatch<React.SetStateAction<IsraeliPropsConfig>>;
  animationSpeed: number;
  setAnimationSpeed: (speed: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  audioEnabled: boolean;
  setAudioEnabled: (enabled: boolean) => void;
  onSelectPreset: (preset: ViewPreset) => void;
  activePresetId: string;
  activeHotspot: CityHotspot | null;
  onCloseHotspot: () => void;
}

export default function UIOverlay({
  timeOfDay,
  setTimeOfDay,
  propsConfig,
  setPropsConfig,
  animationSpeed,
  setAnimationSpeed,
  isPlaying,
  setIsPlaying,
  audioEnabled,
  setAudioEnabled,
  onSelectPreset,
  activePresetId,
  activeHotspot,
  onCloseHotspot,
}: UIOverlayProps) {
  const [showPropsMenu, setShowPropsMenu] = useState(false);
  const [showPresetsMenu, setShowPresetsMenu] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const toggleProp = (key: keyof IsraeliPropsConfig) => {
    setPropsConfig((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getPresetIcon = (icon: string) => {
    switch (icon) {
      case 'Building2': return <Building2 className="w-4 h-4" />;
      case 'Sun': return <Sun className="w-4 h-4" />;
      case 'Utensils': return <Utensils className="w-4 h-4" />;
      case 'ShoppingBag': return <ShoppingBag className="w-4 h-4" />;
      case 'Train': return <Train className="w-4 h-4" />;
      case 'Bike': return <Bike className="w-4 h-4" />;
      default: return <Camera className="w-4 h-4" />;
    }
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex flex-col justify-between p-3 sm:p-6 overflow-hidden">
      {/* ----------------- TOP BAR ----------------- */}
      <header className="pointer-events-auto flex items-start justify-between gap-2">
        {/* Title & Badge */}
        <div className="bg-slate-900/85 backdrop-blur-md border border-slate-800/90 rounded-2xl p-3 sm:p-4 shadow-2xl flex items-center gap-3.5 max-w-sm">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-sky-500 to-amber-400 flex items-center justify-center text-xl shadow-lg shadow-sky-500/20 shrink-0">
            🇮🇱
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-black text-white tracking-tight">
                תל אביב הקטנה 3D
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30">
                מודל ישראלי
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
              דודי שמש • דגלי ישראל • רחוב דיזנגוף • קו אדום
            </p>
          </div>
        </div>

        {/* Quick Controls Bar (Atmosphere, Audio, Info) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Time of Day Modes */}
          <div className="bg-slate-900/85 backdrop-blur-md border border-slate-800/90 rounded-2xl p-1 shadow-2xl flex items-center gap-0.5">
            <button
              onClick={() => setTimeOfDay('noon')}
              title="שמש ים-תיכונית (Noon Sun)"
              className={`p-2 rounded-xl transition flex items-center gap-1 text-xs font-medium ${
                timeOfDay === 'noon'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sun className="w-4 h-4" />
              <span className="hidden md:inline">צהריים</span>
            </button>

            <button
              onClick={() => setTimeOfDay('sunset')}
              title="שקיעה תל-אביבית (Tel Aviv Sunset)"
              className={`p-2 rounded-xl transition flex items-center gap-1 text-xs font-medium ${
                timeOfDay === 'sunset'
                  ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sunset className="w-4 h-4" />
              <span className="hidden md:inline">שקיעה</span>
            </button>

            <button
              onClick={() => setTimeOfDay('night')}
              title="לילה תל-אביבי מואר (Night Lights)"
              className={`p-2 rounded-xl transition flex items-center gap-1 text-xs font-medium ${
                timeOfDay === 'night'
                  ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Moon className="w-4 h-4" />
              <span className="hidden md:inline">לילה</span>
            </button>

            <button
              onClick={() => setTimeOfDay('sharav')}
              title="שרב / חמסין מדברי (Sharav)"
              className={`p-2 rounded-xl transition flex items-center gap-1 text-xs font-medium ${
                timeOfDay === 'sharav'
                  ? 'bg-yellow-600 text-slate-950 font-bold shadow-md shadow-yellow-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Wind className="w-4 h-4" />
              <span className="hidden md:inline">שרב</span>
            </button>
          </div>

          {/* Sound Ambiance Toggle */}
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            title={audioEnabled ? 'השתק סאונד עירוני' : 'הפעל סאונד אווירה עירוני (Web Audio)'}
            className={`p-2.5 rounded-2xl backdrop-blur-md border shadow-2xl transition flex items-center justify-center ${
              audioEnabled
                ? 'bg-sky-500 text-slate-950 border-sky-400 font-bold shadow-sky-500/30'
                : 'bg-slate-900/85 text-slate-400 border-slate-800/90 hover:text-slate-200'
            }`}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Info Modal Button */}
          <button
            onClick={() => setShowAbout(!showAbout)}
            title="אודות הפרויקט והאלמנטים הישראליים"
            className="p-2.5 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-slate-800/90 text-slate-400 hover:text-slate-200 shadow-2xl transition"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ----------------- HOTSPOT DETAIL DRAWER (When active) ----------------- */}
      {activeHotspot && (
        <div className="pointer-events-auto self-center max-w-md w-full bg-slate-900/95 backdrop-blur-xl border border-amber-500/40 rounded-3xl p-5 shadow-2xl text-right animate-in fade-in zoom-in-95 duration-200 mb-4">
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-amber-400 px-2 py-0.5 rounded-md bg-amber-400/10">
                  {activeHotspot.badge}
                </span>
                <h3 className="text-base font-extrabold text-white mt-0.5">
                  {activeHotspot.title}
                </h3>
              </div>
            </div>
            <button
              onClick={onCloseHotspot}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mt-3">
            {activeHotspot.description}
          </p>
        </div>
      )}

      {/* ----------------- BOTTOM CONTROLS & DOCK ----------------- */}
      <footer className="pointer-events-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left Side: Animation Playback Controller */}
        <div className="bg-slate-900/85 backdrop-blur-md border border-slate-800/90 rounded-2xl px-3.5 py-2 shadow-2xl flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition ${
              isPlaying
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title={isPlaying ? 'עצור אנימציה' : 'הפעל אנימציה'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 text-[11px]">מהירות:</span>
            {[0.5, 1.0, 1.5, 2.0].map((speed) => (
              <button
                key={speed}
                onClick={() => setAnimationSpeed(speed)}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-mono transition ${
                  animationSpeed === speed
                    ? 'bg-slate-700 text-amber-400 font-bold border border-amber-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Viewpoints and Prop Toggles */}
        <div className="flex items-center gap-2">
          {/* Viewpoints Menu Button */}
          <div className="relative">
            <button
              onClick={() => {
                setShowPresetsMenu(!showPresetsMenu);
                setShowPropsMenu(false);
              }}
              className={`px-3.5 py-2 rounded-2xl backdrop-blur-md border shadow-2xl transition flex items-center gap-2 text-xs font-bold ${
                showPresetsMenu
                  ? 'bg-sky-500 text-slate-950 border-sky-400'
                  : 'bg-slate-900/85 text-slate-200 border-slate-800/90 hover:bg-slate-800'
              }`}
            >
              <Compass className="w-4 h-4 text-sky-400" />
              <span>זוויות מבט</span>
            </button>

            {/* Presets Popup Menu */}
            {showPresetsMenu && (
              <div className="absolute bottom-12 right-0 w-60 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl p-2 shadow-2xl flex flex-col gap-1 text-right">
                <span className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                  בחר זווית מצלמה
                </span>
                {VIEW_PRESETS.map((p) => {
                  const isActive = activePresetId === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        onSelectPreset(p);
                        setShowPresetsMenu(false);
                      }}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition ${
                        isActive
                          ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {getPresetIcon(p.icon)}
                        <span>{p.name}</span>
                      </span>
                      {isActive && <Check className="w-3.5 h-3.5 text-sky-400" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Israeli Props Customizer Button */}
          <div className="relative">
            <button
              onClick={() => {
                setShowPropsMenu(!showPropsMenu);
                setShowPresetsMenu(false);
              }}
              className={`px-3.5 py-2 rounded-2xl backdrop-blur-md border shadow-2xl transition flex items-center gap-2 text-xs font-bold ${
                showPropsMenu
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-slate-900/85 text-slate-200 border-slate-800/90 hover:bg-slate-800'
              }`}
            >
              <Layers className="w-4 h-4 text-amber-400" />
              <span>שכבות ישראליות</span>
            </button>

            {/* Israeli Props Toggle List */}
            {showPropsMenu && (
              <div className="absolute bottom-12 right-0 w-64 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl p-2.5 shadow-2xl flex flex-col gap-1 text-right">
                <span className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                  הפעל / כבה אלמנטים
                </span>

                {[
                  { key: 'flags' as const, label: '🇮🇱 דגלי ישראל מתנפנפים' },
                  { key: 'solarHeaters' as const, label: '☀️ דודי שמש וקולטים' },
                  { key: 'airConditioners' as const, label: '❄️ מזגני אלקטרה ותדיראן' },
                  { key: 'hebrewSigns' as const, label: '🥙 שלטי רחוב וחנויות בעברית' },
                  { key: 'streetFurniture' as const, label: '🛴 קורקינטים ודואר ישראל' },
                  { key: 'palmTrees' as const, label: '🌴 דקלים ובוגנוויליה' },
                  { key: 'nightLights' as const, label: '💡 תאורת ניאון וחלונות' },
                ].map(({ key, label }) => {
                  const active = propsConfig[key];
                  return (
                    <button
                      key={key}
                      onClick={() => toggleProp(key)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition ${
                        active
                          ? 'bg-amber-500/15 text-amber-300 font-medium border border-amber-500/30'
                          : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
                      }`}
                    >
                      <span>{label}</span>
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center transition ${
                          active
                            ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold'
                            : 'border-slate-700 bg-slate-800'
                        }`}
                      >
                        {active && <Check className="w-3 h-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </footer>

      {/* ----------------- ABOUT / PROJECT INFO MODAL ----------------- */}
      {showAbout && (
        <div className="pointer-events-auto fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl text-right space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🇮🇱</span>
                <div>
                  <h3 className="text-lg font-black text-white">
                    תל אביב הקטנה - Littlest Tel Aviv
                  </h3>
                  <p className="text-xs text-slate-400">
                    עיבוד ישראלי למודל Three.js LittlestTokyo
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAbout(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
              <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60 space-y-1.5">
                <h4 className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  מה כולל המודל הישראלי?
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  <li><strong>דגלי ישראל</strong> מתנפנפים עם מגן דוד ופסים כחולים ברמת פיקסל מדויקת.</li>
                  <li><strong>דודי שמש וקולטי שמש</strong> אותנטיים על גגות המבנים מוטים ב-45 מעלות דרומה.</li>
                  <li><strong>מזגנים תלויים על הקירות</strong> (מותגי אלקטרה ותדיראן) עם צינורות ניקוז.</li>
                  <li><strong>שלטי רחוב וחנויות בעברית</strong>: שווארמה האחים, קיוסק 24/7, קפה תמר, AM:PM, סופר-פארם, רחוב דיזנגוף ושדרות רוטשילד.</li>
                  <li><strong>רכבת קלה תל אביבית (דנקל)</strong> עם שילוט אלקטרוני 'קו אדום: פ"ת ⇄ בת ים'.</li>
                  <li><strong>קורקינטים שיתופיים</strong> (Lime/Bird) ותיבת דואר אדומה של דואר ישראל.</li>
                  <li><strong>דקלי וושינגטוניה</strong> ים-תיכוניים ושיחי בוגנוויליה ורודים מטפסים.</li>
                  <li><strong>4 מצבי אקלים ישראליים</strong>: שמש ים-תיכונית, שקיעה תל אביבית, לילה זוהר ושרב/חמסין מדברי.</li>
                  <li><strong>סאונד אווירה מבוסס Web Audio</strong> עם צליל פעמון רכבת קלה.</li>
                </ul>
              </div>

              <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800 flex items-center justify-between">
                <span>Model: Glen Fox (CC Attribution)</span>
                <span>Three.js • WebGL • TypeScript</span>
              </div>
            </div>

            <button
              onClick={() => setShowAbout(false)}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-amber-500/20"
            >
              חזור לחוויה התלת-ממדית
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
