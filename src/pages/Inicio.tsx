import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookPlus, ChevronRight, ListMusic, MessageSquarePlus,
  Minus, Music2, Pause, Play, Plus, Search, SlidersHorizontal, Users, Zap,
  Volume2, Disc, User, FileText, Radio, Calendar, Flame, MessageSquare, Mic2,
  CheckCircle2, FileEdit, Clock, FilePlus, Sparkles
} from 'lucide-react';
import { useMusicas } from '../hooks/useMusicas';
import { useAuth } from '../hooks/useAuth';
import { useEspacos } from '../hooks/useEspacos';
import { usePlayer } from '../hooks/usePlayer';
import { COR_TOM } from '../data/cores-tom';
import { Metronomo } from '../utils/metronomo';
import type { Musica } from '../types';
import { Avatar, CapaMusica, Header } from '../components/aurora';

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
    <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/80">
    {icon}{titulo}
    </h2>
    {verTodas && (
      <Link to={verTodas} className="flex items-center gap-0.5 text-xs font-medium text-[#a78bfa] hover:text-purple-300 transition-colors">
      Ver todas <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    )}
    </div>
  );
}

function EstadoVazio({ texto, acaoLabel, acaoHref }: { texto: string; acaoLabel?: string; acaoHref?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 p-6 text-center">
    <p className="text-xs text-white/40">{texto}</p>
    {acaoLabel && acaoHref && <Link to={acaoHref} className="text-xs font-semibold text-[#8b5cf6] hover:underline">{acaoLabel}</Link>}
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
    <article className="rounded-2xl border border-[#26194d] bg-[#120c28]/90 p-5 shadow-xl flex flex-col justify-between h-full">
    <div className="flex items-center justify-between mb-2">
    <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/80">
    <Clock className="h-4 w-4 text-[#8b5cf6]" /> METRÔNOMO
    </h2>
    <div className={`w-2 h-2 rounded-full ${ativo ? 'bg-[#8b5cf6] animate-ping' : 'bg-white/20'}`} />
    </div>

    <div className="flex items-center justify-around py-2">
    {/* Pêndulo / Dial Visual do Metrônomo estilo Mockup */}
    <div className="relative w-16 h-20 flex items-center justify-center">
    <div className="absolute inset-0 rounded-full border border-purple-500/20 animate-pulse" />
    <div className="w-1 h-14 bg-gradient-to-t from-[#8b5cf6] to-[#c084fc] rounded-full origin-bottom animate-bounce" style={{ animationDuration: `${60 / bpm}s` }} />
    </div>

    <div className="text-center">
    <span className="font-mono text-4xl font-extrabold text-white tracking-tight">{bpm}</span>
    <p className="text-[10px] font-bold uppercase tracking-widest text-[#8c82ab] mt-1">BPM</p>
    </div>
    </div>

    <div className="flex items-center justify-center gap-3 pt-2">
    <button
    className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors border border-[#26194d] active:scale-95"
    onClick={() => setBpm((v) => Math.max(40, v - 1))}
    aria-label="Diminuir BPM"
    >
    <Minus className="h-4 w-4" />
    </button>
    <button
    className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#a855f7] text-white flex items-center justify-center transition-all shadow-lg shadow-purple-950/50 active:scale-95"
    onClick={alternar}
    aria-label={ativo ? 'Parar metrônomo' : 'Iniciar metrônomo'}
    >
    {ativo ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
    </button>
    <button
    className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors border border-[#26194d] active:scale-95"
    onClick={() => setBpm((v) => Math.min(240, v + 1))}
    aria-label="Aumentar BPM"
    >
    <Plus className="h-4 w-4" />
    </button>
    </div>
    </article>
  );
}

function AtividadeRecenteWidget() {
  const atividades = [
    { id: 1, titulo: 'Nova cifra adicionada', desc: 'Teu Amor Não Falha – Cifra', tempo: '10 min atrás', icon: FilePlus, cor: 'text-purple-400' },
    { id: 2, titulo: 'Sugestão aprovada', desc: 'Deus de Promessas – Cifra', tempo: '1 h atrás', icon: CheckCircle2, cor: 'text-emerald-400' },
    { id: 3, titulo: 'Cifra atualizada', desc: 'A Ele a Glória – Cifra', tempo: '2 h atrás', icon: FileEdit, cor: 'text-blue-400' },
    { id: 4, titulo: 'Novo comentário', desc: 'Em Grande é o Senhor – Cifra', tempo: '3 h atrás', icon: MessageSquare, cor: 'text-amber-400' },
  ];

  return (
    <article className="rounded-2xl border border-[#26194d] bg-[#120c28]/90 p-5 shadow-xl flex flex-col justify-between h-full">
    <div className="flex items-center justify-between mb-3">
    <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/80">
    <Zap className="h-4 w-4 text-[#8b5cf6]" /> ATIVIDADE RECENTE
    </h2>
    <Link to="/atividade" className="text-[11px] font-medium text-[#a78bfa] hover:text-purple-300">Ver todas</Link>
    </div>

    <div className="space-y-2.5">
    {atividades.map((item) => {
      const Icon = item.icon;
      return (
        <div key={item.id} className="flex items-start justify-between gap-3 p-1.5 rounded-xl hover:bg-white/5 transition-colors">
        <div className="flex items-center gap-2.5 min-w-0">
        <div className={`p-1.5 rounded-lg bg-white/5 border border-white/10 shrink-0 ${item.cor}`}>
        <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0">
        <p className="text-xs font-semibold text-white truncate">{item.titulo}</p>
        <p className="text-[10px] text-[#8c82ab] truncate">{item.desc}</p>
        </div>
        </div>
        <span className="text-[10px] text-[#625785] shrink-0 font-mono">{item.tempo}</span>
        </div>
      );
    })}
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
    <main className="app-page space-y-6 pb-32 fade-in max-w-5xl mx-auto px-4 pt-2 text-white" style={{ backgroundColor: '#080710' }}>
    {/* Cabeçalho com Info de Usuário */}
    <Header />

    {/* Busca Rápida Estilizada */}
    <Link to="/busca-rapida" className="flex items-center gap-3 rounded-2xl border border-[#26194d] bg-[#120c28]/80 p-3.5 text-white/40 hover:border-[#8b5cf6]/50 transition-all backdrop-blur-xl shadow-inner">
    <Search className="h-4 w-4 shrink-0 text-white/40" />
    <span className="flex-1 text-xs text-white/60">Buscar músicas, artistas, pastas, espaços...</span>
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#291757] text-[#a78bfa] border border-[#8b5cf6]/30">
    <SlidersHorizontal className="h-3.5 w-3.5" />
    </span>
    </Link>

    {/* Hero Card: Próximo Culto / Modo Palco */}
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#120c28] via-[#1a1040] to-[#291757] border border-[#26194d] p-5 shadow-2xl">
    <div className="absolute top-0 right-0 w-72 h-72 bg-[#7c3aed]/15 rounded-full blur-3xl pointer-events-none" />
    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div className="space-y-1.5">
    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#291757] border border-[#8b5cf6]/40 text-[#a78bfa] text-[10px] font-bold uppercase tracking-wider">
    <Calendar size={12} /> Próximo Culto
    </div>
    <h2 className="text-xl font-extrabold text-white tracking-tight">Culto de Domingo - Noite</h2>
    <p className="text-xs text-[#8c82ab]">
    {musicas.length > 0 ? `${Math.min(musicas.length, 4)} músicas no repertório` : 'Repertório em preparação'}
    </p>
    </div>

    <button
    onClick={() => navigate('/player')}
    className="text-xs py-3 px-6 flex items-center justify-center gap-2 rounded-2xl font-bold bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] text-white shadow-lg shadow-purple-900/40 hover:opacity-95 transition-opacity shrink-0 cursor-pointer"
    >
    <Radio size={16} />
    <span>Modo Palco</span>
    </button>
    </div>
    </div>

    {/* Playlists - Carrossel horizontal */}
    <section>
    <SectionHeader icon={<ListMusic className="h-4 w-4 text-[#8b5cf6]" />} titulo="PLAYLISTS" verTodas="/playlists" />
    <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
    {[
      { id: 1, titulo: 'Domingo Manhã', qtd: 12, imagemUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80' },
      { id: 2, titulo: 'Ensaio Geral', qtd: 20, imagemUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80' },
      { id: 3, titulo: 'Acústico', qtd: 8, imagemUrl: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&q=80' },
      { id: 4, titulo: 'Culto de Jovens', qtd: 15, imagemUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80' },
    ].map((item) => (
      <article
      key={item.id}
      onClick={() => navigate('/playlists')}
      className="overflow-hidden rounded-2xl border border-[#26194d] bg-[#120c28]/90 hover:border-[#8b5cf6]/50 transition-all cursor-pointer group shadow-lg shrink-0 w-44"
      >
      <div className="relative">
      <div className="flex h-24 items-center justify-center bg-cover bg-center p-2 text-center border-b border-white/5" style={{ backgroundImage: `url(${item.imagemUrl})` }}>
      <span className="text-xs font-bold text-white drop-shadow-md group-hover:text-[#a78bfa] transition-colors">{item.titulo}</span>
      </div>
      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
      <button type="button" className="absolute top-2 right-2 grid h-7 w-7 place-items-center rounded-full bg-[#8b5cf6] text-white shadow-md group-hover:scale-110 transition-transform">
      <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
      </button>
      </div>
      <div className="p-2.5">
      <p className="truncate text-xs font-semibold text-white">{item.titulo}</p>
      <p className="text-[10px] text-[#8c82ab]">{item.qtd} músicas</p>
      </div>
      </article>
    ))}
    </div>
    </section>

    {/* Mais ouvida + Cifras recentes em 2 colunas */}
    <section className="grid gap-6 md:grid-cols-2">
    <div>
    <SectionHeader icon={<Music2 className="h-4 w-4 text-[#8b5cf6]" />} titulo="MAIS OUVIDAS" verTodas="/musica" />
    <div className="divide-y divide-white/5 rounded-2xl border border-[#26194d] bg-[#120c28]/90 overflow-hidden shadow-xl">
    {maisOuvidas.map((musica) => (
      <Link key={musica.id} to={`/musica/${musica.id}`} className="flex items-center justify-between p-3 hover:bg-white/5 transition-colors group">
      <div className="flex items-center gap-3 min-w-0">
      <CapaMusica tom={musica.tom} titulo={musica.titulo} tamanho="sm" />
      <div className="min-w-0">
      <p className="text-xs font-semibold text-white truncate group-hover:text-[#a78bfa] transition-colors">{musica.titulo}</p>
      <p className="text-[10px] text-[#8c82ab] truncate">{musica.artista || 'Artista não informado'}</p>
      </div>
      </div>
      </Link>
    ))}
    {!maisOuvidas.length && <EstadoVazio texto="Nenhuma música tocada ainda." acaoLabel="Ir pra Música" acaoHref="/musica" />}
    </div>
    </div>

    <div>
    <SectionHeader icon={<FileText className="h-4 w-4 text-[#8b5cf6]" />} titulo="CIFRAS RECENTES" verTodas="/cifra" />
    <div className="divide-y divide-white/5 rounded-2xl border border-[#26194d] bg-[#120c28]/90 overflow-hidden shadow-xl">
    {cifrasRecentes.map((musica) => {
      const corHex = COR_TOM[musica.tom || 'C'] || '#8B5CF6';
      return (
        <Link key={musica.id} to={`/musica/${musica.id}`} className="flex items-center justify-between p-3 hover:bg-white/5 transition-colors group">
        <div className="flex items-center gap-3 min-w-0">
        {/* Badge Circular de Tom Estilo Mockup #1 */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold border" style={{ backgroundColor: `${corHex}22`, color: corHex, borderColor: `${corHex}66` }}>
        {musica.tom || 'C'}
        </div>
        <div className="min-w-0">
        <p className="text-xs font-semibold text-white truncate group-hover:text-[#a78bfa] transition-colors">{musica.titulo}</p>
        <p className="text-[10px] text-[#8c82ab] truncate">{musica.artista || 'Artista não informado'}</p>
        </div>
        </div>
        <span className="shrink-0 text-[10px] text-[#625785] font-mono pl-2">{diaRelativo(musica.ultimaTocada as string)}</span>
        </Link>
      );
    })}
    {!cifrasRecentes.length && <EstadoVazio texto="Nenhuma cifra acessada ainda." acaoLabel="Ir pra Cifra" acaoHref="/cifra" />}
    </div>
    </div>
    </section>

    {/* Grid: Metrônomo (Esquerda) + Atividade Recente (Direita) - Estilo Mockup #1 */}
    <section className="grid gap-6 md:grid-cols-2">
    <MetronomoWidget />
    <AtividadeRecenteWidget />
    </section>

    {/* Comunidade */}
    <section>
    <SectionHeader icon={<Users className="h-4 w-4 text-[#8b5cf6]" />} titulo="COMUNIDADE" />
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
    <Link to="/editor" className="flex flex-col items-center gap-2 rounded-2xl border border-[#26194d] bg-[#120c28]/90 p-4 text-center hover:border-[#8b5cf6]/50 transition-all group">
    <div className="p-2.5 rounded-xl bg-[#291757] text-[#a78bfa] group-hover:scale-110 transition-transform">
    <Plus className="h-5 w-5" />
    </div>
    <span className="text-xs font-semibold text-white">Adicionar música</span>
    </Link>
    <Link to="/editor" className="flex flex-col items-center gap-2 rounded-2xl border border-[#26194d] bg-[#120c28]/90 p-4 text-center hover:border-[#8b5cf6]/50 transition-all group">
    <div className="p-2.5 rounded-xl bg-[#291757] text-[#a78bfa] group-hover:scale-110 transition-transform">
    <BookPlus className="h-5 w-5" />
    </div>
    <span className="text-xs font-semibold text-white">Adicionar cifra</span>
    </Link>
    <button type="button" disabled className="flex cursor-not-allowed flex-col items-center gap-2 rounded-2xl border border-[#26194d]/50 bg-[#120c28]/40 p-4 text-center opacity-50">
    <div className="p-2.5 rounded-xl bg-white/5 text-white/40">
    <MessageSquare className="h-5 w-5" />
    </div>
    <span className="text-xs font-semibold text-white/60">Fazer sugestão</span>
    </button>
    <button type="button" disabled className="flex cursor-not-allowed flex-col items-center gap-2 rounded-2xl border border-[#26194d]/50 bg-[#120c28]/40 p-4 text-center opacity-50">
    <div className="p-2.5 rounded-xl bg-white/5 text-white/40">
    <Users className="h-5 w-5" />
    </div>
    <span className="text-xs font-semibold text-white/60">Ver comunidade</span>
    </button>
    </div>
    </section>

    {/* Seções inferiores (Destaque / Artistas) */}
    <section className="grid gap-6 md:grid-cols-2">
    <div>
    <SectionHeader icon={<Flame className="h-4 w-4 text-[#8b5cf6]" />} titulo="CIFRAS EM DESTAQUE" verTodas="/cifra" />
    <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
    {musicas.slice(0, 5).map((musica) => (
      <Link key={`destaque-${musica.id}`} to={`/musica/${musica.id}`} className="min-w-[150px] rounded-2xl border border-[#26194d] bg-[#120c28]/90 p-3 shadow-lg hover:border-[#8b5cf6]/50 transition-all group shrink-0">
      <CapaMusica tom={musica.tom} titulo={musica.titulo} tamanho="md" />
      <p className="mt-2 truncate text-xs font-bold text-white group-hover:text-[#a78bfa] transition-colors">{musica.titulo}</p>
      <p className="truncate text-[10px] text-[#8c82ab]">{musica.artista || 'Artista'}</p>
      </Link>
    ))}
    </div>
    </div>

    <div>
    <SectionHeader icon={<Mic2 className="h-4 w-4 text-[#8b5cf6]" />} titulo="ARTISTAS EM ALTA" verTodas="/artistas" />
    <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
    {[...new Set(musicas.map((m) => m.artista).filter(Boolean))].slice(0, 8).map((artista) => (
      <Link key={artista} to={`/artista/${encodeURIComponent(artista)}`} className="min-w-[120px] rounded-2xl border border-[#26194d] bg-[#120c28]/90 p-3 text-center shadow-lg hover:border-[#8b5cf6]/50 transition-all group shrink-0">
      <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-gradient-to-tr from-[#7c3aed] to-[#c084fc] text-white font-bold text-xs border border-white/10 shadow-md">
      {artista[0].toUpperCase()}
      </div>
      <p className="mt-2 truncate text-xs font-bold text-white group-hover:text-[#a78bfa] transition-colors">{artista}</p>
      <p className="text-[10px] text-[#8c82ab]">1.2k seguidores</p>
      </Link>
    ))}
    </div>
    </div>
    </section>
    </main>
  );
}
