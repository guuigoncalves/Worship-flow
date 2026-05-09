import { Link, useParams } from 'react-router-dom';
import { Play } from 'lucide-react';
import { useMusicas } from '../hooks/useMusicas';
import { COR_TOM } from '../data/cores-tom';

export default function Album() {
  const { id } = useParams();
  const { musicas } = useMusicas();
  const faixas = musicas.filter((musica) => musica.artista.toLowerCase().replace(/\W+/g, '-') === id);
  const artista = faixas[0]?.artista ?? 'Álbum';
  return <main className="app-page"><section className="grid gap-6 md:grid-cols-[240px_1fr]"><div className="grid aspect-square place-items-center rounded-3xl bg-elevada font-display text-5xl text-primaria">WF</div><div><p className="text-sm uppercase tracking-[0.18em] text-primaria">Álbum</p><h1 className="font-display text-4xl font-bold">Essenciais de {artista}</h1><button className="btn-primary mt-4"><Play className="h-4 w-4" />Tocar Álbum</button></div></section><div className="mt-8 grid gap-3">{faixas.map((musica) => <Link className="card flex items-center justify-between p-4" style={{ borderLeft: `3px solid ${COR_TOM[musica.tom]}` }} key={musica.id} to={`/musica/${musica.id}`}><span>{musica.titulo}</span><span className="chip">{musica.tom}</span></Link>)}</div></main>;
}
