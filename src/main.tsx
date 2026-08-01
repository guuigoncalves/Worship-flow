import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import './i18n';
import './index.css';
import App from './App';
import { aplicarTema, temas, type Tema } from './utils/temas';
import { aplicarLayout, layoutsDisponiveis, type Layout } from './utils/layouts';

registerSW({ immediate: true });

// Aplica tema/layout salvos antes do primeiro render — evita flash do tema
// errado e corrige o tema não persistir quando o app abre fora de /configuracoes.
const temaSalvo = localStorage.getItem('worshipflow:tema');
aplicarTema(temas.includes(temaSalvo as Tema) ? (temaSalvo as Tema) : 'eclipse');
const layoutSalvo = localStorage.getItem('worshipflow:layout');
aplicarLayout(layoutsDisponiveis.includes(layoutSalvo as Layout) ? (layoutSalvo as Layout) : 'aurora');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
