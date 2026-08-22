import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  ListMusic,
  Minus,
  Music2,
  Pause,
  Play,
  Plus,
  Radio,
  Search,
  SlidersHorizontal,
  Zap,
  FileText,
  Clock,
  FilePlus,
  MessageSquare,
  MoreVertical,
  SkipBack,
  SkipForward,
  Repeat
} from 'lucide-react';
import { useMusicas } from '../hooks/useMusicas';
import { usePlayer } from '../hooks/usePlayer';
import { COR_TOM } from '../data/cores-tom';
import { Metronomo } from '../utils/metronomo';
import { CapaMusica, Header } from '../components/aurora';
import { EstadoVazio } from '../components/compartilhado/EstadoVazio';

function SectionHeader({ icon, titulo, verTodas }: { icon: React.ReactNode; titulo: string; verTodas?: string }) {
  return (
    <div className="mb-2 flex items-center justify-between gap-1">
    <h2 className="flex items-center gap-1.5 text-[10px] sm:text-xs font-black uppercase tracking-tight sm:tracking-wider text-slate-300 truncate">
    {icon}
    <span>{titulo}</span>
    </h2>
    {verTodas && (
      <Link to={verTodas} className="flex items-center gap-0.5 text-[10px] sm:text-xs font-semibold text-purple-400 hover:text-purple-300 shrink-0">
      <span>Ver todas</span>
      <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
      </Link>
    )}
    </div>
  );
}

/* ===================================================================
 *  METRÔNOMO WIDGET (ALTURA PROPORCIONAL)
 *  =================================================================== */
function MetronomoWidget() {
  const metronomoRef = useRef<Metronomo | null>(null);
  const [bpm, setBpm] = useState(120);
  const [ativo, setAtivo] = useState(false);

  useEffect(() => {
    metronomoRef.current = new Metronomo();
    return () => metronomoRef.current?.parar();
  }, []);

  useEffect(() => {
    metronomoRef.current?.setBpm(bpm);
  }, [bpm]);

  function alternar() {
    if (ativo) {
      metronomoRef.current?.parar();
      setAtivo(false);
      return;
    }
    metronomoRef.current?.setBpm(bpm);
    metronomoRef.current?.iniciar();
    setAtivo(true);
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#12142B] p-3 flex flex-col gap-2.5">
    <div className="flex items-center justify-between">
    <div className="flex items-center gap-1.5">
    <Clock className="h-3 w-3 text-[var(--primaria)]" />
    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Metrônomo</span>
    </div>
    <span className={`h-1.5 w-1.5 rounded-full ${ativo ? 'bg-[var(--primaria)] animate-pulse' : 'bg-white/15'}`} />
    </div>

    <div className="flex items-center justify-between">
    <span className="font-mono text-2xl font-black text-white leading-none">{bpm}<span className="text-[9px] font-bold text-slate-400 ml-1">BPM</span></span>

    <div className="relative w-10 h-10 shrink-0">
    <svg viewBox="0 0 40 40" className="w-full h-full">
    <polygon points="12,36 28,36 24,10 16,10" fill="none" stroke="#3f3a5c" strokeWidth="1.5" />
    <line
    x1="20" y1="34" x2="20" y2="14"
    stroke="#A78BFA"
    strokeWidth="2"
    strokeLinecap="round"
    style={ativo ? { transformOrigin: '20px 34px', animation: 'balancoPendulo 0.6s ease-in-out infinite alternate' } : undefined}
    />
    <circle cx="20" cy="34" r="2" fill="#A78BFA" />
    </svg>
    </div>
    </div>

    <style>{`@keyframes balancoPendulo { from { transform: rotate(-14deg); } to { transform: rotate(14deg); } }`}</style>

    <div className="flex items-center justify-between">
    <button
    className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center active:scale-95 transition-transform"
    onClick={() => setBpm((v) => Math.max(40, v - 1))}
    >
    <Minus className="h-3 w-3" />
    </button>
    <button
    className="w-8 h-8 rounded-full bg-[var(--primaria)] text-white flex items-center justify-center shadow-md shadow-purple-900/40 hover:brightness-110 active:scale-95 transition-transform"
    onClick={alternar}
    >
    {ativo ? <Pause className="h-3 w-3 fill-current" /> : <Play className="h-3 w-3 fill-current ml-0.5" />}
    </button>
    <button
    className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center active:scale-95 transition-transform"
    onClick={() => setBpm((v) => Math.min(240, v + 1))}
    >
    <Plus className="h-3 w-3" />
    </button>
    </div>
    </div>
  );
}

