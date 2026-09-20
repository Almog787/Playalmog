/**
 * Procedural Web Audio synthesizer for Israeli / Mediterranean urban ambiance
 * Generates ambient city warmth, distant train chimes, and Mediterranean breeze.
 */
export class IsraeliAmbianceAudio {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying = false;
  private noiseNode: AudioNode | null = null;
  private intervalId: number | null = null;

  public init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioCtx();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
  }

  public toggle(enabled: boolean) {
    if (!this.ctx) this.init();
    if (!this.ctx || !this.masterGain) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (enabled && !this.isPlaying) {
      this.startAmbiance();
      this.isPlaying = true;
    } else if (!enabled && this.isPlaying) {
      this.stopAmbiance();
      this.isPlaying = false;
    }
  }

  private startAmbiance() {
    if (!this.ctx || !this.masterGain) return;

    // 1. Pink Noise / Mediterranean warm breeze filter
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.02;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to warm city rumble
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.2, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    whiteNoise.start();
    this.noiseNode = whiteNoise;

    // 2. Periodic Light Rail Chime (צליל פעמון רכבת קלה תל-אביב)
    this.intervalId = window.setInterval(() => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;
      this.playTrainChime();
    }, 14000);
  }

  public playTrainChime() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // Two-tone chord (E5 & G5)
    const tones = [659.25, 783.99];
    tones.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.18);

      gain.gain.setValueAtTime(0, now + idx * 0.18);
      gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.18 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.18 + 1.2);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now + idx * 0.18);
      osc.stop(now + idx * 0.18 + 1.3);
    });
  }

  private stopAmbiance() {
    if (this.noiseNode) {
      try {
        (this.noiseNode as AudioBufferSourceNode).stop();
        this.noiseNode.disconnect();
      } catch {
        // ignore
      }
      this.noiseNode = null;
    }
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public setVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime);
    }
  }

  public getPlaying(): boolean {
    return this.isPlaying;
  }
}

export const ambianceAudio = new IsraeliAmbianceAudio();
