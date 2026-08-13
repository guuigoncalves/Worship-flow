import { createPortal } from 'react-dom';
import { Music2, Pause, Play, SkipBack, SkipForward, Clock } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePlayer } from '../../hooks/usePlayer';

export function MiniPlayer() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { faixa, tocando, progresso, duracao, tocar, pausar } = usePlayer();

  // REGRA DE OCULTAÇÃO: NÃO exibir em tela cheia do player
  if (pathname === '/player') return null;
  if (pathname === '/login') return null;
  if (!faixa) return null;

  const pct = duracao > 0 ? Math.min(100, (progresso / duracao) * 100) : 0;

  function formatarTempo(segundos: number): string {
    if (!segundos || segundos <= 0) return '0:00';
    const m = Math.floor(segundos / 60);
    const s = Math.floor(segundos % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  return createPortal(
    <div
      className="fixed bottom-[4.25rem] md:bottom-0 left-0 right-0 z-40 px-2 md:px-4 pb-2 md:pb-3 pointer-events-none"
    >
      <div
        className="pointer-events-auto mx-auto flex max-w-5xl items-center justify-between gap-3 rounded-2xl bg-[#120f24] border border-[#2d264f] px-3 py-2.5 shadow-2xl shadow-purple-950/40"
      >
        {/* Thumbnail + info */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#1a1b2e] border border-[#2d264f]"
            type="button"
            onClick={() => navigate('/player')}
            aria-label="Abrir player"
          >
            {faixa.capaUrl ? (
              <img className="h-full w-full object-cover" src={faixa.capaUrl} alt="" />
            ) : (
              <Music2 className="h-5 w-5 text-purple-400" />
            )}
          </button>

          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-widest text-purple-400">Tocando agora</p>
            <p className="truncate text-xs font-bold text-white">{faixa.titulo}</p>
            <p className="truncate text-[11px] text-[#a78bfa]">{faixa.artista}</p>
          </div>
        </div>

        {/* Indicadores de Tom e BPM/Tempo (sm/md) */}
        <div className="hidden items-center gap-4 sm:flex">
          {faixa.tom && (
            <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-mono font-semibold text-purple-300 border border-purple-500/30">
              Tom: {faixa.tom}
            </span>
          )}
          <span className="flex items-center gap-1 rounded-full bg-slate-800 px-3 py-1 text-xs font-mono font-semibold text-[#8f85b8] border border-[#2d264f]">
            <Clock size={10} />
            {formatarTempo(progresso)} / {formatarTempo(duracao)}
          </span>
        </div>

        {/* Controles */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-white/70 hover:text-white hover:bg-slate-700 transition-colors border border-[#2d264f] sm:flex"
            type="button"
            aria-label="Anterior"
          >
            <SkipBack className="h-4 w-4" />
          </button>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#8b72ee] to-[#6d4aff] text-white shadow-md shadow-purple-900/30 hover:brightness-110 transition-all"
            type="button"
            onClick={() => (tocando ? pausar() : tocar())}
            aria-label={tocando ? 'Pausar' : 'Tocar'}
          >
            {tocando ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
          </button>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-white/70 hover:text-white hover:bg-slate-700 transition-colors border border-[#2d264f] sm:flex"
            type="button"
            aria-label="Próxima"
          >
            <SkipForward className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Barra de progresso */}
      {duracao > 0 && (
        <div className="mx-auto mt-1.5 h-1 max-w-5xl overflow-hidden rounded-full bg-[#2d264f]">
          <div className="h-full rounded-full bg-purple-400" style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>,
    document.body
  );
}
