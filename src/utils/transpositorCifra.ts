import { semitonsEntre, transporLetra, transporPorSemitom } from './transposicao';
import type { Tom } from '../types';

export function calcularSemitons(tomOrigem: string, tomDestino: string): number {
  return semitonsEntre(tomOrigem as Tom, tomDestino as Tom);
}

export function transporCifra(textoCifra: string, semitons: number): string {
  return transporPorSemitom(textoCifra, semitons);
}
