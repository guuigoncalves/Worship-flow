import Tesseract from 'tesseract.js';
import type { ResultadoLeitura } from './tipos';

export async function extrairTextoOCR(file: File, onProgress?: (pct: number) => void): Promise<ResultadoLeitura> {
  const { data } = await Tesseract.recognize(file, 'por', {
    logger: (m) => {
      if (m.status === 'recognizing' && typeof m.progress === 'number') {
        onProgress?.(m.progress);
      }
    },
  });
  return { texto: data.text, confianca: data.confidence / 100 };
}
