import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import type { FilaReproducao } from '../types';
import { lerLocalStorage, salvarLocalStorage } from '../utils/storage';

const filaPadrao: FilaReproducao = { atual: null, proximas: [], anteriores: [] };
const localKey = 'worshipflow:fila';

interface FilaContextValue {
  fila: FilaReproducao;
  tocarAgora: (musicaId: string) => void;
  adicionarFila: (musicaId: string) => void;
  proxima: () => string | null;
  anterior: () => string | null;
  limparFila: () => void;
}

const FilaContext = createContext<FilaContextValue | null>(null);

export function FilaProvider({ children }: { children: ReactNode }) {
  const [fila, setFila] = useState<FilaReproducao>(() => lerLocalStorage(localKey, filaPadrao));

  const salvar = useCallback((proximaFila: FilaReproducao) => {
    setFila(proximaFila);
    salvarLocalStorage(localKey, proximaFila);
  }, []);

  const tocarAgora = useCallback(
    (musicaId: string) => {
      salvar({
        atual: musicaId,
        proximas: fila.atual ? [fila.atual, ...fila.proximas.filter((id) => id !== musicaId)] : fila.proximas.filter((id) => id !== musicaId),
        anteriores: fila.anteriores
      });
    },
    [fila, salvar]
  );

  const adicionarFila = useCallback(
    (musicaId: string) => {
      if (fila.atual === musicaId || fila.proximas.includes(musicaId)) return;
      salvar({ ...fila, atual: fila.atual ?? musicaId, proximas: fila.atual ? [...fila.proximas, musicaId] : fila.proximas });
    },
    [fila, salvar]
  );

  const proxima = useCallback(() => {
    const [primeira, ...resto] = fila.proximas;
    if (!primeira) return null;
    salvar({ atual: primeira, proximas: resto, anteriores: fila.atual ? [fila.atual, ...fila.anteriores].slice(0, 20) : fila.anteriores });
    return primeira;
  }, [fila, salvar]);

  const anterior = useCallback(() => {
    const [ultima, ...resto] = fila.anteriores;
    if (!ultima) return null;
    salvar({ atual: ultima, anteriores: resto, proximas: fila.atual ? [fila.atual, ...fila.proximas] : fila.proximas });
    return ultima;
  }, [fila, salvar]);

  const limparFila = useCallback(() => salvar(filaPadrao), [salvar]);

  const value = useMemo(() => ({ fila, tocarAgora, adicionarFila, proxima, anterior, limparFila }), [adicionarFila, anterior, fila, limparFila, proxima, tocarAgora]);
  return <FilaContext.Provider value={value}>{children}</FilaContext.Provider>;
}

export function useFila() {
  const context = useContext(FilaContext);
  if (!context) throw new Error('useFila must be used inside FilaProvider');
  return context;
}