/* ===================================================================
 *  MODO PALCO (CARD COMPACTO)
 *  =================================================================== */
function ModoPalcoWidget() {
  const navigate = useNavigate();
  const { musicas } = useMusicas();

  return (
    <div className="rounded-2xl border border-[var(--primaria)]/30 bg-gradient-to-br from-[#12142B] to-[#1a1040] p-3 flex flex-col gap-2.5">
    <div className="flex items-center gap-1.5">
    <Radio className="h-3 w-3 text-[var(--primaria)]" />
    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Modo Palco</span>
    </div>

    <div className="flex-1 min-w-0">
    <p className="text-sm font-black text-white leading-tight truncate">Domingo · Noite</p>
    <p className="text-[10px] text-slate-400 mt-0.5">
    {musicas.length > 0 ? `${Math.min(musicas.length, 4)} músicas prontas` : 'Repertório em preparação'}
    </p>
    </div>

    <button
    onClick={() => navigate('/player')}
    className="flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold bg-[var(--primaria)] text-white hover:brightness-110 active:scale-95 transition-all"
    >
    <Radio size={12} />
    <span>Iniciar</span>
    </button>
    </div>
  );
}

/* ===================================================================
 *  PÁGINA PRINCIPAL INÍCIO
 *  =================================================================== */
