import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { TimeOfDay, IsraeliPropsConfig, CityHotspot } from '../types/city';
import { buildIsraeliCityAdditions, IsraeliSceneManager } from './IsraeliCityScene';
import { CITY_HOTSPOTS } from '../data/cityData';

interface ThreeCanvasProps {
  timeOfDay: TimeOfDay;
  propsConfig: IsraeliPropsConfig;
  animationSpeed: number;
  isPlaying: boolean;
  activePresetId: string;
  activeHotspot: CityHotspot | null;
  onSelectHotspot: (hotspot: CityHotspot | null) => void;
  onLoaded: () => void;
}

export default function ThreeCanvas({
  timeOfDay,
  propsConfig,
  animationSpeed,
  isPlaying,
  activeHotspot,
  onSelectHotspot,
  onLoaded,
}: ThreeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [screenHotspots, setScreenHotspots] = useState<
    { hotspot: CityHotspot; x: number; y: number; visible: boolean }[]
  >([]);

  // Refs for Three.js instance objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionRef = useRef<THREE.AnimationAction | null>(null);
  const skyRef = useRef<Sky | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const pmremRef = useRef<THREE.PMREMGenerator | null>(null);
  const israeliManagerRef = useRef<IsraeliSceneManager | null>(null);

  // Camera animation target
  const targetCamPos = useRef<THREE.Vector3>(new THREE.Vector3(5.2, 2.8, 7.8));
  const targetLookPos = useRef<THREE.Vector3>(new THREE.Vector3(0.6, 1.4, 0.2));
  const isTransitioningCam = useRef<boolean>(false);

  // Update props visibility whenever propsConfig changes
  useEffect(() => {
    if (israeliManagerRef.current) {
      israeliManagerRef.current.updatePropsVisibility(propsConfig);
    }
  }, [propsConfig]);

  // Update Animation Mixer Speed & Play/Pause
  useEffect(() => {
    if (actionRef.current) {
      actionRef.current.timeScale = isPlaying ? animationSpeed : 0;
    }
  }, [animationSpeed, isPlaying]);

  // Apply Lighting and Atmosphere for TimeOfDay
  const applyTimeOfDay = useCallback((time: TimeOfDay) => {
    if (!skyRef.current || !sunLightRef.current || !ambientLightRef.current || !hemiLightRef.current || !sceneRef.current || !rendererRef.current || !pmremRef.current) {
      return;
    }

    const uniforms = skyRef.current.material.uniforms;
    const sunLight = sunLightRef.current;
    const ambientLight = ambientLightRef.current;
    const hemiLight = hemiLightRef.current;
    const isNight = time === 'night';

    if (israeliManagerRef.current) {
      israeliManagerRef.current.setNightMode(isNight);
    }

    if (time === 'noon') {
      // Mediterranean Midday Sun
      uniforms['turbidity'].value = 1.0;
      uniforms['rayleigh'].value = 2.2;
      uniforms['mieCoefficient'].value = 0.005;
      uniforms['mieDirectionalG'].value = 0.8;
      uniforms['sunPosition'].value.set(-0.7, 0.65, 0.5);

      sunLight.position.set(6, 12, 5);
      sunLight.color.setHex(0xfff7ed);
      sunLight.intensity = 2.2;

      ambientLight.color.setHex(0xe0f2fe);
      ambientLight.intensity = 1.0;

      hemiLight.color.setHex(0xdbeafe);
      hemiLight.groundColor.setHex(0x78716c);
      hemiLight.intensity = 0.9;
    } else if (time === 'sunset') {
      // Tel Aviv Sunset / Golden Hour
      uniforms['turbidity'].value = 4.0;
      uniforms['rayleigh'].value = 6.0;
      uniforms['mieCoefficient'].value = 0.02;
      uniforms['mieDirectionalG'].value = 0.92;
      uniforms['sunPosition'].value.set(-0.95, 0.08, 0.28);

      sunLight.position.set(-8, 2.5, 4);
      sunLight.color.setHex(0xf97316);
      sunLight.intensity = 3.0;

      ambientLight.color.setHex(0xfda4af);
      ambientLight.intensity = 0.7;

      hemiLight.color.setHex(0xfb923c);
      hemiLight.groundColor.setHex(0x431407);
      hemiLight.intensity = 0.6;
    } else if (time === 'night') {
      // Tel Aviv Nightlife
      uniforms['turbidity'].value = 10.0;
      uniforms['rayleigh'].value = 0.15;
      uniforms['mieCoefficient'].value = 0.08;
      uniforms['mieDirectionalG'].value = 0.5;
      uniforms['sunPosition'].value.set(-0.8, -0.6, 0.5);

      sunLight.position.set(0, 10, 0);
      sunLight.color.setHex(0x1e293b);
      sunLight.intensity = 0.2;

      ambientLight.color.setHex(0x1e1b4b);
      ambientLight.intensity = 0.35;

      hemiLight.color.setHex(0x312e81);
      hemiLight.groundColor.setHex(0x020617);
      hemiLight.intensity = 0.4;
    } else if (time === 'sharav') {
      // Sharav / Hamsin (Warm desert dusty haze)
      uniforms['turbidity'].value = 8.0;
      uniforms['rayleigh'].value = 4.5;
      uniforms['mieCoefficient'].value = 0.05;
      uniforms['mieDirectionalG'].value = 0.85;
      uniforms['sunPosition'].value.set(-0.6, 0.5, 0.6);

      sunLight.position.set(5, 10, 4);
      sunLight.color.setHex(0xfde047);
      sunLight.intensity = 2.4;

      ambientLight.color.setHex(0xfef08a);
      ambientLight.intensity = 1.1;

      hemiLight.color.setHex(0xfde68a);
      hemiLight.groundColor.setHex(0x92400e);
      hemiLight.intensity = 0.8;
    }

    try {
      sceneRef.current.environment = pmremRef.current.fromScene(skyRef.current as unknown as THREE.Scene).texture;
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    applyTimeOfDay(timeOfDay);
  }, [timeOfDay, applyTimeOfDay]);

  // Handle hotspot camera focusing
  useEffect(() => {
    if (activeHotspot) {
      targetCamPos.current.set(...activeHotspot.cameraPos);
      targetLookPos.current.set(...activeHotspot.targetPos);
      isTransitioningCam.current = true;
    }
  }, [activeHotspot]);

  // Main Three.js Initialization & Render Loop
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    let animationFrameId: number;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(
      40,
      container.clientWidth / container.clientHeight,
      0.1,
      150
    );
    camera.position.set(5.2, 2.8, 7.8);
    cameraRef.current = camera;

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0.6, 1.4, 0.2);
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // Prevent going below ground
    controls.minDistance = 1.2;
    controls.maxDistance = 22;
    controls.update();
    controlsRef.current = controls;

    // 5. Sky & Environment
    const sky = new Sky();
    sky.scale.setScalar(10000);
    scene.add(sky);
    skyRef.current = sky;

    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    pmremRef.current = pmrem;

    // 6. Lights
    const sunLight = new THREE.DirectionalLight(0xfff7ed, 2.2);
    sunLight.position.set(6, 12, 5);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 30;
    sunLight.shadow.bias = -0.0005;
    const d = 5;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    const ambientLight = new THREE.AmbientLight(0xe0f2fe, 1.0);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x78716c, 0.9);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    // 7. Attach Israeli Additions (Flags, Solar Boilers, AC Units, Signs, Flora)
    const israeliManager = buildIsraeliCityAdditions(scene);
    israeliManagerRef.current = israeliManager;
    israeliManager.updatePropsVisibility(propsConfig);

    // 8. GLTF + DRACO Loader for LittlestTokyo
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/gltf/');

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      '/models/LittlestTokyo.glb',
      (gltf) => {
        const model = gltf.scene;
        model.position.set(1, 1, 0);
        model.scale.set(0.01, 0.01, 0.01);

        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
          }
        });

        scene.add(model);

        // Animations
        if (gltf.animations && gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(model);
          mixerRef.current = mixer;
          const action = mixer.clipAction(gltf.animations[0]);
          action.play();
          actionRef.current = action;
        }

        setIsLoading(false);
        onLoaded();
        applyTimeOfDay(timeOfDay);
      },
      (xhr) => {
        if (xhr.total > 0) {
          setLoadingProgress(Math.round((xhr.loaded / xhr.total) * 100));
        }
      },
      (error) => {
        console.error('Error loading LittlestTokyo model:', error);
        setIsLoading(false);
      }
    );

    // Resize Handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Clock
    const clock = new THREE.Clock();

    // 9. Main Animation Loop
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Update Animation Mixer
      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }

      // Update Israeli Additions (Flags wave, AC fans)
      if (israeliManagerRef.current) {
        israeliManagerRef.current.update(delta, elapsed);
      }

      // Smooth camera transition when preset or hotspot is clicked
      if (isTransitioningCam.current) {
        camera.position.lerp(targetCamPos.current, 0.06);
        controls.target.lerp(targetLookPos.current, 0.06);

        if (
          camera.position.distanceTo(targetCamPos.current) < 0.05 &&
          controls.target.distanceTo(targetLookPos.current) < 0.05
        ) {
          isTransitioningCam.current = false;
        }
      }

      controls.update();

      // Project 3D Hotspots to 2D Screen Coordinates
      const projected = CITY_HOTSPOTS.map((h) => {
        const v = new THREE.Vector3(...h.position);
        v.project(camera);

        const isBehind = v.z > 1;
        const x = ((v.x + 1) * container.clientWidth) / 2;
        const y = ((-v.y + 1) * container.clientHeight) / 2;

        return {
          hotspot: h,
          x,
          y,
          visible: !isBehind && x > 20 && x < container.clientWidth - 20 && y > 20 && y < container.clientHeight - 20,
        };
      });
      setScreenHotspots(projected);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      dracoLoader.dispose();
      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [onLoaded, applyTimeOfDay, propsConfig, timeOfDay]);

  return (
    <div className="relative w-full h-full select-none overflow-hidden" ref={containerRef}>
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center gap-6 p-6">
          <div className="relative flex items-center justify-center">
            <div className="w-20 h-20 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
            <span className="absolute text-2xl">🇮🇱</span>
          </div>

          <div className="text-center space-y-2 max-w-sm">
            <h2 className="text-xl font-bold text-white tracking-tight">
              בונה את תל אביב הקטנה...
            </h2>
            <p className="text-xs text-slate-400">
              טוען מודל תלת-ממד, דודי שמש, דגלי ישראל, שלטי רחוב וטקסטורות
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-64 bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-amber-500 via-sky-500 to-blue-600 h-full transition-all duration-300 rounded-full"
              style={{ width: `${Math.max(loadingProgress, 15)}%` }}
            />
          </div>
          <span className="text-xs font-mono text-slate-500">{loadingProgress}%</span>
        </div>
      )}

      {/* 3D Hotspot Badges Over the City */}
      {!isLoading &&
        screenHotspots.map(({ hotspot, x, y, visible }) => {
          if (!visible) return null;
          const isActive = activeHotspot?.id === hotspot.id;

          return (
            <button
              key={hotspot.id}
              onClick={() => onSelectHotspot(isActive ? null : hotspot)}
              style={{ left: `${x}px`, top: `${y}px` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 group transition-all duration-300 ${
                isActive ? 'scale-110 z-30' : 'hover:scale-105'
              }`}
            >
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold shadow-xl backdrop-blur-md border transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-amber-500/30'
                    : 'bg-slate-900/85 text-slate-100 border-slate-700/80 hover:bg-slate-800 hover:border-amber-500/60'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="whitespace-nowrap">{hotspot.title}</span>
              </div>
            </button>
          );
        })}
    </div>
  );
}
