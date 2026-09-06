/**
 * Kaun Banega College Pati — Audio Manager
 *
 * Synthesized placeholder sounds using the Web Audio API.
 * No external audio files needed — all sounds are generated via oscillators
 * and gain envelopes to create game-show-style stings.
 *
 * Audio context MUST be unlocked by a user gesture (the "LET'S START" button
 * on the welcome screen) before any sound can play. This is a browser requirement.
 *
 * To replace with real audio files later:
 * 1. Add .mp3/.wav files to /public/audio/
 * 2. Modify each play method to use AudioBufferSourceNode instead of oscillators
 */

type SoundType =
  | 'intro'
  | 'questionReveal'
  | 'timerTick'
  | 'timerWarning'
  | 'optionSelect'
  | 'lock'
  | 'finalAnswer'
  | 'correct'
  | 'wrong'
  | 'lifelineUse'
  | 'pollReveal'
  | 'hotlineConnect'
  | 'finale'
  | 'nextQuestion';

class AudioManager {
  private static instance: AudioManager;
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private unlocked: boolean = false;
  private customUrls: Record<string, string> = {};

  private constructor() {}

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  updateCustomUrls(urls: Record<string, string>) {
    this.customUrls = urls;
  }

  /** Call this on the first user gesture (LET'S START button) */
  unlock() {
    if (this.ctx) return;
    this.ctx = new AudioContext();
    this.unlocked = true;
    // Play a silent buffer to fully unlock on iOS/Safari
    const buffer = this.ctx.createBuffer(1, 1, 22050);
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.ctx.destination);
    source.start(0);
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  isUnlocked() {
    return this.unlocked;
  }

  playCustom(sound: string, url: string) {
    if (!this.enabled || !this.ctx || !this.unlocked) return;
    const audio = new Audio(url);
    audio.play().catch(e => console.error("Error playing custom audio:", e));
  }

  play(sound: SoundType) {
    if (!this.enabled || !this.ctx || !this.unlocked) return;

    // Play custom URL if provided
    if (this.customUrls[sound]) {
      const audio = new Audio(this.customUrls[sound]);
      audio.play().catch(e => console.error("Error playing custom audio:", e));
      return;
    }

    switch (sound) {
      case 'intro':
        this.playIntro();
        break;
      case 'questionReveal':
        this.playQuestionReveal();
        break;
      case 'timerTick':
        this.playTimerTick();
        break;
      case 'timerWarning':
        this.playTimerWarning();
        break;
      case 'optionSelect':
        this.playOptionSelect();
        break;
      case 'lock':
        this.playLock();
        break;
      case 'finalAnswer':
        this.playFinalAnswer();
        break;
      case 'correct':
        this.playCorrect();
        break;
      case 'wrong':
        this.playWrong();
        break;
      case 'lifelineUse':
        this.playLifelineUse();
        break;
      case 'pollReveal':
        this.playPollReveal();
        break;
      case 'hotlineConnect':
        this.playHotlineConnect();
        break;
      case 'finale':
        this.playFinale();
        break;
      case 'nextQuestion':
        this.playNextQuestion();
        break;
    }
  }

  // ── Synthesized Sound Effects ────────────────────────────────────────────

  private createOsc(type: OscillatorType, freq: number, duration: number, gain: number = 0.3): void {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(gain, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(g);
    g.connect(this.ctx.destination);
    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + duration);
  }

