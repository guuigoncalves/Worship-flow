import * as XLSX from 'xlsx';
import { importarTextoLivre } from '../acordes';
import type { MusicaRascunho } from '../importarParser';
import type { Nivel, TagMusica, Tom } from '../../types';

const tomRegex = /^(C#|Db|D#|Eb|F#|Gb|G#|Ab|A#|Bb|C|D|E|F|G|A|B)$/i;
const papeisPermitidos: Nivel[] = ['iniciante', 'intermediario', 'avancado'];

function normalizarTom(valor: string): Tom {
  const match = valor.trim().toUpperCase().match(tomRegex);
  if (!match) return 'G';
  const normalizado = match[1]!;
  const mapeamento: Record<string, Tom> = {
    C: 'C',
    'C#': 'C#',
    DB: 'C#',
    D: 'D',
    'D#': 'Eb',
    EB: 'Eb',
    E: 'E',
    F: 'F',
    'F#': 'F#',
    GB: 'F#',
    G: 'G',
    'G#': 'Ab',
    AB: 'Ab',
    A: 'A',
    'A#': 'Bb',
    BB: 'Bb',
    B: 'B',
  };
  return mapeamento[normalizado] ?? (normalizado as Tom);
}

function parseTags(valor: string | undefined): TagMusica[] {
  if (!valor) return ['louvor'];
  return valor
    .split(',')
    .map((tag) => tag.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') as TagMusica)
    .filter((tag) => tag.length > 0);
}

function parseDificuldade(valor: string | undefined): Nivel {
  if (!valor) return 'intermediario';
  const normalizado = valor.toLowerCase();
  return papeisPermitidos.find((p) => p === normalizado) ?? 'intermediario';
}

export async function lerPlanilha(file: File): Promise<MusicaRascunho[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<any>(sheet);
  const rascunhos: MusicaRascunho[] = [];
  for (const row of rows) {
    const titulo = (row.Titulo ?? row.titulo ?? '').toString().trim();
    const artista = (row.Artista ?? row.artista ?? 'Importado').toString().trim();
    const tom = normalizarTom((row.Tom ?? row.tom ?? 'G').toString());
    const letraRaw = (row.Letra ?? row.letra ?? '').toString().trim();
    const letra = importarTextoLivre(letraRaw);
    const tags = parseTags((row.Tags ?? row.tags)?.toString());
    const dificuldade = parseDificuldade((row.Dificuldade ?? row.dificuldade)?.toString());
    if (!titulo || !letra) continue;
    rascunhos.push({
      titulo,
      artista,
      tom,
      letra,
      acordes: [] as string[],
      dificuldade,
      tags,
      ...(row.BPM ? { bpm: Number(row.BPM) } : row.bpm ? { bpm: Number(row.bpm) } : {}),
      ...(row.Capo ? { capo: Number(row.Capo) } : row.capo ? { capo: Number(row.capo) } : {}),
      sourceUrl: file.name,
    });
  }
  return rascunhos;
}