export default function Inicio() {
  const navigate = useNavigate();
  const { musicas } = useMusicas();
  const [busca, setBusca] = useState('');

  // 5 Músicas Mais Ouvidas
  const maisOuvidas = useMemo(
    () => [...musicas].filter((m) => m.vezesTocada > 0).sort((a, b) => b.vezesTocada - a.vezesTocada).slice(0, 5),
                              [musicas]
  );

  // Garantir exatamente 5 itens para Cifras Recentes
  const cifrasRecentes = useMemo(() => {
    const comData = [...musicas].filter((m) => m.ultimaTocada).sort((a, b) => (b.ultimaTocada ?? '').localeCompare(a.ultimaTocada ?? ''));
    if (comData.length >= 5) return comData.slice(0, 5);
    const idsJa = new Set(comData.map((m) => m.id));
    const faltam = musicas.filter((m) => !idsJa.has(m.id));
    return [...comData, ...faltam].slice(0, 5);
  }, [musicas]);

  return (
    <main className="app-page space-y-3.5 sm:space-y-5 pb-36 fade-in max-w-6xl mx-auto px-3 pt-1 text-white">
    {/* 1. Header Topo */}
    <Header />

    {/* 2. Campo de Busca */}
    <div className="relative flex items-center gap-2">
    <div className="relative flex-1">
    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
    <input
    type="text"
    value={busca}
    onChange={(e) => setBusca(e.target.value)}
    placeholder="Buscar músicas, artistas, pastas, espaços..."
    className="w-full bg-[#12142B] border border-white/10 rounded-2xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50"
    />
    </div>
    <button onClick={() => navigate('/busca-rapida')} className="p-2 bg-[#12142B] border border-white/10 rounded-2xl text-purple-400 hover:text-purple-300">
    <SlidersHorizontal className="h-4 w-4" />
    </button>
    </div>

    {/* 4. Playlists */}
    <section>
    <SectionHeader icon={<ListMusic className="h-4 w-4 text-purple-400" />} titulo="PLAYLISTS" verTodas="/playlists" />
    <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
    {[
      { id: 1, titulo: 'Domingo Manhã', qtd: '12 músicas', bg: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80' },
      { id: 2, titulo: 'Ensaio Geral', qtd: '20 músicas', bg: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80' },
      { id: 3, titulo: 'Acústico', qtd: '8 músicas', bg: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&q=80' },
      { id: 4, titulo: 'Culto de Jovens', qtd: '15 músicas', bg: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80' }
    ].map((item) => (
      <article
      key={item.id}
      onClick={() => navigate('/playlists')}
      className="relative w-28 h-36 sm:w-32 sm:h-42 rounded-2xl overflow-hidden border border-white/10 shadow-lg group cursor-pointer shrink-0 transition-transform hover:scale-105"
      >
      <img src={item.bg} alt={item.titulo} className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0B16] via-black/30 to-transparent" />
      <button className="absolute top-2 right-2 text-white/70 p-1 rounded-full bg-black/40">
      <MoreVertical className="w-3 h-3" />
      </button>
      <div className="absolute bottom-8 left-2">
      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-md">
      <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current ml-0.5" />
      </div>
      </div>
      <div className="absolute bottom-2 left-2 right-2">
      <p className="font-bold text-[11px] sm:text-xs text-white truncate">{item.titulo}</p>
      <p className="text-[9px] text-slate-300">{item.qtd}</p>
      </div>
      </article>
    ))}
    </div>
    </section>

    {/* 5. METRÔNOMO + MODO PALCO — compacto, acima de Mais Ouvidas/Cifras Recentes */}
    <section className="grid grid-cols-2 gap-2.5 sm:gap-4">
    <MetronomoWidget />
    <ModoPalcoWidget />
    </section>

    {/* 6. 2 COLUNAS LADO A LADO (MAIS OUVIDAS + CIFRAS RECENTES) */}
    <section className="grid grid-cols-2 gap-2.5 sm:gap-4">
    {/* Coluna Esquerda: MAIS OUVIDAS */}
    <div>
    <SectionHeader icon={<Music2 className="h-3.5 w-3.5 text-purple-400 shrink-0" />} titulo="MAIS OUVIDAS" verTodas="/musica" />
    <div className="divide-y divide-white/5 rounded-2xl border border-white/10 bg-[#12142B] overflow-hidden">
    {maisOuvidas.map((musica) => (
      <Link key={musica.id} to={'/musica/' + musica.id} className="flex items-center justify-between p-2.5 hover:bg-white/5 group h-12">
      <div className="flex items-center gap-2.5 min-w-0">
      <CapaMusica tom={musica.tom} titulo={musica.titulo} capaUrl={musica.capaUrl} tamanho="sm" />
      <div className="min-w-0">
      <p className="text-xs font-bold text-white truncate group-hover:text-purple-300">{musica.titulo}</p>
      <p className="text-[10px] text-slate-400 truncate">{musica.artista || 'Artista não informado'}</p>
      </div>
      </div>
      </Link>
    ))}
    </div>
    {!maisOuvidas.length && <EstadoVazio titulo="Nada tocado ainda" texto="Suas músicas mais ouvidas aparecem aqui" />}
    </div>

    {/* Coluna Direita: CIFRAS RECENTES */}
    <div>
    <SectionHeader icon={<FileText className="h-3.5 w-3.5 text-purple-400 shrink-0" />} titulo="CIFRAS RECENTES" verTodas="/cifra" />
    <div className="divide-y divide-white/5 rounded-2xl border border-white/10 bg-[#12142B] overflow-hidden">
    {cifrasRecentes.map((musica) => {
      const corHex = COR_TOM[musica.tom || 'C'] || '#8B5CF6';
    return (
      <Link key={musica.id} to={'/musica/' + musica.id} className="flex items-center justify-between p-2.5 hover:bg-white/5 group h-12">
      <div className="flex items-center gap-2.5 min-w-0">
      <div
      className="flex w-8 h-8 shrink-0 items-center justify-center rounded-xl text-xs font-black border"
      style={{ backgroundColor: corHex + '22', color: corHex, borderColor: corHex + '66' }}
      >
      {musica.tom || 'C'}
      </div>
      <div className="min-w-0">
      <p className="text-xs font-bold text-white truncate group-hover:text-purple-300">{musica.titulo}</p>
      <p className="text-[10px] text-slate-400 truncate">{musica.artista || 'Artista não informado'}</p>
      </div>
      </div>
      </Link>
    );
    })}
    </div>
    {!cifrasRecentes.length && <EstadoVazio titulo="Nada por aqui ainda" texto="Cifras que você acessar aparecem aqui" />}
    </div>
    </section>
    </main>
  );
}
