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
      <main className="app-page space-y-6 pb-32 fade-in bg-[#080711] min-h-screen px-4 pt-4 text-white">
      <header className="flex items-center justify-between pt-1">
      <button
      onClick={() => navigate(-1)}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-[#130d2a] border border-[#271d4a] text-white hover:bg-white/10 transition-colors"
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
    <main className="app-page space-y-4 pb-24 fade-in max-w-md mx-auto bg-gradient-to-b from-[#120c2a] via-[#080711] to-[#080711] min-h-screen px-4 pt-3 text-white">
    {/* Header Superior */}
    <header className="flex items-center justify-between pt-1">
    <button
    onClick={() => navigate(-1)}
    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#130d2a] border border-[#271d4a] text-white/90 hover:bg-white/10 transition-colors"
    type="button"
    aria-label="Voltar"
    >
    <ArrowLeft className="w-5 h-5" />
    </button>
    <h1 className="text-sm font-medium text-white/90">Player</h1>
    <button
    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#130d2a] border border-[#271d4a] text-white/90 hover:bg-white/10 transition-colors"
    type="button"
    aria-label="Mais opções"
    >
    <MoreVertical className="w-5 h-5" />
    </button>
    </header>

    {/* Capa do Álbum (Tamanho Otimizado ~220px) */}
    <div className="pt-1 flex justify-center">
    <div className="relative w-56 h-56">
    {/* Glow Roxo de Fundo */}
    <div
    className="absolute -inset-3 rounded-3xl blur-2xl opacity-35 pointer-events-none transition-all duration-700"
    style={{
      background: tocando
      ? 'radial-gradient(circle, #7c3aed 0%, #4c1d95 60%, transparent 100%)'
      : 'radial-gradient(circle, #4c1d95 0%, transparent 70%)',
    }}
    />

    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-[#2a1e50] shadow-2xl bg-[#0d091e]">
    {faixa.capaUrl ? (
      <img className="h-full w-full object-cover" src={faixa.capaUrl} alt={faixa.titulo} />
    ) : (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1d1340] via-[#100b28] to-[#080614]">
      <Music className="w-16 h-16 text-[#8b5cf6]/60" />
      </div>
    )}
    </div>
    </div>
    </div>

    {/* Informações da Música: Título, Artista, Coração e Tom */}
    <div className="pt-1 space-y-1.5">
    <div className="flex items-start justify-between gap-3">
    <div className="min-w-0 flex-1">
    <h2 className="text-lg font-bold text-white truncate tracking-tight">{faixa.titulo}</h2>
    <p className="text-xs text-white/60 truncate mt-0.5">{faixa.artista || 'Artista não informado'}</p>
    </div>
    <button
    type="button"
    onClick={() => setFavorito(!favorito)}
    className="p-1 text-white/70 hover:text-red-400 transition-colors shrink-0"
    aria-label="Favorito"
    >
    <Heart className={`w-5 h-5 ${favorito ? 'text-red-500 fill-red-500' : ''}`} />
    </button>
    </div>

    {/* Tag do Tom */}
    <div>
    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#1d123d] border border-[#3b2770] text-purple-200 text-xs font-medium">
    <span className="font-semibold">{faixaTom}</span>
    <span className="text-white/50 text-[10px]">Tom</span>
    </span>
    </div>
    </div>

    {/* Barra de Progresso e Tempos */}
    <div className="space-y-1 pt-1">
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
    <div className="flex justify-between text-[10px] font-mono text-white/40">
    <span>{formatarTempo(progresso)}</span>
    <span>{formatarTempo(duracao)}</span>
    </div>
    </div>

    {/* Controles do Player */}
    <div className="flex items-center justify-between px-2 pt-1">
    <button
    type="button"
    onClick={() => setShuffleAtivo(!shuffleAtivo)}
    className={`p-2 transition-colors ${shuffleAtivo ? 'text-[#a78bfa]' : 'text-white/40 hover:text-white'}`}
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

    {/* Botão Play/Pause Central em Círculo */}
    <button
    type="button"
    onClick={() => (tocando ? pausar() : tocar(faixa))}
    className="h-14 w-14 rounded-full bg-gradient-to-tr from-[#6d28d9] to-[#8b5cf6] text-white flex items-center justify-center shadow-[0_0_25px_rgba(139,92,246,0.5)] hover:scale-105 active:scale-95 transition-all"
    >
    {tocando ? (
      <Pause size={24} fill="currentColor" />
    ) : (
      <Play size={24} fill="currentColor" className="ml-1" />
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
    className={`p-2 transition-colors ${repeatAtivo ? 'text-[#a78bfa]' : 'text-white/40 hover:text-white'}`}
    title="Repetir"
    >
    <Repeat size={18} />
    </button>
    </div>

    {/* Controle de Volume */}
    <div className="flex items-center gap-3 px-1 pt-1">
    <button
    type="button"
    onClick={() => setVolume(volume === 0 ? 0.8 : 0)}
    className="text-white/40 hover:text-white transition-colors shrink-0"
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
    className="text-white/40 hover:text-white transition-colors shrink-0"
    >
    <Volume2 size={18} />
    </button>
    </div>

    {/* Modo de Reprodução (4 cards lado a lado) */}
    <div className="space-y-1.5 pt-2">
    <h3 className="text-xs font-medium text-white/60">Modo de reprodução</h3>
    <div className="grid grid-cols-4 gap-2">
    {modos.map((m) => {
      const Icon = m.icon;
      const ativo = modo === m.id;
      return (
        <button
        key={m.id}
        type="button"
        onClick={() => setModo(modo === m.id ? 'normal' : m.id)}
        className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl border transition-all duration-200 gap-1 ${
          ativo
          ? 'bg-[#25154d] border-[#8b5cf6] text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]'
          : 'bg-[#130d2a]/80 border-[#251c4a] text-white/40 hover:text-white/80 hover:bg-[#1a1238]'
        }`}
        >
        <Icon size={16} className={ativo ? 'text-[#a78bfa]' : 'text-white/40'} />
        <span className="text-[11px] font-medium">{m.label}</span>
        </button>
      );
    })}
    </div>
    </div>

    {/* Fila de Reprodução */}
    <div className="space-y-2 pt-2">
    <div className="flex items-center justify-between">
    <h3 className="text-xs font-medium text-white/60">Fila de reprodução</h3>
    {fila.length > 0 ? (
      <button
      type="button"
      onClick={() => {}}
      className="text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors"
      >
      Limpar fila
      </button>
    ) : (
      <span className="text-xs text-white/40 font-normal">Fila vazia</span>
    )}
    </div>

    {fila.length > 0 && (
      <div className="space-y-2">
      {fila.map((item, idx) => {
        const eAtiva = item.id === faixa.id;
        const itemTom = (item as any)?.tom || 'D';
      return (
        <div
        key={item.id + idx}
        onClick={() => tocar(item)}
        className={`p-2 flex items-center justify-between border rounded-2xl transition-all cursor-pointer ${
          eAtiva
          ? 'bg-[#1e133c] border-[#8b5cf6]/60 shadow-md shadow-purple-950/40'
          : 'bg-[#130d2a]/70 border-[#251c4a] hover:bg-[#1a1238]'
        }`}
        >
        <div className="flex items-center gap-3 min-w-0">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-[#2a1e50] bg-[#0d091e]">
        {item.capaUrl ? (
          <img className="h-full w-full object-cover" src={item.capaUrl} alt="" />
        ) : (
          <CapaMusica titulo={item.titulo} tom={itemTom} tamanho="sm" />
        )}
        </div>
        <div className="min-w-0">
        <p className={`text-xs font-medium truncate ${eAtiva ? 'text-white font-semibold' : 'text-white/80'}`}>
        {item.titulo}
        </p>
        <p className="text-[11px] text-white/40 truncate mt-0.5">
        {item.artista || 'Artista não informado'}
        </p>
        </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 pl-2">
        {eAtiva && tocando ? (
          <div className="flex items-end gap-0.5 h-3.5 px-1">
          <span className="w-0.5 h-2.5 bg-[#a78bfa] rounded-full animate-pulse" />
          <span className="w-0.5 h-3.5 bg-[#8b5cf6] rounded-full animate-bounce" />
          <span className="w-0.5 h-2 bg-[#a78bfa] rounded-full animate-pulse" />
          </div>
        ) : (
          <GripVertical size={16} className="text-white/20 hover:text-white/50" />
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
