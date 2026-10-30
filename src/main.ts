import './style.css';
import { BionicScene, ChassisFinish, GripPreset } from './three-scene';
import { TelemetryEngine, PowerMode } from './telemetry';
import { DossierManager } from './dossier';
import { audioEngine } from './audio';
import { translations, Language } from './i18n';

class HaykalApp {
  private bionicScene!: BionicScene;
  private telemetryEngine!: TelemetryEngine;
  private dossierManager!: DossierManager;
  private currentLang: Language = 'ar';
  private currentFinish: ChassisFinish = 'carbon';

  constructor() {
    this.init();
  }

  private init() {
    // 1. Initialize 3D Scene
    const viewportContainer = document.getElementById('threeViewportContainer') as HTMLElement;
    const canvas = document.getElementById('threeCanvas') as HTMLCanvasElement;
    this.bionicScene = new BionicScene(viewportContainer, canvas);

    // 2. Initialize Telemetry & EMG
    const emgCanvas = document.getElementById('emgCanvas') as HTMLCanvasElement;
    this.telemetryEngine = new TelemetryEngine(emgCanvas);

    // 3. Initialize Dossier Manager
    this.dossierManager = new DossierManager();

    // 4. Wire Telemetry Callback
    this.bionicScene.registerTelemetryCallback((data) => {
      this.updateHudTelemetry(data.gripAngle, data.totalTorque);
    });

    // 5. Setup UI Event Listeners
    this.setupPresetButtons();
    this.setupSliders();
    this.setupCameraButtons();
    this.setupToolbarButtons();
    this.setupFinishSwatches();
    this.setupPanelTabs();
    this.setupNeuralTuning();
    this.setupPowerControls();
    this.setupHeaderActions();

    // 6. Start Telemetry UI Refresh Loop
    this.startLiveTelemetryLoop();
  }

