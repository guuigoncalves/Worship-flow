import { useEffect, useState } from 'react';

// Cada layout troca a ESTRUTURA visual (grade, navegação, tipografia, densidade),
// diferente do tema (utils/temas.ts) que só troca cor. "aurora" é o único
// implementado até agora — os demais existem aqui como reserva de nome pra não
// prometer 5 layouts prontos quando só 1 está de fato pronto.
export const layouts = ['aurora', 'mono', 'neon', 'editorial', 'compacto'] as const;
export type Layout = typeof layouts[number];

export const layoutsDisponiveis: Layout[] = ['aurora'];

export const layoutInfo: Record<Layout, { nome: string; descricao: string }> = {
  aurora: { nome: 'Aurora', descricao: 'Vidro fosco, gradientes suaves e blobs animados de fundo.' },
  mono: { nome: 'Mono', descricao: 'Alto contraste, tipografia grande, zero decoração. Em breve.' },
  neon: { nome: 'Neon', descricao: 'Contornos brilhantes, fundo escuro absoluto, estética synthwave. Em breve.' },
  editorial: { nome: 'Editorial', descricao: 'Denso, baseado em grid editorial e serifada nos títulos. Em breve.' },
  compacto: { nome: 'Compacto', descricao: 'Densidade máxima de informação, pouco espaçamento. Em breve.' }
};

const key = 'worshipflow:layout';

export function aplicarLayout(layout: Layout) {
  document.documentElement.setAttribute('data-layout', layout);
}

export function useLayout() {
  const [layout, setLayoutState] = useState<Layout>(() => {
    const salvo = localStorage.getItem(key);
    return layoutsDisponiveis.includes(salvo as Layout) ? (salvo as Layout) : 'aurora';
  });
  useEffect(() => {
    aplicarLayout(layout);
    localStorage.setItem(key, layout);
  }, [layout]);
  const setLayout = (proximo: Layout) => {
    if (!layoutsDisponiveis.includes(proximo)) return;
    setLayoutState(proximo);
  };
  return { layout, setLayout, layouts, layoutsDisponiveis, layoutInfo };
}
