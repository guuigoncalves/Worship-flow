export type Compasso = 2 | 3 | 4 | 6;
export type BeatCallback = (beat: number, total: number) => void;
export type SomMetronomo = 'click' | 'clap' | 'beep' | 'visual';

export class Metronomo {
  private ctx: AudioContext | null = null;
  private bpm = 100;
  private compasso: Compasso = 4;
  private ativo = false;
  private beatAtual = 0;
  private nextBeatTime = 0;
  private timer: number | null = null;
  private taps: number[] = [];
  private callbacks = new Set<BeatCallback>();
  private som: SomMetronomo = 'click';
  private lookahead = 25.0;
  private scheduleAhead = 0.1;

  iniciar(): void {
    const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    this.ctx ??= new AudioCtx();
    void this.ctx.resume();
    this.ativo = true;
    this.beatAtual = 0;
    this.nextBeatTime = this.ctx.currentTime + 0.05;
    this.scheduler();
  }

  parar(): void {
    this.ativo = false;
    if (this.timer) window.clearTimeout(this.timer);
    this.timer = null;
  }

  setBpm(bpm: number): void {
    this.bpm = Math.min(220, Math.max(40, bpm));
  }

  setCompasso(n: Compasso): void {
    this.compasso = n;
    this.beatAtual = 0;
  }

  setSom(som: SomMetronomo): void {
    this.som = som;
  }

  tapTempo(): void {
    const agora = performance.now();
    this.taps = [...this.taps, agora].slice(-4);
    if (this.taps.length < 2) return;
    const intervalos = this.taps.slice(1).map((tap, index) => tap - this.taps[index]);
    const media = intervalos.reduce((soma, item) => soma + item, 0) / intervalos.length;
    this.setBpm(Math.round(60000 / media));
  }

  onBeat(cb: BeatCallback): () => void {
    this.callbacks.add(cb);
    return () => this.callbacks.delete(cb);
  }

  private scheduler = () => {
    if (!this.ctx || !this.ativo) return;
    while (this.nextBeatTime < this.ctx.currentTime + this.scheduleAhead) {
      this.scheduleBeat(this.beatAtual, this.nextBeatTime);
      const secondsPerBeat = 60 / this.bpm;
      this.nextBeatTime += secondsPerBeat;
      this.beatAtual = (this.beatAtual + 1) % this.compasso;
    }
    this.timer = window.setTimeout(this.scheduler, this.lookahead);
  };

  private scheduleBeat(beat: number, time: number) {
    const total = this.compasso;
    window.setTimeout(() => this.callbacks.forEach((cb) => cb(beat + 1, total)), Math.max(0, (time - (this.ctx?.currentTime ?? 0)) * 1000));
    if (!this.ctx || this.som === 'visual') return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const accent = beat === 0;
    osc.frequency.value = this.som === 'beep' ? (accent ? 1320 : 880) : (accent ? 1200 : 760);
    osc.type = this.som === 'clap' ? 'square' : 'sine';
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(accent ? 0.55 : 0.3, time + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.055);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(time);
    osc.stop(time + 0.07);
  }
}
