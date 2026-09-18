import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { WaterSimulation } from '../physics/waterSimulation';
import { BuoyancyEngine } from '../physics/buoyancyEngine';
import { WaterPhysicsConfig, EnvironmentConfig, ToolMode, CameraView, FloatingObjectType, PhysicsTelemetry } from '../types';
import { waterAudio } from '../utils/waterAudio';

interface WaterCanvas3DProps {
  physicsConfig: WaterPhysicsConfig;
  envConfig: EnvironmentConfig;
  toolMode: ToolMode;
  cameraView: CameraView;
  selectedSpawnType: FloatingObjectType;
  rainRate: number;
  onTelemetryUpdate: (telemetry: PhysicsTelemetry) => void;
  lang: 'he' | 'en';
}

export const WaterCanvas3D: React.FC<WaterCanvas3DProps> = ({
  physicsConfig,
  envConfig,
  toolMode,
  cameraView,
  selectedSpawnType,
  rainRate,
  onTelemetryUpdate,
  lang
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Physics simulation instances
  const simulationRef = useRef<WaterSimulation>(new WaterSimulation(128));
  const buoyancyRef = useRef<BuoyancyEngine>(new BuoyancyEngine());

  // Interaction tracking refs
  const isPointerDownRef = useRef<boolean>(false);
  const pointerNormPosRef = useRef<{ x: number; y: number } | null>(null);
  const pointerButtonRef = useRef<number>(0);
  const draggedObjectRef = useRef<string | null>(null);

  // Camera Orbit state
  const cameraAngleRef = useRef<{ theta: number; phi: number; radius: number }>({
    theta: 0.8,
    phi: 0.65,
    radius: 2.1
  });
  const isRotatingCameraRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Rain accumulator
  const rainAccumulatorRef = useRef<number>(0);

  // FPS tracking
  const fpsFramesRef = useRef<number>(0);
  const fpsTimeRef = useRef<number>(performance.now());
  const currentFpsRef = useRef<number>(60);

  // Sync camera presets
  useEffect(() => {
    const cam = cameraAngleRef.current;
    if (cameraView === 'perspective_3d') {
      cam.theta = 0.8;
      cam.phi = 0.65;
      cam.radius = 2.1;
    } else if (cameraView === 'top_down') {
      cam.theta = 0;
      cam.phi = 0.05; // almost top down
      cam.radius = 1.9;
    } else if (cameraView === 'side_tank') {
      cam.theta = 0;
      cam.phi = 1.35; // looking straight from side
      cam.radius = 2.2;
    } else if (cameraView === 'underwater') {
      cam.theta = 0.4;
      cam.phi = 1.8; // below surface looking up
      cam.radius = 1.8;
    }
  }, [cameraView]);

  // Main Three.js Scene Setup & Render Loop
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let width = container.clientWidth || 800;
    let height = container.clientHeight || 600;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(envConfig.skyColorTop);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 50);
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, envConfig.ambientLight * 0.9);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(new THREE.Color(envConfig.sunColor), 1.6);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // 3. Pool Tank Structure
    // Tank dimensions: 1.0 x 0.5 x 1.0
    const tankGroup = new THREE.Group();
    scene.add(tankGroup);

    // Floor texture creation based on floorType
    const createFloorTexture = () => {
      const texCanvas = document.createElement('canvas');
      texCanvas.width = 512;
      texCanvas.height = 512;
      const ctx = texCanvas.getContext('2d')!;

      if (envConfig.floorType === 'blue_tiles') {
        // Luxury swimming pool tiles
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(0, 0, 512, 512);
        const tileSize = 32;
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#e0f2fe';
        for (let x = 0; x < 512; x += tileSize) {
          for (let y = 0; y < 512; y += tileSize) {
            // Subtle tile shading variation
            const shade = Math.random() * 20 - 10;
            ctx.fillStyle = `rgb(${2 + shade}, ${132 + shade}, ${199 + shade})`;
            ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);
            ctx.strokeRect(x, y, tileSize, tileSize);
          }
        }
      } else if (envConfig.floorType === 'sand_pebbles') {
        // Tropical white-sand bed
        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(0, 0, 512, 512);
        for (let i = 0; i < 4000; i++) {
          const px = Math.random() * 512;
          const py = Math.random() * 512;
          const size = Math.random() * 2.5 + 0.5;
          ctx.fillStyle = Math.random() > 0.4 ? '#fde68a' : '#d97706';
          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (envConfig.floorType === 'ocean_rock') {
        // Dark volcanic basalt / stones
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, 512, 512);
        for (let i = 0; i < 600; i++) {
          const px = Math.random() * 512;
          const py = Math.random() * 512;
          ctx.fillStyle = Math.random() > 0.5 ? '#334155' : '#0f172a';
          ctx.fillRect(px, py, Math.random() * 16 + 4, Math.random() * 16 + 4);
        }
      } else {
        // Deep abyss
        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, 512, 512);
      }

      const texture = new THREE.CanvasTexture(texCanvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(2, 2);
      return texture;
    };

    // Floor Mesh
    const floorGeo = new THREE.PlaneGeometry(1.04, 1.04);
    const floorMat = new THREE.MeshStandardMaterial({
      map: createFloorTexture(),
      roughness: 0.6,
      metalness: 0.1
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -0.32;
    floorMesh.receiveShadow = true;
    tankGroup.add(floorMesh);

    // Tank Side Glass Borders
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(envConfig.waterColorSurface),
      transmission: 0.85,
      opacity: 0.4,
      transparent: true,
      roughness: 0.1,
      ior: 1.5,
      thickness: 0.05
    });

    const wallGeo = new THREE.BoxGeometry(1.04, 0.35, 0.02);
    // Back wall
    const wallBack = new THREE.Mesh(wallGeo, glassMat);
    wallBack.position.set(0, -0.15, -0.52);
    tankGroup.add(wallBack);

    // Front wall
    const wallFront = new THREE.Mesh(wallGeo, glassMat);
    wallFront.position.set(0, -0.15, 0.52);
    tankGroup.add(wallFront);

    // Left wall
    const sideGeo = new THREE.BoxGeometry(0.02, 0.35, 1.04);
    const wallLeft = new THREE.Mesh(sideGeo, glassMat);
    wallLeft.position.set(-0.52, -0.15, 0);
    tankGroup.add(wallLeft);

    // Right wall
    const wallRight = new THREE.Mesh(sideGeo, glassMat);
    wallRight.position.set(0.52, -0.15, 0);
    tankGroup.add(wallRight);

    // 4. Dynamic Water Surface Mesh
    const gridRes = simulationRef.current.size;
    const waterGeo = new THREE.PlaneGeometry(1.0, 1.0, gridRes - 1, gridRes - 1);
    waterGeo.rotateX(-Math.PI / 2);

    // Caustics canvas texture for floor projection
    const causticsCanvas = document.createElement('canvas');
    causticsCanvas.width = gridRes;
    causticsCanvas.height = gridRes;
    const causticsCtx = causticsCanvas.getContext('2d')!;
    const causticsImageData = causticsCtx.createImageData(gridRes, gridRes);
    const causticsTexture = new THREE.CanvasTexture(causticsCanvas);
    causticsTexture.minFilter = THREE.LinearFilter;
    causticsTexture.magFilter = THREE.LinearFilter;

    // Projected caustics plane on pool floor
    const causticsGeo = new THREE.PlaneGeometry(1.02, 1.02);
    const causticsMat = new THREE.MeshBasicMaterial({
      map: causticsTexture,
      transparent: true,
      opacity: 0.55 * envConfig.causticsIntensity,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const causticsMesh = new THREE.Mesh(causticsGeo, causticsMat);
    causticsMesh.rotation.x = -Math.PI / 2;
    causticsMesh.position.y = -0.315;
    scene.add(causticsMesh);

    // Realistic Water Shader Material
    const waterUniforms = {
      uTime: { value: 0 },
      uSunDirection: { value: new THREE.Vector3(0, 1, 0) },
      uSunColor: { value: new THREE.Color(envConfig.sunColor) },
      uWaterColorSurface: { value: new THREE.Color(envConfig.waterColorSurface) },
      uWaterColorDeep: { value: new THREE.Color(envConfig.waterColorDeep) },
      uSkyColor: { value: new THREE.Color(envConfig.skyColorHorizon) },
      uRefractionIndex: { value: physicsConfig.refractionIndex },
      uClarity: { value: physicsConfig.clarity },
      uBioluminescent: { value: envConfig.bioluminescentGlow ? 1.0 : 0.0 },
      uCausticsMap: { value: causticsTexture }
    };

    const waterMat = new THREE.ShaderMaterial({
      uniforms: waterUniforms,
      vertexShader: `
        uniform float uTime;
        varying vec3 vWorldPosition;
        varying vec3 vNormal;
        varying vec2 vUv;
        varying float vElevation;

        void main() {
          vUv = uv;
          vNormal = normal;
          vElevation = position.y;
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uSunDirection;
        uniform vec3 uSunColor;
        uniform vec3 uWaterColorSurface;
        uniform vec3 uWaterColorDeep;
        uniform vec3 uSkyColor;
        uniform float uRefractionIndex;
        uniform float uClarity;
        uniform float uBioluminescent;
        uniform sampler2D uCausticsMap;

        varying vec3 vWorldPosition;
        varying vec3 vNormal;
        varying vec2 vUv;
        varying float vElevation;

        void main() {
          vec3 N = normalize(vNormal);
          vec3 V = normalize(cameraPosition - vWorldPosition);
          vec3 L = normalize(uSunDirection);

          // 1. Fresnel Reflectance (Schlick's approximation)
          float R0 = 0.025; // Water reflectance at normal incidence
          float cosTheta = max(0.0, dot(V, N));
          float fresnel = R0 + (1.0 - R0) * pow(1.0 - cosTheta, 5.0);

          // 2. Specular Highlights (Blinn-Phong)
          vec3 H = normalize(L + V);
          float specAngle = max(0.0, dot(N, H));
          float specular = pow(specAngle, 140.0) * 1.8;

          // Secondary sparkle
          float microSparkle = pow(specAngle, 30.0) * 0.3;

          // 3. Depth & Absorption (Beer-Lambert law)
          // Red light absorbs faster, leaving turquoise/cyan
          float depthFactor = clamp((0.0 - vElevation) * 3.0 + 0.3, 0.0, 1.0);
          vec3 waterBodyColor = mix(uWaterColorSurface, uWaterColorDeep, depthFactor);

          // Refraction caustics bleed through surface
          vec4 causticSample = texture2D(uCausticsMap, vUv);
          float causticGlint = causticSample.r * 0.35 * uClarity;

          // 4. Sky Reflection
          vec3 skyReflect = mix(uSkyColor, vec3(1.0), pow(1.0 - N.y, 2.0) * 0.4);

          // 5. Combine Refraction and Reflection
          vec3 finalColor = mix(waterBodyColor + causticGlint, skyReflect, fresnel);
          finalColor += (specular + microSparkle) * uSunColor;

          // 6. Bioluminescent glow (blue/cyan electric light on disturbance)
          if (uBioluminescent > 0.5) {
            float disturbance = abs(vElevation) * 18.0;
            vec3 bioGlow = vec3(0.05, 0.85, 1.0) * disturbance;
            finalColor += bioGlow;
          }

          // 7. White foam on steep wave crests
          float foam = clamp(abs(vElevation) * 12.0 - 0.45, 0.0, 0.7);
          finalColor = mix(finalColor, vec3(0.95, 0.98, 1.0), foam);

          gl_FragColor = vec4(finalColor, 0.88);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });

    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    scene.add(waterMesh);

    // 5. Buoyant 3D Objects Visualization Pool
    const objectMeshesGroup = new THREE.Group();
    scene.add(objectMeshesGroup);

    const objectMeshMap = new Map<string, THREE.Group>();

    const createObject3D = (type: FloatingObjectType, color: string): THREE.Group => {
      const group = new THREE.Group();

      if (type === 'duck') {
        // Yellow Rubber Duck
        const bodyGeo = new THREE.SphereGeometry(0.045, 16, 16);
        bodyGeo.scale(1.2, 0.9, 1.0);
        const duckMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 });
        const body = new THREE.Mesh(bodyGeo, duckMat);
        body.castShadow = true;
        group.add(body);

        // Head
        const headGeo = new THREE.SphereGeometry(0.028, 16, 16);
        const head = new THREE.Mesh(headGeo, duckMat);
        head.position.set(0.035, 0.038, 0);
        head.castShadow = true;
        group.add(head);

        // Beak
        const beakGeo = new THREE.ConeGeometry(0.012, 0.03, 8);
        const beakMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.4 });
        const beak = new THREE.Mesh(beakGeo, beakMat);
        beak.rotation.z = -Math.PI / 2;
        beak.position.set(0.065, 0.035, 0);
        group.add(beak);

        // Eyes
        const eyeGeo = new THREE.SphereGeometry(0.005, 8, 8);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
        eyeL.position.set(0.05, 0.048, 0.015);
        const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
        eyeR.position.set(0.05, 0.048, -0.015);
        group.add(eyeL);
        group.add(eyeR);
      } else if (type === 'sphere') {
        // Floating Red/Orange Nautical Sphere
        const sphereGeo = new THREE.SphereGeometry(0.05, 24, 24);
        const sphereMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(color),
          roughness: 0.2,
          metalness: 0.1
        });
        const sphere = new THREE.Mesh(sphereGeo, sphereMat);
        sphere.castShadow = true;
        group.add(sphere);

        // Ring stripe
        const ringGeo = new THREE.TorusGeometry(0.051, 0.006, 8, 24);
        const ringMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        group.add(ring);
      } else if (type === 'wood_block') {
        // Floating Wooden Crate
        const boxGeo = new THREE.BoxGeometry(0.09, 0.09, 0.09);
        const boxMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.8 });
        const box = new THREE.Mesh(boxGeo, boxMat);
        box.castShadow = true;
        group.add(box);
      } else if (type === 'lotus') {
        // Water Lily Pad & Blossom
        const padGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.005, 24);
        const padMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.5 });
        const pad = new THREE.Mesh(padGeo, padMat);
        group.add(pad);

        // Pink Flower Center
        for (let p = 0; p < 8; p++) {
          const petalGeo = new THREE.ConeGeometry(0.015, 0.04, 6);
          const petalMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.3 });
          const petal = new THREE.Mesh(petalGeo, petalMat);
          const angle = (p / 8) * Math.PI * 2;
          petal.position.set(Math.cos(angle) * 0.02, 0.02, Math.sin(angle) * 0.02);
          petal.rotation.x = Math.sin(angle) * 0.4;
          petal.rotation.z = -Math.cos(angle) * 0.4;
          group.add(petal);
        }
      } else {
        // Navigation Buoy with light beacon
        const cylGeo = new THREE.CylinderGeometry(0.04, 0.055, 0.12, 16);
        const buoyMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 });
        const buoy = new THREE.Mesh(cylGeo, buoyMat);
        buoy.castShadow = true;
        group.add(buoy);

        // Flashing Light beacon
        const beaconGeo = new THREE.SphereGeometry(0.015, 8, 8);
        const beaconMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
        const beacon = new THREE.Mesh(beaconGeo, beaconMat);
        beacon.position.y = 0.07;
        group.add(beacon);
      }

      return group;
    };

    // 6. Rain Particle System
    const rainCount = 180;
    const rainGeo = new THREE.BufferGeometry();
    const rainPositions = new Float32Array(rainCount * 3);
    for (let r = 0; r < rainCount; r++) {
      rainPositions[r * 3 + 0] = (Math.random() - 0.5) * 1.0;
      rainPositions[r * 3 + 1] = Math.random() * 0.8 + 0.1;
      rainPositions[r * 3 + 2] = (Math.random() - 0.5) * 1.0;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
    const rainMat = new THREE.PointsMaterial({
      color: 0xbae6fd,
      size: 0.012,
      transparent: true,
      opacity: 0.65
    });
    const rainParticles = new THREE.Points(rainGeo, rainMat);
    scene.add(rainParticles);

    // ResizeObserver handler
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      if (newW > 0 && newH > 0) {
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // 7. Animation Loop
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const now = performance.now();
      const dt = Math.min(0.04, (now - lastTime) / 1000);
      lastTime = now;

      // Update FPS Telemetry
      fpsFramesRef.current++;
      if (now - fpsTimeRef.current >= 400) {
        currentFpsRef.current = Math.round((fpsFramesRef.current * 1000) / (now - fpsTimeRef.current));
        fpsFramesRef.current = 0;
        fpsTimeRef.current = now;

        const tel = simulationRef.current.getTelemetry();
        onTelemetryUpdate({
          fps: currentFpsRef.current,
          simTimeMs: Math.round(dt * 1000 * 10) / 10,
          activeWavesEnergy: tel.waveEnergyJoules,
          peakWaveHeight: tel.peakHeightCm,
          rmsWaveHeight: tel.rmsHeightCm,
          objectCount: buoyancyRef.current.objects.length,
          rainDropsPerSec: rainRate
        });
      }

      // Handle continuous drag ripples
      if (isPointerDownRef.current && pointerNormPosRef.current && toolMode === 'ripple') {
        const p = pointerNormPosRef.current;
        simulationRef.current.addDisturbance(p.x, p.y, 0.045, 0.35);
      }

      // Handle Rain Simulation
      if (rainRate > 0) {
        rainAccumulatorRef.current += rainRate * dt;
        while (rainAccumulatorRef.current >= 1.0) {
          rainAccumulatorRef.current -= 1.0;
          const rx = 0.1 + Math.random() * 0.8;
          const ry = 0.1 + Math.random() * 0.8;
          simulationRef.current.addDisturbance(rx, ry, 0.02, 0.18);
          if (Math.random() < 0.2) {
            waterAudio.playDrop(0.2);
          }
        }

        // Animate visual rain streaks
        const positions = rainGeo.attributes.position.array as Float32Array;
        for (let r = 0; r < rainCount; r++) {
          positions[r * 3 + 1] -= dt * 2.8;
          if (positions[r * 3 + 1] < 0) {
            positions[r * 3 + 1] = 0.7 + Math.random() * 0.2;
            positions[r * 3 + 0] = (Math.random() - 0.5) * 0.95;
            positions[r * 3 + 2] = (Math.random() - 0.5) * 0.95;
          }
        }
        rainGeo.attributes.position.needsUpdate = true;
        rainParticles.visible = true;
      } else {
        rainParticles.visible = false;
      }

      // Step Physics Simulation
      simulationRef.current.step(dt, physicsConfig);
      buoyancyRef.current.step(dt, simulationRef.current, physicsConfig);

      // Update Water Mesh Vertices & Normals
      const heightBuf = simulationRef.current.getHeightBuffer();
      const normBuf = simulationRef.current.getNormalBuffer();
      const posAttr = waterGeo.attributes.position;
      const normalAttr = waterGeo.attributes.normal;

      const S = simulationRef.current.size;
      for (let i = 0; i < S * S; i++) {
        // Plane geometry vertices are laid out row by row
        posAttr.setY(i, heightBuf[i] * 0.15); // Scale displacement
        normalAttr.setXYZ(i, normBuf[i * 3 + 0], normBuf[i * 3 + 1], normBuf[i * 3 + 2]);
      }
      posAttr.needsUpdate = true;
      normalAttr.needsUpdate = true;

      // Update Caustics Texture
      const causticsBuf = simulationRef.current.getCausticsBuffer();
      const cData = causticsImageData.data;
      for (let i = 0; i < S * S; i++) {
        const val = Math.min(255, Math.floor(causticsBuf[i] * 70));
        const idx = i * 4;
        cData[idx + 0] = val;
        cData[idx + 1] = Math.min(255, val + 20);
        cData[idx + 2] = 255;
        cData[idx + 3] = val;
      }
      causticsCtx.putImageData(causticsImageData, 0, 0);
      causticsTexture.needsUpdate = true;

      // Update Floating Objects
      const currentObjects = buoyancyRef.current.objects;
      const currentIds = new Set(currentObjects.map((o) => o.id));

      // Remove deleted meshes
      for (const [id, mesh] of objectMeshMap.entries()) {
        if (!currentIds.has(id)) {
          objectMeshesGroup.remove(mesh);
          objectMeshMap.delete(id);
        }
      }

      // Update or create active meshes
      for (const obj of currentObjects) {
        let mesh = objectMeshMap.get(obj.id);
        if (!mesh) {
          mesh = createObject3D(obj.type, obj.color);
          objectMeshMap.set(obj.id, mesh);
          objectMeshesGroup.add(mesh);
        }

        mesh.position.set(obj.x, obj.y, obj.z);
        mesh.rotation.x = obj.pitch;
        mesh.rotation.z = obj.roll;
      }

      // Update Camera Position from Orbit Controls
      const cam = cameraAngleRef.current;
      camera.position.x = cam.radius * Math.sin(cam.phi) * Math.sin(cam.theta);
      camera.position.y = cam.radius * Math.cos(cam.phi);
      camera.position.z = cam.radius * Math.sin(cam.phi) * Math.cos(cam.theta);
      camera.lookAt(0, -0.08, 0);

      // Update Sun Direction Vector
      const sunPhi = THREE.MathUtils.degToRad(90 - envConfig.sunElevation);
      const sunTheta = THREE.MathUtils.degToRad(envConfig.sunAzimuth);
      const sunDir = new THREE.Vector3(
        Math.sin(sunPhi) * Math.sin(sunTheta),
        Math.cos(sunPhi),
        Math.sin(sunPhi) * Math.cos(sunTheta)
      ).normalize();

      sunLight.position.copy(sunDir.clone().multiplyScalar(3.0));
      waterUniforms.uSunDirection.value.copy(sunDir);
      waterUniforms.uTime.value = now * 0.001;

      // Render Scene
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, [envConfig, physicsConfig, rainRate, cameraView, toolMode, onTelemetryUpdate]);

  // Pointer Interaction Logic (Raycasting on Water Surface)
  const raycastWater = useCallback((clientX: number, clientY: number): { normX: number; normZ: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((clientY - rect.top) / rect.height) * 2 + 1;

    // Raycast onto water plane y = 0
    const cam = cameraAngleRef.current;
    const camPos = new THREE.Vector3(
      cam.radius * Math.sin(cam.phi) * Math.sin(cam.theta),
      cam.radius * Math.cos(cam.phi),
      cam.radius * Math.sin(cam.phi) * Math.cos(cam.theta)
    );

    const camera = new THREE.PerspectiveCamera(45, rect.width / rect.height, 0.1, 50);
    camera.position.copy(camPos);
    camera.lookAt(0, -0.08, 0);
    camera.updateMatrixWorld();

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const target = new THREE.Vector3();
    const hit = raycaster.ray.intersectPlane(plane, target);

    if (hit && Math.abs(hit.x) <= 0.5 && Math.abs(hit.z) <= 0.5) {
      // Convert world coord [-0.5, 0.5] to normalized simulation coord [0, 1]
      return {
        normX: hit.x + 0.5,
        normZ: hit.z + 0.5
      };
    }
    return null;
  }, []);

  // Mouse Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    isPointerDownRef.current = true;
    pointerButtonRef.current = e.button;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    // Right click or Shift key = Camera Orbit
    if (e.button === 2 || e.shiftKey) {
      isRotatingCameraRef.current = true;
      return;
    }

    const hit = raycastWater(e.clientX, e.clientY);
    if (!hit) {
      isRotatingCameraRef.current = true;
      return;
    }

    pointerNormPosRef.current = { x: hit.normX, y: hit.normZ };

    // Execute Tool Action
    if (toolMode === 'ripple') {
      simulationRef.current.addDisturbance(hit.normX, hit.normZ, 0.05, 0.7);
      waterAudio.playSplash(0.4);
    } else if (toolMode === 'spawn_object') {
      buoyancyRef.current.spawnObject(selectedSpawnType, hit.normX - 0.5, hit.normZ - 0.5);
    } else if (toolMode === 'tsunami') {
      simulationRef.current.addTsunami();
      waterAudio.playTsunami();
    } else if (toolMode === 'wave_generator') {
      const sim = simulationRef.current;
      sim.waveGeneratorActive = !sim.waveGeneratorActive;
      sim.waveGeneratorX = hit.normX;
      sim.waveGeneratorY = hit.normZ;
      if (sim.waveGeneratorActive) {
        waterAudio.playDrop(0.6);
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDownRef.current) return;

    if (isRotatingCameraRef.current) {
      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };

      const cam = cameraAngleRef.current;
      cam.theta -= dx * 0.008;
      cam.phi = Math.max(0.08, Math.min(Math.PI * 0.48, cam.phi - dy * 0.008));
      return;
    }

    const hit = raycastWater(e.clientX, e.clientY);
    if (hit) {
      pointerNormPosRef.current = { x: hit.normX, y: hit.normZ };
    }
  };

  const handlePointerUp = () => {
    isPointerDownRef.current = false;
    isRotatingCameraRef.current = false;
    pointerNormPosRef.current = null;
    draggedObjectRef.current = null;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const cam = cameraAngleRef.current;
    cam.radius = Math.max(1.1, Math.min(3.6, cam.radius + e.deltaY * 0.002));
  };

  return (
    <div
      ref={containerRef}
      id="water-canvas-container"
      className="relative w-full h-full select-none overflow-hidden bg-slate-950 touch-none"
      onContextMenu={(e) => e.preventDefault()}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={handleWheel}
    >
      <canvas ref={canvasRef} className="w-full h-full block cursor-crosshair" />

      {/* Floating Canvas Hint */}
      <div className="absolute top-4 left-4 pointer-events-none z-10 bg-slate-900/60 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 text-xs text-white/80 shadow-lg flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        <span>
          {lang === 'he'
            ? 'גרור על המים ליצירת אדוות | קליק ימני או Shift לסיבוב מצלמה | גלגלת לזום'
            : 'Drag water to ripple | Right click / Shift to orbit camera | Scroll to zoom'}
        </span>
      </div>
    </div>
  );
};
