import { Link } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookPlus, ChevronRight, ListMusic, Megaphone, MessageSquarePlus,
  Minus, Music2, Pause, Play, Plus, Search, SlidersHorizontal, Users, Zap
} from 'lucide-react';
import { useMusicas } from '../hooks/useMusicas';
import { useAuth } from '../hooks/useAuth';
import { useEspacos } from '../hooks/useEspacos';
import { usePlayer } from '../hooks/usePlayer';
import { COR_TOM } from '../data/cores-tom';
import { Metronomo } from '../utils/metronomo';
import type { Musica } from '../types';

// Início — painel-resumo, layout replicado da referência visual (Aurora).
// Onde o mockup mostra Playlists / Atividade Recente / Comunidade não há
// modelo de dado real ainda (sem coleção de playlists, sem feed de atividade,
// sem comunidade pública — ver GESTAO_APP_CIFRA_MUSICA.md, pendência #6).
// Essas seções ficam com o MESMO layout/estilo da referência, mas com
// estado vazio honesto em vez de conteúdo inventado.

function diaRelativo(iso: string): string {
  const dt = new Date(iso);
  const hoje = new Date();
  const dias = Math.floor((new Date(hoje.toDateString()).getTime() - new Date(dt.toDateString()).getTime()) / 86400000);
  if (dias <= 0) return 'Hoje';
  if (dias === 1) return 'Ontem';
  return `${dias} dias`;
}

function Avatar({ nome, foto }: { nome?: string; foto?: string }) {
  if (foto) return <img src={foto} alt={nome ?? 'Perfil'} className="h-12 w-12 rounded-full object-cover ring-2 ring-primaria/40" />;
  const inicial = nome?.trim()?.[0]?.toUpperCase() ?? '?';
  return <span className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-[var(--primaria)] to-[var(--acento)] font-display font-bold text-fundo ring-2 ring-primaria/40">{inicial}</span>;
}

