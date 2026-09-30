import * as THREE from 'three';

export interface WindSettings {
  speed: number; // 0 (calm) to 30 (storm), standard ~ 12-16
  direction: number; // Angle in radians
  turbulence: number; // 0 to 1
  elevation: number; // Angle upward / downward
}

export class Particle {
  position: THREE.Vector3;
  previous: THREE.Vector3;
  original: THREE.Vector3;
  acceleration: THREE.Vector3;
  mass: number;
  invMass: number;
  pinned: boolean;

  constructor(x: number, y: number, z: number, mass: number, pinned: boolean = false) {
    this.position = new THREE.Vector3(x, y, z);
    this.previous = new THREE.Vector3(x, y, z);
    this.original = new THREE.Vector3(x, y, z);
    this.acceleration = new THREE.Vector3(0, 0, 0);
    this.mass = mass;
    this.invMass = pinned ? 0 : 1 / mass;
    this.pinned = pinned;
  }

  addForce(force: THREE.Vector3) {
    if (!this.pinned) {
      this.acceleration.addScaledVector(force, this.invMass);
    }
  }

  integrate(deltaSq: number, drag: number) {
    if (this.pinned) return;

    const current = this.position.clone();
    const velocity = this.position.clone().sub(this.previous).multiplyScalar(drag);
    
    // Verlet integration step: x(t + dt) = x(t) + (x(t) - x(t - dt)) * drag + a * dt^2
    this.position.add(velocity).addScaledVector(this.acceleration, deltaSq);
    this.previous.copy(current);
    this.acceleration.set(0, 0, 0);
  }
}

export interface Constraint {
  p1: Particle;
  p2: Particle;
  distance: number;
  stiffness: number;
}

export class ClothSimulation {
  w: number; // Physical width
  h: number; // Physical height
  xSegments: number;
  ySegments: number;
  particles: Particle[];
  constraints: Constraint[];
  geometry: THREE.BufferGeometry;
  
  // Wind & Physics Parameters
  gravity: THREE.Vector3 = new THREE.Vector3(0, -9.81 * 0.45, 0);
  drag: number = 0.985;
  windSettings: WindSettings = {
    speed: 15,
    direction: 0,
    turbulence: 0.65,
    elevation: 0.05,
  };
  
  private timeAccumulator: number = 0;
  private noiseSeed: number = 0;

  constructor(
    width: number = 4.4,
    height: number = 3.2,
    xSegments: number = 44,
    ySegments: number = 32
  ) {
    this.w = width;
    this.h = height;
    this.xSegments = xSegments;
    this.ySegments = ySegments;
    this.particles = [];
    this.constraints = [];

    this.initParticles();
    this.initConstraints();
    this.geometry = this.createGeometry();
  }

  private index(u: number, v: number): number {
    return u + v * (this.xSegments + 1);
  }

  private initParticles() {
    const mass = 0.08; // Lightweight silk / flag nylon cloth

    for (let v = 0; v <= this.ySegments; v++) {
      for (let u = 0; u <= this.xSegments; u++) {
        const x = (u / this.xSegments) * this.w;
        const y = (1 - v / this.ySegments) * this.h;
        const z = (Math.random() - 0.5) * 0.02; // Small initial perturbation

        // Pin the left edge (hoist of the flag)
        const isPinned = u === 0;
        const p = new Particle(x, y, z, mass, isPinned);
        this.particles.push(p);
      }
    }
  }

  private initConstraints() {
    const addConstraint = (u1: number, v1: number, u2: number, v2: number, stiffness: number = 1.0) => {
      const p1 = this.particles[this.index(u1, v1)];
      const p2 = this.particles[this.index(u2, v2)];
      const dist = p1.position.distanceTo(p2.position);
      this.constraints.push({ p1, p2, distance: dist, stiffness });
    };

    // 1. Structural constraints (adjacent edges)
    for (let v = 0; v <= this.ySegments; v++) {
      for (let u = 0; u <= this.xSegments; u++) {
        if (u < this.xSegments) addConstraint(u, v, u + 1, v, 1.0);
        if (v < this.ySegments) addConstraint(u, v, u, v + 1, 1.0);
      }
    }

    // 2. Shear constraints (diagonals - prevents diamond distortion)
    for (let v = 0; v < this.ySegments; v++) {
      for (let u = 0; u < this.xSegments; u++) {
        addConstraint(u, v, u + 1, v + 1, 0.85);
        addConstraint(u + 1, v, u, v + 1, 0.85);
      }
    }

    // 3. Bending / Flexion constraints (2-step hops - creates realistic gentle cloth ripples)
    for (let v = 0; v <= this.ySegments; v++) {
      for (let u = 0; u <= this.xSegments; u++) {
        if (u < this.xSegments - 1) addConstraint(u, v, u + 2, v, 0.6);
        if (v < this.ySegments - 1) addConstraint(u, v, u, v + 2, 0.6);
      }
    }
  }

