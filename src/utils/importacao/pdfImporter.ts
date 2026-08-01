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
    const texto = content.items.map((item: any) => ('str' in item ? item.str : '')).filter(Boolean).join(' ');
    textos.push(texto);
  }
  return { texto: textos.join('\n\n'), confianca: 0.95 };
}
