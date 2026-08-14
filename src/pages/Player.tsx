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
  Volume1,
  Volume2,
  Music,
  ArrowLeft,
  Heart,
  MoreVertical,
  Shuffle,
  Repeat,
  Users,
  Sliders,
  Bell,
  GripVertical
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
  const [favorito, setFavorito] = React.useState(false);
  const [shuffleAtivo, setShuffleAtivo] = React.useState(false);
  const [repeatAtivo, setRepeatAtivo] = React.useState(false);

  const formatarTempo = (segundos: number) => {
    if (!segundos || isNaN(segundos)) return '00:00';
    const min = Math.floor(segundos / 60);
    const seg = Math.floor(segundos % 60);
    return `${min < 10 ? '0' : ''}${min}:${seg < 10 ? '0' : ''}${seg}`;
  };

  if (!faixa) {
    return (
      <main className="app-page space-y-6 pb-32 fade-in bg-gradient-to-b from-[#16102e] via-[#0a0814] to-[#0a0814] min-h-screen px-4 pt-4">
      <header className="flex items-center justify-between pt-1">
      <button
      onClick={() => navigate(-1)}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-[#16122c]/80 border border-[#2d2454] text-white hover:bg-white/10 transition-colors"
      type="button"
      aria-label="Voltar"
      >
      <ArrowLeft className="w-5 h-5" />
      </button>
      <h1 className="text-sm font-semibold text-white/90">Player</h1>
      <div className="w-10" />
      </header>
      <EstadoVazio
      titulo="Nenhuma faixa em reprodução"
      texto="Selecione uma música no Hub Música ou na Biblioteca para tocar aqui."
      />
      </main>
    );
  }

  const faixaTom = (faixa as any)?.tom || 'C';
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

  const modos = [
    { id: 'normal', label: 'Normal', icon: Music },
    { id: 'fundo', label: 'Fundo', icon: Users },
    { id: 'pad', label: 'Pad', icon: Sliders },
    { id: 'metronomo', label: 'Metrônomo', icon: Bell },
  ] as const;

  return (
    <main className="app-page space-y-5 pb-28 fade-in max-w-md mx-auto bg-gradient-to-b from-[#181136] via-[#0c0919] to-[#080612] min-h-screen px-4 pt-3 text-white">
    {/* Top Header */}
    <header className="flex items-center justify-between pt-1">
    <button
    onClick={() => navigate(-1)}
    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#181335]/60 border border-[#2e2353] text-white/90 hover:bg-white/10 transition-colors"
    type="button"
    aria-label="Voltar"
    >
    <ArrowLeft className="w-5 h-5" />
    </button>
    <h1 className="text-sm font-medium text-white/90">Player</h1>
    <button
    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#181335]/60 border border-[#2e2353] text-white/90 hover:bg-white/10 transition-colors"
    type="button"
    aria-label="Mais opções"
    >
    <MoreVertical className="w-5 h-5" />
    </button>
    </header>

    {/* Album Artwork Card */}
    <div className="pt-2 flex justify-center">
    <div className="relative w-full aspect-square max-w-[320px]">
    {/* Ambient Purple Glow */}
    <div
    className="absolute -inset-4 rounded-3xl blur-2xl opacity-40 pointer-events-none transition-all duration-700"
    style={{
      background: tocando
      ? 'radial-gradient(circle, #7c3aed 0%, #4c1d95 60%, transparent 100%)'
      : 'radial-gradient(circle, #4c1d95 0%, transparent 70%)',
    }}
    />

    <div className="relative h-full w-full overflow-hidden rounded-3xl border border-[#32255d]/60 shadow-2xl bg-[#140e2d]">
    {faixa.capaUrl ? (
      <img className="h-full w-full object-cover" src={faixa.capaUrl} alt={faixa.titulo} />
    ) : (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#24174d] via-[#150f33] to-[#0c081f]">
      <Music className="w-20 h-20 text-[#8b5cf6]/60" />
      </div>
    )}
    </div>
    </div>
    </div>

    {/* Title, Artist, Heart & Tom Badge */}
    <div className="pt-2 space-y-2">
    <div className="flex items-start justify-between gap-3">
    <div className="min-w-0 flex-1">
    <h2 className="text-xl font-semibold text-white truncate tracking-tight">{faixa.titulo}</h2>
    <p className="text-sm text-white/60 truncate mt-0.5">{faixa.artista || 'Artista não informado'}</p>
    </div>
    <button
    type="button"
    onClick={() => setFavorito(!favorito)}
    className="p-1.5 text-white/70 hover:text-red-400 transition-colors mt-0.5 shrink-0"
    aria-label="Favorito"
    >
    <Heart className={`w-6 h-6 ${favorito ? 'text-red-500 fill-red-500' : ''}`} />
    </button>
    </div>

    {/* Tom Badge Pill */}
    <div>
    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#271952]/80 border border-[#4c3585] text-purple-200 text-xs font-medium tracking-wide">
    <span className="font-semibold">{faixaTom}</span>
    <span className="text-white/50 text-[10px]">Tom</span>
    </span>
    </div>
    </div>

    {/* Progress Bar & Timers */}
    <div className="space-y-1.5 pt-1">
    <div
    className="relative h-1.5 w-full bg-white/10 rounded-full cursor-pointer group"
    onClick={(e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = x / rect.width;
      seek(pct * duracao);
    }}
    >
    <div
    className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-[#a78bfa] to-[#7c3aed] transition-all duration-100"
    style={{ width: `${progPercent}%` }}
    >
    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md scale-0 group-hover:scale-100 transition-transform" />
    </div>
    </div>
    <div className="flex justify-between text-[11px] font-mono text-white/50">
    <span>{formatarTempo(progresso)}</span>
    <span>{formatarTempo(duracao)}</span>
    </div>
    </div>

    {/* Playback Controls */}
    <div className="flex items-center justify-between px-2 pt-1">
    <button
    type="button"
    onClick={() => setShuffleAtivo(!shuffleAtivo)}
    className={`p-2 transition-colors ${shuffleAtivo ? 'text-[#a78bfa]' : 'text-white/50 hover:text-white'}`}
    title="Aleatório"
    >
    <Shuffle size={18} />
    </button>

    <button
    type="button"
    onClick={handlePrev}
    className="p-2 text-white/80 hover:text-white transition-colors"
    title="Anterior"
    >
    <SkipBack size={22} fill="currentColor" />
    </button>

    {/* Central Circular Play/Pause Button */}
    <button
    type="button"
    onClick={() => (tocando ? pausar() : tocar(faixa))}
    className="h-16 w-16 rounded-full bg-gradient-to-tr from-[#6d28d9] to-[#8b5cf6] text-white flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:scale-105 active:scale-95 transition-all"
    >
    {tocando ? (
      <Pause size={26} fill="currentColor" />
    ) : (
      <Play size={26} fill="currentColor" className="ml-1" />
    )}
    </button>

    <button
    type="button"
    onClick={handleNext}
    className="p-2 text-white/80 hover:text-white transition-colors"
    title="Próximo"
    >
    <SkipForward size={22} fill="currentColor" />
    </button>

    <button
    type="button"
    onClick={() => setRepeatAtivo(!repeatAtivo)}
    className={`p-2 transition-colors ${repeatAtivo ? 'text-[#a78bfa]' : 'text-white/50 hover:text-white'}`}
    title="Repetir"
    >
    <Repeat size={18} />
    </button>
    </div>

    {/* Volume Bar */}
    <div className="flex items-center gap-3 px-1 pt-1">
    <button
    type="button"
    onClick={() => setVolume(volume === 0 ? 0.8 : 0)}
    className="text-white/50 hover:text-white transition-colors shrink-0"
    >
    <Volume1 size={18} />
    </button>
    <input
    type="range"
    min={0}
    max={1}
    step={0.01}
    value={volume}
    onChange={(e) => setVolume(Number(e.target.value))}
    className="flex-1 accent-[#8b5cf6] h-1 bg-white/10 rounded-lg cursor-pointer"
    />
    <button
    type="button"
    onClick={() => setVolume(1)}
    className="text-white/50 hover:text-white transition-colors shrink-0"
    >
    <Volume2 size={18} />
    </button>
    </div>

    {/* Modo de Reprodução (4 horizontal cards) */}
    <div className="space-y-2 pt-2">
    <h3 className="text-xs font-medium text-white/70">Modo de reprodução</h3>
    <div className="grid grid-cols-4 gap-2">
    {modos.map((m) => {
      const Icon = m.icon;
      const ativo = modo === m.id;
      return (
        <button
        key={m.id}
        type="button"
        onClick={() => setModo(modo === m.id ? 'normal' : m.id)}
        className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl border transition-all duration-200 gap-1.5 ${
          ativo
          ? 'bg-[#291757] border-[#8b5cf6] text-white shadow-lg shadow-purple-900/40'
          : 'bg-[#120e26]/60 border-[#2b214f]/80 text-white/50 hover:text-white/80 hover:bg-[#181335]'
        }`}
        >
        <Icon size={18} className={ativo ? 'text-[#a78bfa]' : 'text-white/50'} />
        <span className="text-[11px] font-medium">{m.label}</span>
        </button>
      );
    })}
    </div>
    </div>

    {/* Fila de Reprodução */}
    <div className="space-y-2.5 pt-2">
    <div className="flex items-center justify-between">
    <h3 className="text-xs font-medium text-white/70">Fila de reprodução</h3>
    {fila.length > 0 && (
      <button
      type="button"
      onClick={() => {}}
      className="text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors"
      >
      Limpar fila
      </button>
    )}
    </div>

    {fila.length === 0 ? (
      <div className="p-4 rounded-2xl bg-[#120e26]/40 border border-[#2b214f]/60 text-center text-xs text-white/40">
      Fila vazia
      </div>
    ) : (
      <div className="space-y-2">
      {fila.map((item, idx) => {
        const eAtiva = item.id === faixa.id;
        const itemTom = (item as any)?.tom || 'D';
      return (
        <div
        key={item.id + idx}
        onClick={() => tocar(item)}
        className={`p-2.5 flex items-center justify-between border rounded-2xl transition-all cursor-pointer ${
          eAtiva
          ? 'bg-[#211545]/90 border-[#8b5cf6]/60 shadow-md shadow-purple-950/50'
          : 'bg-[#120e26]/70 border-[#291f4a]/70 hover:bg-[#1a1436]'
        }`}
        >
        <div className="flex items-center gap-3 min-w-0">
        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-[#32255d]/80 bg-[#171033]">
        {item.capaUrl ? (
          <img className="h-full w-full object-cover" src={item.capaUrl} alt="" />
        ) : (
          <CapaMusica titulo={item.titulo} tom={itemTom} tamanho="sm" />
        )}
        </div>
        <div className="min-w-0">
        <p className={`text-xs font-medium truncate ${eAtiva ? 'text-white font-semibold' : 'text-white/90'}`}>
        {item.titulo}
        </p>
        <p className="text-[11px] text-white/50 truncate mt-0.5">
        {item.artista || 'Artista não informado'}
        </p>
        </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 pl-2">
        {eAtiva && tocando ? (
          /* Equalizer Animated Wave Bars */
          <div className="flex items-end gap-0.5 h-4 px-1">
          <span className="w-0.5 h-3 bg-[#a78bfa] rounded-full animate-pulse" />
          <span className="w-0.5 h-4 bg-[#8b5cf6] rounded-full animate-bounce" />
          <span className="w-0.5 h-2 bg-[#a78bfa] rounded-full animate-pulse" />
          </div>
        ) : (
          <GripVertical size={16} className="text-white/30 hover:text-white/60" />
        )}
        </div>
        </div>
      );
      })}
      </div>
    )}
    </div>
    </main>
  );
};

export default Player;
