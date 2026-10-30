import confetti from 'canvas-confetti';
import { audioEngine } from './audio';

export class DossierManager {
  private modalOverlay: HTMLElement;
  private btnClose: HTMLButtonElement;
  private btnPrint: HTMLButtonElement;
  private btnCelebrate: HTMLButtonElement;

  constructor() {
    this.modalOverlay = document.getElementById('dossierModal') as HTMLElement;
    this.btnClose = document.getElementById('btnCloseDossier') as HTMLButtonElement;
    this.btnPrint = document.getElementById('btnPrintDossier') as HTMLButtonElement;
    this.btnCelebrate = document.getElementById('btnCelebrateCalib') as HTMLButtonElement;

    this.initEvents();
  }

  private initEvents() {
    this.btnClose.addEventListener('click', () => this.close());
    this.modalOverlay.addEventListener('click', (e) => {
      if (e.target === this.modalOverlay) {
        this.close();
      }
    });

    this.btnPrint.addEventListener('click', () => {
      audioEngine.playUIClick(true);
      window.print();
    });

    this.btnCelebrate.addEventListener('click', () => {
      this.triggerCertificationCelebration();
    });
  }

  public open(currentTorque: string, chassisMaterial: string) {
    audioEngine.playUIClick(true);
    const rptMaxTorque = document.getElementById('rptMaxTorque');
    const rptChassisMat = document.getElementById('rptChassisMat');

    if (rptMaxTorque) rptMaxTorque.textContent = `${currentTorque} N`;
    if (rptChassisMat) rptChassisMat.textContent = chassisMaterial;

    this.modalOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  public close() {
    audioEngine.playUIClick();
    this.modalOverlay.classList.add('hidden');
    document.body.style.overflow = '';
  }

  public triggerCertificationCelebration() {
    audioEngine.playLatchSound();
    audioEngine.playNeuralBurst();

    // High tech confetti burst with neon green and cyan palette
    confetti({
      particleCount: 85,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#84cc16', '#00f0ff', '#facc15', '#38bdf8', '#ffffff']
    });

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#84cc16', '#00f0ff']
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#84cc16', '#a855f7']
      });
    }, 250);
  }
}
