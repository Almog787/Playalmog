import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { ClothSimulation, WindSettings } from '../utils/clothSimulation';
import { createHighResIsraelFlagTexture } from '../utils/flagTexture';

export type TimeOfDayPreset = 'noon' | 'sunset' | 'night' | 'sunrise';

export type CameraPreset = 'hero' | 'closeup' | 'wide' | 'side' | 'top';

export interface FlagSceneConfig {
  timeOfDay: TimeOfDayPreset;
  windSpeed: number; // 0 to 30
  windTurbulence: number; // 0 to 1
  windDirection: number; // 0 to 360 degrees
  slowMotion: boolean;
  autoRotate: boolean;
}

export class FlagScene {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  
  // Sky & Lighting
  private sky: Sky;
  private sunPosition: THREE.Vector3 = new THREE.Vector3();
  private dirLight: THREE.DirectionalLight;
  private backLight: THREE.DirectionalLight;
  private hemiLight: THREE.HemisphereLight;
  private ambientLight: THREE.AmbientLight;
  private spotLight1: THREE.SpotLight;
  private spotLight2: THREE.SpotLight;
  private pmremGenerator: THREE.PMREMGenerator;

  // 3D Objects
  private clothSim: ClothSimulation;
  private flagMesh: THREE.Mesh;
  private flagpoleGroup: THREE.Group;
  private platformGroup: THREE.Group;

  // Animation & State
  private clock: THREE.Clock = new THREE.Clock();
  private isRunning: boolean = true;
  private config: FlagSceneConfig;

  // Target Camera position animation
  private targetCameraPos: THREE.Vector3 | null = null;
  private targetControlsTarget: THREE.Vector3 | null = null;

  constructor(container: HTMLElement, initialConfig: FlagSceneConfig) {
    this.container = container;
    this.config = { ...initialConfig };

    // 1. Scene Setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#87CEEB');

    // 2. Camera Setup
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(42, aspect, 0.1, 1000);
    this.camera.position.set(3.8, 6.2, 7.5);

    // 3. Renderer Setup with High-DPI & Film-grade Tone Mapping
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.pmremGenerator.compileEquirectangularShader();

    // 4. Orbit Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.target.set(1.8, 6.8, 0);
    this.controls.minDistance = 2.0;
    this.controls.maxDistance = 25.0;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.15; // Allow slight low angle looking up
    this.controls.autoRotate = this.config.autoRotate;
    this.controls.autoRotateSpeed = 0.8;

    // 5. Build Sky & Lights
    this.sky = new Sky();
    this.sky.scale.setScalar(450000);
    this.scene.add(this.sky);

    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
    this.scene.add(this.hemiLight);

    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.25);
    this.scene.add(this.ambientLight);

    this.dirLight = new THREE.DirectionalLight(0xffffff, 2.4);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 50;
    this.dirLight.shadow.camera.left = -8;
    this.dirLight.shadow.camera.right = 8;
    this.dirLight.shadow.camera.top = 10;
    this.dirLight.shadow.camera.bottom = -2;
    this.dirLight.shadow.bias = -0.0003;
    this.scene.add(this.dirLight);

    // Backlight for cloth translucency / subsurface glow
    this.backLight = new THREE.DirectionalLight(0xffffff, 0.8);
    this.scene.add(this.backLight);

    // Night Spotlights targeting the flag from below
    this.spotLight1 = new THREE.SpotLight(0xfff4e0, 0, 25, Math.PI / 5, 0.4, 1.2);
    this.spotLight1.position.set(-2, 0.5, 3);
    this.spotLight1.target.position.set(2, 7, 0);
    this.spotLight1.castShadow = true;
    this.scene.add(this.spotLight1);
    this.scene.add(this.spotLight1.target);

    this.spotLight2 = new THREE.SpotLight(0xe0f0ff, 0, 25, Math.PI / 5, 0.4, 1.2);
    this.spotLight2.position.set(2, 0.5, -3);
    this.spotLight2.target.position.set(2, 7, 0);
    this.scene.add(this.spotLight2);
    this.scene.add(this.spotLight2.target);

    // 6. Build High-Fidelity Flagpole & Base
    this.flagpoleGroup = this.createFlagpole();
    this.scene.add(this.flagpoleGroup);

    this.platformGroup = this.createPlatform();
    this.scene.add(this.platformGroup);

    // 7. Build Flag Cloth Physics & Material
    // Physical dimensions: width 4.4m x height 3.2m (ratio 8:11 approx)
    this.clothSim = new ClothSimulation(4.4, 3.2, 48, 34);
    
