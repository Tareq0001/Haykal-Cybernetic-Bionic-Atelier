/**
 * HAYKAL Web Audio API Micro-Servo Acoustic & Haptic Engine
 * Synthesizes real-time high-pitch servo motor hums, hydraulic pressure releases,
 * and mechanical joint latching without external sound files.
 */

class ServoAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private activeServoOsc: OscillatorNode | null = null;
  private activeServoGain: GainNode | null = null;
  private servoTimeout: number | null = null;

  constructor() {
    // Lazy initialize on first user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.activeServoGain && this.ctx) {
      this.activeServoGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Triggers a continuous or short servo motor actuation whine
   * Intensity: 0.1 to 1.0 based on movement delta
   */
  public playServoSound(intensity: number = 0.5, durationMs: number = 220) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Bandpass filter to emulate small metallic servo gearbox
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.Q.setValueAtTime(3.5, now);

      // Pitch sweep: starting high (1800Hz), dipping, and ramping as servo accelerates
      const baseFreq = 800 + intensity * 600;
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(baseFreq * 1.4, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq, now + 0.05);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.1, now + (durationMs / 1000));

      // Harmonic overtone
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'triangle';
      subOsc.frequency.setValueAtTime(baseFreq * 0.5, now);
      subGain.gain.setValueAtTime(0.04 * intensity, now);

      const maxGain = Math.min(0.08, 0.03 + intensity * 0.05);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(maxGain, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + (durationMs / 1000));

      osc.connect(filter);
      filter.connect(gain);
      subOsc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      subOsc.start(now);
      osc.stop(now + (durationMs / 1000));
      subOsc.stop(now + (durationMs / 1000));
    } catch {
      // AudioContext might be blocked until user gesture
    }
  }

  /**
   * Mechanical latch / lock click when reaching endstops (100% or preset snap)
   */
  public playLatchSound() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.04);

      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // Ignore
    }
  }

  /**
   * UI Click / Cyber confirmation beep
   */
  public playUIClick(highPitch: boolean = false) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const freq = highPitch ? 2200 : 880;
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.03);

      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // Ignore
    }
  }

  /**
   * Induce high-frequency EMG spike burst acoustic pulse
   */
  public playNeuralBurst() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // White noise burst
      const bufferSize = this.ctx.sampleRate * 0.15;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(800, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
    } catch {
      // Ignore
    }
  }
}

export const audioEngine = new ServoAudioEngine();