function CapaMusica({ musica, className = 'h-12 w-12' }: { musica?: Pick<Musica, 'tom'>; className?: string }) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-xl text-fundo ${className}`}
      style={{ background: musica ? `linear-gradient(135deg, ${COR_TOM[musica.tom]}, var(--acento))` : 'var(--elevada)' }}
    >
      <Music2 className="h-1/2 w-1/2 opacity-80" />
    </span>
  );
}

function SectionHeader({ icon, titulo, verTodas }: { icon: React.ReactNode; titulo: string; verTodas?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-textoSecundario">
        {icon}{titulo}
      </h2>
      {verTodas && <Link to={verTodas} className="flex items-center text-sm font-semibold text-primaria">Ver todas <ChevronRight className="h-4 w-4" /></Link>}
    </div>
  );
}

function EstadoVazio({ texto, acaoLabel, acaoHref }: { texto: string; acaoLabel?: string; acaoHref?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 p-6 text-center">
      <p className="text-sm text-textoSecundario">{texto}</p>
      {acaoLabel && acaoHref && <Link to={acaoHref} className="text-sm font-semibold text-primaria">{acaoLabel}</Link>}
    </div>
  );
}

function MetronomoWidget() {
  const metronomoRef = useRef<Metronomo | null>(null);
  const [bpm, setBpm] = useState(100);
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

  const ticks = Array.from({ length: 24 }, (_, i) => i * 15);

  return (
    <article className="card p-6">
      <SectionHeader icon={<span className="text-primaria">⏱</span>} titulo="Metrônomo" />
      <div className="flex flex-col items-center gap-4">
        <div className="relative grid h-36 w-36 place-items-center rounded-full" style={{ background: 'radial-gradient(closest-side, var(--superficie) 62%, transparent 63%), conic-gradient(var(--primaria) 0turn, var(--borda) 0turn)' }}>
          {ticks.map((deg) => (
            <span key={deg} className="absolute top-1 left-1/2 h-2 w-[2px] -translate-x-1/2 rounded-full bg-borda" style={{ transform: `rotate(${deg}deg) translateY(0)`, transformOrigin: '1px 66px' }} />
          ))}
          <div className={`h-16 w-[3px] origin-bottom rounded-full bg-primaria transition-transform duration-200 ${ativo ? 'animate-pulse' : ''}`} />
          <span className="absolute font-display text-4xl font-extrabold">{bpm}</span>
          <span className="absolute bottom-6 text-[10px] font-semibold uppercase tracking-widest text-textoSecundario">BPM</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="btn-ghost h-10 w-10 rounded-full p-0" onClick={() => setBpm((v) => Math.max(40, v - 4))} aria-label="Diminuir BPM"><Minus className="h-4 w-4" /></button>
          <button className="btn-primary h-14 w-14 rounded-full p-0" onClick={alternar} aria-label={ativo ? 'Parar metrônomo' : 'Iniciar metrônomo'}>
            {ativo ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </button>
          <button className="btn-ghost h-10 w-10 rounded-full p-0" onClick={() => setBpm((v) => Math.min(220, v + 4))} aria-label="Aumentar BPM"><Plus className="h-4 w-4" /></button>
        </div>
      </div>
    </article>
  );
}

export default function Inicio() {
  const { musicas } = useMusicas();
  const { perfilUsuario } = useAuth();
  const { espacos } = useEspacos();
  const { faixa, tocando, tocar, pausar } = usePlayer();

  const maisOuvidas = useMemo(() => [...musicas].filter((m) => m.vezesTocada > 0).sort((a, b) => b.vezesTocada - a.vezesTocada).slice(0, 5), [musicas]);
  const cifrasRecentes = useMemo(() => [...musicas].filter((m) => m.ultimaTocada).sort((a, b) => (b.ultimaTocada ?? '').localeCompare(a.ultimaTocada ?? '')).slice(0, 5), [musicas]);
  const primeiroNome = perfilUsuario?.nome?.split(' ')[0];

  return (
    <main className="app-page fade-in pb-28">
      {/* Header */}
      <header className="flex items-center gap-3">
        <div className="mr-auto flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[var(--primaria)] to-[var(--acento)] text-fundo"><Music2 className="h-5 w-5" /></span>
          <h1 className="font-display text-xl font-extrabold"><span className="text-gradient">Worship</span>Flow</h1>
        </div>
        <div className="text-right leading-tight">
          <p className="text-sm font-semibold">{primeiroNome ? `Olá, ${primeiroNome}` : 'Olá'} 🎵</p>
          <p className="text-xs text-textoSecundario">Vamos fazer música hoje?</p>
        </div>
        <Link to="/perfil" aria-label="Perfil"><Avatar nome={perfilUsuario?.nome} foto={perfilUsuario?.foto} /></Link>
      </header>

      {/* Busca */}
      <Link to="/busca-rapida" className="card mt-5 flex items-center gap-3 p-4 text-textoSecundario">
        <Search className="h-5 w-5 shrink-0" />
        <span className="flex-1 text-sm">Buscar músicas, artistas, pastas, espaços…</span>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primaria text-fundo"><SlidersHorizontal className="h-4 w-4" /></span>
      </Link>

      {/* Playlists — sem modelo de dado ainda; estado vazio honesto no mesmo layout */}
      <section className="mt-8">
        <SectionHeader icon={<ListMusic className="h-4 w-4" />} titulo="Playlists" />
        <div className="card flex items-center justify-between gap-3 p-4">
          <p className="text-sm text-textoSecundario">Playlists ainda não existem no app — é uma feature nova, não implementada.</p>
        </div>
      </section>

      {/* Mais ouvidas / Cifras recentes */}
      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <SectionHeader icon={<span className="text-primaria">♪</span>} titulo="Mais ouvidas" verTodas="/musica" />
          <div className="card divide-y divide-borda p-2">
            {maisOuvidas.map((musica) => (
              <Link key={musica.id} to={`/musica/${musica.id}`} className="flex items-center gap-3 p-2.5">
                <CapaMusica musica={musica} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{musica.titulo}</span>
                  <span className="block truncate text-xs text-textoSecundario">{musica.artista}</span>
                </span>
              </Link>
            ))}
            {!maisOuvidas.length && <EstadoVazio texto="Nenhuma música tocada ainda." acaoLabel="Ir pra Música" acaoHref="/musica" />}
          </div>
        </div>

        <div>
          <SectionHeader icon={<span className="text-primaria">🎸</span>} titulo="Cifras recentes" verTodas="/cifra" />
          <div className="card divide-y divide-borda p-2">
            {cifrasRecentes.map((musica) => (
              <Link key={musica.id} to={`/musica/${musica.id}`} className="flex items-center gap-3 p-2.5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full font-display font-bold text-fundo" style={{ background: COR_TOM[musica.tom] }}>{musica.tom[0]}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{musica.titulo}</span>
                  <span className="block truncate text-xs text-textoSecundario">{musica.artista}</span>
                </span>
                <span className="shrink-0 text-xs text-textoSecundario">{diaRelativo(musica.ultimaTocada as string)}</span>
              </Link>
            ))}
            {!cifrasRecentes.length && <EstadoVazio texto="Nenhuma cifra acessada ainda." acaoLabel="Ir pra Cifra" acaoHref="/cifra" />}
          </div>
        </div>
      </section>

      {/* Metrônomo / Atividade recente */}
      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <MetronomoWidget />

        <article className="card p-6">
          <SectionHeader icon={<Zap className="h-4 w-4" />} titulo="Atividade recente" verTodas={espacos.length ? '/espacos' : undefined} />
          <EstadoVazio texto="Sem feed de atividade ainda — essa funcionalidade não existe no app hoje." />
        </article>
      </section>

      {/* Comunidade */}
      <section className="mt-8">
        <SectionHeader icon={<Users className="h-4 w-4" />} titulo="Comunidade" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Link to="/cifra" className="card flex flex-col items-center gap-2 p-4 text-center">
            <Plus className="h-5 w-5 text-primaria" /><span className="text-sm font-semibold">Adicionar música</span>
          </Link>
          <Link to="/cifra" className="card flex flex-col items-center gap-2 p-4 text-center">
            <BookPlus className="h-5 w-5 text-primaria" /><span className="text-sm font-semibold">Adicionar cifra</span>
          </Link>
          <button type="button" disabled className="card flex cursor-not-allowed flex-col items-center gap-2 p-4 text-center opacity-50">
            <MessageSquarePlus className="h-5 w-5" /><span className="text-sm font-semibold">Fazer sugestão</span>
          </button>
          <button type="button" disabled className="card flex cursor-not-allowed flex-col items-center gap-2 p-4 text-center opacity-50">
            <Megaphone className="h-5 w-5" /><span className="text-sm font-semibold">Ver comunidade</span>
          </button>
        </div>
        <p className="mt-2 text-xs text-textoSecundario">Comunidade pública (sugestão, moderação, destaques) ainda não existe no app — os dois botões acima ficam desabilitados até essa feature ser construída.</p>
      </section>
    </main>
  );
}
