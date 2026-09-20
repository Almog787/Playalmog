import { useState, useCallback } from 'react';
import ThreeCanvas from './components/ThreeCanvas';
import UIOverlay from './components/UIOverlay';
import { TimeOfDay, IsraeliPropsConfig, ViewPreset, CityHotspot } from './types/city';
import { ambianceAudio } from './utils/audioAmbiance';
import { VIEW_PRESETS } from './data/cityData';

export default function App() {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('noon');
  const [propsConfig, setPropsConfig] = useState<IsraeliPropsConfig>({
    flags: true,
    solarHeaters: true,
    airConditioners: true,
    hebrewSigns: true,
    streetFurniture: true,
    palmTrees: true,
    nightLights: true,
  });

  const [animationSpeed, setAnimationSpeed] = useState<number>(1.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(false);
  const [activePresetId, setActivePresetId] = useState<string>('overview');
  const [activeHotspot, setActiveHotspot] = useState<CityHotspot | null>(null);

  const handleToggleAudio = useCallback((enabled: boolean) => {
    setAudioEnabled(enabled);
    ambianceAudio.toggle(enabled);
  }, []);

  const handleSelectPreset = useCallback((preset: ViewPreset) => {
    setActivePresetId(preset.id);
    setActiveHotspot(null);
  }, []);

  const handleSelectHotspot = useCallback((hotspot: CityHotspot | null) => {
    setActiveHotspot(hotspot);
    if (hotspot) {
      setActivePresetId('');
    }
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-['Rubik','Heebo',sans-serif]">
      {/* 3D WebGL Canvas */}
      <ThreeCanvas
        timeOfDay={timeOfDay}
        propsConfig={propsConfig}
        animationSpeed={animationSpeed}
        isPlaying={isPlaying}
        activePresetId={activePresetId}
        activeHotspot={activeHotspot}
        onSelectHotspot={handleSelectHotspot}
        onLoaded={() => console.log('Littlest Tel Aviv Loaded')}
      />

      {/* Floating Interactive UI Overlay */}
      <UIOverlay
        timeOfDay={timeOfDay}
        setTimeOfDay={setTimeOfDay}
        propsConfig={propsConfig}
        setPropsConfig={setPropsConfig}
        animationSpeed={animationSpeed}
        setAnimationSpeed={setAnimationSpeed}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        audioEnabled={audioEnabled}
        setAudioEnabled={handleToggleAudio}
        onSelectPreset={handleSelectPreset}
        activePresetId={activePresetId}
        activeHotspot={activeHotspot}
        onCloseHotspot={() => setActiveHotspot(null)}
      />
    </div>
  );
}
