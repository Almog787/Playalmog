import React, { useState } from 'react';
import { PhysicsTelemetry } from '../types';
import { Activity, BookOpen, X, Info, Gauge, Flame, Sparkles } from 'lucide-react';

interface PhysicsHUDProps {
  telemetry: PhysicsTelemetry;
  lang: 'he' | 'en';
}

export const PhysicsHUD: React.FC<PhysicsHUDProps> = ({ telemetry, lang }) => {
  const [showTheoryModal, setShowTheoryModal] = useState(false);

  return (
    <>
      {/* Top-Right Telemetry Card */}
      <div
        id="physics-telemetry-badge"
        className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 bg-slate-900/80 backdrop-blur-md border border-white/10 p-3 rounded-2xl text-white shadow-xl min-w-[210px] select-none"
        dir={lang === 'he' ? 'rtl' : 'ltr'}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-0.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-300">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            <span>{lang === 'he' ? 'ניטור פיזיקלי חי' : 'Physics Telemetry'}</span>
          </div>
          <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
            {telemetry.fps} FPS
          </span>
        </div>

        {/* Telemetry Metrics Grid */}
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400">{lang === 'he' ? 'אנרגיית גל:' : 'Wave Energy:'}</span>
            <span className="font-mono text-cyan-300 font-bold">{telemetry.activeWavesEnergy} J</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400">{lang === 'he' ? 'שיא גובה:' : 'Peak Height:'}</span>
            <span className="font-mono text-amber-300 font-bold">{telemetry.peakWaveHeight} cm</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400">{lang === 'he' ? 'ממוצע RMS:' : 'RMS Height:'}</span>
            <span className="font-mono text-sky-300 font-bold">{telemetry.rmsWaveHeight} cm</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400">{lang === 'he' ? 'גופים צפים:' : 'Floating Bodies:'}</span>
            <span className="font-mono text-emerald-300 font-bold">{telemetry.objectCount}</span>
          </div>
        </div>

        {/* Learn Physics Button */}
        <button
          id="learn-physics-btn"
          onClick={() => setShowTheoryModal(true)}
          className="mt-1 flex items-center justify-center gap-1.5 w-full py-1.5 px-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 text-cyan-300 text-xs font-medium transition-all"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>{lang === 'he' ? 'משוואות הפיזיקה' : 'Physics Principles'}</span>
        </button>
      </div>

      {/* Physics Principles Educational Modal */}
      {showTheoryModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 select-none">
          <div
            className="bg-slate-900 border border-white/20 rounded-3xl p-6 max-w-2xl w-full shadow-2xl text-white max-h-[85vh] overflow-y-auto flex flex-col gap-4"
            dir={lang === 'he' ? 'rtl' : 'ltr'}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-bold text-white">
                  {lang === 'he' ? 'הפיזיקה והאופטיקה של הדמיית המים' : 'The Physics & Optics of Water Simulation'}
                </h2>
              </div>
              <button
                onClick={() => setShowTheoryModal(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Principles Items */}
            <div className="flex flex-col gap-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
              {/* 1. The Wave Equation */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <h3 className="font-bold text-cyan-300 mb-1">
                  1. {lang === 'he' ? 'משוואת הגלים הדו-ממדית (Shallow Water Wave Equation)' : '2D Wave Equation'}
                </h3>
                <p className="mb-2">
                  {lang === 'he'
                    ? 'התפשטות הגלים על פני המים מחושבת על ידי פתרון נומרי בדיד (Finite Difference) של משוואת הגלים:'
                    : 'Wave propagation across the surface is computed by numerical finite differences of the wave equation:'}
                </p>
                <div className="font-mono bg-slate-950/80 p-2.5 rounded-xl border border-cyan-500/20 text-cyan-200 text-center text-xs">
                  ∂²h / ∂t² = c² ∇²h - γ (∂h / ∂t) + σ ∇⁴h
                </div>
                <p className="mt-2 text-slate-400 text-xs">
                  {lang === 'he'
                    ? 'כאשר c היא מהירות הגל, γ הוא מקדם הריסון (צמיגות), ו-σ הוא מקדם מתח הפנים.'
                    : 'Where c is wave speed, γ is damping factor, and σ is surface tension.'}
                </p>
              </div>

              {/* 2. Snell's Law & Refraction */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <h3 className="font-bold text-cyan-300 mb-1">
                  2. {lang === 'he' ? 'שבירת אור לפי חוק סנל (Snell’s Law of Refraction)' : 'Snell’s Law of Refraction'}
                </h3>
                <p className="mb-2">
                  {lang === 'he'
                    ? 'קרני האור חודרות מהאוויר למים ונשברות בהתאם למקדם השבירה של מים (n = 1.333):'
                    : 'Light rays passing from air into water bend according to the refractive index of water (n = 1.333):'}
                </p>
                <div className="font-mono bg-slate-950/80 p-2 rounded-xl border border-cyan-500/20 text-cyan-200 text-center text-xs">
                  n₁ · sin(θ₁) = n₂ · sin(θ₂)
                </div>
              </div>

              {/* 3. Fresnel Reflectance */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <h3 className="font-bold text-cyan-300 mb-1">
                  3. {lang === 'he' ? 'אפקט פרנל (Fresnel Reflectance - Schlick)' : 'Fresnel Reflectance'}
                </h3>
                <p>
                  {lang === 'he'
                    ? 'במבט ישיר כלפי מטה (זווית 0°), המים שקופים כמעט לחלוטין. בזוויות חדות (Grazing angles), המים פועלים כמראה מושלמת המשקפת את השמיים והשמש.'
                    : 'Looking straight down, water is highly transparent. At glancing angles, water reflects like a mirror.'}
                </p>
              </div>

              {/* 4. Caustics Formation */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <h3 className="font-bold text-cyan-300 mb-1">
                  4. {lang === 'he' ? 'היווצרות קאוסטיקה (Dynamic Caustics)' : 'Caustics Formation'}
                </h3>
                <p>
                  {lang === 'he'
                    ? 'קעירות הגלים פועלת כעדשות מרכזות (Convex lenses). קרני השמש מתכנסות לקווי מוקד זוהרים על גבי קרקעית הבריכה, ומרקדות בתנועה חיה יחד עם הגל.'
                    : 'Wave crests act as optical convex lenses, focusing sunlight into dancing luminous lines on the seabed.'}
                </p>
              </div>

              {/* 5. Archimedes' Buoyancy */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <h3 className="font-bold text-cyan-300 mb-1">
                  5. {lang === 'he' ? 'חוק ארכימדס וכוח הציפה (Archimedes’ Principle)' : 'Archimedes’ Buoyancy'}
                </h3>
                <p>
                  {lang === 'he'
                    ? 'על כל גוף מוטל כוח עילוי השווה למשקל נפח הנוזל שהוא דוחה: F_b = ρ · V_sub · g. הגופים מתיישרים אוטומטית לפי וקטור הנורמל של הגל.'
                    : 'Every submerged body experiences an upward buoyant force equal to displaced fluid weight: F_b = ρ · V_sub · g.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowTheoryModal(false)}
              className="mt-2 w-full py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors"
            >
              {lang === 'he' ? 'הבנתי, חזור להדמיה' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
