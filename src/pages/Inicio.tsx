import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookPlus, ChevronRight, ListMusic, MessageSquarePlus,
  Minus, Music2, Pause, Play, Plus, Search, SlidersHorizontal, Users, Zap, MoreHorizontal,
  Volume2, Disc, User, FileText, Radio, Calendar, Flame, MessageSquare, Mic2, Star
} from 'lucide-react';
import { useMusicas } from '../hooks/useMusicas';
import { useAuth } from '../hooks/useAuth';
import { useEspacos } from '../hooks/useEspacos';
import { usePlayer } from '../hooks/usePlayer';
import { COR_TOM } from '../data/cores-tom';
import { Metronomo } from '../utils/metronomo';
import type { Musica } from '../types';
import { Avatar, CapaMusica } from '../components/aurora';

function diaRelativo(iso: string): string {
  if (!iso) return 'Recentemente';
  const dt = new Date(iso);
  const hoje = new Date();
  const dias = Math.floor((new Date(hoje.toDateString()).getTime() - new Date(dt.toDateString()).getTime()) / 86400000);
  if (dias <= 0) return 'Hoje';
  if (dias === 1) return 'Ontem';
  return `${dias} dias`;
}

function SectionHeader({ icon, titulo, verTodas }: { icon: React.ReactNode; titulo: string; verTodas?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/70">
        {icon}{titulo}
      </h2>
      {verTodas && (
        <Link to={verTodas} className="flex items-center gap-0.5 text-xs font-medium text-[var(--primaria)] hover:text-purple-300 transition-colors">
          Ver todas <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

function EstadoVazio({ texto, acaoLabel, acaoHref }: { texto: string; acaoLabel?: string; acaoHref?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 p-6 text-center">
      <p className="text-xs text-white/50">{texto}</p>
      {acaoLabel && acaoHref && <Link to={acaoHref} className="text-xs font-semibold text-[var(--primaria)] hover:underline">{acaoLabel}</Link>}
    </div>
  );
}

function MetronomoWidget() {
  const metronomoRef = useRef<Metronomo | null>(null);
  const [bpm, setBpm] = useState(120);
  const [ativo, setAtivo] = useState(false);

  useEffect(() => {
    metronomoRef.current = new Metronomo();
    return () => metronomoRef.current?.parar();
  }, []);

  useEffect(() => { metronomoRef.current?.setBpm(bpm); }, [bpm]);

  function alternar() {
    if (ativo) { metronomoRef.current?.parar(); setAtivo(false); return; }
    metronomoRef.current?.setBpm(bpm);
    metronomoRef.current?.iniciar();
    setAtivo(true);
  }

  return (
    <article className="card rounded-2xl border border-white/10 bg-[#141522]/90 p-5 shadow-xl flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/70">
          <span className="text-[var(--primaria)]">⏱</span> METRÔNOMO
        </h2>
        <div className={`w-2 h-2 rounded-full ${ativo ? 'bg-[var(--primaria)] animate-ping' : 'bg-white/20'}`} />
      </div>

      <div className="flex items-center justify-around py-3">
        <div className="relative w-14 h-20 flex items-center justify-center">
          <div className="w-1 h-16 bg-gradient-to-t from-[var(--primaria)] to-[var(--acento)] rounded-full origin-bottom animate-bounce" style={{ animationDuration: `${60 / bpm}s` }} />
        </div>

        <div className="text-center">
          <span className="font-mono text-4xl font-extrabold text-white tracking-tight">{bpm}</span>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mt-1">BPM</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
        <button
          className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors border border-white/10 active:scale-95"
          onClick={() => setBpm((v) => Math.max(40, v - 1))}
          aria-label="Diminuir BPM"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--primaria)] to-[var(--acento)] text-fundo flex items-center justify-center transition-all shadow-lg shadow-purple-900/30 active:scale-95"
          onClick={alternar}
          aria-label={ativo ? 'Parar metrônomo' : 'Iniciar metrônomo'}
        >
          {ativo ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
        </button>
        <button
          className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors border border-white/10 active:scale-95"
          onClick={() => setBpm((v) => Math.min(240, v + 1))}
          aria-label="Aumentar BPM"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}

export default function Inicio() {
  const navigate = useNavigate();
  const { musicas } = useMusicas();
  const { perfilUsuario, user } = useAuth();
  const { espacos } = useEspacos();
  const { faixa, tocando, tocar, pausar } = usePlayer();

  const primeiroNome = perfilUsuario?.nome?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'Músico';
  const fotoUsuario = perfilUsuario?.foto || user?.photoURL || undefined;

  const maisOuvidas = useMemo(() => [...musicas].filter((m) => m.vezesTocada > 0).sort((a, b) => b.vezesTocada - a.vezesTocada).slice(0, 5), [musicas]);
  const cifrasRecentes = useMemo(() => [...musicas].filter((m) => m.ultimaTocada).sort((a, b) => (b.ultimaTocada ?? '').localeCompare(a.ultimaTocada ?? '')).slice(0, 5), [musicas]);

  return (
    <main className="app-page space-y-6 pb-32 fade-in" style={{ backgroundColor: '#0B0C10' }}>
      {/* Cabeçalho com Info de Usuário */}
      <header className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-2xl bg-gradient-to-br from-[var(--primaria)] to-[var(--acento)] text-fundo">
            <Volume2 size={24} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gradient tracking-tight">WorshipFlow</h1>
            <p className="text-xs text-white/60">
              Olá, {primeiroNome} <span className="inline-block animate-bounce">🎵</span>
            </p>
            <p className="text-[10px] text-white/40">Vamos fazer música hoje?</p>
          </div>
        </div>
        <Link to="/perfil" aria-label="Perfil">
          <Avatar nome={primeiroNome} fotoUrl={fotoUsuario} tamanho="md" />
        </Link>
      </header>

      {/* Busca Rápida Estilizada */}
      <Link to="/busca-rapida" className="card flex items-center gap-3 rounded-2xl border border-white/10 bg-[#141522]/80 p-3.5 text-white/40 hover:border-[var(--primaria)]/40 transition-all backdrop-blur-xl shadow-inner">
        <Search className="h-4 w-4 shrink-0 text-white/40" />
        <span className="flex-1 text-xs text-white/60">Buscar músicas, artistas, pastas, espaços...</span>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[var(--primaria-dim)] text-[var(--primaria)] border border-[var(--primaria)]/30">
          <SlidersHorizontal className="h-3.5 w-3.5" />
        </span>
      </Link>

      {/* Hero Card: Próximo Culto / Modo Palco */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0B0C10] via-[#141522] to-[#1A1040] border border-white/10 p-5 shadow-2xl">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[var(--primaria)]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[var(--primaria-dim)] border border-[var(--primaria)]/30 text-[var(--primaria)] text-[10px] font-bold uppercase tracking-wider">
              <Calendar size={12} /> Próximo Culto
            </div>
            <h2 className="text-lg font-extrabold text-white">Culto de Domingo - Noite</h2>
            <p className="text-xs text-white/60">
              {musicas.length > 0 ? `${Math.min(musicas.length, 4)} músicas no repertório` : 'Repertório em preparação'}
            </p>
          </div>

          <button
            onClick={() => navigate('/tocar')}
            className="btn-primary text-xs py-2.5 px-5 flex items-center justify-center gap-2 rounded-2xl font-bold shadow-lg shadow-[var(--primaria)]/30 shrink-0 cursor-pointer"
          >
            <Radio size={16} />
            <span>Modo Palco</span>
          </button>
        </div>
      </div>

      {/* Playlists - Carrossel horizontal */}
      <section>
        <SectionHeader icon={<ListMusic className="h-4 w-4 text-[var(--primaria)]" />} titulo="PLAYLISTS" verTodas="/playlists" />
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {[
            { id: 1, titulo: 'Domingo Manhã', qtd: 12 },
            { id: 2, titulo: 'Ensaio Geral', qtd: 20 },
            { id: 3, titulo: 'Acústico', qtd: 8 },
            { id: 4, titulo: 'Culto de Jovens', qtd: 15 },
          ].map((item) => (
            <article
              key={item.id}
              onClick={() => navigate('/playlists')}
              className="card overflow-hidden rounded-2xl border border-white/10 bg-[#141522]/90 hover:border-[var(--primaria)]/40 transition-all cursor-pointer group shadow-lg shrink-0 w-44"
            >
              <div className="relative">
                <div className="flex h-24 items-center justify-center bg-gradient-to-br from-[var(--primaria)]/20 to-[var(--acento)]/20 p-2 text-center">
                  <span className="text-xs font-bold text-white/90 group-hover:text-[var(--primaria)] transition-colors">{item.titulo}</span>
                </div>
                <button type="button" className="absolute top-2 right-2 grid h-7 w-7 place-items-center rounded-full bg-[var(--primaria)] text-fundo shadow-md group-hover:scale-110 transition-transform">
                  <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                </button>
              </div>
              <div className="p-2.5">
                <p className="truncate text-xs font-semibold text-white">{item.titulo}</p>
                <p className="text-[10px] text-white/40">{item.qtd} músicas</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Mais ouvidas + Cifras recentes em 2 colunas */}
      <section className="grid gap-6 md:grid-cols-2">
        <div>
          <SectionHeader icon={<Music2 className="h-4 w-4 text-[var(--primaria)]" />} titulo="MAIS OUVIDAS" verTodas="/musica" />
          <div className="card divide-y divide-white/5 rounded-2xl border border-white/10 bg-[#141522]/90 overflow-hidden shadow-xl">
            {maisOuvidas.map((musica) => (
              <Link key={musica.id} to={`/musica/${musica.id}`} className="flex items-center justify-between p-3 hover:bg-white/5 transition-colors group">
                <div className="flex items-center gap-3 min-w-0">
                  <CapaMusica tom={musica.tom} titulo={musica.titulo} tamanho="sm" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate group-hover:text-[var(--primaria)] transition-colors">{musica.titulo}</p>
                    <p className="text-[10px] text-white/50 truncate">{musica.artista || 'Artista não informado'}</p>
                  </div>
                </div>
              </Link>
            ))}
            {!maisOuvidas.length && <EstadoVazio texto="Nenhuma música tocada ainda." acaoLabel="Ir pra Música" acaoHref="/musica" />}
          </div>
        </div>

        <div>
          <SectionHeader icon={<FileText className="h-4 w-4 text-[var(--primaria)]" />} titulo="CIFRAS RECENTES" verTodas="/cifra" />
          <div className="card divide-y divide-white/5 rounded-2xl border border-white/10 bg-[#141522]/90 overflow-hidden shadow-xl">
            {cifrasRecentes.map((musica) => (
              <Link key={musica.id} to={`/musica/${musica.id}`} className="flex items-center justify-between p-3 hover:bg-white/5 transition-colors group">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate group-hover:text-[var(--primaria)] transition-colors">{musica.titulo}</p>
                  <p className="text-[10px] text-white/50 truncate">{musica.artista || 'Artista não informado'}</p>
                </div>
                <span className="shrink-0 text-[10px] text-white/40">{diaRelativo(musica.ultimaTocada as string)}</span>
              </Link>
            ))}
            {!cifrasRecentes.length && <EstadoVazio texto="Nenhuma cifra acessada ainda." acaoLabel="Ir pra Cifra" acaoHref="/cifra" />}
          </div>
        </div>
      </section>

      {/* Metrônomo */}
      <section>
        <MetronomoWidget />
      </section>

      {/* Comunidade */}
      <section>
        <SectionHeader icon={<Users className="h-4 w-4 text-[var(--primaria)]" />} titulo="COMUNIDADE" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Link to="/editor" className="card flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-[#141522]/90 p-4 text-center hover:border-[var(--primaria)]/40 transition-all group">
            <div className="p-2.5 rounded-xl bg-[var(--primaria-dim)] text-[var(--primaria)] group-hover:scale-110 transition-transform">
              <Plus className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold text-white">Adicionar música</span>
          </Link>
          <Link to="/editor" className="card flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-[#141522]/90 p-4 text-center hover:border-[var(--primaria)]/40 transition-all group">
            <div className="p-2.5 rounded-xl bg-[var(--primaria-dim)] text-[var(--primaria)] group-hover:scale-110 transition-transform">
              <BookPlus className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold text-white">Adicionar cifra</span>
          </Link>
          <button type="button" disabled className="card flex cursor-not-allowed flex-col items-center gap-2 rounded-2xl border border-white/10 bg-[#141522]/50 p-4 text-center opacity-50">
            <div className="p-2.5 rounded-xl bg-white/5 text-white/40">
              <MessageSquare className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold text-white/60">Fazer sugestão</span>
          </button>
          <button type="button" disabled className="card flex cursor-not-allowed flex-col items-center gap-2 rounded-2xl border border-white/10 bg-[#141522]/50 p-4 text-center opacity-50">
            <div className="p-2.5 rounded-xl bg-white/5 text-white/40">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold text-white/60">Ver comunidade</span>
          </button>
        </div>
      </section>

      {/* Seções inferiores (Destaque / Artistas) */}
      <section>
        <SectionHeader icon={<Flame className="h-4 w-4 text-[var(--primaria)]" />} titulo="CIFRAS EM DESTAQUE" verTodas="/cifra" />
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {musicas.slice(0, 5).map((musica) => (
            <Link key={`destaque-${musica.id}`} to={`/musica/${musica.id}`} className="card min-w-[150px] rounded-2xl border border-white/10 bg-[#141522]/90 p-3 shadow-lg hover:border-[var(--primaria)]/40 transition-all group shrink-0">
              <CapaMusica tom={musica.tom} titulo={musica.titulo} tamanho="md" />
              <p className="mt-2 truncate text-xs font-bold text-white group-hover:text-[var(--primaria)] transition-colors">{musica.titulo}</p>
              <p className="truncate text-[10px] text-white/50">{musica.artista || 'Artista'}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-4">
        <SectionHeader icon={<Mic2 className="h-4 w-4 text-[var(--primaria)]" />} titulo="ARTISTAS EM ALTA" verTodas="/artistas" />
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {[...new Set(musicas.map((m) => m.artista).filter(Boolean))].slice(0, 8).map((artista) => (
            <Link key={artista} to={`/artista/${encodeURIComponent(artista)}`} className="card min-w-[120px] rounded-2xl border border-white/10 bg-[#141522]/90 p-3 text-center shadow-lg hover:border-[var(--primaria)]/40 transition-all group shrink-0">
              <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-gradient-to-tr from-[var(--primaria)]/40 to-[var(--acento)]/40 text-white font-bold text-xs border border-white/10">
                {artista[0].toUpperCase()}
              </div>
              <p className="mt-2 truncate text-xs font-bold text-white group-hover:text-[var(--primaria)] transition-colors">{artista}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}