  private setupPresetButtons() {
    const presetButtons = document.querySelectorAll('.grip-preset-card');
    presetButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        presetButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const presetKey = btn.getAttribute('data-preset') as GripPreset;
        this.bionicScene.applyPreset(presetKey);

        // Update slider values after preset
        setTimeout(() => {
          this.syncSlidersFromScene();
        }, 100);

        // Update neural pattern text
        const patternVal = document.getElementById('patternDetectedVal');
        const titleKey = `preset${presetKey.charAt(0).toUpperCase() + presetKey.slice(1)}` as keyof typeof translations.ar;
        if (patternVal) {
          patternVal.textContent = translations[this.currentLang][titleKey] || presetKey;
        }

        // Increase muscle excitation temporarily
        this.telemetryEngine.setMuscleExcitation(0.85);
        setTimeout(() => {
          this.telemetryEngine.setMuscleExcitation(0.2);
        }, 1200);
      });
    });
  }

  private setupSliders() {
    const fingers: ('thumb' | 'index' | 'middle' | 'ring' | 'pinky')[] = [
      'thumb',
      'index',
      'middle',
      'ring',
      'pinky'
    ];

    fingers.forEach((finger) => {
      const slider = document.getElementById(`slide${finger.charAt(0).toUpperCase() + finger.slice(1)}`) as HTMLInputElement;
      const label = document.getElementById(`val${finger.charAt(0).toUpperCase() + finger.slice(1)}`);

      if (slider) {
        slider.addEventListener('input', () => {
          const val = Number(slider.value);
          if (label) label.textContent = `${val}%`;
          this.bionicScene.setFingerFlexion(finger, val);

          // Acoustic feedback
          audioEngine.playServoSound(val / 100, 100);
          this.telemetryEngine.setMuscleExcitation(val / 100);
        });
      }
    });

    // Wrist Sliders
    const pitchSlider = document.getElementById('slideWristPitch') as HTMLInputElement;
    const pitchVal = document.getElementById('valWristPitch');
    if (pitchSlider) {
      pitchSlider.addEventListener('input', () => {
        const val = Number(pitchSlider.value);
        if (pitchVal) pitchVal.textContent = `${val}°`;
        this.bionicScene.setWristPitch(val);
      });
    }

    const yawSlider = document.getElementById('slideWristYaw') as HTMLInputElement;
    const yawVal = document.getElementById('valWristYaw');
    if (yawSlider) {
      yawSlider.addEventListener('input', () => {
        const val = Number(yawSlider.value);
        if (yawVal) yawVal.textContent = `${val}°`;
        this.bionicScene.setWristYaw(val);
      });
    }

    // Flex All Button
    const btnFlexAll = document.getElementById('btnFlexAll');
    if (btnFlexAll) {
      btnFlexAll.addEventListener('click', () => {
        this.bionicScene.applyPreset('fist');
        this.syncSlidersFromScene();
      });
    }
  }

  private syncSlidersFromScene() {
    const vals = this.bionicScene.fingerValues;
    const update = (id: string, val: number, unit = '%') => {
      const slider = document.getElementById(`slide${id}`) as HTMLInputElement;
      const label = document.getElementById(`val${id}`);
      if (slider) slider.value = String(Math.round(val));
      if (label) label.textContent = `${Math.round(val)}${unit}`;
    };

    update('Thumb', vals.thumb);
    update('Index', vals.index);
    update('Middle', vals.middle);
    update('Ring', vals.ring);
    update('Pinky', vals.pinky);
    update('WristPitch', vals.wristPitch, '°');
    update('WristYaw', vals.wristYaw, '°');
  }

  private setupCameraButtons() {
    const camButtons = document.querySelectorAll('.cam-btn');
    camButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        camButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const cam = btn.getAttribute('data-cam') as 'front' | 'top' | 'side' | 'iso';
        this.bionicScene.setCameraView(cam);
      });
    });
  }

  private setupToolbarButtons() {
    // Auto Rotate
    const btnAutoRotate = document.getElementById('btnAutoRotate');
    if (btnAutoRotate) {
      btnAutoRotate.addEventListener('click', () => {
        const active = this.bionicScene.toggleAutoRotate();
        btnAutoRotate.classList.toggle('active', active);
      });
    }

    // Hologram Wireframe
    const btnWireframe = document.getElementById('btnWireframe');
    if (btnWireframe) {
      btnWireframe.addEventListener('click', () => {
        const active = this.bionicScene.toggleWireframe();
        btnWireframe.classList.toggle('active', active);
      });
    }

    // Explode Chassis
    const btnExplode = document.getElementById('btnExplodeChassis');
    if (btnExplode) {
      btnExplode.addEventListener('click', () => {
        const active = this.bionicScene.toggleExplode();
        btnExplode.classList.toggle('active', active);
      });
    }

    // Reset Pose
    const btnReset = document.getElementById('btnResetPose');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        this.bionicScene.applyPreset('neutral');
        this.syncSlidersFromScene();
      });
    }
  }

  private setupFinishSwatches() {
    const swatches = document.querySelectorAll('.swatch-btn');
    swatches.forEach((btn) => {
      btn.addEventListener('click', () => {
        swatches.forEach((s) => s.classList.remove('active'));
        btn.classList.add('active');

        const finish = btn.getAttribute('data-finish') as ChassisFinish;
        this.currentFinish = finish;
        this.bionicScene.setChassisFinish(finish);
      });
    });
  }

  private setupPanelTabs() {
    const tabs = document.querySelectorAll('.panel-tab-btn');
    const panes = document.querySelectorAll('.tab-pane');

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => t.classList.remove('active'));
        panes.forEach((p) => p.classList.remove('active'));

        tab.classList.add('active');
        const tabKey = tab.getAttribute('data-tab');
        const targetPane = document.getElementById(`pane${tabKey?.charAt(0).toUpperCase()}${tabKey?.slice(1)}`);
        if (targetPane) targetPane.classList.add('active');
        audioEngine.playUIClick();
      });
    });
  }

  private setupNeuralTuning() {
    const btnBurst = document.getElementById('btnEmgBoost');
    if (btnBurst) {
      btnBurst.addEventListener('click', () => {
        this.telemetryEngine.triggerSpikeBurst();
      });
    }

    const slideThreshold = document.getElementById('slideThreshold') as HTMLInputElement;
    const dispThreshold = document.getElementById('dispThreshold');
    if (slideThreshold) {
      slideThreshold.addEventListener('input', () => {
        if (dispThreshold) dispThreshold.textContent = `${slideThreshold.value} µV`;
      });
    }

    const slideFilter = document.getElementById('slideFilter') as HTMLInputElement;
    const dispFilter = document.getElementById('dispFilter');
    if (slideFilter) {
      slideFilter.addEventListener('input', () => {
        if (dispFilter) dispFilter.textContent = `${slideFilter.value}%`;
      });
    }
  }

  private setupPowerControls() {
    const modeBtns = document.querySelectorAll('.p-mode-btn');
    modeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        modeBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const mode = btn.getAttribute('data-pmode') as PowerMode;
        this.telemetryEngine.setPowerMode(mode);
      });
    });
  }

  private setupHeaderActions() {
    // Sound Toggle
    const btnAudio = document.getElementById('btnAudioToggle');
    const iconAudioOn = document.getElementById('iconAudioOn');
    const iconAudioOff = document.getElementById('iconAudioOff');

    if (btnAudio) {
      btnAudio.addEventListener('click', () => {
        const muted = audioEngine.toggleMute();
        iconAudioOn?.classList.toggle('hidden', muted);
        iconAudioOff?.classList.toggle('hidden', !muted);
      });
    }

    // Theme Toggle
    const btnTheme = document.getElementById('btnThemeToggle');
    const iconMoon = document.getElementById('iconMoon');
    const iconSun = document.getElementById('iconSun');

    if (btnTheme) {
      btnTheme.addEventListener('click', () => {
        document.body.classList.toggle('theme-light');
        document.body.classList.toggle('theme-dark');
        const isLight = document.body.classList.contains('theme-light');
        iconMoon?.classList.toggle('hidden', isLight);
        iconSun?.classList.toggle('hidden', !isLight);
        audioEngine.playUIClick();
      });
    }

    // Language Toggle
    const btnLang = document.getElementById('btnLangToggle');
    const langLabel = document.getElementById('langLabel');

    if (btnLang) {
      btnLang.addEventListener('click', () => {
        this.currentLang = this.currentLang === 'ar' ? 'en' : 'ar';
        if (langLabel) langLabel.textContent = this.currentLang === 'ar' ? 'EN' : 'عربي';
        this.applyLanguage(this.currentLang);
        audioEngine.playUIClick(true);
      });
    }

    // Open Dossier Modal
    const btnOpenDossier = document.getElementById('btnOpenDossier');
    if (btnOpenDossier) {
      btnOpenDossier.addEventListener('click', () => {
        const totalTorque = document.getElementById('hudTotalTorque')?.textContent || '3.8 N·m';
        this.dossierManager.open(totalTorque, this.currentFinish.toUpperCase());
      });
    }
  }

  private updateHudTelemetry(gripAngle: number, totalTorque: number) {
    const elAngle = document.getElementById('hudGripAngle');
    const elTorque = document.getElementById('hudTotalTorque');
    if (elAngle) elAngle.textContent = `${gripAngle}°`;
    if (elTorque) elTorque.textContent = `${totalTorque} N·m`;
  }

  private startLiveTelemetryLoop() {
    setInterval(() => {
      // 1. Calculate fingertip pressures
      const forces = this.telemetryEngine.calculateFingertipForces(this.bionicScene.fingerValues);

      const updateGauge = (id: string, force: number, maxForce: number) => {
        const gauge = document.getElementById(`gauge${id}`);
        if (!gauge) return;
        const fill = gauge.querySelector('.gauge-bar-fill') as HTMLElement;
        const valText = gauge.querySelector('.tip-value') as HTMLElement;
        if (fill) {
          const pct = Math.min(100, Math.max(5, (force / maxForce) * 100));
          fill.style.height = `${pct}%`;
        }
        if (valText) valText.textContent = `${force} N`;
      };

      updateGauge('Thumb', forces.thumb, 24);
      updateGauge('Index', forces.index, 26);
      updateGauge('Middle', forces.middle, 30);
      updateGauge('Ring', forces.ring, 20);
      updateGauge('Pinky', forces.pinky, 14);

      const totalForceEl = document.getElementById('valTotalGripForce');
      if (totalForceEl) totalForceEl.textContent = `${forces.total} N`;

      // 2. Battery & Power updates
      const battPillVal = document.getElementById('headerBatteryVal');
      const battPercentText = document.getElementById('batteryPercentText');
      const batteryLiquid = document.getElementById('batteryLiquid');
      const battCurrentVal = document.getElementById('battCurrentVal');
      const battTempVal = document.getElementById('battTempVal');
      const battRuntimeVal = document.getElementById('battRuntimeVal');

      const pctStr = `${Math.round(this.telemetryEngine.batteryPercent)}%`;
      if (battPillVal) battPillVal.textContent = pctStr;
      if (battPercentText) battPercentText.textContent = pctStr;
      if (batteryLiquid) batteryLiquid.style.height = `${this.telemetryEngine.batteryPercent}%`;

      if (battCurrentVal) battCurrentVal.textContent = `${this.telemetryEngine.currentDraw} A`;
      if (battTempVal) battTempVal.textContent = `${this.telemetryEngine.coreTemp} °C`;
      if (battRuntimeVal) battRuntimeVal.textContent = `${this.telemetryEngine.getBatteryRuntime()} h`;

      // 3. EMG stats minor fluctuation
      const valEmgAmp = document.getElementById('valEmgAmp');
      const valEmgFreq = document.getElementById('valEmgFreq');
      if (valEmgAmp) {
        const baseAmp = 60 + forces.total * 2.8;
        valEmgAmp.textContent = `${Math.round(baseAmp + (Math.random() - 0.5) * 8)} µV`;
      }
      if (valEmgFreq) {
        valEmgFreq.textContent = `${Math.round(88 + (Math.random() - 0.5) * 6)} Hz`;
      }
    }, 150);
  }

  private applyLanguage(lang: Language) {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

    const t = translations[lang];
    const elements = document.querySelectorAll('[data-i18n]');

    elements.forEach((el) => {
      const key = el.getAttribute('data-i18n') as keyof typeof t;
      if (key && t[key]) {
        el.textContent = t[key];
      }
    });
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  new HaykalApp();
});
