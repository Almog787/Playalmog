import * as THREE from 'three';
import {
  createIsraeliFlagTexture,
  createIsraeliStreetSignTexture,
  createStoreSignTexture,
  createSolarPanelTexture,
  createACTexture,
  createLightRailSignTexture,
} from '../utils/israeliTextures';
import { IsraeliPropsConfig } from '../types/city';

export interface IsraeliSceneManager {
  group: THREE.Group;
  update: (delta: number, time: number) => void;
  updatePropsVisibility: (config: IsraeliPropsConfig) => void;
  setNightMode: (isNight: boolean) => void;
}

export function buildIsraeliCityAdditions(scene: THREE.Scene): IsraeliSceneManager {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'IsraeliCityAdditions';
  scene.add(rootGroup);

  const flagsGroup = new THREE.Group();
  const solarGroup = new THREE.Group();
  const acGroup = new THREE.Group();
  const signsGroup = new THREE.Group();
  const streetFurnitureGroup = new THREE.Group();
  const palmsGroup = new THREE.Group();
  const nightLightsGroup = new THREE.Group();

  rootGroup.add(flagsGroup);
  rootGroup.add(solarGroup);
  rootGroup.add(acGroup);
  rootGroup.add(signsGroup);
  rootGroup.add(streetFurnitureGroup);
  rootGroup.add(palmsGroup);
  rootGroup.add(nightLightsGroup);

  const flagMeshes: { mesh: THREE.Mesh; origZ: Float32Array; speed: number }[] = [];
  const fanMeshes: THREE.Object3D[] = [];
  const glowingMaterials: THREE.MeshStandardMaterial[] = [];
  const neonLights: THREE.PointLight[] = [];

  // -------------------------------------------------------------
  // 1. ISRAELI FLAGS (דגלי ישראל על תורן ושרשרת דגלונים)
  // -------------------------------------------------------------
  const flagTex = createIsraeliFlagTexture();

  // A. Main Rooftop Flagpole
  const flagpoleGeo = new THREE.CylinderGeometry(0.015, 0.02, 1.6, 16);
  const flagpoleMat = new THREE.MeshStandardMaterial({
    color: 0xd0d7de,
    metalness: 0.85,
    roughness: 0.2,
  });
  const flagpole = new THREE.Mesh(flagpoleGeo, flagpoleMat);
  flagpole.position.set(0.7, 3.4, -0.4);
  flagsGroup.add(flagpole);

  // Gold finial sphere on top
  const finialGeo = new THREE.SphereGeometry(0.04, 16, 16);
  const finialMat = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    metalness: 0.9,
    roughness: 0.1,
  });
  const finial = new THREE.Mesh(finialGeo, finialMat);
  finial.position.set(0.7, 4.2, -0.4);
  flagsGroup.add(finial);

  // Waving Israeli Cloth Flag
  const flagGeo = new THREE.PlaneGeometry(0.75, 0.48, 24, 16);
  const flagMat = new THREE.MeshStandardMaterial({
    map: flagTex,
    roughness: 0.4,
    side: THREE.DoubleSide,
  });
  const mainFlag = new THREE.Mesh(flagGeo, flagMat);
  mainFlag.position.set(0.7 + 0.375, 3.85, -0.4);
  flagsGroup.add(mainFlag);

  const origZ = new Float32Array(flagGeo.attributes.position.array.length);
  origZ.set(flagGeo.attributes.position.array as Float32Array);
  flagMeshes.push({ mesh: mainFlag, origZ, speed: 4.0 });

  // B. Balcony Flags (Small Israeli flags on various railings)
  const createBalconyFlag = (pos: [number, number, number], rotY: number) => {
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.01, 0.6, 8),
      flagpoleMat
    );
    pole.rotation.z = -Math.PI / 4;
    pole.rotation.y = rotY;
    pole.position.set(...pos);
    flagsGroup.add(pole);

    const bFlagGeo = new THREE.PlaneGeometry(0.32, 0.2, 14, 8);
    const bFlag = new THREE.Mesh(bFlagGeo, flagMat);
    bFlag.position.set(pos[0] + 0.15, pos[1] + 0.12, pos[2]);
    bFlag.rotation.y = rotY;
    flagsGroup.add(bFlag);

    const bOrigZ = new Float32Array(bFlagGeo.attributes.position.array.length);
    bOrigZ.set(bFlagGeo.attributes.position.array as Float32Array);
    flagMeshes.push({ mesh: bFlag, origZ: bOrigZ, speed: 4.5 });
  };

  createBalconyFlag([1.9, 1.8, 1.2], 0.3);
  createBalconyFlag([-0.4, 2.3, 0.6], -0.6);
  createBalconyFlag([0.2, 1.4, 1.6], 0);

  // -------------------------------------------------------------
  // 2. ISRAELI SOLAR WATER HEATERS (דודי שמש וקולטי שמש)
  // -------------------------------------------------------------
  const solarPanelTex = createSolarPanelTexture();

  const createDudShemesh = (
    pos: [number, number, number],
    rotY: number = 0,
    scale: number = 1
  ) => {
    const dudGroup = new THREE.Group();
    dudGroup.position.set(...pos);
    dudGroup.rotation.y = rotY;
    dudGroup.scale.setScalar(scale);

    // White Cylindrical Boiler (דוד מים לבן)
    const boilerGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.52, 24);
    const boilerMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.3,
      metalness: 0.15,
    });
    const boiler = new THREE.Mesh(boilerGeo, boilerMat);
    boiler.rotation.x = Math.PI / 2;
    boiler.position.set(0, 0.28, -0.22);
    dudGroup.add(boiler);

    // Red/Blue Chromagen stripe around boiler
    const stripeGeo = new THREE.CylinderGeometry(0.122, 0.122, 0.08, 24);
    const stripeMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Blue Chromagen band
      roughness: 0.4,
    });
    const stripe = new THREE.Mesh(stripeGeo, stripeMat);
    stripe.rotation.x = Math.PI / 2;
    stripe.position.set(0, 0.28, -0.22);
    dudGroup.add(stripe);

    // Metal Frame Stand (מעמד ברזל זוויתי)
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.8,
      roughness: 0.5,
    });
    const legGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.3, 8);
    const leg1 = new THREE.Mesh(legGeo, frameMat);
    leg1.position.set(-0.14, 0.15, -0.2);
    const leg2 = new THREE.Mesh(legGeo, frameMat);
    leg2.position.set(0.14, 0.15, -0.2);
    const leg3 = new THREE.Mesh(legGeo, frameMat);
    leg3.position.set(-0.14, 0.15, -0.35);
    const leg4 = new THREE.Mesh(legGeo, frameMat);
    leg4.position.set(0.14, 0.15, -0.35);
    dudGroup.add(leg1, leg2, leg3, leg4);

    // Solar Collector Panel (קולט שמש זכוכית מוטה ב-45 מעלות דרומה)
    const panelGeo = new THREE.BoxGeometry(0.42, 0.02, 0.65);
    const panelMat = new THREE.MeshStandardMaterial({
      map: solarPanelTex,
      roughness: 0.15,
      metalness: 0.3,
    });
    const panel = new THREE.Mesh(panelGeo, panelMat);
    panel.position.set(0, 0.22, 0.14);
    panel.rotation.x = Math.PI / 5; // Tilted towards the sun
    dudGroup.add(panel);

    // Panel support legs
    const pLegGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.25, 8);
    const pLeg1 = new THREE.Mesh(pLegGeo, frameMat);
    pLeg1.position.set(-0.18, 0.12, 0.05);
    const pLeg2 = new THREE.Mesh(pLegGeo, frameMat);
    pLeg2.position.set(0.18, 0.12, 0.05);
    dudGroup.add(pLeg1, pLeg2);

    // Connecting copper pipes (צינורות נחושת)
    const pipeMat = new THREE.MeshStandardMaterial({
      color: 0xb45309,
      metalness: 0.7,
      roughness: 0.3,
    });
    const pipeGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.3, 8);
    const pipe = new THREE.Mesh(pipeGeo, pipeMat);
    pipe.rotation.x = Math.PI / 3;
    pipe.position.set(0.1, 0.26, -0.05);
    dudGroup.add(pipe);

    solarGroup.add(dudGroup);
  };

  // Place multiple authentic Israeli solar heaters on rooftops
  createDudShemesh([0.9, 3.1, -0.2], 0, 1.1);
  createDudShemesh([0.3, 3.1, -0.35], 0.2, 0.95);
  createDudShemesh([-0.6, 2.7, 0.1], -0.4, 0.9);
  createDudShemesh([1.7, 2.3, 0.5], 0.5, 0.85);
  createDudShemesh([1.4, 2.3, -0.6], -0.2, 0.9);
  createDudShemesh([-0.3, 2.05, 1.3], 0.3, 0.8);

  // -------------------------------------------------------------
  // 3. ISRAELI AIR CONDITIONER COMPRESSORS (מזגנים תלויים על הקירות)
  // -------------------------------------------------------------
  const electraTex = createACTexture('electra');
  const tadiranTex = createACTexture('tadiran');
  const tornadoTex = createACTexture('tornado');

  const createACUnit = (
    pos: [number, number, number],
    rotY: number,
    brand: 'electra' | 'tadiran' | 'tornado' = 'electra'
  ) => {
    const ac = new THREE.Group();
    ac.position.set(...pos);
    ac.rotation.y = rotY;

    const tex = brand === 'electra' ? electraTex : brand === 'tadiran' ? tadiranTex : tornadoTex;
    const bodyGeo = new THREE.BoxGeometry(0.28, 0.2, 0.14);

    const sideMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.5 });
    const frontMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.3 });
    const materials = [
      sideMat, sideMat, sideMat, sideMat,
      frontMat, // Front
      sideMat, // Back
    ];

    const body = new THREE.Mesh(bodyGeo, materials);
    ac.add(body);

    // Wall mounting brackets (תושבות ברזל)
    const bMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
    const b1 = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.15, 0.16), bMat);
    b1.position.set(-0.1, -0.05, -0.02);
    const b2 = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.15, 0.16), bMat);
    b2.position.set(0.1, -0.05, -0.02);
    ac.add(b1, b2);

    // Drain tube (צינור ניקוז מים שנוטף)
    const tubeGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.35, 6);
    const tubeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.6 });
    const tube = new THREE.Mesh(tubeGeo, tubeMat);
    tube.position.set(0.11, -0.22, 0.02);
    ac.add(tube);

    acGroup.add(ac);
  };

  // Hang AC units across external building facades
  createACUnit([1.95, 2.05, 0.4], Math.PI / 2, 'electra');
  createACUnit([1.95, 1.45, 0.8], Math.PI / 2, 'tadiran');
  createACUnit([-0.85, 2.2, 0.3], -Math.PI / 2, 'tornado');
  createACUnit([-0.85, 1.5, -0.2], -Math.PI / 2, 'electra');
  createACUnit([0.65, 2.45, 1.62], 0, 'tadiran');
  createACUnit([-0.1, 1.9, 1.62], 0, 'electra');
  createACUnit([1.1, 1.35, -1.2], Math.PI, 'tornado');

  // -------------------------------------------------------------
  // 4. AUTHENTIC HEBREW STORE & STREET SIGNS (שלטים ישראליים)
  // -------------------------------------------------------------
  const createSign = (
    texture: THREE.CanvasTexture,
    size: [number, number],
    pos: [number, number, number],
    rotY: number = 0,
    emissiveIntensity: number = 0.6
  ) => {
    const signGeo = new THREE.PlaneGeometry(size[0], size[1]);
    const signMat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.2,
      emissive: 0xffffff,
      emissiveMap: texture,
      emissiveIntensity: emissiveIntensity,
      side: THREE.FrontSide,
    });
    glowingMaterials.push(signMat);

    const signMesh = new THREE.Mesh(signGeo, signMat);
    signMesh.position.set(...pos);
    signMesh.rotation.y = rotY;

    // Frame backing
    const backGeo = new THREE.BoxGeometry(size[0] + 0.04, size[1] + 0.04, 0.03);
    const backMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7 });
    const backMesh = new THREE.Mesh(backGeo, backMat);
    backMesh.position.set(0, 0, -0.018);
    signMesh.add(backMesh);

    signsGroup.add(signMesh);
    return signMesh;
  };

  // A. Street Signs (רחוב דיזנגוף & שדרות רוטשילד)
  const dizengoffTex = createIsraeliStreetSignTexture('רחוב דיזנגוף', 'Dizengoff St.');
  const rothschildTex = createIsraeliStreetSignTexture('שדרות רוטשילד', 'Rothschild Blvd.');
  const herzlTex = createIsraeliStreetSignTexture('רחוב הרצל', 'Herzl St.');

  createSign(dizengoffTex, [0.5, 0.2], [1.98, 1.25, 0.1], Math.PI / 2, 0.4);
  createSign(rothschildTex, [0.55, 0.2], [0.35, 1.15, 1.63], 0, 0.4);
  createSign(herzlTex, [0.45, 0.18], [-0.88, 1.2, 0.5], -Math.PI / 2, 0.4);

  // B. Commercial Storefront Signs (שווארמה, קיוסק, קפה, טמבור, AM:PM, סופרפארם)
  const shawarmaTex = createStoreSignTexture('shawarma');
  const falafelTex = createStoreSignTexture('falafel');
  const kioskTex = createStoreSignTexture('kiosk');
  const cafeTex = createStoreSignTexture('cafe');
  const tambourTex = createStoreSignTexture('tambour');
  const ampmTex = createStoreSignTexture('ampm');
  const superpharmTex = createStoreSignTexture('superpharm');

  // Main shawarma rooftop billboard
  createSign(shawarmaTex, [1.1, 0.55], [0.85, 2.75, 1.25], 0.1, 0.8);

  // AM:PM Supermarket sign
  createSign(ampmTex, [0.85, 0.42], [1.96, 1.05, 0.95], Math.PI / 2, 0.9);

  // Kiosk 24/7 Neon Sign
  createSign(kioskTex, [0.75, 0.38], [-0.86, 0.95, 0.8], -Math.PI / 2, 1.0);

  // Cafe Tamar
  createSign(cafeTex, [0.65, 0.32], [0.95, 1.15, -1.22], Math.PI, 0.7);

  // Falafel Kaduri
  createSign(falafelTex, [0.75, 0.38], [-0.2, 1.6, 1.62], 0, 0.8);

  // Tambour hardware
  createSign(tambourTex, [0.6, 0.3], [1.96, 1.7, -0.3], Math.PI / 2, 0.6);

  // Super-Pharm
  createSign(superpharmTex, [0.7, 0.35], [-0.86, 1.65, -0.5], -Math.PI / 2, 0.7);

  // C. Light Rail LED Destination Display
  const lightRailTex = createLightRailSignTexture();
  createSign(lightRailTex, [0.8, 0.2], [0.1, 1.88, -0.05], 0, 1.2);

  // -------------------------------------------------------------
  // 5. ISRAELI STREET OBJECTS & FURNITURE (קורקינטים, דואר ישראל, פחים ירוקים)
  // -------------------------------------------------------------
  // A. Israel Post Red Mailbox (תיבת דואר אדומה של דואר ישראל)
  const postBoxGroup = new THREE.Group();
  postBoxGroup.position.set(1.85, 0.85, 1.4);
  const postBoxBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.07, 0.28, 16),
    new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3 })
  );
  postBoxBody.position.y = 0.14;
  const postBoxCap = new THREE.Mesh(
    new THREE.SphereGeometry(0.072, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.2 })
  );
  postBoxCap.position.y = 0.28;
  const postPost = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.015, 0.18, 8),
    new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 })
  );
  postPost.position.y = 0.02;
  postBoxGroup.add(postBoxBody, postBoxCap, postPost);
  streetFurnitureGroup.add(postBoxGroup);

  // B. Tel Aviv Shared E-Scooters (Lime / Bird / Wind קורקינט שיתופי)
  const createScooter = (pos: [number, number, number], rotY: number, color: number = 0x84cc16) => {
    const scooter = new THREE.Group();
    scooter.position.set(...pos);
    scooter.rotation.y = rotY;
    scooter.scale.setScalar(0.7);

    // Deck
    const deck = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.02, 0.32),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 })
    );
    deck.position.y = 0.04;

    // Stem (Lime green / color)
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.01, 0.01, 0.38, 8),
      new THREE.MeshStandardMaterial({ color, roughness: 0.3 })
    );
    stem.position.set(0, 0.22, 0.14);
    stem.rotation.x = -0.15;

    // Handlebar
    const handlebar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.008, 0.18, 8),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 })
    );
    handlebar.rotation.z = Math.PI / 2;
    handlebar.position.set(0, 0.4, 0.11);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.02, 12);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.9 });
    const wheelFront = new THREE.Mesh(wheelGeo, wheelMat);
    wheelFront.rotation.z = Math.PI / 2;
    wheelFront.position.set(0, 0.03, 0.15);
    const wheelBack = new THREE.Mesh(wheelGeo, wheelMat);
    wheelBack.rotation.z = Math.PI / 2;
    wheelBack.position.set(0, 0.03, -0.15);

    scooter.add(deck, stem, handlebar, wheelFront, wheelBack);
    streetFurnitureGroup.add(scooter);
  };

  createScooter([1.75, 0.78, 1.25], 0.4, 0x84cc16); // Lime scooter
  createScooter([1.78, 0.78, 1.15], 0.25, 0x0284c7); // Wind blue scooter
  createScooter([-0.6, 0.82, 1.55], -1.1, 0xf43f5e); // Bird pink scooter

  // C. Green Israeli "Tzparon" Recycling / Garbage Bin (פח ירוק עירוני)
  const createGreenBin = (pos: [number, number, number], rotY: number) => {
    const bin = new THREE.Group();
    bin.position.set(...pos);
    bin.rotation.y = rotY;
    bin.scale.setScalar(0.75);

    const binBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.28, 0.18),
      new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.4 })
    );
    binBody.position.y = 0.14;

    const binLid = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.04, 0.2),
      new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.3 })
    );
    binLid.position.y = 0.3;

    // Small black wheels
    const wheelGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.02, 10);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const w1 = new THREE.Mesh(wheelGeo, wheelMat);
    w1.rotation.z = Math.PI / 2;
    w1.position.set(0.1, 0.025, -0.06);
    const w2 = new THREE.Mesh(wheelGeo, wheelMat);
    w2.rotation.z = Math.PI / 2;
    w2.position.set(-0.1, 0.025, -0.06);

    bin.add(binBody, binLid, w1, w2);
    streetFurnitureGroup.add(bin);
  };

  createGreenBin([-0.75, 0.8, 1.3], 0.3);
  createGreenBin([1.8, 0.8, -0.9], -0.5);

  // -------------------------------------------------------------
  // 6. MEDITERRANEAN WASHINGTONIA PALMS & FLORA (דקלים ובוגנוויליה)
  // -------------------------------------------------------------
  const createPalmTree = (pos: [number, number, number], height: number = 1.4) => {
    const palm = new THREE.Group();
    palm.position.set(...pos);

    // Trunk (גזע דקל מחוספס)
    const trunkGeo = new THREE.CylinderGeometry(0.04, 0.065, height, 8);
    const trunkMat = new THREE.MeshStandardMaterial({
      color: 0x785135,
      roughness: 0.9,
    });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = height / 2;
    trunk.rotation.z = 0.05; // slight organic bend
    palm.add(trunk);

    // Crown of Fronds (ענפי דקל פרוסים)
    const frondMat = new THREE.MeshStandardMaterial({
      color: 0x166534,
      roughness: 0.6,
      side: THREE.DoubleSide,
    });
    for (let i = 0; i < 9; i++) {
      const angle = (i / 9) * Math.PI * 2;
      const frond = new THREE.Mesh(
        new THREE.PlaneGeometry(0.55, 0.16),
        frondMat
      );
      frond.position.set(0, height, 0);
      frond.rotation.y = angle;
      frond.rotation.x = Math.PI / 3.5;
      palm.add(frond);
    }

    // Dates cluster (אשכול תמרים כתום)
    const dates = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.07),
      new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 })
    );
    dates.position.set(0.03, height - 0.05, 0.03);
    palm.add(dates);

    palmsGroup.add(palm);
  };

  createPalmTree([2.3, 0.75, 1.7], 1.6);
  createPalmTree([2.4, 0.75, -1.6], 1.5);
  createPalmTree([-1.4, 0.75, 1.4], 1.3);

  // Bougainvillea climbing flower bushes (שיחי בוגנוויליה ורודים/מג'נטה מטפסים)
  const createBougainvillea = (pos: [number, number, number], scale: number = 1) => {
    const bush = new THREE.Group();
    bush.position.set(...pos);
    bush.scale.setScalar(scale);

    const fMat = new THREE.MeshStandardMaterial({
      color: 0xdb2777, // Vibrant pink bougainvillea flower
      roughness: 0.4,
    });
    const lMat = new THREE.MeshStandardMaterial({
      color: 0x15803d, // Green leaves
      roughness: 0.7,
    });

    for (let i = 0; i < 6; i++) {
      const b = new THREE.Mesh(new THREE.DodecahedronGeometry(0.12), fMat);
      b.position.set((Math.random() - 0.5) * 0.25, (Math.random() - 0.5) * 0.25, (Math.random() - 0.5) * 0.25);
      bush.add(b);
    }
    for (let i = 0; i < 4; i++) {
      const l = new THREE.Mesh(new THREE.DodecahedronGeometry(0.1), lMat);
      l.position.set((Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.3);
      bush.add(l);
    }

    palmsGroup.add(bush);
  };

  createBougainvillea([1.96, 1.5, 1.3], 0.9);
  createBougainvillea([0.15, 2.1, 1.62], 1.0);
  createBougainvillea([-0.86, 1.8, 0.1], 0.85);

  // -------------------------------------------------------------
  // 7. NIGHT ILLUMINATION & NEON LIGHTS (תאורת לילה ישראלית)
  // -------------------------------------------------------------
  const createNeonPointLight = (pos: [number, number, number], color: number, intensity: number) => {
    const light = new THREE.PointLight(color, intensity, 3, 2);
    light.position.set(...pos);
    nightLightsGroup.add(light);
    neonLights.push(light);
  };

  createNeonPointLight([0.85, 2.8, 1.4], 0xff6600, 1.2); // Shawarma orange glow
  createNeonPointLight([1.96, 1.05, 1.1], 0x10b981, 1.0); // AM:PM green glow
  createNeonPointLight([-0.86, 1.0, 0.9], 0xf43f5e, 1.2); // Kiosk pink glow
  createNeonPointLight([0.35, 1.2, 1.7], 0x0088ff, 0.8); // Street sign blue glow

  // -------------------------------------------------------------
  // ANIMATION & CONTROLLER INTERFACE
  // -------------------------------------------------------------
  return {
    group: rootGroup,
    update: (_delta: number, time: number) => {
      // Animate cloth flag waving with realistic wind harmonic waves
      for (const { mesh, origZ, speed } of flagMeshes) {
        const posAttr = mesh.geometry.attributes.position;
        const arr = posAttr.array as Float32Array;

        for (let i = 0; i < arr.length; i += 3) {
          const x = arr[i];
          const factor = Math.max(0, (x + 0.375) / 0.75); // Fixed at flagpole (x=0)

          const wave1 = Math.sin(time * speed + x * 8) * 0.05;
          const wave2 = Math.cos(time * speed * 1.5 + x * 12) * 0.02;
          arr[i + 2] = origZ[i + 2] + (wave1 + wave2) * factor;
        }
        posAttr.needsUpdate = true;
      }
    },
    updatePropsVisibility: (config: IsraeliPropsConfig) => {
      flagsGroup.visible = config.flags;
      solarGroup.visible = config.solarHeaters;
      acGroup.visible = config.airConditioners;
      signsGroup.visible = config.hebrewSigns;
      streetFurnitureGroup.visible = config.streetFurniture;
      palmsGroup.visible = config.palmTrees;
      nightLightsGroup.visible = config.nightLights;
    },
    setNightMode: (isNight: boolean) => {
      const factor = isNight ? 1.5 : 0.4;
      for (const mat of glowingMaterials) {
        mat.emissiveIntensity = factor;
      }
      for (const light of neonLights) {
        light.intensity = isNight ? 1.5 : 0.2;
      }
    },
  };
}
