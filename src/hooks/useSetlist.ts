import { useCallback, useEffect, useState } from 'react';
import type { MusicaEspaco, Tom } from '../types';

const SETLIST_KEY = 'worshipflow:setlist';

interface SetlistItem extends MusicaEspaco {
  ordem: number;
}

interface UseSetlistOptions {
  cultoId: string;
}

interface UseSetlistValue {
  setlist: SetlistItem[];
  adicionarMusicaAoCulto: (musica: MusicaEspaco, tom?: Tom) => void;
  removerMusicaDoCulto: (musicaId: string) => void;
  alterarTomMusicaCulto: (musicaId: string, novoTom: Tom) => void;
  reordenarSetlist: (novaOrdemIds: string[]) => void;
}

const STORAGE_KEY = (cultoId: string) => `${SETLIST_KEY}:${cultoId}`;

export function useSetlist({ cultoId }: UseSetlistOptions): UseSetlistValue {
  const [setlist, setSetlist] = useState<SetlistItem[]>([]);

  useEffect(() => {
    if (!cultoId) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY(cultoId));
      if (raw) {
        const parsed = JSON.parse(raw) as SetlistItem[];
        setSetlist(parsed);
      } else {
        setSetlist([]);
      }
    } catch {
      setSetlist([]);
    }
  }, [cultoId]);

  const persist = useCallback((lista: SetlistItem[]) => {
    if (!cultoId) return;
    try {
      localStorage.setItem(STORAGE_KEY(cultoId), JSON.stringify(lista));
    } catch {
      // ignora erro de storage
    }
  }, [cultoId]);

  const adicionarMusicaAoCulto = useCallback((musica: MusicaEspaco, tom?: Tom) => {
    if (!cultoId) return;
    setSetlist((prev) => {
      const nova = [...prev, { ...musica, tom: tom || musica.tom, ordem: prev.length }];
      persist(nova);
      return nova;
    });
  }, [cultoId, persist]);

  const removerMusicaDoCulto = useCallback((musicaId: string) => {
    if (!cultoId) return;
    setSetlist((prev) => {
      const nova = prev.filter((item) => item.id !== musicaId).map((item, idx) => ({ ...item, ordem: idx }));
      persist(nova);
      return nova;
    });
  }, [cultoId, persist]);

  const alterarTomMusicaCulto = useCallback((musicaId: string, novoTom: Tom) => {
    if (!cultoId) return;
    setSetlist((prev) => {
      const nova = prev.map((item) => (item.id === musicaId ? { ...item, tom: novoTom } : item));
      persist(nova);
      return nova;
    });
  }, [cultoId, persist]);

  const reordenarSetlist = useCallback((novaOrdemIds: string[]) => {
    if (!cultoId) return;
    setSetlist((prev) => {
      const mapa = new Map(prev.map((item) => [item.id, item]));
      const nova = novaOrdemIds
        .map((id) => mapa.get(id))
        .filter(Boolean)
        .map((item, idx) => ({ ...item!, ordem: idx }));
      persist(nova);
      return nova;
    });
  }, [cultoId, persist]);

  return { setlist, adicionarMusicaAoCulto, removerMusicaDoCulto, alterarTomMusicaCulto, reordenarSetlist };
}
