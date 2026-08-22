import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { Pause, Play, SkipBack, SkipForward, Repeat } from 'lucide-react';
import { usePlayer } from '../../hooks/usePlayer';

export function MiniPlayer() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { faixa, fila, tocando, progresso, duracao, tocar, pausar } = usePlayer();

  if (pathname === '/player') return null;
  if (pathname === '/login') return null;
  if (!faixa) return null;

  function formatarTempo(segundos: number): string {
    if (!segundos || segundos <= 0) return '00:00';
    const m = Math.floor(segundos / 60);
    const s = Math.floor(segundos % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  }

  const pct = duracao > 0 ? Math.min(100, (progresso / duracao) * 100) : 0;
  const idxAtual = fila.findIndex((item) => item.id === faixa.id);
  const temAnterior = idxAtual > 0;
  const temProxima = idxAtual >= 0 && idxAtual < fila.length - 1;

  function anterior() {
    if (temAnterior) tocar(fila[idxAtual - 1]);
  }

  function proxima() {
    if (temProxima) tocar(fila[idxAtual + 1]);
  }

  return createPortal(
    <div className="fixed bottom-[4.5rem] md:bottom-2 left-2 right-2 z-40 max-w-5xl mx-auto">
    {/* Moldura de Borda Fina Gradiente 1px */}
    <div className="p-[1px] rounded-2xl sm:rounded-3xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 shadow-[0_0_20px_rgba(168,85,247,0.25)]">
    <div
    className="relative p-3 sm:p-3.5 rounded-[15px] sm:rounded-[23px] bg-[#070817] text-white overflow-hidden backdrop-blur-2xl cursor-pointer"
    onClick={() => navigate('/player')}
    >

    {/* Efeitos de Luzes e Feixes de Fundo */}
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {/* Focos de Luz Suaves (Sutil para não clarear o fundo) */}
    <div className="absolute -top-12 -left-12 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl" />
    <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl" />
    <div className="absolute -top-12 -right-12 w-44 h-44 bg-purple-500/15 rounded-full blur-3xl" />
    <div className="absolute -bottom-12 -right-12 w-44 h-44 bg-purple-900/20 rounded-full blur-3xl" />

    {/* Feixes Curvos de Luz */}
    <svg className="absolute inset-0 w-full h-full opacity-20" preserveAspectRatio="none" viewBox="0 0 500 150">
    <path d="M-50,150 Q100,20 250,80 T550,0" fill="none" stroke="url(#grad-cyan)" strokeWidth="1.5" />
    <path d="M-50,0 Q200,140 350,40 T550,150" fill="none" stroke="url(#grad-purple)" strokeWidth="1.5" />
    <defs>
    <linearGradient id="grad-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.8" />
    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.2" />
    </linearGradient>
    <linearGradient id="grad-purple" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stopColor="#A855F7" stopOpacity="0.2" />
    <stop offset="100%" stopColor="#EC4899" stopOpacity="0.8" />
    </linearGradient>
    </defs>
    </svg>
    </div>

    <div className="relative z-10 flex items-center gap-3">
    {/* 1. Capa do Álbum */}
    <img
    src={faixa.capaUrl || '/logo.svg'}
    alt={faixa.titulo}
    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover ring-1 ring-white/20 shrink-0 shadow-lg aspect-square"
    />

    {/* 2. Conteúdo da Direita */}
    <div className="flex-1 min-w-0 space-y-1.5">
    {/* Topo: Título + Artista | Logo do App Oficial em Branco */}
    <div className="flex items-center justify-between gap-2 min-w-0">
    <div className="min-w-0 flex-1">
    <h3 className="text-xs sm:text-sm font-extrabold text-white truncate leading-tight">
    {faixa.titulo}
    </h3>
    <p className="text-[10px] sm:text-xs text-slate-300 truncate leading-tight mt-0.5">{faixa.artista}</p>
    </div>

    {/* Logo do App Oficial em Branco */}
    <div className="flex items-center gap-1.5 text-white shrink-0">
    <img
    src="/logo.svg"
    alt="WorshipFlow"
    className="h-7 sm:h-8 w-auto brightness-0 invert drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]"
    onError={(e) => {
      e.currentTarget.style.display = 'none';
    }}
    />
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 sm:w-7 sm:h-7 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]">
    <path d="M3 12v-2m3 5V9m3 9V6m3 11V7m3 7v-4m3 2v-1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
    </div>
    </div>

    {/* Linha de Progresso — real */}
    <div className="relative w-full h-1 bg-white/10 rounded-full cursor-pointer group my-1">
    <div className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-purple-500 to-purple-400 rounded-full" style={{ width: `${pct}%` }} />
    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-purple-300 rounded-full shadow-[0_0_8px_#A855F7] ring-2 ring-purple-500" style={{ left: `${pct}%` }} />
    </div>

    {/* Linha Inferior: Horários + Botões Centralizados — reais */}
    <div className="flex items-center justify-between pt-0.5" onClick={(e) => e.stopPropagation()}>
    <span className="text-[10px] sm:text-xs text-slate-400 font-mono font-medium">{formatarTempo(progresso)}</span>

    <div className="flex items-center gap-3 sm:gap-4">
    <button type="button" onClick={anterior} disabled={!temAnterior} className="text-white hover:text-purple-300 transition-colors disabled:opacity-30 disabled:hover:text-white">
    <SkipBack className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" />
    </button>
    <button
    type="button"
    onClick={() => (tocando ? pausar() : tocar())}
    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#181135] border border-purple-500/60 text-white flex items-center justify-center shadow-[0_0_12px_rgba(168,85,247,0.5)] hover:scale-105 active:scale-95 transition-all"
    >
    {tocando ? (
      <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
    ) : (
      <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current ml-0.5" />
    )}
    </button>
    <button type="button" onClick={proxima} disabled={!temProxima} className="text-white hover:text-purple-300 transition-colors disabled:opacity-30 disabled:hover:text-white">
    <SkipForward className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" />
    </button>
    </div>

    <div className="flex items-center gap-1">
    <span className="text-[10px] sm:text-xs text-slate-400 font-mono font-medium">{formatarTempo(duracao)}</span>
    <Repeat className="w-3 h-3 text-slate-500" />
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>,
    document.body
  );
}
