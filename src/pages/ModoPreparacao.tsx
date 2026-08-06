import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Music2, Save, PenLine, Play, Pause } from 'lucide-react';
import { useEspacos, useEspacoDetalhe } from '../hooks/useEspacos';
import { ExibicaoCifra } from '../components/apresentacao/ExibicaoCifra';
import { useRolagemAutomatica } from '../components/apresentacao/RolagemAutomatica';
import { EstadoVazio } from '../components/compartilhado/EstadoVazio';
import { transporLetra } from '../utils/transposicao';
import type { Tom } from '../types';

const tamanhos = ['pequeno', 'medio', 'grande', 'extra'] as const;
type Tamanho = typeof tamanhos[number];
type VelocidadeRolagem = 'lenta' | 'media' | 'rapida';

export default function ModoPreparacao() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { espacos } = useEspacos();
  const { musicas, loading, observacoesEnsaio, salvarObservacaoEnsaio } = useEspacoDetalhe(id);
  const [indice, setIndice] = useState(0);
  const [tom, setTom] = useState<Tom>('C');
  const [tamanho, setTamanho] = useState<Tamanho>('grande');
  const [autoScroll, setAutoScroll] = useState(true);
  const [velocidade, setVelocidade] = useState<VelocidadeRolagem>('media');
  const [bpm, setBpm] = useState(100);
  const [batida, setBatida] = useState(0);
  const [metronomeAtivo, setMetronomeAtivo] = useState(false);
  const [nota, setNota] = useState('');
  const [salvandoNota, setSalvandoNota] = useState(false);

  const espaco = espacos.find((item) => item.id === id);
  const scrollRef = useRolagemAutomatica(autoScroll, velocidade);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (musicas[indice]) {
      setTom(musicas[indice].tom);
      setNota(observacoesEnsaio[musicas[indice].id] ?? '');
    }
  }, [indice, musicas, observacoesEnsaio]);

  const musicaAtual = musicas[indice];
  const letraTransposta = useMemo(() => {
    if (!musicaAtual) return '';
    return transporLetra(musicaAtual.letra, musicaAtual.tom, tom);
  }, [musicaAtual, tom]);

  async function handleSalvarNota() {
    if (!musicaAtual) return;
    setSalvandoNota(true);
    await salvarObservacaoEnsaio(musicaAtual.id, nota);
    setSalvandoNota(false);
  }

  function avancar() {
    setIndice((atual) => Math.min(musicas.length - 1, atual + 1));
  }

  function voltar() {
    setIndice((atual) => Math.max(0, atual - 1));
  }

  if (loading) {
    return (
      <main className="app-page flex items-center justify-center min-h-[60vh]" style={{ backgroundColor: '#0B0C10' }}>
        <div className="w-8 h-8 border-2 border-[var(--primaria)] border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (!musicaAtual || musicas.length === 0) {
    return (
      <main className="app-page space-y-6 fade-in" style={{ backgroundColor: '#0B0C10' }}>
        <div className="flex items-center gap-3">
          <button className="btn-ghost text-xs" type="button" onClick={() => navigate(`/espaco/${id}`)}>
            <ArrowLeft size={16} />
            <span>Voltar</span>
          </button>
          <h1 className="text-2xl font-bold text-gradient">Modo de Preparação</h1>
        </div>
        <EstadoVazio titulo="Repertório vazio" texto="Adicione músicas ao espaço para iniciar o modo de preparação." />
      </main>
    );
  }

  return (
    <main className="app-page fade-in" style={{ backgroundColor: '#0B0C10' }}>
      <div className="flex items-center justify-between gap-3 pb-4">
        <div className="flex items-center gap-3">
          <button className="btn-ghost text-xs" type="button" onClick={() => navigate(`/espaco/${id}`)}>
            <ArrowLeft size={16} />
            <span>Voltar</span>
          </button>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--primaria)]">Modo de Preparação</p>
            <h1 className="m-0 font-display text-xl font-bold text-gradient">{espaco?.nome ?? '…'}</h1>
          </div>
        </div>
        <span className="text-xs text-white/50">
          {indice + 1} de {musicas.length}
        </span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mb-4">
        {musicas.map((m, idx) => (
          <button
            key={m.id}
            type="button"
            className={`chip shrink-0 text-xs ${idx === indice ? 'chip-active' : ''}`}
            onClick={() => setIndice(idx)}
          >
            {m.titulo}
          </button>
        ))}
      </div>

      <div className="card p-3 bg-[var(--superficie-alta)] border border-[var(--borda)]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button className="btn-ghost h-9 w-9 p-0" type="button" onClick={voltar} disabled={indice === 0}>
              <ChevronLeft size={18} />
            </button>
            <button className="btn-ghost h-9 w-9 p-0" type="button" onClick={avancar} disabled={indice === musicas.length - 1}>
              <ChevronRight size={18} />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate font-semibold text-sm">{musicaAtual.titulo}</p>
                <span className="chip text-[10px] px-1.5 py-0.5 border-[var(--borda)]">{musicaAtual.tom}</span>
              </div>
              <p className="truncate text-xs text-white/50">{musicaAtual.artista}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select className="input w-auto text-xs" value={tom} onChange={(event) => setTom(event.target.value as Tom)}>
              {['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'].map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <div className={`h-3 w-3 rounded-full ${metronomeAtivo ? (batida === 0 ? 'bg-[var(--primaria)]' : 'bg-[var(--acento)]') : 'bg-white/20'}`} />
            <button className={`btn-ghost h-9 px-2 text-xs ${metronomeAtivo ? 'text-[var(--primaria)]' : ''}`} type="button" onClick={() => setMetronomeAtivo((v) => !v)}>
              <Music2 size={14} />
              {bpm} BPM
            </button>
            {metronomeAtivo && (
              <input className="w-20 accent-[var(--primaria)]" type="range" min={40} max={220} value={bpm} onChange={(event) => setBpm(Number(event.target.value))} />
            )}
          </div>
        </div>

        <div className="mt-2 flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs text-white/50">
            <input type="checkbox" checked={autoScroll} onChange={(event) => setAutoScroll(event.target.checked)} className="accent-[var(--primaria)]" />
            Auto-scroll
          </label>
          <select className="input w-auto text-xs" value={velocidade} onChange={(event) => setVelocidade(event.target.value as VelocidadeRolagem)}>
            <option value="lenta">Lenta</option>
            <option value="media">Média</option>
            <option value="rapida">Rápida</option>
          </select>
          <select className="input w-auto text-xs" value={tamanho} onChange={(event) => setTamanho(event.target.value as Tamanho)}>
            {tamanhos.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
        <div ref={scrollRef} className="card overflow-y-auto p-4 sm:p-6" style={{ maxHeight: 'calc(100vh - 280px)' }}>
          <ExibicaoCifra letra={letraTransposta} acordesProibidos={[]} modo="ambos" tamanho={tamanho} possuiCifra={true} formato="acima" />
        </div>

        <div className="space-y-4">
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <PenLine size={16} className="text-[var(--primaria)]" />
              <h2 className="text-sm font-semibold">Anotações do Ensaio</h2>
            </div>
            <p className="text-xs text-white/50 mb-2">
              {musicaAtual.titulo}
            </p>
            <textarea
              className="input min-h-[120px] resize-y text-xs w-full"
              value={nota}
              onChange={(event) => setNota(event.target.value)}
              placeholder="Ex: Intro no piano solista; pular 2º verso; solo de guitarra antes do ponte…"
            />
            <button className="btn-primary mt-2 w-full text-xs" type="button" onClick={() => void handleSalvarNota()} disabled={salvandoNota}>
              <Save size={14} />
              {salvandoNota ? 'Salvando...' : 'Salvar anotação'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}