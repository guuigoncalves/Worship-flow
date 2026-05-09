import { useEffect, useRef } from 'react';

export function useRolagemAutomatica(ativo: boolean, velocidade: 'lenta' | 'media' | 'rapida') {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!ativo) return undefined;
    const pxPorTick = velocidade === 'lenta' ? 0.45 : velocidade === 'rapida' ? 1.4 : 0.85;
    const timer = window.setInterval(() => {
      if (!ref.current) return;
      ref.current.scrollTop += pxPorTick;
    }, 35);
    return () => window.clearInterval(timer);
  }, [ativo, velocidade]);
  return ref;
}
