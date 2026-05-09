import { Link } from 'react-router-dom';
import { useMusicas } from '../hooks/useMusicas';
import { COR_TOM } from '../data/cores-tom';

export default function Artistas() {
  const { musicas } = useMusicas();
  const artistas = Object.values(musicas.reduce<Record<string, { id: string; nome: string; total: number; tom: string }>>((acc, musica) => {
    const id = musica.artista.toLowerCase().replace(/\W+/g, '-');
    acc[id] ??= { id, nome: musica.artista, total: 0, tom: musica.tom };
    acc[id].total += 1;
    return acc;
  }, {}));
  return <main className="app-page"><h1 className="font-display text-3xl font-bold">Artistas</h1><div className="mt-6 grid gap-3">{artistas.map((artista) => <Link key={artista.id} className="card flex items-center gap-4 p-4" to={`/artista/${artista.id}`}><span className="grid h-12 w-12 rounded-full place-items-center font-display font-bold text-fundo" style={{ background: COR_TOM[artista.tom] }}>{artista.nome[0]}</span><span className="flex-1 font-semibold">{artista.nome}</span><span className="text-sm text-textoSecundario">{artista.total} músicas</span></Link>)}</div></main>;
}
