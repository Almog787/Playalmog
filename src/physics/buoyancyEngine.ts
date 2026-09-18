// Archimedes Principle Rigid Body Buoyancy Engine
// Simulates floating, bobbing, pitch/roll wave alignment, and hydrodynamic wake disturbances

import { BuoyantObject, FloatingObjectType, WaterPhysicsConfig } from '../types';
import { WaterSimulation } from './waterSimulation';
import { waterAudio } from '../utils/waterAudio';

export class BuoyancyEngine {
  public objects: BuoyantObject[] = [];

  constructor() {
    this.spawnDefaultObjects();
  }

  public spawnDefaultObjects() {
    this.objects = [
      {
        id: 'duck-1',
        type: 'duck',
        x: 0.1,
        y: 0.05,
        z: 0.0,
        vx: 0,
        vy: 0,
        vz: 0,
        pitch: 0,
        roll: 0,
        radius: 0.06,
        mass: 0.4,
        buoyancyFactor: 1.6,
        color: '#fbbf24'
      },
      {
        id: 'sphere-1',
        type: 'sphere',
        x: -0.25,
        y: 0.1,
        z: -0.2,
        vx: 0,
        vy: 0,
        vz: 0,
        pitch: 0,
        roll: 0,
        radius: 0.07,
        mass: 0.6,
        buoyancyFactor: 1.3,
        color: '#ef4444'
      },
      {
        id: 'lotus-1',
        type: 'lotus',
        x: 0.25,
        y: 0.02,
        z: 0.25,
        vx: 0,
        vy: 0,
        vz: 0,
        pitch: 0,
        roll: 0,
        radius: 0.08,
        mass: 0.2,
        buoyancyFactor: 2.2,
        color: '#ec4899'
      }
    ];
  }

  public spawnObject(type: FloatingObjectType, normX: number = 0, normZ: number = 0) {
    const id = `${type}-${Date.now()}`;
    let radius = 0.06;
    let mass = 0.5;
    let buoyancyFactor = 1.4;
    let color = '#38bdf8';

    switch (type) {
      case 'duck':
        radius = 0.065;
        mass = 0.35;
        buoyancyFactor = 1.7;
        color = '#facc15';
        break;
      case 'sphere':
        radius = 0.07;
        mass = 0.5;
        buoyancyFactor = 1.3;
        color = '#ef4444';
        break;
      case 'wood_block':
        radius = 0.075;
        mass = 0.65;
        buoyancyFactor = 1.25;
        color = '#b45309';
        break;
      case 'buoy':
        radius = 0.08;
        mass = 0.8;
        buoyancyFactor = 1.5;
        color = '#0284c7';
        break;
      case 'lotus':
        radius = 0.085;
        mass = 0.2;
        buoyancyFactor = 2.0;
        color = '#f472b6';
        break;
    }

    const obj: BuoyantObject = {
      id,
      type,
      x: normX,
      y: 0.3, // Drop from above water
      z: normZ,
      vx: (Math.random() - 0.5) * 0.05,
      vy: -0.2,
      vz: (Math.random() - 0.5) * 0.05,
      pitch: 0,
      roll: 0,
      radius,
      mass,
      buoyancyFactor,
      color
    };

    this.objects.push(obj);
    waterAudio.playDrop(0.7);
    return obj;
  }

  public clearObjects() {
    this.objects = [];
  }

  public step(dt: number, water: WaterSimulation, config: WaterPhysicsConfig) {
    const gravity = config.gravity || 9.8;
    const boundaryLimit = 0.42; // Stay inside tank

    for (let i = 0; i < this.objects.length; i++) {
      const obj = this.objects[i];
      if (obj.isDragging) continue;

      // Map 3D coordinate [-0.5, 0.5] to water grid [0, 1]
      const gridX = Math.max(0.01, Math.min(0.99, obj.x + 0.5));
      const gridZ = Math.max(0.01, Math.min(0.99, obj.z + 0.5));

      const waterHeight = water.getHeightAt(gridX, gridZ) * 0.15; // Scaled to world height
      const normal = water.getNormalAt(gridX, gridZ);

      // Submersion calculation
      const bottom = obj.y - obj.radius;
      const top = obj.y + obj.radius;

      let submergedRatio = 0;
      if (top <= waterHeight) {
        submergedRatio = 1.0; // Fully submerged
      } else if (bottom < waterHeight) {
        submergedRatio = (waterHeight - bottom) / (2 * obj.radius); // Partially submerged
      }

      // Forces
      let fy = -obj.mass * gravity * 0.04; // Gravity force

      if (submergedRatio > 0) {
        // Archimedes Buoyancy Force: F_b = rho * V_submerged * g
        const fb = obj.mass * gravity * 0.04 * obj.buoyancyFactor * submergedRatio;
        fy += fb;

        // Fluid drag (damping)
        const dragCoeff = 2.8 * (1.0 + config.viscosity * 5.0);
        obj.vy *= Math.max(0.7, 1.0 - dragCoeff * dt);
        obj.vx *= Math.max(0.85, 1.0 - dragCoeff * 0.6 * dt);
        obj.vz *= Math.max(0.85, 1.0 - dragCoeff * 0.6 * dt);

        // Hydrodynamic wake: moving object pushes water
        const speed = Math.sqrt(obj.vx * obj.vx + obj.vz * obj.vz + obj.vy * obj.vy);
        if (speed > 0.02) {
          water.addDisturbance(gridX, gridZ, obj.radius * 1.5, -obj.vy * 0.4 - speed * 0.2);
        }

        // Object entry splash detection
        if (obj.vy < -0.3 && submergedRatio < 0.3) {
          waterAudio.playSplash(Math.min(1.0, Math.abs(obj.vy) * 2.0));
          water.addDisturbance(gridX, gridZ, obj.radius * 2.5, 0.8);
        }
      }

      // Integrate vertical motion
      obj.vy += (fy / obj.mass) * dt;
      obj.y += obj.vy * dt;

      // Integrate horizontal drift
      obj.x += obj.vx * dt;
      obj.z += obj.vz * dt;

      // Boundary collisions with tank walls
      if (obj.x < -boundaryLimit) {
        obj.x = -boundaryLimit;
        obj.vx = -obj.vx * 0.5;
      } else if (obj.x > boundaryLimit) {
        obj.x = boundaryLimit;
        obj.vx = -obj.vx * 0.5;
      }

      if (obj.z < -boundaryLimit) {
        obj.z = -boundaryLimit;
        obj.vz = -obj.vz * 0.5;
      } else if (obj.z > boundaryLimit) {
        obj.z = boundaryLimit;
        obj.vz = -obj.vz * 0.5;
      }

      // Torquing alignment to water surface normal
      // Target pitch and roll from normal vector (-dh/dx, 1, -dh/dz)
      const targetPitch = Math.atan2(normal[2], normal[1]) * 0.8;
      const targetRoll = Math.atan2(-normal[0], normal[1]) * 0.8;

      obj.pitch += (targetPitch - obj.pitch) * Math.min(1.0, dt * 8.0);
      obj.roll += (targetRoll - obj.roll) * Math.min(1.0, dt * 8.0);
    }
  }
}
