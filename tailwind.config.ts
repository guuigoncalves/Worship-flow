import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        body: ['DM Sans', 'sans-serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif']
      },
      colors: {
        fundo: 'var(--fundo)',
        superficie: 'var(--superficie)',
        elevada: 'var(--superficie-alta)',
        primaria: 'var(--primaria)',
        primariaDim: 'var(--primaria-dim)',
        acento: 'var(--acento)',
        perigo: 'var(--perigo)',
        sucesso: 'var(--sucesso)',
        texto: 'var(--texto)',
        textoSecundario: 'var(--texto-sec)',
        borda: 'var(--borda)'
      }
    }
  },
  plugins: []
} satisfies Config;
