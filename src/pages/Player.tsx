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
  FileText,
  Heart,
  MoreVertical,
  Shuffle,
  Repeat
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
  const [favorito, setFavorito] = React.useState(false);
  const [shuffleAtivo, setShuffleAtivo] = React.useState(false);
  const [repeatAtivo, setRepeatAtivo] = React.useState(false);
  const [filaVisivel, setFilaVisivel] = React.useState(false);

  const formatarTempo = (segundos: number) => {
    const min = Math.floor(segundos / 60);
    const seg = Math.floor(segundos % 60);
    return `${min}:${seg < 10 ? '0' : ''}${seg}`;
  };

  if (!faixa) {
    return (
      <main className="app-page space-y-6 pb-32 fade-in bg-gradient-to-b from-[#181236]/40 via-[#080711] to-[#080711]">
        <header className="flex items-center justify-between pt-1">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#120f26] border border-[#2a224f] text-white hover:bg-white/10 transition-colors"
            type="button"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
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

  const handlePrev = () => {
    const idx = fila.findIndex((item) => item.id === faixa.id);
    if (idx > 0) {
      tocar(fila[idx - 1]);
    }
  };

  const handleNext = () => {
    const idx = fila.findIndex((item) => item.id === faixa.id);
    if (idx >= 0 && idx < fila.length - 1) {
      tocar(fila[idx + 1]);
    }
  };

  const handleMoverFila = (_index: number, _direcao: -1 | 1) => {
    // Reordenação da fila não exposta pelo hook atual.
  };

  return (
    <main className="app-page space-y-6 pb-32 fade-in max-w-md mx-auto bg-gradient-to-b from-[#181236]/40 via-[#080711] to-[#080711]">
      <header className="flex items-center justify-between pt-1">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#120f26] border border-[#2a224f] text-white hover:bg-white/10 transition-colors"
          type="button"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-bold text-white">Player</h1>
        <button
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#120f26] border border-[#2a224f] text-white hover:bg-white/10 transition-colors"
          type="button"
          aria-label="Mais opções"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </header>

      <div className="flex flex-col items-center justify-center pt-2 space-y-4">
        <div className="relative">
          {tocando && (
            <div
              className="absolute -inset-8 rounded-full blur-3xl opacity-50 animate-pulse pointer-events-none"
              style={{ background: 'radial-gradient(circle, #8B5CF6 0%, #4F46E5 50%, transparent 70%)' }}
            />
          )}
          <div className="relative h-60 w-60 overflow-hidden rounded-2xl border border-[#2a224f] shadow-[0_0_35px_rgba(139,114,238,0.25)] bg-gradient-to-br from-[#1d163d] via-[#2a1b54] to-[#120f26]">
            {faixa.capaUrl ? (
              <img className="h-full w-full object-cover" src={faixa.capaUrl} alt={faixa.titulo} />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Music className="w-16 h-16 text-[#8b72ee]" />
              </div>
            )}
          </div>
        </div>

        <div className="text-center space-y-1 w-full px-4">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-xl font-extrabold text-white truncate">{faixa.titulo}</h2>
            <button
              type="button"
              onClick={() => setFavorito(!favorito)}
              className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${favorito ? 'text-red-400 border-red-500/30' : 'text-[#8f85b8] border-[#2d264f] hover:text-red-500'}`}
              aria-label="Favorito"
            >
              <Heart className="w-6 h-6" fill={favorito ? 'currentColor' : 'none'} />
            </button>
          </div>
          <p className="text-xs text-[#8f85b8] truncate">{faixa.artista || 'Artista não informado'}</p>
          {faixaTom && (
            <div className="pt-1">
              <span className="inline-block px-3 py-1 rounded-full bg-[#1e1b4b] border border-[#3730a3] text-[#c4b5fd] text-xs font-bold font-mono">
                {faixaTom}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2 px-2">
        <div
          className="relative h-2 w-full bg-white/10 rounded-full cursor-pointer overflow-hidden"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const pct = x / rect.width;
            seek(pct * duracao);
          }}
        >
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-[#8b72ee] to-[#6d4aff] transition-all duration-100"
            style={{ width: `${progPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-white/40">
          <span>{formatarTempo(progresso)}</span>
          <span>{formatarTempo(duracao)}</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => setShuffleAtivo(!shuffleAtivo)}
          className={`p-2 transition-colors ${shuffleAtivo ? 'text-[#a78bfa]' : 'text-white/60 hover:text-white'}`}
          title="Shuffle"
        >
          <Shuffle size={20} />
        </button>
        <button
          type="button"
          onClick={handlePrev}
          className="p-3 text-white/60 hover:text-white transition-colors"
          title="Anterior"
        >
          <SkipBack size={24} />
        </button>
        <button
          type="button"
          onClick={() => (tocando ? pausar() : tocar(faixa))}
          className="h-16 w-16 rounded-2xl bg-gradient-to-r from-[#8b72ee] to-[#6d4aff] text-white flex items-center justify-center shadow-[0_0_25px_rgba(139,114,238,0.5)] hover:scale-105 active:scale-95 transition-all"
        >
          {tocando ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="p-3 text-white/60 hover:text-white transition-colors"
          title="Próximo"
        >
          <SkipForward size={24} />
        </button>
        <button
          type="button"
          onClick={() => setRepeatAtivo(!repeatAtivo)}
          className={`p-2 transition-colors ${repeatAtivo ? 'text-[#a78bfa]' : 'text-white/60 hover:text-white'}`}
          title="Repeat"
        >
          <Repeat size={20} />
        </button>
      </div>

      <div className="flex items-center gap-3 px-2">
        <button
          type="button"
          onClick={() => setVolume(volume === 0 ? 0.8 : 0)}
          className="text-white/60 hover:text-white transition-colors"
        >
          {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="flex-1 accent-[#8b72ee] h-1"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Modo de reprodução</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(['normal', 'fundo', 'pad', 'metronomo'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setModo(modo === m ? 'normal' : m)}
              className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                modo === m
                  ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-600/30'
                  : 'bg-white/5 text-white/40 border-[#2a224f] hover:text-white'
              }`}
            >
              {m === 'fundo' ? 'Fundo' : m.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider flex items-center gap-2">
            <List size={14} className="text-[#a78bfa]" />
            <span>Fila de reprodução ({fila.length})</span>
          </h3>
          <button
            type="button"
            onClick={() => setFilaVisivel(!filaVisivel)}
            className="text-[10px] text-purple-400 hover:text-purple-300"
          >
            {filaVisivel ? 'Ocultar' : 'Exibir'}
          </button>
        </div>
        {filaVisivel && fila.length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {fila.map((item, idx) => (
              <div
                key={item.id + idx}
                onClick={() => tocar(item)}
                className="card p-3 flex items-center justify-between border border-[#2a224f] bg-[#120f26] hover:bg-white/5 transition-all rounded-2xl cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#2a224f]">
                    {item.capaUrl ? (
                      <img className="h-full w-full object-cover" src={item.capaUrl} alt="" />
                    ) : (
                      <CapaMusica titulo={item.titulo} tom={item.tom} tamanho="sm" />
                    )}
                  </div>
                  <span className="text-xs font-medium text-white truncate">{item.titulo}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-[#2a224f]">
                    {(item as any).tom || 'C'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {mostrarLetra && temLetra && (
        <div className="bg-[#120f26]/90 border border-[#2a224f] rounded-3xl p-5 backdrop-blur-xl space-y-2">
          <h3 className="text-xs font-semibold text-[#a78bfa] uppercase tracking-wider">Letra da Música</h3>
          <div className="whitespace-pre-wrap font-mono text-xs text-white/80 leading-relaxed max-h-60 overflow-y-auto pr-2">
            {musica?.letra}
          </div>
        </div>
      )}
    </main>
  );
};

export default Player;
