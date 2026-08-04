import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../hooks/usePlayer';
import { useMusicas } from '../hooks/useMusicas';
import { CapaMusica } from '../components/aurora';
import { EstadoVazio } from '../components/compartilhado/EstadoVazio';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Music,
  ArrowLeft,
  List,
  FileText
} from 'lucide-react';

export const Player: React.FC = () => {
  const navigate = useNavigate();
  const {
    faixa,
    fila,
    tocando,
    progresso,
    duracao,
    volume,
    modo,
    tocar,
    pausar,
    seek,
    setVolume,
    setModo
  } = usePlayer();
  const { obterMusica } = useMusicas();
  const [mostrarLetra, setMostrarLetra] = React.useState(false);

  const formatarTempo = (segundos: number) => {
    const min = Math.floor(segundos / 60);
    const seg = Math.floor(segundos % 60);
    return `${min}:${seg < 10 ? '0' : ''}${seg}`;
  };

  if (!faixa) {
    return (
      <div className="app-page space-y-6 pb-24 fade-in">
        <button onClick={() => navigate(-1)} className="btn-ghost h-9 w-9 p-0">
          <ArrowLeft size={16} />
        </button>
        <EstadoVazio
          titulo="Nenhuma faixa selecionada"
          texto="Selecione uma música da biblioteca para iniciar a reprodução."
        />
      </div>
    );
  }

  const faixaTom = (faixa as any)?.tom;
  const musica = faixa.musicaId ? obterMusica(faixa.musicaId) : null;
  const temLetra = Boolean(musica?.letra);
  const progPercent = duracao > 0 ? (progresso / duracao) * 100 : 0;

  return (
    <div className="app-page space-y-5 pb-24 fade-in max-w-lg mx-auto">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="btn-ghost h-9 w-9 p-0">
        <ArrowLeft size={16} />
      </button>

      {/* Capa centralizada com glow */}
      <div className="flex flex-col items-center justify-center pt-2">
        <div className="relative">
          {/* Glow */}
          {tocando && (
            <div
              className="absolute -inset-6 rounded-full blur-2xl opacity-40 animate-pulse"
              style={{ background: 'radial-gradient(circle, #A259FF 0%, transparent 70%)' }}
            />
          )}
          <div
            className="relative h-52 w-52 overflow-hidden rounded-3xl"
            style={{ boxShadow: '0 24px 60px -12px rgba(162,89,255,0.5)', border: '1px solid rgba(162,89,255,0.3)' }}
          >
            <CapaMusica
              tom={faixaTom}
              titulo={faixa.titulo}
              tamanho="lg"
              className="h-full w-full"
            />
          </div>
        </div>

        {/* Info */}
        <div className="mt-5 w-full space-y-1 px-4 text-center">
          <h1 className="text-xl font-bold truncate">{faixa.titulo}</h1>
          <p className="text-sm truncate" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {faixa.artista || 'Artista não informado'}
          </p>
          {faixaTom && (
            <span
              className="inline-block mt-1 rounded-full px-3 py-0.5 text-xs font-bold"
              style={{ background: 'rgba(162,89,255,0.2)', color: '#A259FF', border: '1px solid rgba(162,89,255,0.3)' }}
            >
              Tom: {faixaTom}
            </span>
          )}
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="space-y-2 px-2">
        <div
          className="relative h-1.5 w-full overflow-hidden rounded-full cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.1)' }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const pct = x / rect.width;
            seek(pct * duracao);
          }}
        >
          <div
            className="absolute left-0 top-0 h-full rounded-full transition-all duration-100"
            style={{ width: `${progPercent}%`, background: 'linear-gradient(90deg, #A259FF, #5B8DEF)' }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.35)' }}>
          <span>{formatarTempo(progresso)}</span>
          <span>{formatarTempo(duracao)}</span>
        </div>
      </div>

      {/* Controles */}
      <div
        className="flex items-center justify-around rounded-2xl p-4"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* PAD */}
        <button
          onClick={() => setModo(modo === 'pad' ? 'normal' : 'pad')}
          className="rounded-lg px-3 py-1.5 text-xs font-bold transition-colors"
          style={modo === 'pad'
            ? { background: 'rgba(162,89,255,0.3)', color: '#A259FF', border: '1px solid rgba(162,89,255,0.4)' }
            : { color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}
          title="Modo Pad contínuo"
        >
          PAD
        </button>

        {/* Anterior */}
        <button onClick={() => {}} className="p-3 transition-colors" style={{ color: 'rgba(255,255,255,0.6)' }} title="Anterior">
          <SkipBack size={22} />
        </button>

        {/* Play/Pause principal */}
        <button
          onClick={() => (tocando ? pausar() : tocar(faixa))}
          className="flex h-14 w-14 items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95"
          style={{ background: 'linear-gradient(120deg, #A259FF, #5B8DEF)', boxShadow: '0 8px 24px -8px rgba(162,89,255,0.6)' }}
        >
          {tocando ? <Pause size={26} style={{ color: 'white' }} /> : <Play size={26} className="ml-0.5" style={{ color: 'white' }} />}
        </button>

        {/* Próxima */}
        <button onClick={() => {}} className="p-3 transition-colors" style={{ color: 'rgba(255,255,255,0.6)' }} title="Próxima">
          <SkipForward size={22} />
        </button>

        {/* Volume e letra */}
        <div className="flex items-center gap-1">
          <button onClick={() => setVolume(volume === 0 ? 0.8 : 0)} className="p-2 transition-colors" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          {temLetra && (
            <button
              onClick={() => setMostrarLetra((valor) => !valor)}
              className="p-2 transition-colors"
              style={{ color: mostrarLetra ? '#A259FF' : 'rgba(255,255,255,0.5)' }}
              title={mostrarLetra ? 'Ocultar letra' : 'Exibir letra'}
            >
              <FileText size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Letra */}
      {mostrarLetra && temLetra && (
        <div
          className="max-h-[50vh] overflow-y-auto rounded-2xl p-5"
          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="whitespace-pre-wrap break-words font-mono text-sm leading-relaxed">
            {musica?.letra}
          </div>
        </div>
      )}

      {/* Fila */}
      {fila.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <List size={14} style={{ color: '#A259FF' }} />
            <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>Fila ({fila.length})</span>
          </div>
          <div className="card max-h-48 overflow-y-auto divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            {fila.map((item, idx) => (
              <div
                key={item.id + idx}
                onClick={() => tocar(item)}
                className="flex cursor-pointer items-center justify-between p-2.5 transition-colors hover:bg-white/5"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <Music size={12} style={{ color: '#A259FF' }} className="shrink-0" />
                  <span className="truncate text-sm">{item.titulo}</span>
                </div>
                <span className="shrink-0 text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {(item as any).tom || ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Player;
