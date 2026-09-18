// 2.5D Shallow Water Wave Equation Physics Engine
// Solves: d²h/dt² = c² ∇²h - damping * dh/dt
// Features: Dual-buffer wave propagation, surface normal field, caustic light ray tracing, dynamic disturbance

import { WaterPhysicsConfig } from '../types';

export class WaterSimulation {
  public readonly size: number;
  private currentBuffer: Float32Array;
  private previousBuffer: Float32Array;
  private velocityBuffer: Float32Array;
  private normalBuffer: Float32Array;   // 3 components per cell (nx, ny, nz)
  private causticsBuffer: Float32Array; // Light concentration intensity on the pool bed

  // Foam tracking
  private foamBuffer: Float32Array;

  // Wave generator
  public waveGeneratorActive: boolean = false;
  public waveGeneratorFrequency: number = 2.5; // Hz
  public waveGeneratorAmplitude: number = 0.6;
  public waveGeneratorX: number = 0.5;
  public waveGeneratorY: number = 0.5;

  private timeSec: number = 0;

  constructor(size: number = 140) {
    this.size = size;
    const count = size * size;
    this.currentBuffer = new Float32Array(count);
    this.previousBuffer = new Float32Array(count);
    this.velocityBuffer = new Float32Array(count);
    this.normalBuffer = new Float32Array(count * 3);
    this.causticsBuffer = new Float32Array(count);
    this.foamBuffer = new Float32Array(count);

    // Initialize default flat surface normals pointing upwards (0, 1, 0)
    for (let i = 0; i < count; i++) {
      this.normalBuffer[i * 3 + 0] = 0;
      this.normalBuffer[i * 3 + 1] = 1;
      this.normalBuffer[i * 3 + 2] = 0;
      this.causticsBuffer[i] = 1.0;
    }
  }

  public reset() {
    this.currentBuffer.fill(0);
    this.previousBuffer.fill(0);
    this.velocityBuffer.fill(0);
    this.foamBuffer.fill(0);
    this.causticsBuffer.fill(1.0);
    const count = this.size * this.size;
    for (let i = 0; i < count; i++) {
      this.normalBuffer[i * 3 + 0] = 0;
      this.normalBuffer[i * 3 + 1] = 1;
      this.normalBuffer[i * 3 + 2] = 0;
    }
  }

