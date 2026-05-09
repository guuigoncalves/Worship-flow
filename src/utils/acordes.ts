import type { Tom } from '../types';

export const tons: Tom[] = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

const raizRegex = /^(C#|Db|D#|Eb|F#|Gb|G#|Ab|A#|Bb|C|D|E|F|G|A|B)(.*)$/;

export function extrairAcordes(letra: string): string[] {
  const acordes = new Set<string>();
  for (const match of letra.matchAll(/\[([^\]]+)]/g)) {
    const acorde = match[1]?.trim();
    if (acorde && validarAcorde(acorde)) {
      acordes.add(acorde);
    }
  }
  return [...acordes];
}

export function validarAcorde(acorde: string): boolean {
  if (!acorde.trim()) return false;
  return /^([A-G](#|b)?)(m|maj|dim|aug|sus|add)?[0-9]?(maj7|m7|sus2|sus4|add9|dim|aug)?(\/[A-G](#|b)?)?$/.test(acorde);
}

export function raizDoAcorde(acorde: string): string {
  return acorde.match(raizRegex)?.[1] ?? acorde;
}

export function normalizarAcorde(acorde: string): string {
  return acorde.trim().replace(/\s+/g, '');
}

export function temAcordeProibido(acordes: string[], proibidos: string[]): boolean {
  const proibidosNormalizados = proibidos.map(normalizarAcorde);
  return acordes.some((acorde) => proibidosNormalizados.includes(normalizarAcorde(acorde)));
}

export function acordeAlternativoFacil(acorde: string): string {
  const mapa: Record<string, string> = {
    F: 'Fmaj7',
    Bm: 'D',
    'C#m': 'A',
    'G#m': 'Em',
    'F#m': 'D',
    Bb: 'A#',
    Eb: 'D#',
    Ab: 'G#',
    'B/F#': 'B',
    'C#': 'Db'
  };
  return mapa[acorde] ?? raizDoAcorde(acorde);
}

export function importarTextoLivre(texto: string): string {
  const linhas = texto.split(/\r?\n/);
  return linhas
    .map((linha) => {
      const comColchetes = linha.replace(/\b([A-G](?:#|b)?(?:m|maj7|m7|7|sus2|sus4|add9|dim|aug)?(?:\/[A-G](?:#|b)?)?)\b/g, (valor) => {
        if (validarAcorde(valor)) return `[${valor}]`;
        return valor;
      });
      return comColchetes.replace(/\{(c|chord):\s*([^}]+)}/gi, '[$2]');
    })
    .join('\n');
}
