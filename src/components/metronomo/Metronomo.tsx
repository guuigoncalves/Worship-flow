import { useEffect, useMemo, useState } from 'react';
import { Metronomo as MetronomoEngine, type Compasso, type SomMetronomo } from '../../utils/metronomo';

export function Metronomo() {
  const engine = useMemo(() => new MetronomoEngine(), []);
  const [ativo, setAtivo] = useState(false);
  const [bpm, setBpm] = useState(100);
  const [compasso, setCompasso] = useState<Compasso>(4);
  const [beat, setBeat] = useState(0);
  const [som, setSom] = useState<SomMetronomo>('click');

  useEffect(() => engine.onBeat((atual) => setBeat(atual)), [engine]);
  useEffect(() => { engine.setBpm(bpm); }, [bpm, engine]);
  useEffect(() => { engine.setCompasso(compasso); }, [compasso, engine]);
  useEffect(() => { engine.setSom(som); }, [som, engine]);
  useEffect(() => () => engine.parar(), [engine]);

  return (
    <section className={`card p-5 ${ativo && beat === 1 ? 'ring-2 ring-primaria' : ativo ? 'ring-1 ring-acento' : ''}`}>
      <div className="text-center">
        <div className="font-display text-[72px] font-800 leading-none text-primaria">{bpm}</div>
        <p className="text-sm uppercase tracking-[0.18em] text-textoSecundario">BPM</p>
      </div>
      <input className="mt-5 w-full accent-[var(--primaria)]" type="range" min={40} max={220} value={bpm} onChange={(event) => setBpm(Number(event.target.value))} />
      <div className="mt-4 grid grid-cols-5 gap-2">
        <button className="btn-ghost px-2" type="button" onClick={() => setBpm((v) => Math.max(40, v - 1))}>-1</button>
        <button className="btn-ghost px-2" type="button" onClick={() => setBpm((v) => Math.max(40, v - 5))}>-5</button>
        <button className="btn-primary px-2" type="button" onClick={() => { engine.tapTempo(); }}>TAP</button>
        <button className="btn-ghost px-2" type="button" onClick={() => setBpm((v) => Math.min(220, v + 5))}>+5</button>
        <button className="btn-ghost px-2" type="button" onClick={() => setBpm((v) => Math.min(220, v + 1))}>+1</button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {([2, 3, 4, 6] as Compasso[]).map((item) => (
          <button key={item} className={`chip ${compasso === item ? 'chip-active' : ''}`} type="button" onClick={() => setCompasso(item)}>{item === 6 ? '6/8' : `${item}/4`}</button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {(['click', 'clap', 'beep', 'visual'] as SomMetronomo[]).map((item) => (
          <button key={item} className={`chip capitalize ${som === item ? 'chip-active' : ''}`} type="button" onClick={() => setSom(item)}>{item}</button>
        ))}
      </div>
      <button className="btn-primary mt-5 w-full" type="button" onClick={() => { if (ativo) engine.parar(); else engine.iniciar(); setAtivo((v) => !v); }}>
        {ativo ? 'Parar' : 'Iniciar'}
      </button>
    </section>
  );
}