  // Add disturbance (splash, raindrop, wake)
  public addDisturbance(normX: number, normY: number, radiusNorm: number, strength: number) {
    const cx = Math.floor(normX * this.size);
    const cy = Math.floor(normY * this.size);
    const r = Math.max(1, Math.floor(radiusNorm * this.size));
    const r2 = r * r;

    const x0 = Math.max(1, cx - r);
    const x1 = Math.min(this.size - 2, cx + r);
    const y0 = Math.max(1, cy - r);
    const y1 = Math.min(this.size - 2, cy + r);

    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const dx = x - cx;
        const dy = y - cy;
        const dist2 = dx * dx + dy * dy;
        if (dist2 <= r2) {
          // Cosine bell shape distribution
          const factor = Math.cos((Math.sqrt(dist2) / r) * (Math.PI * 0.5));
          const idx = y * this.size + x;
          this.currentBuffer[idx] += strength * factor;

          // Generate foam on high impact
          if (Math.abs(strength) > 0.4) {
            this.foamBuffer[idx] = Math.min(1.0, this.foamBuffer[idx] + Math.abs(strength) * 0.8);
          }
        }
      }
    }
  }

  // Tsunami / shockwave across a line or radial burst
  public addTsunami() {
    const center = Math.floor(this.size / 2);
    this.addDisturbance(0.5, 0.5, 0.16, 2.8);
    // Secondary ring
    setTimeout(() => {
      this.addDisturbance(0.5, 0.5, 0.22, -1.4);
    }, 40);
  }

  // Step the wave equation simulation
  public step(dt: number, config: WaterPhysicsConfig) {
    this.timeSec += dt;
    const S = this.size;
    const curr = this.currentBuffer;
    const prev = this.previousBuffer;
    const vel = this.velocityBuffer;
    const foam = this.foamBuffer;

    // Active continuous wave oscillator
    if (this.waveGeneratorActive) {
      const oscVal = Math.sin(this.timeSec * this.waveGeneratorFrequency * Math.PI * 2) * this.waveGeneratorAmplitude;
      this.addDisturbance(this.waveGeneratorX, this.waveGeneratorY, 0.03, oscVal * 0.25);
    }

    const c2 = Math.min(0.48, config.waveSpeed * 0.15); // Courant stability criterion
    const damping = Math.max(0.92, Math.min(0.998, config.damping));
    const tension = config.surfaceTension * 0.1;

    // 1. Solve 2D wave finite-difference equation
    for (let y = 1; y < S - 1; y++) {
      const rowOffset = y * S;
      const topOffset = (y - 1) * S;
      const bottomOffset = (y + 1) * S;

      for (let x = 1; x < S - 1; x++) {
        const i = rowOffset + x;

        // 5-point discrete Laplace operator (4-neighborhood)
        const left = curr[i - 1];
        const right = curr[i + 1];
        const top = curr[topOffset + x];
        const bottom = curr[bottomOffset + x];

        // Diagonal neighbors for surface tension smoothing
        const tl = curr[topOffset + x - 1];
        const tr = curr[topOffset + x + 1];
        const bl = curr[bottomOffset + x - 1];
        const br = curr[bottomOffset + x + 1];

        const laplacian = (left + right + top + bottom - 4 * curr[i]);
        const laplacianDiag = (tl + tr + bl + br - 4 * curr[i]) * 0.25;

        // Wave acceleration: a = c² ∇²h
        const accel = c2 * (laplacian + tension * laplacianDiag);

        // Verlet integration with damping
        let newHeight = (2 * curr[i] - prev[i] + accel) * damping;

        // Store next height in prev temporarily
        prev[i] = newHeight;

        // Compute velocity for telemetry and buoyant object interaction
        vel[i] = (newHeight - curr[i]);

        // Foam dissipation
        foam[i] *= 0.985;
      }
    }

    // Swap buffers
    this.currentBuffer = prev;
    this.previousBuffer = curr;

    // 2. Compute Surface Normals & Caustics
    this.computeNormalsAndCaustics(config);
  }

  // Central difference surface normals & refracted caustics on pool floor
  private computeNormalsAndCaustics(config: WaterPhysicsConfig) {
    const S = this.size;
    const h = this.currentBuffer;
    const norms = this.normalBuffer;
    const caustics = this.causticsBuffer;
    const foam = this.foamBuffer;

    // Reset caustics to ambient level
    caustics.fill(0.35);

    // Light ray refraction factor
    const depth = config.depth || 1.8;
    const ior = config.refractionIndex || 1.333;
    const eta = 1.0 / ior; // Air to water ratio

    for (let y = 1; y < S - 1; y++) {
      const row = y * S;
      for (let x = 1; x < S - 1; x++) {
        const i = row + x;
        const normIdx = i * 3;

        // Central differences: dh/dx and dh/dy
        const dhdx = (h[i + 1] - h[i - 1]) * 1.8;
        const dhdy = (h[row + S + x] - h[row - S + x]) * 1.8;

        // Un-normalized normal: (-dh/dx, 1.0, -dh/dy)
        let nx = -dhdx;
        let ny = 1.0;
        let nz = -dhdy;
        const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1.0;
        nx /= len;
        ny /= len;
        nz /= len;

        norms[normIdx + 0] = nx;
        norms[normIdx + 1] = ny;
        norms[normIdx + 2] = nz;

        // Steep wave crest foam generation
        const slope = Math.sqrt(dhdx * dhdx + dhdy * dhdy);
        if (slope > config.foamThreshold) {
          foam[i] = Math.min(1.0, foam[i] + (slope - config.foamThreshold) * 1.5);
        }

        // Caustics computation via Snell's Law ray displacement:
        // Ray starts at (x, y) on surface pointing straight down (0, -1, 0)
        // Refracted ray direction: R = eta*I + (eta*cosI - cosT)*N
        // For I = (0, -1, 0), cosI = N.y, cosT = sqrt(1 - eta²*(1 - cosI²))
        const cosI = ny;
        const sinT2 = eta * eta * (1.0 - cosI * cosI);
        if (sinT2 <= 1.0) {
          const cosT = Math.sqrt(1.0 - sinT2);
          const rx = -eta * nx * (cosI - cosT);
          const rz = -eta * nz * (cosI - cosT);

          // Floor target coordinate where light ray focuses
          const fx = Math.floor(x + rx * depth * S * 0.4);
          const fy = Math.floor(y + rz * depth * S * 0.4);

          if (fx >= 0 && fx < S && fy >= 0 && fy < S) {
            const floorIdx = fy * S + fx;
            caustics[floorIdx] = Math.min(3.5, caustics[floorIdx] + 0.35);
          }
        }
      }
    }
  }

  // Read height at continuous normalized coordinates [0, 1]
  public getHeightAt(normX: number, normY: number): number {
    const x = Math.max(0, Math.min(this.size - 1, normX * (this.size - 1)));
    const y = Math.max(0, Math.min(this.size - 1, normY * (this.size - 1)));

    const x0 = Math.floor(x);
    const x1 = Math.min(this.size - 1, x0 + 1);
    const y0 = Math.floor(y);
    const y1 = Math.min(this.size - 1, y0 + 1);

    const fx = x - x0;
    const fy = y - y0;

    const S = this.size;
    const h00 = this.currentBuffer[y0 * S + x0];
    const h10 = this.currentBuffer[y0 * S + x1];
    const h01 = this.currentBuffer[y1 * S + x0];
    const h11 = this.currentBuffer[y1 * S + x1];

    // Bilinear interpolation
    const hTop = h00 * (1 - fx) + h10 * fx;
    const hBottom = h01 * (1 - fx) + h11 * fx;
    return hTop * (1 - fy) + hBottom * fy;
  }

  // Read surface normal at normalized coordinates [0, 1]
  public getNormalAt(normX: number, normY: number): [number, number, number] {
    const x = Math.floor(Math.max(1, Math.min(this.size - 2, normX * (this.size - 1))));
    const y = Math.floor(Math.max(1, Math.min(this.size - 2, normY * (this.size - 1))));
    const idx = (y * this.size + x) * 3;
    return [
      this.normalBuffer[idx + 0],
      this.normalBuffer[idx + 1],
      this.normalBuffer[idx + 2]
    ];
  }

  // Get current wave telemetry
  public getTelemetry() {
    let sumH2 = 0;
    let maxH = 0;
    let sumV2 = 0;
    const count = this.size * this.size;

    for (let i = 0; i < count; i++) {
      const h = this.currentBuffer[i];
      const v = this.velocityBuffer[i];
      const absH = Math.abs(h);
      if (absH > maxH) maxH = absH;
      sumH2 += h * h;
      sumV2 += v * v;
    }

    const rms = Math.sqrt(sumH2 / count);
    const energy = (sumH2 + sumV2 * 2.0) * 10.0;

    return {
      peakHeightCm: Math.round(maxH * 15 * 10) / 10,
      rmsHeightCm: Math.round(rms * 15 * 10) / 10,
      waveEnergyJoules: Math.round(energy * 10) / 10
    };
  }

  // Accessors for renderer
  public getHeightBuffer(): Float32Array { return this.currentBuffer; }
  public getNormalBuffer(): Float32Array { return this.normalBuffer; }
  public getCausticsBuffer(): Float32Array { return this.causticsBuffer; }
  public getFoamBuffer(): Float32Array { return this.foamBuffer; }
}
