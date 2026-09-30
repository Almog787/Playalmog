import { useEffect, useRef } from 'react';
import { FlagScene, FlagSceneConfig, TimeOfDayPreset, CameraPreset } from './FlagScene';

interface FlagCanvasProps {
  config: FlagSceneConfig;
  activeCameraPreset: CameraPreset | null;
  onSceneReady?: (scene: FlagScene) => void;
}

export default function FlagCanvas({
  config,
  activeCameraPreset,
  onSceneReady,
}: FlagCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<FlagScene | null>(null);

  // Initialize Scene
  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new FlagScene(containerRef.current, config);
    sceneRef.current = scene;
    onSceneReady?.(scene);

    return () => {
      scene.destroy();
      sceneRef.current = null;
    };
  }, []);

  // Sync Time of Day
  useEffect(() => {
    sceneRef.current?.updateTimeOfDay(config.timeOfDay);
  }, [config.timeOfDay]);

  // Sync Wind
  useEffect(() => {
    sceneRef.current?.updateWind({
      speed: config.windSpeed,
      turbulence: config.windTurbulence,
      direction: config.windDirection,
    });
  }, [config.windSpeed, config.windTurbulence, config.windDirection]);

  // Sync AutoRotate & SlowMotion
  useEffect(() => {
    sceneRef.current?.setAutoRotate(config.autoRotate);
  }, [config.autoRotate]);

  useEffect(() => {
    sceneRef.current?.setSlowMotion(config.slowMotion);
  }, [config.slowMotion]);

  // Sync Camera Preset
  useEffect(() => {
    if (activeCameraPreset && sceneRef.current) {
      sceneRef.current.setCameraPreset(activeCameraPreset);
    }
  }, [activeCameraPreset]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing select-none outline-none"
    />
  );
}
