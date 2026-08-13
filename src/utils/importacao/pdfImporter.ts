import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { ResultadoLeitura } from './tipos';

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export async function extrairTextoPDF(file: File): Promise<ResultadoLeitura> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: arrayBuffer }).promise;
  const textos: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const itens = content.items as any[];

    const linhas: string[] = [];
    let ultimaY: number | null = null;

    for (const item of itens) {
      const str: string = 'str' in item ? item.str : '';
      if (!str) continue;

      const transform: number[] = item.transform || [];
      const y: number = transform[5] ?? 0;

      if (ultimaY !== null && Math.abs(ultimaY - y) > 5) {
        linhas.push('\n');
      }

      linhas.push(str);
      ultimaY = y;
    }

    const texto = linhas.join('');
    textos.push(texto.trim());
  }
  return { texto: textos.join('\n\n'), confianca: 0.95 };
}
