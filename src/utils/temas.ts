import { useEffect, useState } from 'react';

export const temas = ['eclipse', 'midnight', 'sunset', 'forest', 'claro'] as const;
export type Tema = typeof temas[number];

const key = 'worshipflow:tema';

export function aplicarTema(tema: Tema) {
  document.documentElement.classList.remove(...temas.map((item) => `tema-${item}`));
  document.documentElement.classList.add(`tema-${tema}`);
}

export function useTema() {
  const [tema, setTemaState] = useState<Tema>(() => {
    const salvo = localStorage.getItem(key);
    return temas.includes(salvo as Tema) ? (salvo as Tema) : 'eclipse';
  });
  useEffect(() => {
    aplicarTema(tema);
    localStorage.setItem(key, tema);
  }, [tema]);
  return { tema, setTema: setTemaState, temas };
}
