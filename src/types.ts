// Type definitions for Realistic Water Physics Simulation

export type EnvironmentPresetId = 'tropical' | 'luxury_pool' | 'sunset' | 'bioluminescence' | 'storm';

export type ToolMode = 'ripple' | 'rain' | 'wave_generator' | 'spawn_object' | 'tsunami';

export type CameraView = 'perspective_3d' | 'top_down' | 'side_tank' | 'underwater';

export type FloatingObjectType = 'sphere' | 'duck' | 'wood_block' | 'buoy' | 'lotus';

export interface WaterPhysicsConfig {
  waveSpeed: number;        // Propagation speed c (0.5 to 3.0)
  damping: number;          // Wave energy dissipation (0.94 to 0.998)
  surfaceTension: number;   // Dispersion / smoothing factor (0.0 to 0.3)
  viscosity: number;        // Fluid resistance (0.01 to 0.2)
  gravity: number;          // Gravity acceleration (m/s^2)
  depth: number;            // Water depth (for absorption and caustics)
  refractionIndex: number;  // Snell's Law IOR (e.g. 1.333 for water)
  clarity: number;          // Transparency (turbidity) 0 to 1
  foamThreshold: number;    // Wave steepness for whitecap generation
}

export interface EnvironmentConfig {
  id: EnvironmentPresetId;
  nameHe: string;
  nameEn: string;
  descriptionHe: string;
  descriptionEn: string;
  waterColorSurface: string;   // Hex / rgb
  waterColorDeep: string;      // Deep absorption color
  floorType: 'sand_pebbles' | 'blue_tiles' | 'ocean_rock' | 'deep_chasm';
  sunElevation: number;        // Degrees (10 to 90)
  sunAzimuth: number;          // Degrees (0 to 360)
  sunColor: string;
  skyColorTop: string;
  skyColorHorizon: string;
  causticsIntensity: number;   // 0 to 2.0
  bioluminescentGlow: boolean; // Electric blue reaction on wave peak
  ambientLight: number;        // 0 to 1
  rainAllowed: boolean;
  defaultRainRate: number;     // drops per second
}

export interface BuoyantObject {
  id: string;
  type: FloatingObjectType;
  x: number;       // Grid / 3D coordinate (-1 to 1)
  y: number;       // Vertical position (height)
  z: number;       // Depth coordinate (-1 to 1)
  vx: number;      // Velocity X
  vy: number;      // Velocity Y
  vz: number;      // Velocity Z
  pitch: number;   // Tilt angle along X
  roll: number;    // Tilt angle along Z
  radius: number;  // Bounding radius
  mass: number;    // Mass in kg
  buoyancyFactor: number; // Volume vs mass ratio
  color: string;
  isDragging?: boolean;
}

export interface PhysicsTelemetry {
  fps: number;
  simTimeMs: number;
  activeWavesEnergy: number; // in Joules / relative
  peakWaveHeight: number;    // in cm
  rmsWaveHeight: number;     // in cm
  objectCount: number;
  rainDropsPerSec: number;
}
