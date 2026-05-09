import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Download, FileText, Maximize2, Minus, Plus } from 'lucide-react';
import { useMusicas } from '../hooks/useMusicas';
import { usePerfil } from '../hooks/usePerfil';
import { tomPorDeslocamento, transporLetra } from '../utils/transposicao';
import type { Tom } from '../types';
import { exportarChordPro, exportarPDF, exportarTXT } from '../utils/exportar';

type Aba = 'cifra' | 'letra' | 'detalhes';

function renderCifra(letra: string, proibidos: string[] = []) {
  return letra.split('\n').map((linha, index) => {
    if (/^\[[^\]]+]$/.test(linha.trim())) return <p key={index} className="mt-6 font-mono text-acento">{linha}</p>;
    const partes = linha.split(/(\[[^\]]+])/g).filter(Boolean);
    return <p key={index} className="min-h-7 font-mono leading-8">{partes.map((parte, i) => {
      const acorde = parte.match(/^\[([^\]]+)]$/)?.[1];
      if (!acorde) return <span key={i}>{parte}</span>;
      const proibido = proibidos.includes(acorde);
      return <button key={i} className={`mx-0.5 rounded px-1 font-bold text-primaria ${proibido ? 'border border-perigo bg-[rgba(224,64,64,0.2)] text-perigo' : ''}`} type="button" title={proibido ? 'Acorde proibido: veja alternativas' : acorde}>{acorde}</button>;
    })}</p>;
  });
}

export default function DetalheMusica() {
  const { id } = useParams();
  const { obterMusica } = useMusicas();
  const { perfil } = usePerfil();
  const musica = id ? obterMusica(id) : undefined;
  const [aba, setAba] = useState<Aba>('cifra');
  const [tom, setTom] = useState<Tom>(musica?.tom ?? 'G');
  const letra = useMemo(() => musica ? transporLetra(musica.letra, musica.tom, tom) : '', [musica, tom]);
  if (!musica) return <main className="app-page"><p>Música não encontrada.</p></main>;
  const letraLimpa = letra.replace(/\[[^\]]+]/g, '');
  return (
    <main className="app-page">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="font-display text-3xl font-bold">{musica.titulo}</h1><p className="text-textoSecundario">{musica.artista}</p></div>
        <Link className="btn-primary" to={`/tocar/${musica.id}`}><Maximize2 className="h-4 w-4" />Tocar em Tela Cheia</Link>
      </header>
      <div className="mt-5 flex gap-2">{(['cifra','letra','detalhes'] as Aba[]).map((item) => <button key={item} className={`chip capitalize ${aba === item ? 'chip-active' : ''}`} onClick={() => setAba(item)}>{item}</button>)}</div>
      {aba === 'cifra' ? <section className="mt-5">
        <div className="sticky top-3 z-10 mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-borda bg-superficie/90 p-2 backdrop-blur"><span className="chip">Tom: {tom}</span><button className="btn-ghost h-10 w-10 p-0" onClick={() => setTom(tomPorDeslocamento(tom, -1))}><Minus /></button><button className="btn-ghost h-10 w-10 p-0" onClick={() => setTom(tomPorDeslocamento(tom, 1))}><Plus /></button><span className="chip">{musica.versoes.length || 1} versões</span></div>
        <article className="card p-5">{renderCifra(letra, perfil.acordesProibidos)}</article>
      </section> : null}
      {aba === 'letra' ? <article className="card mt-5 whitespace-pre-line p-5 text-xl leading-10">{letraLimpa}</article> : null}
      {aba === 'detalhes' ? <section className="card mt-5 grid gap-4 p-5">
        <div className="grid gap-3 sm:grid-cols-2"><p>Tom: <b>{tom}</b></p><p>BPM: <b>72</b></p><p>Capo: <b>0</b></p><p>Dificuldade: <b>{musica.dificuldade}</b></p><p>Tags: <b>{musica.tags.join(', ')}</b></p><p>Álbum: <b>Essenciais de {musica.artista}</b></p></div>
        <label className="flex items-center gap-3"><input type="checkbox" /> Pública</label>
        <div><h2 className="font-display text-xl font-bold">Versões salvas</h2>{musica.versoes.map((versao) => <button className="chip mr-2 mt-2" key={versao.id}>{versao.rotulo}</button>)}</div>
        <div className="flex flex-wrap gap-2"><button className="btn-ghost" onClick={() => exportarPDF(musica)}><Download className="h-4 w-4" />PDF</button><button className="btn-ghost" onClick={() => exportarTXT(musica)}><FileText className="h-4 w-4" />TXT</button><button className="btn-ghost" onClick={() => exportarChordPro(musica)}>ChordPro</button><button className="btn-ghost">Excel</button></div>
      </section> : null}
    </main>
  );
}
