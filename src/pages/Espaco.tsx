import { useState } from 'react';
import { useMusicas } from '../hooks/useMusicas';
import { COR_TOM } from '../data/cores-tom';
import { exportarListaExcel } from '../utils/exportar';

export default function Espaco() {
  const [aba, setAba] = useState<'musicas'|'pastas'|'membros'|'config'>('musicas');
  const { musicas } = useMusicas();
  return <main className="app-page"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm uppercase tracking-[0.18em] text-primaria">Espaço</p><h1 className="font-display text-3xl font-bold">Ministério Local</h1></div><button className="btn-ghost" onClick={() => exportarListaExcel(musicas)}>Exportar músicas</button></div><div className="mt-5 flex gap-2 overflow-auto">{(['musicas','pastas','membros','config'] as const).map((item) => <button key={item} className={`chip capitalize ${aba === item ? 'chip-active' : ''}`} onClick={() => setAba(item)}>{item}</button>)}</div>{aba === 'musicas' ? <div className="mt-6 grid gap-3 md:grid-cols-2">{musicas.map((musica) => <article className="card p-4" style={{ borderLeft: `3px solid ${COR_TOM[musica.tom]}` }} key={musica.id}><h2 className="font-semibold">{musica.titulo}</h2><p className="text-sm text-textoSecundario">{musica.artista}</p></article>)}</div> : <section className="card mt-6 p-5"><h2 className="font-display text-xl font-bold">{aba}</h2><p className="mt-2 text-textoSecundario">Gestão de {aba} com permissões de dono, admin, editor e leitor.</p></section>}</main>;
}
