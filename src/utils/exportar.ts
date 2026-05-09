import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import type { Musica } from '../types';

function baixar(nome: string, conteudo: BlobPart, tipo: string) {
  const url = URL.createObjectURL(new Blob([conteudo], { type: tipo }));
  const link = document.createElement('a');
  link.href = url;
  link.download = nome;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportarPDF(musica: Musica): void {
  const pdf = new jsPDF();
  pdf.setFont('courier');
  pdf.setFontSize(16);
  pdf.text(musica.titulo, 14, 18);
  pdf.setFontSize(10);
  pdf.text(`Artista: ${musica.artista} | Tom: ${musica.tom}`, 14, 26);
  pdf.setFontSize(11);
  pdf.text(pdf.splitTextToSize(musica.letra, 180), 14, 38);
  pdf.save(`${musica.titulo}.pdf`);
}

export function exportarTXT(musica: Musica): void {
  baixar(`${musica.titulo}.txt`, `${musica.titulo}\n${musica.artista}\nTom: ${musica.tom}\n\n${musica.letra}`, 'text/plain;charset=utf-8');
}

export function exportarChordPro(musica: Musica): void {
  baixar(`${musica.titulo}.cho`, `{title: ${musica.titulo}}\n{artist: ${musica.artista}}\n{key: ${musica.tom}}\n\n${musica.letra}`, 'text/plain;charset=utf-8');
}

export function exportarBibliotecaJSON(musicas: Musica[]): void {
  baixar('worshipflow-biblioteca.json', JSON.stringify(musicas, null, 2), 'application/json');
}

export function exportarListaExcel(musicas: Musica[]): void {
  const rows = musicas.map((musica) => ({ Titulo: musica.titulo, Artista: musica.artista, Tom: musica.tom, BPM: '', Capo: '', Tags: musica.tags.join(', '), Dificuldade: musica.dificuldade }));
  const sheet = XLSX.utils.json_to_sheet(rows);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, 'Musicas');
  XLSX.writeFile(book, 'worshipflow-musicas.xlsx');
}