  private playNote(freq: number, startTime: number, duration: number, type: OscillatorType = 'sine', gain: number = 0.2): void {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, startTime);
    g.gain.linearRampToValueAtTime(gain, startTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.connect(g);
    g.connect(this.ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  private playIntro() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // Dramatic ascending arpeggio
    [261.63, 329.63, 392.00, 523.25, 659.25].forEach((freq, i) => {
      this.playNote(freq, t + i * 0.15, 0.4, 'triangle', 0.25);
    });
    // Final chord
    this.playNote(523.25, t + 0.75, 1.0, 'sine', 0.15);
    this.playNote(659.25, t + 0.75, 1.0, 'sine', 0.12);
    this.playNote(783.99, t + 0.75, 1.0, 'sine', 0.10);
  }

  private playQuestionReveal() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.playNote(440, t, 0.15, 'triangle', 0.2);
    this.playNote(554.37, t + 0.1, 0.15, 'triangle', 0.2);
    this.playNote(659.25, t + 0.2, 0.3, 'triangle', 0.25);
  }

  private playTimerTick() {
    this.createOsc('sine', 880, 0.08, 0.15);
  }

  private playTimerWarning() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.playNote(880, t, 0.12, 'square', 0.15);
    this.playNote(880, t + 0.15, 0.12, 'square', 0.15);
  }

  private playOptionSelect() {
    this.createOsc('sine', 523.25, 0.12, 0.2);
  }

  private playLock() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.playNote(392, t, 0.2, 'triangle', 0.25);
    this.playNote(523.25, t + 0.15, 0.3, 'triangle', 0.3);
  }

  private playFinalAnswer() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // Dramatic descending tone
    this.playNote(659.25, t, 0.3, 'sine', 0.2);
    this.playNote(554.37, t + 0.25, 0.3, 'sine', 0.2);
    this.playNote(440, t + 0.5, 0.6, 'sine', 0.25);
  }

  private playCorrect() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // Triumphant ascending fanfare
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      this.playNote(freq, t + i * 0.12, 0.3, 'triangle', 0.2);
    });
    // Sustained chord
    this.playNote(783.99, t + 0.5, 0.8, 'sine', 0.15);
    this.playNote(1046.50, t + 0.5, 0.8, 'sine', 0.12);
  }

  private playWrong() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // Descending minor tones
    this.playNote(440, t, 0.3, 'sawtooth', 0.15);
    this.playNote(370, t + 0.25, 0.3, 'sawtooth', 0.15);
    this.playNote(311.13, t + 0.5, 0.5, 'sawtooth', 0.12);
  }

  private playLifelineUse() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.playNote(392, t, 0.15, 'sine', 0.2);
    this.playNote(523.25, t + 0.12, 0.15, 'sine', 0.2);
    this.playNote(659.25, t + 0.24, 0.25, 'sine', 0.25);
  }

  private playPollReveal() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    [261.63, 329.63, 392, 440].forEach((freq, i) => {
      this.playNote(freq, t + i * 0.08, 0.2, 'sine', 0.15);
    });
  }

  private playHotlineConnect() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // Phone ring effect
    for (let i = 0; i < 3; i++) {
      this.playNote(440, t + i * 0.4, 0.15, 'sine', 0.2);
      this.playNote(480, t + i * 0.4, 0.15, 'sine', 0.15);
    }
  }

  private playFinale() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // Grand celebratory fanfare — the richest sound cue in the app
    const notes = [
      [523.25, 0, 0.3], [659.25, 0.15, 0.3], [783.99, 0.3, 0.3],
      [1046.50, 0.5, 0.5], [1318.51, 0.7, 0.5],
      [1046.50, 1.0, 0.8], [1318.51, 1.0, 0.8], [1567.98, 1.0, 0.8],
    ] as const;
    notes.forEach(([freq, offset, dur]) => {
      this.playNote(freq, t + offset, dur, 'triangle', 0.2);
    });
    // Shimmer
    for (let i = 0; i < 5; i++) {
      this.playNote(2093 + i * 200, t + 1.2 + i * 0.08, 0.3, 'sine', 0.05);
    }
  }

  private playNextQuestion() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.playNote(440, t, 0.15, 'triangle', 0.15);
    this.playNote(523.25, t + 0.1, 0.2, 'triangle', 0.18);
  }
}

// Singleton instance
export const audioManager = AudioManager.getInstance();
