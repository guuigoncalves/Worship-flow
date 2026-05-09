import { useMemo } from 'react';
import { useMusicas } from './useMusicas';

export function useHistorico() {
  const { musicas } = useMusicas();
  return useMemo(() => {
    const recentes = musicas
      .filter((musica) => musica.ultimaTocada)
      .sort((a, b) => (b.ultimaTocada ?? '').localeCompare(a.ultimaTocada ?? ''))
      .slice(0, 12);
    const maisTocadas = [...musicas].sort((a, b) => b.vezesTocada - a.vezesTocada).slice(0, 8);
    const favoritas = musicas.filter((musica) => musica.eFavorita);
    const totalReproducoes = musicas.reduce((total, musica) => total + musica.vezesTocada, 0);
    return { recentes, maisTocadas, favoritas, totalReproducoes };
  }, [musicas]);
}
