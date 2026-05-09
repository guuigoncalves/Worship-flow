import { Link } from 'react-router-dom';
import { Disc3 } from 'lucide-react';
import { useMusicas } from '../hooks/useMusicas';

export default function Albuns() {
  const { musicas } = useMusicas();
  const albuns = Object.values(musicas.reduce<Record<string, { id: string; titulo: string; artista: string; faixas: number }>>((acc, musica) => {
    const id = musica.artista.toLowerCase().replace(/\W+/g, '-');
    acc[id] ??= { id, titulo: `Essenciais de ${musica.artista}`, artista: musica.artista, faixas: 0 };
    acc[id].faixas += 1;
    return acc;
  }, {}));
  return <main className="app-page"><h1 className="font-display text-3xl font-bold">Álbuns</h1><div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{albuns.map((album) => <Link key={album.id} className="card p-4" to={`/album/${album.id}`}><div className="grid aspect-square place-items-center rounded-xl bg-elevada text-primaria"><Disc3 className="h-14 w-14" /></div><h2 className="mt-3 font-display text-xl font-bold">{album.titulo}</h2><p className="text-sm text-textoSecundario">{album.artista} · {album.faixas} faixas</p></Link>)}</div></main>;
}
