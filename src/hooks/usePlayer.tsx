import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Howl } from 'howler';
import { useToast } from './useToast';
import type { Tom } from '../types';

export interface FaixaAudio {
  id: string;
  titulo: string;
  artista: string;
  capaUrl?: string;
  audioUrl?: string;
  musicaId?: string;
  tom?: Tom;
}

type ModoPlayer = 'normal' | 'fundo' | 'pad' | 'metronomo';

interface PlayerContextValue {
  faixa: FaixaAudio | null;
  fila: FaixaAudio[];
  tocando: boolean;
  progresso: number;
  duracao: number;
  volume: number;
  volumePercent: number;
  modo: ModoPlayer;
  tocar: (faixa?: FaixaAudio) => void;
  pausar: () => void;
  seek: (segundos: number) => void;
  setVolume: (volume: number) => void;
  setModo: (modo: ModoPlayer) => void;
  adicionarFila: (faixa: FaixaAudio) => void;
  graves: number;
  medios: number;
  agudos: number;
  setGraves: (valor: number) => void;
  setMedios: (valor: number) => void;
  setAgudos: (valor: number) => void;
  boost: '100%' | '150%' | '200%' | '300%';
  setBoost: (valor: '100%' | '150%' | '200%' | '300%') => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);
const key = 'worshipflow:player';
const eqKey = 'worshipflow:player:eq';

const boostValores: Record<'100%' | '150%' | '200%' | '300%', number> = {
  '100%': 1,
  '150%': 1.5,
  '200%': 2,
  '300%': 3,
};

