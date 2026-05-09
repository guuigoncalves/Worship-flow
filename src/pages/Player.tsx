import { Link } from 'react-router-dom';
import { Pause, Play, Repeat, Shuffle, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { usePlayer } from '../hooks/usePlayer';
import { Metronomo } from '../components/metronomo/Metronomo';

function tempo(segundos: number) {
  const min = Math.floor(segundos / 60);
  const sec = Math.floor(segundos % 60).toString().padStart(2, '0');
  return `${min}:${sec}`;
}

export default function Player() {
  const { faixa, tocando, tocar, pausar, progresso, duracao, seek, volume, setVolume, modo, setModo } = usePlayer();
  const atual = faixa ?? { id: 'demo', titulo: 'Player WorshipFlow', artista: 'Selecione ou adicione uma faixa', capaUrl: '' };
  const pct = duracao ? (progresso / duracao) * 100 : 0;
  return (
    <main className="app-page">
      <section className="mx-auto flex min-h-[calc(100vh-140px)] max-w-xl flex-col justify-center">
        <div className="mx-auto grid aspect-square w-full max-w-[360px] place-items-center rounded-[28px] bg-elevada shadow-[0_0_80px_var(--primaria-dim)]">
          {atual.capaUrl ? <img className="h-full w-full rounded-[28px] object-cover" src={atual.capaUrl} alt="" /> : <span className="font-display text-7xl text-primaria">WF</span>}
        </div>
        <div className="mt-8 text-center">
          <h1 className="font-display text-[22px] font-bold">{atual.titulo}</h1>
          <p className="text-sm text-textoSecundario">{atual.artista}</p>
        </div>
        <div className="mt-7">
          <div className="h-2 overflow-hidden rounded-full bg-elevada"><div className="h-full rounded-full bg-primaria" style={{ width: `${pct}%` }} /></div>
          <div className="mt-2 flex justify-between font-mono text-xs text-textoSecundario"><span>{tempo(progresso)}</span><span>{tempo(duracao)}</span></div>
        </div>
        <div className="mt-6 flex items-center justify-center gap-4">
          <button className="btn-ghost h-12 w-12 p-0" type="button" onClick={() => seek(-15)} aria-label="Voltar 15 segundos"><SkipBack /></button>
          <button className="btn-primary h-20 w-20 rounded-full p-0" type="button" onClick={() => (tocando ? pausar() : tocar())} aria-label={tocando ? 'Pausar' : 'Tocar'}>
            {tocando ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
          </button>
          <button className="btn-ghost h-12 w-12 p-0" type="button" onClick={() => seek(15)} aria-label="Avançar 15 segundos"><SkipForward /></button>
        </div>
        <div className="mt-5 grid grid-cols-4 gap-2">
          <button className="btn-ghost px-2" type="button"><Shuffle className="h-4 w-4" />Aleatório</button>
          <button className="btn-ghost px-2" type="button"><Repeat className="h-4 w-4" />Repetir</button>
          <label className="btn-ghost px-2"><Volume2 className="h-4 w-4" /><input className="w-full accent-[var(--primaria)]" type="range" min={0} max={1} step={0.05} value={volume} onChange={(event) => setVolume(Number(event.target.value))} /></label>
          <button className="btn-ghost px-2" type="button">Fila</button>
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {(['normal', 'fundo', 'pad', 'metronomo'] as const).map((item) => <button key={item} className={`chip capitalize ${modo === item ? 'chip-active' : ''}`} type="button" onClick={() => setModo(item)}>{item}</button>)}
        </div>
        {atual.musicaId ? <Link className="btn-text mt-3" to={`/musica/${atual.musicaId}`}>Ver Cifra</Link> : null}
      </section>
      <div className="mx-auto max-w-xl pb-8"><Metronomo /></div>
    </main>
  );
}