    const { colorMap, bumpMap, roughnessMap } = createHighResIsraelFlagTexture();

    const flagMaterial = new THREE.MeshStandardMaterial({
      map: colorMap,
      bumpMap: bumpMap,
      bumpScale: 0.006,
      roughnessMap: roughnessMap,
      roughness: 0.68,
      metalness: 0.04,
      side: THREE.DoubleSide,
      shadowSide: THREE.DoubleSide,
    });

    this.flagMesh = new THREE.Mesh(this.clothSim.geometry, flagMaterial);
    this.flagMesh.position.set(0.08, 5.2, 0); // Position on top section of flagpole
    this.flagMesh.castShadow = true;
    this.flagMesh.receiveShadow = true;
    this.flagMesh.customDepthMaterial = new THREE.MeshDepthMaterial({
      depthPacking: THREE.RGBADepthPacking,
      side: THREE.DoubleSide,
    });

    this.scene.add(this.flagMesh);

    // 8. Apply Initial Atmosphere & Wind Settings
    this.updateTimeOfDay(this.config.timeOfDay);
    this.updateWind();

    // 9. Resize & Animation Loop
    window.addEventListener('resize', this.onWindowResize);
    this.animate = this.animate.bind(this);
    this.renderer.setAnimationLoop(this.animate);
  }

  /**
   * Creates an authentic brushed chrome/aluminum flagpole with golden finial and pulleys
   */
  private createFlagpole(): THREE.Group {
    const group = new THREE.Group();

    // Materials
    const poleMat = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      metalness: 0.92,
      roughness: 0.18,
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.96,
      roughness: 0.12,
    });

    const darkMetalMat = new THREE.MeshStandardMaterial({
      color: 0x222222,
      metalness: 0.8,
      roughness: 0.3,
    });

    // 1. Tapered Main Pole (Height: 9.2m)
    const poleGeo = new THREE.CylinderGeometry(0.045, 0.08, 9.0, 32);
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 4.5;
    pole.castShadow = true;
    pole.receiveShadow = true;
    group.add(pole);

    // 2. Golden Finial / Sphere at Top (Crown of pole)
    const ballGeo = new THREE.SphereGeometry(0.16, 32, 32);
    const ball = new THREE.Mesh(ballGeo, goldMat);
    ball.position.y = 9.08;
    ball.castShadow = true;
    group.add(ball);

    // Decorative Spearhead tip atop the sphere
    const spearGeo = new THREE.ConeGeometry(0.06, 0.28, 16);
    const spear = new THREE.Mesh(spearGeo, goldMat);
    spear.position.y = 9.32;
    spear.castShadow = true;
    group.add(spear);

    // 3. Top Pulley Truck Box
    const pulleyGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.1, 24);
    const pulley = new THREE.Mesh(pulleyGeo, darkMetalMat);
    pulley.position.y = 8.92;
    group.add(pulley);

    // 4. White Braided Halyard Rope
    const ropeMat = new THREE.MeshStandardMaterial({
      color: 0xf5f5f5,
      roughness: 0.9,
    });
    const ropeGeo = new THREE.CylinderGeometry(0.007, 0.007, 9.0, 8);
    const rope = new THREE.Mesh(ropeGeo, ropeMat);
    rope.position.set(0.055, 4.5, 0);
    group.add(rope);

    // 5. Brass Swivel Snap Hooks / Rings at flag grommets
    const hookGeo = new THREE.TorusGeometry(0.035, 0.008, 12, 24);
    const hook1 = new THREE.Mesh(hookGeo, goldMat);
    hook1.position.set(0.055, 8.4, 0);
    hook1.rotation.y = Math.PI / 2;
    group.add(hook1);

    const hook2 = new THREE.Mesh(hookGeo, goldMat);
    hook2.position.set(0.055, 5.2, 0);
    hook2.rotation.y = Math.PI / 2;
    group.add(hook2);

    // 6. Base Cleat (where the rope is tied)
    const cleatGeo = new THREE.BoxGeometry(0.03, 0.18, 0.04);
    const cleat = new THREE.Mesh(cleatGeo, poleMat);
    cleat.position.set(0.08, 1.4, 0);
    group.add(cleat);

    return group;
  }

  /**
   * Creates a scenic Jerusalem Stone / Granite pedestal base
   */
  private createPlatform(): THREE.Group {
    const group = new THREE.Group();

    // Jerusalem Stone / Marble material
    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0xe6dfd1,
      roughness: 0.85,
      metalness: 0.05,
    });

    const darkGraniteMat = new THREE.MeshStandardMaterial({
      color: 0x3a3d40,
      roughness: 0.45,
      metalness: 0.2,
    });

    // Tiered Pedestal
    // Tier 1 (Base collar on pole)
    const collarGeo = new THREE.CylinderGeometry(0.18, 0.24, 0.35, 32);
    const collar = new THREE.Mesh(collarGeo, darkGraniteMat);
    collar.position.y = 0.175;
    collar.castShadow = true;
    collar.receiveShadow = true;
    group.add(collar);

    // Tier 2 (Beveled square pedestal)
    const tier1Geo = new THREE.BoxGeometry(1.6, 0.4, 1.6);
    const tier1 = new THREE.Mesh(tier1Geo, stoneMat);
    tier1.position.y = -0.2;
    tier1.receiveShadow = true;
    tier1.castShadow = true;
    group.add(tier1);

    // Tier 3 (Wide Stone Plaza Platform)
    const plazaGeo = new THREE.CylinderGeometry(8.0, 8.5, 0.6, 64);
    const plaza = new THREE.Mesh(plazaGeo, stoneMat);
    plaza.position.y = -0.7;
    plaza.receiveShadow = true;
    group.add(plaza);

    // Ground horizon disc
    const groundGeo = new THREE.CircleGeometry(80, 64);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x5a6875,
      roughness: 0.95,
      metalness: 0.0,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.0;
    ground.receiveShadow = true;
    group.add(ground);

    return group;
  }

  /**
   * Updates Sky shader parameters & Light intensities based on time of day
   */
  updateTimeOfDay(preset: TimeOfDayPreset) {
    this.config.timeOfDay = preset;
    const uniforms = this.sky.material.uniforms;

    // Reset night spotlights
    this.spotLight1.intensity = 0;
    this.spotLight2.intensity = 0;

    let elevation = 45;
    let azimuth = 180;
    let turbidity = 1.0;
    let rayleigh = 1.5;
    let mieCoefficient = 0.005;
    let mieDirectionalG = 0.7;
    let exposure = 1.0;
    let dirLightColor = 0xffffff;
    let dirLightIntensity = 2.4;
    let hemiSkyColor = 0xe8f4f8;
    let hemiGroundColor = 0x555555;

    switch (preset) {
      case 'noon': // Bright Sunny Mediterranean Day
        elevation = 65;
        azimuth = 135;
        turbidity = 2.0;
        rayleigh = 1.2;
        mieCoefficient = 0.003;
        mieDirectionalG = 0.8;
        exposure = 1.05;
        dirLightColor = 0xfffcf0;
        dirLightIntensity = 2.6;
        hemiSkyColor = 0xdef0ff;
        hemiGroundColor = 0x666666;
        break;

      case 'sunset': // Golden Hour Sunset
        elevation = 3.5;
        azimuth = 255;
        turbidity = 6.0;
        rayleigh = 3.5;
        mieCoefficient = 0.04;
        mieDirectionalG = 0.92;
        exposure = 0.95;
        dirLightColor = 0xff8c3b;
        dirLightIntensity = 3.2;
        hemiSkyColor = 0xff9966;
        hemiGroundColor = 0x332222;
        break;

      case 'night': // Deep Starry Night with Powerful Illuminating Spotlights
        elevation = -12;
        azimuth = 180;
        turbidity = 0.5;
        rayleigh = 0.2;
        mieCoefficient = 0.001;
        mieDirectionalG = 0.6;
        exposure = 1.15;
        dirLightColor = 0x334466;
        dirLightIntensity = 0.3;
        hemiSkyColor = 0x050c1e;
        hemiGroundColor = 0x020408;
        // Turn on high-power spotlights aiming at the flag
        this.spotLight1.intensity = 45.0;
        this.spotLight2.intensity = 35.0;
        break;

      case 'sunrise': // Crisp Early Dawn
        elevation = 7.0;
        azimuth = 75;
        turbidity = 3.0;
        rayleigh = 2.4;
        mieCoefficient = 0.015;
        mieDirectionalG = 0.85;
        exposure = 1.0;
        dirLightColor = 0xffeedd;
        dirLightIntensity = 2.8;
        hemiSkyColor = 0xffd6cc;
        hemiGroundColor = 0x444444;
        break;
    }

    // Set Sky Uniforms
    uniforms['turbidity'].value = turbidity;
    uniforms['rayleigh'].value = rayleigh;
    uniforms['mieCoefficient'].value = mieCoefficient;
    uniforms['mieDirectionalG'].value = mieDirectionalG;

    const phi = THREE.MathUtils.degToRad(90 - elevation);
    const theta = THREE.MathUtils.degToRad(azimuth);
    this.sunPosition.setFromSphericalCoords(1, phi, theta);
    uniforms['sunPosition'].value.copy(this.sunPosition);

    // Update Lighting
    this.renderer.toneMappingExposure = exposure;
    this.dirLight.color.setHex(dirLightColor);
    this.dirLight.intensity = dirLightIntensity;
    this.dirLight.position.copy(this.sunPosition).multiplyScalar(20);

    // Backlight for subsurface glow
    this.backLight.position.copy(this.sunPosition).negate().multiplyScalar(15);
    this.backLight.color.setHex(dirLightColor);
    this.backLight.intensity = dirLightIntensity * 0.25;

    this.hemiLight.color.setHex(hemiSkyColor);
    this.hemiLight.groundColor.setHex(hemiGroundColor);

    // Refresh PMREM environment from scene
    const envTexture = this.pmremGenerator.fromScene(this.scene).texture;
    this.scene.environment = envTexture;
  }

  /**
   * Updates wind speed, direction, and turbulence
   */
  updateWind(settings?: Partial<WindSettings>) {
    if (settings) {
      if (settings.speed !== undefined) this.config.windSpeed = settings.speed;
      if (settings.turbulence !== undefined) this.config.windTurbulence = settings.turbulence;
      if (settings.direction !== undefined) this.config.windDirection = settings.direction;
    }

    this.clothSim.windSettings.speed = this.config.windSpeed;
    this.clothSim.windSettings.turbulence = this.config.windTurbulence;
    this.clothSim.windSettings.direction = THREE.MathUtils.degToRad(this.config.windDirection);
  }

  /**
   * Smoothly animates the camera to designated cinematic viewpoints
   */
  setCameraPreset(preset: CameraPreset) {
    let targetPos = new THREE.Vector3();
    let lookTarget = new THREE.Vector3(1.8, 6.8, 0);

    switch (preset) {
      case 'hero': // Dynamic low-angle looking up proudly
        targetPos.set(2.2, 3.2, 5.8);
        lookTarget.set(1.8, 6.8, 0);
        break;
      case 'closeup': // Intimate close-up on Star of David & cloth weave
        targetPos.set(2.4, 6.6, 2.5);
        lookTarget.set(2.2, 6.8, 0);
        break;
      case 'side': // Perfect profile view showing full waving wave-crests
        targetPos.set(2.2, 6.5, 7.0);
        lookTarget.set(2.2, 6.5, 0);
        break;
      case 'wide': // Panoramic scenic view
        targetPos.set(6.5, 7.8, 12.0);
        lookTarget.set(1.5, 5.5, 0);
        break;
      case 'top': // High angle looking down
        targetPos.set(1.0, 12.5, 6.0);
        lookTarget.set(1.5, 6.5, 0);
        break;
    }

    this.targetCameraPos = targetPos;
    this.targetControlsTarget = lookTarget;
  }

  setAutoRotate(enabled: boolean) {
    this.config.autoRotate = enabled;
    this.controls.autoRotate = enabled;
  }

  setSlowMotion(enabled: boolean) {
    this.config.slowMotion = enabled;
  }

  private onWindowResize = () => {
    if (!this.container) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;

    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  /**
   * Main Render and Physics Animation Loop
   */
  private animate() {
    if (!this.isRunning) return;

    const rawDelta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();
    const simDelta = this.config.slowMotion ? rawDelta * 0.35 : rawDelta;

    // 1. Step Cloth Physics Simulation
    this.clothSim.update(simDelta, elapsedTime);

    // 2. Smoothly interpolate camera if a preset was triggered
    if (this.targetCameraPos && this.targetControlsTarget) {
      this.camera.position.lerp(this.targetCameraPos, 0.06);
      this.controls.target.lerp(this.targetControlsTarget, 0.06);

      if (this.camera.position.distanceTo(this.targetCameraPos) < 0.05) {
        this.targetCameraPos = null;
        this.targetControlsTarget = null;
      }
    }

    // 3. Update Controls & Render
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    this.isRunning = false;
    this.renderer.setAnimationLoop(null);
    window.removeEventListener('resize', this.onWindowResize);
    this.controls.dispose();
    this.pmremGenerator.dispose();
    this.renderer.dispose();
    if (this.container && this.renderer.domElement) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
