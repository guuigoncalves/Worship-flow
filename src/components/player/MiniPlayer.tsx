import { createPortal } from 'react-dom';
import { Pause, Play, SkipForward } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePlayer } from '../../hooks/usePlayer';

export function MiniPlayer() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { faixa, tocando, tocar, pausar } = usePlayer();
  if (pathname.startsWith('/tocar') || pathname === '/login') return null;
  const atual = faixa ?? { id: 'demo', titulo: 'Nenhuma faixa carregada', artista: 'WorshipFlow' };
  return createPortal(
    <div className="fixed bottom-[74px] left-3 right-3 z-30 mx-auto max-w-xl rounded-[14px] border border-borda bg-superficie/95 p-2 shadow-2xl backdrop-blur md:bottom-4 md:left-auto md:right-5 md:w-[360px]">
      <div className="flex items-center gap-3">
        <button className="h-10 w-10 overflow-hidden rounded-lg bg-elevada" type="button" onClick={() => navigate('/player')} aria-label="Abrir player">
          {atual.capaUrl ? <img className="h-full w-full object-cover" src={atual.capaUrl} alt="" /> : <span className="grid h-full place-items-center text-primaria">♪</span>}
        </button>
        <button className="min-w-0 flex-1 text-left" type="button" onClick={() => navigate('/player')}>
          <p className="truncate text-sm font-semibold">{atual.titulo}</p>
          <p className="truncate text-xs text-textoSecundario">{atual.artista}</p>
        </button>
        <button className="btn-text h-10 w-10 p-0 text-texto" type="button" onClick={() => (tocando ? pausar() : tocar())} aria-label={tocando ? 'Pausar' : 'Tocar'}>
          {tocando ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </button>
        <button className="btn-text h-10 w-10 p-0 text-texto" type="button" aria-label="Próxima"><SkipForward className="h-5 w-5" /></button>
      </div>
    </div>,
    document.body
  );
}
