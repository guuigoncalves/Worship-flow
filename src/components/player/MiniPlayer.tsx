import { createPortal } from 'react-dom';
import { Music2, Pause, Play, SkipBack, SkipForward, Clock } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePlayer } from '../../hooks/usePlayer';

export function MiniPlayer() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { faixa, fila, tocando, progresso, duracao, tocar, pausar } = usePlayer();

  // REGRA DE OCULTAÇÃO: NÃO exibir em tela cheia do player
  if (pathname === '/player') return null;
  if (pathname === '/login') return null;
  if (!faixa) return null;

  const pct = duracao > 0 ? Math.min(100, (progresso / duracao) * 100) : 0;

  const indiceAtual = faixa ? fila.findIndex((f) => f.id === faixa.id) : -1;
  const proximaFaixa = indiceAtual >= 0 && indiceAtual < fila.length - 1 ? fila[indiceAtual + 1] : null;
  const anteriorFaixa = indiceAtual > 0 ? fila[indiceAtual - 1] : null;

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
        className="pointer-events-auto mx-auto flex max-w-5xl items-center gap-3 rounded-2xl bg-[#141522]/90 border border-purple-500/20 px-3 py-2 shadow-2xl shadow-purple-950/80 backdrop-blur-xl"
      >
        {/* Thumbnail */}
        <button
          className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-[#181928] border border-white/10"
          type="button"
          onClick={() => navigate('/player')}
          aria-label="Abrir player"
        >
          {faixa.capaUrl ? (
            <img className="h-full w-full object-cover" src={faixa.capaUrl} alt={faixa.titulo} />
          ) : (
            <span className="grid h-full w-full place-items-center text-purple-400">
              <Music2 className="h-5 w-5" />
            </span>
          )}
        </button>

        {/* Título e Artista */}
        <button
          className="min-w-0 flex-1 cursor-pointer text-left"
          type="button"
          onClick={() => navigate('/player')}
        >
          <p className="truncate text-[10px] font-bold uppercase tracking-widest text-purple-400">Tocando agora</p>
          <p className="truncate text-xs font-bold text-white">{faixa.titulo}</p>
          <p className="truncate text-[10px] text-white/50">{faixa.artista}</p>
        </button>

        {/* Indicadores de Tom e BPM (sm/md) */}
        <div className="hidden items-center gap-3 sm:flex">
          {faixa.tom && (
            <span className="rounded-full bg-purple-500/10 px-2.5 py-1 text-[10px] font-semibold text-purple-300 border border-purple-500/20">
              Tom: {faixa.tom}
            </span>
          )}
          <span className="rounded-full bg-slate-800 px-2.5 py-1 text-[10px] font-mono font-semibold text-slate-300 border border-slate-700 flex items-center gap-1">
            <Clock size={10} />
            <span>0:00</span>
          </span>
        </div>

        {/* Controles */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            className="btn-text h-8 w-8 p-0 text-white/70 hover:text-white sm:flex"
            type="button"
            onClick={() => { if (anteriorFaixa) void tocar(anteriorFaixa); }}
            aria-label="Anterior"
          >
            <SkipBack className="h-4 w-4" />
          </button>
          <button
            className="h-10 w-10 rounded-full bg-gradient-to-br from-[#8b72ee] to-[#6d4aff] text-white flex items-center justify-center p-0 shadow-md shadow-purple-900/30"
            type="button"
            onClick={() => (tocando ? pausar() : tocar())}
            aria-label={tocando ? 'Pausar' : 'Tocar'}
          >
            {tocando ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
          </button>
          <button
            className="btn-text h-8 w-8 p-0 text-white/70 hover:text-white sm:flex"
            type="button"
            onClick={() => { if (proximaFaixa) void tocar(proximaFaixa); }}
            aria-label="Próxima"
          >
            <SkipForward className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Barra de progresso */}
      {duracao > 0 && (
        <div className="mx-auto mt-1 h-1 max-w-5xl overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-purple-400" style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>,
    document.body
  );
}
