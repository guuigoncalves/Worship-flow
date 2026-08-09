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
      <main className="app-page space-y-6 pb-32 fade-in" style={{ backgroundColor: '#0B0C10' }}>
        <header className="flex items-center justify-between pt-1">
          <button
            onClick={() => navigate(-1)}
            className="btn-ghost h-9 w-9 p-0 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
            type="button"
            aria-label="Voltar"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-base font-bold text-white">Player</h1>
          <div className="w-9" />
        </header>
        <EstadoVazio
          titulo="Nenhuma faixa em reprodução"
          texto="Selecione uma música no Hub Música ou na Biblioteca para tocar aqui."
        />
      </main>
    );
  }

  const faixaTom = (faixa as any)?.tom;
  const musica = faixa.musicaId ? obterMusica(faixa.musicaId) : null;
  const temLetra = Boolean(musica?.letra);
  const progPercent = duracao > 0 ? (progresso / duracao) * 100 : 0;

  return (
    <main className="app-page space-y-6 pb-32 fade-in max-w-md mx-auto" style={{ backgroundColor: '#0B0C10' }}>
      {/* Header */}
      <header className="flex items-center justify-between pt-1">
        <button
          onClick={() => navigate(-1)}
          className="btn-ghost h-9 w-9 p-0 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
          type="button"
          aria-label="Voltar"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="text-center">
          <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">Tocando agora</span>
          <h1 className="text-sm font-bold text-white truncate max-w-[200px]">{faixa.titulo}</h1>
        </div>
        <button
          onClick={() => setMostrarLetra(!mostrarLetra)}
          disabled={!temLetra}
          className={`btn-ghost h-9 w-9 p-0 flex items-center justify-center rounded-xl border transition-colors ${
            mostrarLetra
              ? 'bg-purple-600/30 border-purple-500/50 text-purple-300'
              : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
          }`}
          type="button"
          title="Ver letra"
        >
          <FileText size={18} />
        </button>
      </header>

      {/* Capa Centralizada com Glow Aurora */}
      <div className="flex flex-col items-center justify-center pt-2 space-y-4">
        <div className="relative">
          {tocando && (
            <div
              className="absolute -inset-8 rounded-full blur-3xl opacity-50 animate-pulse pointer-events-none"
              style={{ background: 'radial-gradient(circle, #8B5CF6 0%, #4F46E5 50%, transparent 70%)' }}
            />
          )}
          <div className="relative h-60 w-60 overflow-hidden rounded-3xl border border-white/15 shadow-2xl shadow-purple-950/50">
            <CapaMusica
              tom={faixaTom}
              titulo={faixa.titulo}
              tamanho="lg"
              className="h-full w-full"
            />
          </div>
        </div>

        {/* Título e Artista */}
        <div className="text-center space-y-1 w-full px-4">
          <h2 className="text-xl font-extrabold text-white truncate">{faixa.titulo}</h2>
          <p className="text-xs text-white/50 truncate">{faixa.artista || 'Artista não informado'}</p>
          {faixaTom && (
            <div className="pt-1">
              <span className="inline-block px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold font-mono">
                Tom: {faixaTom}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Barra de Progresso */}
      <div className="space-y-2 px-2">
        <div
          className="relative h-2 w-full bg-white/10 rounded-full cursor-pointer overflow-hidden backdrop-blur-sm"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const pct = x / rect.width;
            seek(pct * duracao);
          }}
        >
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-400 transition-all duration-100"
            style={{ width: `${progPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-white/40">
          <span>{formatarTempo(progresso)}</span>
          <span>{formatarTempo(duracao)}</span>
        </div>
      </div>

      {/* Controles Principais Aurora */}
      <div className="bg-[#141522]/90 border border-white/10 rounded-3xl p-4 backdrop-blur-xl shadow-2xl flex items-center justify-around">
        <button
          type="button"
          onClick={() => setModo(modo === 'pad' ? 'normal' : 'pad')}
          className={`px-3 py-1.5 rounded-xl text-xs font-black tracking-wider transition-all border ${
            modo === 'pad'
              ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-600/30'
              : 'bg-white/5 text-white/40 border-white/10 hover:text-white'
          }`}
          title="Modo Pad contínuo"
        >
          PAD
        </button>

        <button
          type="button"
          onClick={() => {}}
          className="p-3 text-white/60 hover:text-white transition-colors"
          title="Anterior"
        >
          <SkipBack size={22} />
        </button>

        <button
          type="button"
          onClick={() => (tocando ? pausar() : tocar(faixa))}
          className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center shadow-xl shadow-purple-600/40 hover:scale-105 active:scale-95 transition-all"
        >
          {tocando ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-0.5" />}
        </button>

        <button
          type="button"
          onClick={() => {}}
          className="p-3 text-white/60 hover:text-white transition-colors"
          title="Próxima"
        >
          <SkipForward size={22} />
        </button>

        <button
          type="button"
          onClick={() => setVolume(volume === 0 ? 0.8 : 0)}
          className="p-3 text-white/60 hover:text-white transition-colors"
        >
          {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>

      {/* Exibição da Letra */}
      {mostrarLetra && temLetra && (
        <div className="bg-[#141522]/90 border border-white/10 rounded-3xl p-5 backdrop-blur-xl space-y-2">
          <h3 className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Letra da Música</h3>
          <div className="whitespace-pre-wrap font-mono text-xs text-white/80 leading-relaxed max-h-60 overflow-y-auto pr-2">
            {musica?.letra}
          </div>
        </div>
      )}

      {/* Fila de Reprodução */}
      {fila.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider flex items-center gap-2">
              <List size={14} className="text-purple-400" />
              <span>Fila ({fila.length})</span>
            </h3>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {fila.map((item, idx) => (
              <div
                key={item.id + idx}
                onClick={() => tocar(item)}
                className="card p-3 flex items-center justify-between border border-white/10 bg-[#141522]/80 hover:bg-[#1A1040]/50 transition-all rounded-2xl cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Music size={16} className="text-purple-400 shrink-0" />
                  <span className="text-xs font-medium text-white truncate">{item.titulo}</span>
                </div>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  {(item as any).tom || 'C'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
};

export default Player;
