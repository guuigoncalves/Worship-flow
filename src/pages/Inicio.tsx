import { Link } from 'react-router-dom';
import { Bell, BookOpen, Heart, Link2, Mic2, Music2, Play, Search, Users } from 'lucide-react';
import { useMusicas } from '../hooks/useMusicas';
import { COR_TOM } from '../data/cores-tom';

const atalhos = [
  { to:'/busca-rapida', nome:'Busca Rápida', desc:'Encontre por trecho', Icon:Search },
  { to:'/player', nome:'Oportunidade', desc:'Player e áudio', Icon:Music2 },
  { to:'/biblioteca', nome:'Biblioteca', desc:'Cifras salvas', Icon:BookOpen },
  { to:'/biblioteca', nome:'Favoritos', desc:'Mais usados', Icon:Heart },
  { to:'/editor', nome:'Cifras', desc:'Criar e editar', Icon:Mic2 },
  { to:'/importar', nome:'Letras', desc:'Importar textos', Icon:Music2 },
  { to:'/medleys', nome:'Medleys', desc:'Sequências', Icon:Link2 },
  { to:'/espacos', nome:'Comunidade', desc:'Espaços e público', Icon:Users }
];

function Waveform() {
  return <div className="flex h-16 items-end gap-1">{Array.from({ length: 26 }).map((_, i) => <span key={i} className="w-1 rounded-full bg-primaria" style={{ height: `${18 + (i % 7) * 6}px`, animation: `waveform ${700 + i * 30}ms ease-in-out infinite`, transformOrigin: 'bottom' }} />)}</div>;
}

export default function Inicio() {
  const { musicas } = useMusicas();
  const atual = musicas[0];
  const maisTocadas = [...musicas].sort((a,b) => b.vezesTocada - a.vezesTocada).slice(0,5);
  const ultimas = musicas.slice(0,8);
  return (
    <main className="app-page">
      <header className="flex items-center gap-3">
        <h1 className="mr-auto font-display text-2xl font-extrabold">WorshipFlow</h1>
        <Link className="btn-text h-10 w-10 p-0 text-texto" to="/busca-rapida" aria-label="Buscar"><Search className="h-5 w-5" /></Link>
        <button className="btn-text h-10 w-10 p-0 text-texto" aria-label="Notificações"><Bell className="h-5 w-5" /></button>
        <Link className="h-10 w-10 rounded-full bg-elevada" to="/perfil" aria-label="Perfil" />
      </header>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_280px]">
        <div className="grid gap-6">
          <article className="card bg-elevada p-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primaria">Tocando agora</p>
            <div className="mt-3 flex items-start gap-4">
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-2xl font-bold">{atual?.titulo ?? 'Selecione uma música'}</h2>
                <p className="text-sm text-textoSecundario">{atual?.artista ?? 'Biblioteca local'}</p>
                <div className="mt-3 flex flex-wrap gap-2"><span className="chip">TOM {atual?.tom ?? 'G'}</span><span className="chip">CAPO 0</span><span className="chip">72 BPM</span></div>
              </div>
              <Link className="btn-primary h-14 w-14 rounded-full p-0" to={atual ? `/tocar/${atual.id}` : '/biblioteca'} aria-label="Tocar"><Play className="h-6 w-6" /></Link>
            </div>
            <Waveform />
          </article>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-2">
            {atalhos.map(({ to, nome, desc, Icon }) => <Link key={nome} className="card p-4" to={to}><Icon className="h-6 w-6 text-primaria" /><h3 className="mt-3 font-display font-bold">{nome}</h3><p className="text-xs text-textoSecundario">{desc}</p></Link>)}
          </div>

          <section>
            <h2 className="font-display text-xl font-bold">MAIS TOCADAS</h2>
            <div className="mt-3 grid gap-2">{maisTocadas.map((musica, index) => <Link className="card flex items-center gap-3 p-3" key={musica.id} to={`/musica/${musica.id}`}><span className="w-6 font-mono text-textoSecundario">{index + 1}</span><span className="h-10 w-10 rounded-lg bg-elevada" /><span className="min-w-0 flex-1"><span className="block truncate font-semibold">{musica.titulo}</span><span className="block truncate text-xs text-textoSecundario">{musica.artista}</span></span><span className="chip" style={{ borderColor: COR_TOM[musica.tom] }}>{musica.tom}</span></Link>)}</div>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">ÚLTIMAS USADAS</h2>
            <div className="mt-3 flex gap-3 overflow-auto pb-2">{ultimas.map((musica) => <Link className="w-[120px] shrink-0" key={musica.id} to={`/musica/${musica.id}`}><span className="block aspect-square rounded-xl bg-elevada" /><span className="mt-2 block truncate text-sm font-semibold">{musica.titulo}</span></Link>)}</div>
          </section>
        </div>
        <aside className="card h-max p-4 xl:sticky xl:top-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primaria">Preparando próxima</p>
          <div className="mt-3 flex items-center gap-3"><span className="h-10 w-10 rounded-lg bg-elevada" /><div className="min-w-0 flex-1"><p className="truncate font-semibold">{musicas[1]?.titulo ?? atual?.titulo ?? 'Fila vazia'}</p><p className="text-xs text-textoSecundario">{musicas[1]?.artista ?? 'Adicione músicas'}</p></div><Link className="btn-text" to="/biblioteca">Alterar</Link></div>
        </aside>
      </section>
    </main>
  );
}
