import type { PerfilMusico, Tom } from '../types';
import { extrairAcordes, normalizarAcorde } from './acordes';

const notasSharp = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const notasFlat = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const aliases: Record<string, number> = {
  C: 0,
  'C#': 1,
  Db: 1,
  D: 2,
  'D#': 3,
  Eb: 3,
  E: 4,
  F: 5,
  'F#': 6,
  Gb: 6,
  G: 7,
  'G#': 8,
  Ab: 8,
  A: 9,
  'A#': 10,
  Bb: 10,
  B: 11
};

function preferirBemol(tom: string): boolean {
  return tom.includes('b') || ['F', 'Bb', 'Eb', 'Ab'].includes(tom);
}

export function semitonsEntre(origem: Tom, destino: Tom): number {
  return ((aliases[destino] ?? 0) - (aliases[origem] ?? 0) + 12) % 12;
}

export function transporAcorde(acorde: string, semitons: number, tomDestino?: Tom): string {
  const partes = acorde.split('/');
  const corpo = transporParteAcorde(partes[0] ?? acorde, semitons, tomDestino);
  const baixo = partes[1] ? transporParteAcorde(partes[1], semitons, tomDestino) : '';
  return baixo ? `${corpo}/${baixo}` : corpo;
}

function transporParteAcorde(parte: string, semitons: number, tomDestino?: Tom): string {
  const match = parte.match(/^(C#|Db|D#|Eb|F#|Gb|G#|Ab|A#|Bb|C|D|E|F|G|A|B)(.*)$/);
  if (!match) return parte;
  const raiz = match[1] ?? parte;
  const sufixo = match[2] ?? '';
  const indice = aliases[raiz];
  if (indice === undefined) return parte;
  const destino = (indice + semitons + 120) % 12;
  const escala = preferirBemol(tomDestino ?? raiz) ? notasFlat : notasSharp;
  return `${escala[destino]}${sufixo}`;
}

export function transporLetra(letra: string, tomOriginal: Tom, tomAlvo: Tom): string {
  const semitons = semitonsEntre(tomOriginal, tomAlvo);
  return letra.replace(/\[([^\]]+)]/g, (_, acorde: string) => `[${transporAcorde(acorde, semitons, tomAlvo)}]`);
}

export function transporPorSemitom(letra: string, semitons: number, tomAlvo?: Tom): string {
  return letra.replace(/\[([^\]]+)]/g, (_, acorde: string) => `[${transporAcorde(acorde, semitons, tomAlvo)}]`);
}

export function tomPorDeslocamento(tom: Tom, semitons: number): Tom {
  const indice = aliases[tom] ?? 0;
  const destino = (indice + semitons + 120) % 12;
  const preferidos: Tom[] = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
  return preferidos[destino] ?? 'C';
}

export function sugerirTomMaisFacil(acordes: string[], perfil: PerfilMusico): Tom {
  const tons: Tom[] = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
  let melhorTom: Tom = perfil.tonsPreferidos[0] ?? 'C';
  let melhorPontuacao = Number.POSITIVE_INFINITY;
  for (const tom of tons) {
    const semitons = semitonsEntre('C', tom);
    const transpostos = acordes.map((acorde) => normalizarAcorde(transporAcorde(acorde, semitons, tom)));
    const proibidos = perfil.acordesProibidos.map(normalizarAcorde);
    const penalidadeProibidos = transpostos.filter((acorde) => proibidos.includes(acorde)).length * 10;
    const penalidadePreferencia = perfil.tonsPreferidos.includes(tom) ? -2 : 0;
    const penalidadeCapo = perfil.preferirCapo && ['F#', 'Bb', 'Eb', 'Ab'].includes(tom) ? -1 : 0;
    const pontuacao = penalidadeProibidos + penalidadePreferencia + penalidadeCapo;
    if (pontuacao < melhorPontuacao) {
      melhorPontuacao = pontuacao;
      melhorTom = tom;
    }
  }
  return melhorTom;
}

export function extrairAcordesTranspostos(letra: string, tomOriginal: Tom, tomAlvo: Tom): string[] {
  return extrairAcordes(transporLetra(letra, tomOriginal, tomAlvo));
}