export function PlayerProvider({ children }: { children: ReactNode }) {
  const restaurado = useMemo(() => {
    try { return JSON.parse(localStorage.getItem(key) || '{}') as { faixa?: FaixaAudio; progresso?: number; volume?: number; modo?: ModoPlayer }; }
    catch { return {}; }
  }, []);
  const restauradoEq = useMemo(() => {
    try { return JSON.parse(localStorage.getItem(eqKey) || '{}') as { graves?: number; medios?: number; agudos?: number; boost?: '100%' | '150%' | '200%' | '300%' }; }
    catch { return {}; }
  }, []);
  const [faixa, setFaixa] = useState<FaixaAudio | null>(restaurado.faixa ?? null);
  const [fila, setFila] = useState<FaixaAudio[]>([]);
  const [tocando, setTocando] = useState(false);
  const [progresso, setProgresso] = useState(restaurado.progresso ?? 0);
  const [duracao, setDuracao] = useState(0);
  const [volume, setVolumeState] = useState(() => Math.round((restaurado.volume ?? 0.8) * 100));
  const [modo, setModo] = useState<ModoPlayer>(restaurado.modo ?? 'normal');
  const volumePercent = Math.max(0, Math.min(300, volume));
  const howlVolume = volumePercent <= 100 ? volumePercent / 100 : 1;
  const boostVolume = volumePercent > 100 ? volumePercent / 100 : 1;
  const [graves, setGravesState] = useState(restauradoEq.graves ?? 0);
  const [medios, setMediosState] = useState(restauradoEq.medios ?? 0);
  const [agudos, setAgudosState] = useState(restauradoEq.agudos ?? 0);
  const [boost, setBoostState] = useState<'100%' | '150%' | '200%' | '300%'>(restauradoEq.boost ?? '100%');
  const howlRef = useRef<Howl | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gravesFilterRef = useRef<BiquadFilterNode | null>(null);
  const mediosFilterRef = useRef<BiquadFilterNode | null>(null);
  const agudosFilterRef = useRef<BiquadFilterNode | null>(null);
  const compressorRef = useRef<DynamicsCompressorNode | null>(null);
  const boostGainRef = useRef<GainNode | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify({ faixa, progresso, volume: volume / 100, modo }));
  }, [faixa, progresso, volume, modo]);

  useEffect(() => {
    localStorage.setItem(eqKey, JSON.stringify({ graves, medios, agudos, boost }));
  }, [graves, medios, agudos, boost]);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const configurarEqualizador = useCallback((howl: Howl) => {
    try {
      const ctx = getAudioContext();
      const audioElement = (howl as any)?._sounds?.[0]?._node as HTMLAudioElement | undefined;
      if (!audioElement) return false;

      if (sourceRef.current) {
        try { sourceRef.current.disconnect(); } catch {}
        sourceRef.current = null;
      }

      const source = ctx.createMediaElementSource(audioElement);
      sourceRef.current = source;

      const gravesFilter = ctx.createBiquadFilter();
      gravesFilter.type = 'lowshelf';
      gravesFilter.frequency.value = 100;
      gravesFilter.gain.value = graves;

      const mediosFilter = ctx.createBiquadFilter();
      mediosFilter.type = 'peaking';
      mediosFilter.frequency.value = 1000;
      mediosFilter.Q.value = 1;
      mediosFilter.gain.value = medios;

      const agudosFilter = ctx.createBiquadFilter();
      agudosFilter.type = 'highshelf';
      agudosFilter.frequency.value = 8000;
      agudosFilter.gain.value = agudos;

      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -24;
      compressor.knee.value = 30;
      compressor.ratio.value = 12;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.25;

      const boostGain = ctx.createGain();
      boostGain.gain.value = boostValores[boost];

      source.connect(gravesFilter);
      gravesFilter.connect(mediosFilter);
      mediosFilter.connect(agudosFilter);
      agudosFilter.connect(compressor);
      compressor.connect(boostGain);
      boostGain.connect(ctx.destination);

      gravesFilterRef.current = gravesFilter;
      mediosFilterRef.current = mediosFilter;
      agudosFilterRef.current = agudosFilter;
      compressorRef.current = compressor;
      boostGainRef.current = boostGain;

      return true;
    } catch (e) {
      console.warn('Falha ao configurar equalizador:', e);
      return false;
    }
  }, [getAudioContext, graves, medios, agudos, boost]);

  const atualizarFiltros = useCallback(() => {
    if (gravesFilterRef.current) gravesFilterRef.current.gain.value = graves;
    if (mediosFilterRef.current) mediosFilterRef.current.gain.value = medios;
    if (agudosFilterRef.current) agudosFilterRef.current.gain.value = agudos;
    if (boostGainRef.current) boostGainRef.current.gain.value = boostValores[boost];
  }, [graves, medios, agudos, boost]);

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
      volume: volumePercent <= 100 ? volumePercent / 100 : 1,
      onload: () => setDuracao(howl.duration()),
      onend: () => setTocando(false)
    });
    howlRef.current = howl;
    setFaixa(proxima);

    const configurou = configurarEqualizador(howl);
    if (!configurou) {
      howl.once('load', () => configurarEqualizador(howl));
    }

    if (boostGainRef.current) {
      boostGainRef.current.gain.value = volumePercent > 100 ? volumePercent / 100 : 1;
    }

    return howl;
  }, [volumePercent, showToast, configurarEqualizador]);

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
    const percentual = Math.max(0, Math.min(300, Math.round(valor)));
    setVolumeState(percentual);
    const howlVolume = percentual <= 100 ? percentual / 100 : 1;
    const boostGain = percentual > 100 ? percentual / 100 : 1;
    howlRef.current?.volume(howlVolume);
    if (boostGainRef.current) boostGainRef.current.gain.value = boostGain;
  }, []);

  const adicionarFila = useCallback((nova: FaixaAudio) => setFila((atuais) => [...atuais, nova]), []);

  const setGraves = useCallback((valor: number) => {
    setGravesState(valor);
    if (gravesFilterRef.current) gravesFilterRef.current.gain.value = valor;
  }, []);

  const setMedios = useCallback((valor: number) => {
    setMediosState(valor);
    if (mediosFilterRef.current) mediosFilterRef.current.gain.value = valor;
  }, []);

  const setAgudos = useCallback((valor: number) => {
    setAgudosState(valor);
    if (agudosFilterRef.current) agudosFilterRef.current.gain.value = valor;
  }, []);

  const setBoost = useCallback((valor: '100%' | '150%' | '200%' | '300%') => {
    setBoostState(valor);
    if (boostGainRef.current) boostGainRef.current.gain.value = boostValores[valor];
  }, []);

  const value = useMemo(() => ({ faixa, fila, tocando, progresso, duracao, volume, volumePercent, modo, tocar, pausar, seek, setVolume, setModo, adicionarFila, graves, medios, agudos, setGraves, setMedios, setAgudos, boost, setBoost }), [adicionarFila, agudos, boost, duracao, faixa, fila, graves, medios, modo, pausar, progresso, seek, setAgudos, setGraves, setMedios, setBoost, setModo, setVolume, tocar, tocando, volume, volumePercent]);
  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used inside PlayerProvider');
  return context;
}
