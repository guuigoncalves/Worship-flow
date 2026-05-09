import type { Tom } from '../types';

const cores: Record<Tom, string> = {
  C: '#FF6B6B',
  'C#': '#FF6B6B',
  D: '#4ECDC4',
  Eb: '#87CEEB',
  E: '#45B7D1',
  F: '#96CEB4',
  'F#': '#96CEB4',
  G: '#FFEAA7',
  Ab: '#87CEEB',
  A: '#DDA0DD',
  Bb: '#FF8C69',
  B: '#F0A500'
};

export function corDoTom(tom: Tom): string {
  return cores[tom] ?? '#E8B830';
}