  private createGeometry(): THREE.BufferGeometry {
    const geo = new THREE.BufferGeometry();
    const numVertices = (this.xSegments + 1) * (this.ySegments + 1);

    const positions = new Float32Array(numVertices * 3);
    const uvs = new Float32Array(numVertices * 2);

    let pIdx = 0;
    let uvIdx = 0;

    for (let v = 0; v <= this.ySegments; v++) {
      for (let u = 0; u <= this.xSegments; u++) {
        const particle = this.particles[this.index(u, v)];
        positions[pIdx] = particle.position.x;
        positions[pIdx + 1] = particle.position.y;
        positions[pIdx + 2] = particle.position.z;
        pIdx += 3;

        uvs[uvIdx] = u / this.xSegments;
        uvs[uvIdx + 1] = 1 - v / this.ySegments;
        uvIdx += 2;
      }
    }

    const indices: number[] = [];
    for (let v = 0; v < this.ySegments; v++) {
      for (let u = 0; u < this.xSegments; u++) {
        const a = this.index(u, v);
        const b = this.index(u + 1, v);
        const c = this.index(u + 1, v + 1);
        const d = this.index(u, v + 1);

        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    return geo;
  }

  /**
   * Applies aerodynamic lift, drag, and turbulent wind pulses to cloth triangles
   */
  private applyAerodynamics(elapsedTime: number) {
    const { speed, direction, turbulence, elevation } = this.windSettings;
    
    // Wind vector calculation
    const baseDir = new THREE.Vector3(
      Math.cos(direction) * Math.cos(elevation),
      Math.sin(elevation),
      Math.sin(direction) * Math.cos(elevation)
    ).normalize();

    // Natural turbulent variation: multi-frequency sine waves + traveling pulse
    const gust = Math.sin(elapsedTime * 2.8) * 0.35 + 
                 Math.sin(elapsedTime * 5.2 + 1.2) * 0.2 + 
                 Math.sin(elapsedTime * 0.7) * 0.25;

    const currentSpeed = Math.max(0.5, speed * (1.0 + gust * turbulence));

    const pA = new THREE.Vector3();
    const pB = new THREE.Vector3();
    const pC = new THREE.Vector3();
    const normal = new THREE.Vector3();
    const triVelocity = new THREE.Vector3();
    const vRel = new THREE.Vector3();
    const aeroForce = new THREE.Vector3();

    for (let v = 0; v < this.ySegments; v++) {
      for (let u = 0; u < this.xSegments; u++) {
        const iA = this.index(u, v);
        const iB = this.index(u + 1, v);
        const iC = this.index(u, v + 1);

        const particleA = this.particles[iA];
        const particleB = this.particles[iB];
        const particleC = this.particles[iC];

        pA.copy(particleA.position);
        pB.copy(particleB.position);
        pC.copy(particleC.position);

        // Compute triangle face normal
        pB.sub(pA);
        pC.sub(pA);
        normal.crossVectors(pB, pC).normalize();

        // Local wind vector with wave disturbance traveling along the flag
        const wavePhase = (u / this.xSegments) * 6.0 - elapsedTime * 4.5;
        const waveDisplace = Math.sin(wavePhase) * (0.2 + (u / this.xSegments) * 0.4) * turbulence;
        
        const localWind = baseDir.clone().multiplyScalar(currentSpeed);
        localWind.z += waveDisplace * 3.5;
        localWind.y += Math.cos(wavePhase * 1.5) * 0.8 * turbulence;

        // Triangle velocity
        triVelocity.copy(particleA.position).sub(particleA.previous)
          .add(particleB.position.clone().sub(particleB.previous))
          .add(particleC.position.clone().sub(particleC.previous))
          .multiplyScalar(1 / 3);

        vRel.copy(localWind).sub(triVelocity);

        // Dot product between wind relative velocity and normal
        const vRelDotN = vRel.dot(normal);

        // Aerodynamic pressure: F = 0.5 * rho * v^2 * Area * (v_rel · n) * n
        aeroForce.copy(normal).multiplyScalar(vRelDotN * Math.abs(vRelDotN) * 0.08);

        // Distribute force to the 3 vertices
        aeroForce.multiplyScalar(1 / 3);
        particleA.addForce(aeroForce);
        particleB.addForce(aeroForce);
        particleC.addForce(aeroForce);
      }
    }
  }

  /**
   * Physics update step: Verlet integration and iterative relaxation
   */
  update(delta: number, elapsedTime: number) {
    const clampedDelta = Math.min(delta, 0.033);
    const subSteps = 6;
    const subDelta = clampedDelta / subSteps;
    const subDeltaSq = subDelta * subDelta;

    this.timeAccumulator += clampedDelta;

    for (let step = 0; step < subSteps; step++) {
      const stepTime = elapsedTime + (step / subSteps) * clampedDelta;

      // 1. Apply gravity & Aerodynamic forces
      this.applyAerodynamics(stepTime);

      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        p.addForce(this.gravity);
        p.integrate(subDeltaSq, this.drag);
      }

      // 2. Solve Distance Constraints (Relaxation iterations)
      const iterations = 8;
      const diff = new THREE.Vector3();

      for (let iter = 0; iter < iterations; iter++) {
        for (let c = 0; c < this.constraints.length; c++) {
          const { p1, p2, distance, stiffness } = this.constraints[c];

          diff.copy(p2.position).sub(p1.position);
          const currentDist = diff.length();
          if (currentDist === 0) continue;

          const correctionFactor = ((currentDist - distance) / currentDist) * 0.5 * stiffness;
          diff.multiplyScalar(correctionFactor);

          if (!p1.pinned && !p2.pinned) {
            p1.position.add(diff);
            p2.position.sub(diff);
          } else if (!p1.pinned) {
            p1.position.addScaledVector(diff, 2.0);
          } else if (!p2.pinned) {
            p2.position.addScaledVector(diff, -2.0);
          }
        }
      }
    }

    // 3. Update Render Geometry
    this.updateGeometry();
  }

  private updateGeometry() {
    const posAttr = this.geometry.getAttribute('position') as THREE.BufferAttribute;
    const positions = posAttr.array as Float32Array;

    let pIdx = 0;
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      positions[pIdx] = p.position.x;
      positions[pIdx + 1] = p.position.y;
      positions[pIdx + 2] = p.position.z;
      pIdx += 3;
    }

    posAttr.needsUpdate = true;
    this.geometry.computeVertexNormals();
  }
}
