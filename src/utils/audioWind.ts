/**
 * High-fidelity procedural Web Audio synthesizer for ambient wind and flapping cloth sound.
 * Zero external asset dependencies.
 */
export class WindAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isRunning: boolean = false;
  private masterGain: GainNode | null = null;
  private windGain: GainNode | null = null;
  private flutterGain: GainNode | null = null;
  private windFilter: BiquadFilterNode | null = null;
  private flutterFilter: BiquadFilterNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private noiseSource: AudioBufferSourceNode | null = null;
  private lfoOsc: OscillatorNode | null = null;

  private initContext() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioCtx();

    // Master Output
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // Create 5-second Pink/Brownian Noise buffer
    const bufferSize = this.ctx.sampleRate * 5;
    this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = this.noiseBuffer.getChannelData(0);
    
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    // 1. Ambient Wind Layer (Low-pass filtered brownian noise)
    this.windFilter = this.ctx.createBiquadFilter();
    this.windFilter.type = 'lowpass';
    this.windFilter.frequency.setValueAtTime(260, this.ctx.currentTime);
    this.windFilter.Q.setValueAtTime(1.8, this.ctx.currentTime);

    this.windGain = this.ctx.createGain();
    this.windGain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    this.windGain.connect(this.windFilter);
    this.windFilter.connect(this.masterGain);

    // 2. Cloth Fluttering Layer (Band-pass filtered modulated noise)
    this.flutterFilter = this.ctx.createBiquadFilter();
    this.flutterFilter.type = 'bandpass';
    this.flutterFilter.frequency.setValueAtTime(480, this.ctx.currentTime);
    this.flutterFilter.Q.setValueAtTime(3.2, this.ctx.currentTime);

    this.flutterGain = this.ctx.createGain();
    this.flutterGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    this.flutterGain.connect(this.flutterFilter);
    this.flutterFilter.connect(this.masterGain);

    // LFO to modulate flutter intensity in sync with wind gusts
    this.lfoOsc = this.ctx.createOscillator();
    this.lfoOsc.type = 'sine';
    this.lfoOsc.frequency.setValueAtTime(4.2, this.ctx.currentTime); // 4.2 Hz flapping oscillation

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(180, this.ctx.currentTime);
    this.lfoOsc.connect(lfoGain);
    lfoGain.connect(this.flutterFilter.frequency);
    this.lfoOsc.start();
  }

  start() {
    this.initContext();
    if (!this.ctx || !this.noiseBuffer || !this.masterGain) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.noiseSource) {
      try { this.noiseSource.stop(); } catch {}
    }

    this.noiseSource = this.ctx.createBufferSource();
    this.noiseSource.buffer = this.noiseBuffer;
    this.noiseSource.loop = true;

    if (this.windGain && this.flutterGain) {
      this.noiseSource.connect(this.windGain);
      this.noiseSource.connect(this.flutterGain);
    }

    this.noiseSource.start();
    this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.masterGain.gain.setTargetAtTime(0.35, this.ctx.currentTime, 0.5);
    this.isRunning = true;
  }

  stop() {
    if (!this.ctx || !this.masterGain) return;
    this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.masterGain.gain.setTargetAtTime(0.0, this.ctx.currentTime, 0.4);
    setTimeout(() => {
      if (this.noiseSource) {
        try { this.noiseSource.stop(); } catch {}
        this.noiseSource = null;
      }
      this.isRunning = false;
    }, 450);
  }

  toggle(enabled?: boolean): boolean {
    const nextState = enabled !== undefined ? enabled : !this.isRunning;
    if (nextState) {
      this.start();
    } else {
      this.stop();
    }
    return this.isRunning;
  }

  setWindIntensity(speedNormalized: number) { // 0 to 1
    if (!this.ctx || !this.windFilter || !this.flutterFilter || !this.lfoOsc) return;

    const baseFreq = 180 + speedNormalized * 350;
    const flutterFreq = 350 + speedNormalized * 600;
    const lfoRate = 2.5 + speedNormalized * 6.0;

    this.windFilter.frequency.setTargetAtTime(baseFreq, this.ctx.currentTime, 0.1);
    this.flutterFilter.frequency.setTargetAtTime(flutterFreq, this.ctx.currentTime, 0.1);
    this.lfoOsc.frequency.setTargetAtTime(lfoRate, this.ctx.currentTime, 0.1);
  }

  isActive(): boolean {
    return this.isRunning;
  }
}

export const flagWindAudio = new WindAudioSynthesizer();
