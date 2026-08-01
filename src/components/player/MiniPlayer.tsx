import { createPortal } from 'react-dom';
import { Music2, Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePlayer } from '../../hooks/usePlayer';

export function MiniPlayer() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { faixa, tocando, progresso, duracao, tocar, pausar } = usePlayer();
  if (pathname.startsWith('/tocar') || pathname === '/login') return null;
  if (!faixa) return null;
  const pct = duracao > 0 ? Math.min(100, (progresso / duracao) * 100) : 0;
  return createPortal(
    <div className="fixed bottom-[64px] left-0 right-0 z-30 border-t border-borda bg-superficie/95 px-4 py-3 shadow-2xl backdrop-blur md:bottom-0 md:left-[88px]">
      <div className="mx-auto flex max-w-5xl items-center gap-4">
        <button className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-elevada" type="button" onClick={() => navigate('/player')} aria-label="Abrir player">
          {faixa.capaUrl ? <img className="h-full w-full object-cover" src={faixa.capaUrl} alt="" /> : <span className="grid h-full place-items-center text-primaria"><Music2 className="h-5 w-5" /></span>}
        </button>
        <button className="min-w-0 flex-1 text-left" type="button" onClick={() => navigate('/player')}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-primaria">Tocando agora</p>
          <p className="truncate text-sm font-semibold">{faixa.titulo}</p>
          <p className="truncate text-xs text-textoSecundario">{faixa.artista}</p>
        </button>
        <div className="hidden items-center gap-2 sm:flex">
          <button className="btn-text h-9 w-9 p-0 text-texto" type="button" aria-label="Voltar"><SkipBack className="h-4 w-4" /></button>
          <button className="btn-primary h-11 w-11 rounded-full p-0" type="button" onClick={() => (tocando ? pausar() : tocar())} aria-label={tocando ? 'Pausar' : 'Tocar'}>
            {tocando ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </button>
          <button className="btn-text h-9 w-9 p-0 text-texto" type="button" aria-label="Próxima"><SkipForward className="h-4 w-4" /></button>
        </div>
        <button className="btn-text h-10 w-10 p-0 text-texto sm:hidden" type="button" onClick={() => (tocando ? pausar() : tocar())} aria-label={tocando ? 'Pausar' : 'Tocar'}>
          {tocando ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </button>
      </div>
      {duracao > 0 && (
        <div className="mx-auto mt-2 h-1 max-w-5xl overflow-hidden rounded-full bg-borda">
          <div className="h-full rounded-full bg-primaria" style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>,
    document.body
  );
}
