import type { Musica, Nivel, TagMusica, Tom } from '../types';
import { extrairAcordes } from './acordes';

export type MusicaRascunho = Pick<Musica, 'titulo' | 'artista' | 'tom' | 'letra' | 'acordes' | 'dificuldade' | 'tags'> & { bpm?: number; capo?: number; sourceUrl?: string };

const acordeRegex = /^[A-G](#|b)?(m|maj|min|dim|aug|sus|add)?\d*(\/[A-G](#|b)?)?$/;

function linhaDeAcordes(linha: string) {
  const tokens = linha.trim().split(/\s+/).filter(Boolean);
  if (!tokens.length) return false;
  return tokens.filter((token) => acordeRegex.test(token)).length / tokens.length >= 0.55;
}

export function parsearCifra(texto: string): MusicaRascunho {
  const linhas = texto.replace(/\r/g, '').split('\n');
  const resultado: string[] = [];
  let bpm: number | undefined;
  let capo: number | undefined;
  for (let i = 0; i < linhas.length; i += 1) {
    const linha = linhas[i];
    const bpmMatch = linha.match(/(?:BPM|=)\s*:?\s*(\d{2,3})/i);
    const capoMatch = linha.match(/(?:Capo|Capotraste).*?(\d+)/i);
    if (bpmMatch) bpm = Number(bpmMatch[1]);
    if (capoMatch) capo = Number(capoMatch[1]);
    if (/^\s*\[[^\]]+]\s*$/.test(linha)) { resultado.push(linha.trim()); continue; }
    if (/^\s*(Intro|Verso|Refr[aã]o|Ponte|Final)\s*:\s*$/i.test(linha)) { resultado.push(`[${linha.replace(':', '').trim()}]`); continue; }
    if (linhaDeAcordes(linha) && linhas[i + 1]) {
      const acordes = linha.trim().split(/\s+/);
      const letra = linhas[i + 1];
      resultado.push(`${acordes.map((acorde) => `[${acorde}]`).join('')}${letra}`);
      i += 1;
      continue;
    }
    resultado.push(linha);
  }
  const letra = resultado.join('\n').trim();
  const acordes = extrairAcordes(letra);
  const tom = ((acordes[0]?.replace(/m.*$/, '') as Tom) || 'G');
  const primeira = linhas.find((linha) => linha.trim() && !linhaDeAcordes(linha)) ?? 'Nova música';
  return { titulo: primeira.replace(/\[[^\]]+]/g, '').slice(0, 60), artista: 'Importado', tom, letra, acordes, dificuldade: 'intermediario' as Nivel, tags: ['louvor' as TagMusica], bpm, capo };
}
