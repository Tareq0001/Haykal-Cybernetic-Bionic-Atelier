import { audioEngine } from './audio';

export interface FingertipForces {
  thumb: number;
  index: number;
  middle: number;
  ring: number;
  pinky: number;
  total: number;
}

export type PowerMode = 'balanced' | 'performance' | 'eco';

export class TelemetryEngine {
  private emgCanvas: HTMLCanvasElement;
  private emgCtx: CanvasRenderingContext2D;

  // EMG stream properties
  private ch1Buffer: number[] = [];
  private ch2Buffer: number[] = [];
  private ch3Buffer: number[] = [];
  private bufferLength = 160;
  private muscleExcitation = 0.15; // 0.0 to 1.0 based on movement
  private burstTimer = 0;

  // Battery properties
  public batteryPercent = 94.2;
  public powerMode: PowerMode = 'balanced';
  public nominalVoltage = 14.8;
  public coreTemp = 29.4;
  public currentDraw = 0.42;

  constructor(emgCanvas: HTMLCanvasElement) {
    this.emgCanvas = emgCanvas;
    const ctx = emgCanvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D context for EMG');
    this.emgCtx = ctx;

    // Fill initial buffers
    for (let i = 0; i < this.bufferLength; i++) {
      this.ch1Buffer.push(0);
      this.ch2Buffer.push(0);
      this.ch3Buffer.push(0);
    }

    this.startEmgLoop();
    this.startBatteryDrainLoop();
  }

  public setMuscleExcitation(level: number) {
    // Smooth level
    this.muscleExcitation = Math.max(0.1, Math.min(1.0, level));
  }

  public triggerSpikeBurst() {
    this.burstTimer = 25; // 25 frames of high voltage burst
    this.muscleExcitation = 1.0;
    audioEngine.playNeuralBurst();
  }

  public setPowerMode(mode: PowerMode) {
    this.powerMode = mode;
    audioEngine.playUIClick();
  }

  /**
   * Calculate fingertip forces from finger flexion (0 - 100)
   */
  public calculateFingertipForces(fingerValues: {
    thumb: number;
    index: number;
    middle: number;
    ring: number;
    pinky: number;
  }): FingertipForces {
    const modeMultiplier = this.powerMode === 'performance' ? 1.4 : this.powerMode === 'eco' ? 0.75 : 1.0;

    // Force non-linear curve: touches contact at >40% flexion and increases up to max Newtons
    const getForce = (val: number, maxN: number) => {
      if (val < 25) return Number((val * 0.04).toFixed(1));
      const factor = (val - 25) / 75;
      return Number((1.0 + Math.pow(factor, 1.8) * maxN * modeMultiplier).toFixed(1));
    };

    const thumb = getForce(fingerValues.thumb, 24);
    const index = getForce(fingerValues.index, 26);
    const middle = getForce(fingerValues.middle, 30);
    const ring = getForce(fingerValues.ring, 20);
    const pinky = getForce(fingerValues.pinky, 14);
    const total = Number((thumb + index + middle + ring + pinky).toFixed(1));

    // Dynamic current draw based on total force
    this.currentDraw = Number((0.25 + (total / 114) * (this.powerMode === 'performance' ? 2.8 : 1.6)).toFixed(2));
    this.coreTemp = Number((28.5 + (total / 114) * 5.2).toFixed(1));

    return { thumb, index, middle, ring, pinky, total };
  }

  private startEmgLoop() {
    const render = () => {
      requestAnimationFrame(render);
      this.updateAndDrawEMG();
    };
    render();
  }

  private updateAndDrawEMG() {
    const ctx = this.emgCtx;
    const w = this.emgCanvas.width;
    const h = this.emgCanvas.height;

    // Check canvas resolution match
    if (this.emgCanvas.clientWidth !== w || this.emgCanvas.clientHeight !== h) {
      this.emgCanvas.width = this.emgCanvas.clientWidth;
      this.emgCanvas.height = this.emgCanvas.clientHeight;
    }

    const currentW = this.emgCanvas.width;
    const currentH = this.emgCanvas.height;

    // Decay burst
    let activeExcitation = this.muscleExcitation;
    if (this.burstTimer > 0) {
      this.burstTimer--;
      activeExcitation = 1.0;
    }

    // Generate simulated biopotential wave points
    const t = performance.now() * 0.01;
    // Ch1: Flexor (dominant during closing)
    const ch1Val =
      (Math.sin(t * 1.8) * 0.4 + Math.cos(t * 4.3) * 0.3 + (Math.random() - 0.5) * 0.8) *
      activeExcitation *
      38;
    // Ch2: Extensor
    const ch2Val =
      (Math.cos(t * 2.2) * 0.4 + Math.sin(t * 5.1) * 0.25 + (Math.random() - 0.5) * 0.7) *
      (1.1 - activeExcitation) *
      32;
    // Ch3: Abductor
    const ch3Val =
      (Math.sin(t * 3.4) * 0.35 + (Math.random() - 0.5) * 0.6) *
      (activeExcitation * 0.8 + 0.2) *
      28;

    this.ch1Buffer.push(ch1Val);
    this.ch1Buffer.shift();
    this.ch2Buffer.push(ch2Val);
    this.ch2Buffer.shift();
    this.ch3Buffer.push(ch3Val);
    this.ch3Buffer.shift();

    // Clear background
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, currentW, currentH);

    // Draw subtle grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let y = 15; y < currentH; y += 22) {
      ctx.moveTo(0, y);
      ctx.lineTo(currentW, y);
    }
    for (let x = 20; x < currentW; x += 35) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, currentH);
    }
    ctx.stroke();

    const drawChannel = (buffer: number[], centerY: number, color: string, glowColor: string) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.8;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 6;
      ctx.beginPath();

      const step = currentW / (this.bufferLength - 1);
      for (let i = 0; i < buffer.length; i++) {
        const x = i * step;
        const y = centerY + buffer[i];
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0; // Reset shadow
    };

    const mid1 = currentH * 0.25;
    const mid2 = currentH * 0.55;
    const mid3 = currentH * 0.82;

    // Draw Ch1 (Neon Lime)
    drawChannel(this.ch1Buffer, mid1, '#84cc16', '#84cc16');
    // Draw Ch2 (Cyber Cyan)
    drawChannel(this.ch2Buffer, mid2, '#06b6d4', '#06b6d4');
    // Draw Ch3 (Violet)
    drawChannel(this.ch3Buffer, mid3, '#a855f7', '#a855f7');
  }

  private startBatteryDrainLoop() {
    setInterval(() => {
      // Extremely realistic slow drain
      const drainRate = (this.currentDraw / 4000) * (this.powerMode === 'performance' ? 1.5 : this.powerMode === 'eco' ? 0.6 : 1.0);
      this.batteryPercent = Math.max(1, Number((this.batteryPercent - drainRate).toFixed(2)));
    }, 2000);
  }

  public getBatteryRuntime(): string {
    const capacityAh = 4.8;
    const currentA = Math.max(0.2, this.currentDraw);
    const hours = (capacityAh * (this.batteryPercent / 100)) / currentA;
    return hours.toFixed(1);
  }
}
