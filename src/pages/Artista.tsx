import { Link, useParams } from 'react-router-dom';
import { useMusicas } from '../hooks/useMusicas';
import { COR_TOM } from '../data/cores-tom';

export default function Artista() {
  const { id } = useParams();
  const { musicas } = useMusicas();
  const faixas = musicas.filter((musica) => musica.artista.toLowerCase().replace(/\W+/g, '-') === id);
  const artista = faixas[0]?.artista ?? 'Artista';
  return <main className="app-page"><h1 className="font-display text-4xl font-bold">{artista}</h1><p className="mt-1 text-textoSecundario">Álbuns e músicas avulsas</p><div className="mt-6 grid gap-3">{faixas.map((musica) => <Link className="card p-4" style={{ borderLeft: `3px solid ${COR_TOM[musica.tom]}` }} key={musica.id} to={`/musica/${musica.id}`}><h2 className="font-semibold">{musica.titulo}</h2><p className="text-sm text-textoSecundario">{musica.tom} · {musica.dificuldade}</p></Link>)}</div></main>;
}
