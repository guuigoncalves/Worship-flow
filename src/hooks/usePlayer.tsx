import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Howl } from 'howler';
import { useToast } from './useToast';

export interface FaixaAudio {
  id: string;
  titulo: string;
  artista: string;
  capaUrl?: string;
  audioUrl?: string;
  musicaId?: string;
}

type ModoPlayer = 'normal' | 'fundo' | 'pad' | 'metronomo';

interface PlayerContextValue {
  faixa: FaixaAudio | null;
  fila: FaixaAudio[];
  tocando: boolean;
  progresso: number;
  duracao: number;
  volume: number;
  modo: ModoPlayer;
  tocar: (faixa?: FaixaAudio) => void;
  pausar: () => void;
  seek: (segundos: number) => void;
  setVolume: (volume: number) => void;
  setModo: (modo: ModoPlayer) => void;
  adicionarFila: (faixa: FaixaAudio) => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);
const key = 'worshipflow:player';

export function PlayerProvider({ children }: { children: ReactNode }) {
  const restaurado = useMemo(() => {
    try { return JSON.parse(localStorage.getItem(key) || '{}') as { faixa?: FaixaAudio; progresso?: number; volume?: number; modo?: ModoPlayer }; }
    catch { return {}; }
  }, []);
  const [faixa, setFaixa] = useState<FaixaAudio | null>(restaurado.faixa ?? null);
  const [fila, setFila] = useState<FaixaAudio[]>([]);
  const [tocando, setTocando] = useState(false);
  const [progresso, setProgresso] = useState(restaurado.progresso ?? 0);
  const [duracao, setDuracao] = useState(0);
  const [volume, setVolumeState] = useState(restaurado.volume ?? 0.8);
  const [modo, setModo] = useState<ModoPlayer>(restaurado.modo ?? 'normal');
  const howlRef = useRef<Howl | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify({ faixa, progresso, volume, modo }));
  }, [faixa, progresso, volume, modo]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const howl = howlRef.current;
      if (howl && tocando) setProgresso(Number(howl.seek()) || 0);
    }, 500);
    return () => window.clearInterval(timer);
  }, [tocando]);

  const preparar = useCallback((proxima: FaixaAudio) => {
    howlRef.current?.unload();
    howlRef.current = null;
    if (!proxima.audioUrl) {
      setFaixa(proxima);
      setDuracao(0);
      setProgresso(0);
      setTocando(false);
      showToast('Esta música ainda não tem áudio disponível', 'erro');
      return null;
    }
    const howl = new Howl({
      src: [proxima.audioUrl],
      html5: true,
      volume,
      onload: () => setDuracao(howl.duration()),
      onend: () => setTocando(false)
    });
    howlRef.current = howl;
    setFaixa(proxima);
    return howl;
  }, [volume, showToast]);

  const tocar = useCallback((proxima?: FaixaAudio) => {
    const alvo = proxima ?? faixa;
    if (!alvo) return;
    const howl = proxima ? preparar(alvo) : howlRef.current;
    if (howl) {
      howl.play();
      setTocando(true);
    }
  }, [faixa, preparar]);

  const pausar = useCallback(() => {
    howlRef.current?.pause();
    setTocando(false);
  }, []);

  const seek = useCallback((segundos: number) => {
    const howl = howlRef.current;
    if (!howl) return;
    const alvo = Math.max(0, Math.min(duracao, (Number(howl.seek()) || 0) + segundos));
    howl.seek(alvo);
    setProgresso(alvo);
  }, [duracao]);

  const setVolume = useCallback((valor: number) => {
    setVolumeState(valor);
    howlRef.current?.volume(valor);
  }, []);

  const adicionarFila = useCallback((nova: FaixaAudio) => setFila((atuais) => [...atuais, nova]), []);

  const value = useMemo(() => ({ faixa, fila, tocando, progresso, duracao, volume, modo, tocar, pausar, seek, setVolume, setModo, adicionarFila }), [adicionarFila, duracao, faixa, fila, modo, pausar, progresso, seek, tocar, tocando, volume, setVolume]);
  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used inside PlayerProvider');
  return context;
}
