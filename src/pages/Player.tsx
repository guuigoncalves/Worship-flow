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
  GripVertical,
  Zap,
  SlidersHorizontal
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
    volumePercent,
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
  const [mostrarMixer, setMostrarMixer] = React.useState(false);

  const formatarTempo = (segundos: number) => {
    if (!segundos || isNaN(segundos)) return '00:00';
    const min = Math.floor(segundos / 60);
    const seg = Math.floor(segundos % 60);
    return `${min < 10 ? '0' : ''}${min}:${seg < 10 ? '0' : ''}${seg}`;
  };

  if (!faixa) {
    return (
      <main
      className="app-page space-y-6 pb-32 fade-in min-h-screen px-4 pt-4 text-white"
      style={{ backgroundColor: '#080710' }}
      >
      <header className="flex items-center justify-between pt-1">
      <button
      onClick={() => navigate(-1)}
      className="flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors"
      style={{ backgroundColor: 'var(--superficie)', borderColor: 'var(--borda)', borderWidth: '1px' }}
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
      <main
      className="app-page space-y-4 pb-20 fade-in max-w-md mx-auto min-h-screen px-4 pt-3 text-white"
      style={{
        backgroundColor: '#080710',
        backgroundImage: 'radial-gradient(ellipse at top, #140d33 0%, #080710 70%)',
      }}
      >
      {/* Header Superior */}
      <header className="flex items-center justify-between pt-1">
      <button
      onClick={() => navigate(-1)}
      className="flex h-9 w-9 items-center justify-center rounded-full text-white/90 hover:bg-white/10 transition-colors"
      style={{ backgroundColor: 'var(--superficie)', borderColor: 'var(--borda)', borderWidth: '1px' }}
      type="button"
      aria-label="Voltar"
      >
      <ArrowLeft className="w-5 h-5" />
      </button>
      <h1 className="text-sm font-medium text-white/90">Player</h1>
      <button
      onClick={() => setMostrarMixer(!mostrarMixer)}
      className="flex h-9 w-9 items-center justify-center rounded-full text-white/90 hover:bg-white/10 transition-colors"
      style={{ backgroundColor: mostrarMixer ? '#7c3aed' : 'var(--superficie)', borderColor: 'var(--borda)', borderWidth: '1px' }}
      type="button"
      aria-label="Mixer de Áudio"
      title="Mixer & Stems"
      >
      <SlidersHorizontal className="w-4 h-4" />
      </button>
      </header>

      {/* Capa do Álbum - Tamanho 160px */}
      <div className="pt-1 flex justify-center">
      <div className="relative shrink-0" style={{ width: '160px', height: '160px' }}>
      {/* Glow Roxo de Fundo */}
      <div
      className="absolute -inset-3 rounded-3xl blur-xl opacity-40 pointer-events-none transition-all duration-700"
      style={{
        background: tocando
        ? 'radial-gradient(circle, #7c3aed 0%, #4c1d95 60%, transparent 100%)'
        : 'radial-gradient(circle, #4c1d95 0%, transparent 70%)',
      }}
      />

      <div
      className="relative h-full w-full overflow-hidden rounded-2xl shadow-2xl"
      style={{ backgroundColor: '#0d091e', borderColor: '#281b52', borderWidth: '1px' }}
      >
      {faixa.capaUrl ? (
        <img className="h-full w-full object-cover" src={faixa.capaUrl} alt={faixa.titulo} />
      ) : (
        <div
        className="flex h-full w-full items-center justify-center"
        style={{ backgroundImage: 'linear-gradient(to bottom right, #1c123d, #0f0a26, #070512)' }}
        >
        <Music className="w-12 h-12 text-[#8b5cf6]/50" />
        </div>
      )}
      </div>
      </div>
      </div>

      {/* Informações da Música: Título, Artista e Coração (SEM a tag de Tom) */}
      <div className="pt-1 space-y-1">
      <div className="flex items-center justify-between gap-3">
      <div className="min-w-0 flex-1">
      <h2 className="text-lg font-bold text-white truncate tracking-tight">{faixa.titulo}</h2>
      <p className="text-xs text-[#9388b6] truncate mt-0.5">{faixa.artista || 'Artista não informado'}</p>
      </div>
      <button
      type="button"
      onClick={() => setFavorito(!favorito)}
      className="p-1 text-[#9388b6] hover:text-red-400 transition-colors shrink-0"
      aria-label="Favorito"
      >
      <Heart className={`w-5 h-5 ${favorito ? 'text-red-500 fill-red-500' : ''}`} />
      </button>
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
      <div className="flex justify-between text-[10px] font-mono text-[#796e9c]">
      <span>{formatarTempo(progresso)}</span>
      <span>{formatarTempo(duracao)}</span>
      </div>
      </div>

      {/* Controles do Player */}
      <div className="flex items-center justify-between px-2 pt-1">
      <button
      type="button"
      onClick={() => setShuffleAtivo(!shuffleAtivo)}
      className={`p-2 transition-colors ${shuffleAtivo ? 'text-[#a78bfa]' : 'text-[#796e9c] hover:text-white'}`}
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
      className={`p-2 transition-colors ${repeatAtivo ? 'text-[#a78bfa]' : 'text-[#796e9c] hover:text-white'}`}
      title="Repetir"
      >
      <Repeat size={18} />
      </button>
      </div>

      {/* Controle de Volume com Amplificador BOOST 300% */}
      <div className="flex items-center gap-2.5 px-1 pt-1">
      <button
      type="button"
      onClick={() => setVolume(volumePercent === 0 ? 80 : 0)}
      className="text-[#796e9c] hover:text-white transition-colors shrink-0"
      >
      <Volume1 size={18} />
      </button>
      <input
      type="range"
      min={0}
      max={300}
      step={1}
      value={volumePercent}
      onChange={(e) => setVolume(Number(e.target.value))}
      className="flex-1 h-1 rounded-lg cursor-pointer"
      style={{
        accentColor: volumePercent > 100 ? '#7c3aed' : '#8b5cf6',
        background: 'linear-gradient(to right, rgba(139,92,246,0.35) 0%, rgba(139,92,246,0.35) 100%)',
      }}
      />
      <button
      type="button"
      onClick={() => setVolume(100)}
      className="text-[#796e9c] hover:text-white transition-colors shrink-0"
      >
      <Volume2 size={18} />
      </button>

      <span
      className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all shrink-0 ${
        volumePercent > 100 ? 'text-amber-300' : 'text-[#796e9c]'
      }`}
      style={{
        backgroundColor: volumePercent > 100 ? '#7c3aed' : 'var(--superficie)',
        borderColor: 'var(--borda)',
        borderWidth: '1px',
        boxShadow: volumePercent > 100 ? '0 0 10px rgba(124,58,237,0.5)' : 'none',
      }}
      >
      {volumePercent > 100 && <Zap size={10} className="fill-current" />}
      <span>{volumePercent > 100 ? `${volumePercent}% ⚡` : `${volumePercent}%`}</span>
      </span>
      </div>

      {/* Modo de Reprodução (4 cards lado a lado) */}
      <div className="space-y-1.5 pt-2">
      <h3 className="text-xs font-medium text-[#9388b6]">Modo de reprodução</h3>
      <div className="grid grid-cols-4 gap-2">
      {modos.map((m) => {
        const Icon = m.icon;
        const ativo = modo === m.id;
        return (
          <button
          key={m.id}
          type="button"
          onClick={() => setModo(modo === m.id ? 'normal' : m.id)}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 gap-1 ${
            ativo
            ? 'text-white shadow-[0_0_15px_rgba(139,92,246,0.35)]'
            : 'text-[#8c82ab] hover:text-white'
          }`}
          style={{
            backgroundColor: ativo ? '#291757' : 'var(--superficie)',
            borderColor: ativo ? '#8b5cf6' : 'var(--borda)',
            borderWidth: '1px',
          }}
          >
          <Icon size={16} className={ativo ? 'text-[#a78bfa]' : 'text-[#8c82ab]'} />
          <span className="text-[11px] font-medium">{m.label}</span>
          </button>
        );
      })}
      </div>
      </div>

      {/* Fila de Reprodução */}
      <div className="space-y-2 pt-2">
      <div className="flex items-center justify-between">
      <h3 className="text-xs font-medium text-[#9388b6]">Fila de reprodução</h3>
      {fila.length > 0 ? (
        <button
        type="button"
        onClick={() => {}}
        className="text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors"
        >
        Limpar fila
        </button>
      ) : (
        <span className="text-xs text-[#625785] font-normal">Fila vazia</span>
      )}
      </div>

      {fila.length > 0 && (
        <div className="space-y-2">
        {fila.map((item, idx) => {
          const eAtiva = item.id === faixa.id;
          const itemTom = (item as any)?.tom;
          return (
            <div
            key={item.id + idx}
            onClick={() => tocar(item)}
            className="p-2 flex items-center justify-between rounded-2xl transition-all cursor-pointer"
            style={{
              backgroundColor: eAtiva ? '#1d123d' : 'var(--superficie)',
              borderColor: eAtiva ? '#8b5cf6' : 'var(--borda)',
              borderWidth: '1px',
            }}
            >
            <div className="flex items-center gap-3 min-w-0">
            <div
            className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl"
            style={{ backgroundColor: '#0d091e', borderColor: '#281b52', borderWidth: '1px' }}
            >
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
            <p className="text-[11px] text-[#8c82ab] truncate mt-0.5">
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
