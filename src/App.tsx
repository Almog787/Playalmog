import { useState, useCallback } from 'react';
import FlagCanvas from './components/FlagCanvas';
import FlagControls from './components/FlagControls';
import { FlagSceneConfig, CameraPreset } from './components/FlagScene';
import { flagWindAudio } from './utils/audioWind';

export default function App() {
  const [config, setConfig] = useState<FlagSceneConfig>({
    timeOfDay: 'noon',
    windSpeed: 15,
    windTurbulence: 0.65,
    windDirection: 0,
    slowMotion: false,
    autoRotate: false,
  });

  const [activeCameraPreset, setActiveCameraPreset] = useState<CameraPreset | null>(null);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(false);

  const handleChangeConfig = useCallback((newConfig: Partial<FlagSceneConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...newConfig };
      if (newConfig.windSpeed !== undefined) {
        flagWindAudio.setWindIntensity(updated.windSpeed / 30);
      }
      return updated;
    });
  }, []);

  const handleSelectCameraPreset = useCallback((preset: CameraPreset) => {
    setActiveCameraPreset(preset);
    // Reset after trigger so it can be re-triggered
    setTimeout(() => setActiveCameraPreset(null), 100);
  }, []);

  const handleToggleAudio = useCallback(() => {
    const nextState = !audioEnabled;
    setAudioEnabled(nextState);
    flagWindAudio.toggle(nextState);
    flagWindAudio.setWindIntensity(config.windSpeed / 30);
  }, [audioEnabled, config.windSpeed]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-['Rubik','Heebo',sans-serif]">
      {/* 3D WebGL Photorealistic Flag */}
      <FlagCanvas
        config={config}
        activeCameraPreset={activeCameraPreset}
      />

      {/* Discreet, elegant overlay controls */}
      <FlagControls
        config={config}
        onChangeConfig={handleChangeConfig}
        onSelectCameraPreset={handleSelectCameraPreset}
        audioEnabled={audioEnabled}
        onToggleAudio={handleToggleAudio}
      />
    </div>
  );
}
