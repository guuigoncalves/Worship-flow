import { useCallback } from 'react';
import type { Tom } from '../types';
import { semitonsEntre, sugerirTomMaisFacil, tomPorDeslocamento, transporLetra } from '../utils/transposicao';
import { usePerfil } from './usePerfil';

export function useTransposicao() {
  const { perfil } = usePerfil();

  const transpor = useCallback((letra: string, origem: Tom, destino: Tom) => transporLetra(letra, origem, destino), []);
  const deslocarTom = useCallback((tom: Tom, semitons: number) => tomPorDeslocamento(tom, semitons), []);
  const semitons = useCallback((origem: Tom, destino: Tom) => semitonsEntre(origem, destino), []);
  const sugerir = useCallback((acordes: string[]) => sugerirTomMaisFacil(acordes, perfil), [perfil]);

  return { transpor, deslocarTom, semitons, sugerir };
}
