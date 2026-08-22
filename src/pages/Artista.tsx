import { Link, useParams, useNavigate } from 'react-router-dom';
import { useMusicas } from '../hooks/useMusicas';
import { usePlayer } from '../hooks/usePlayer';
import { SectionHeader, CapaMusica, Avatar } from '../components/aurora';
import { EstadoVazio } from '../components/compartilhado/EstadoVazio';
import { User, Play, ArrowLeft, MoreHorizontal, ChevronRight, Disc } from 'lucide-react';
import { useMemo } from 'react';

export default function Artista() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { musicas, loading } = useMusicas();
  const { tocar } = usePlayer();

  const nomeArtista = id ? decodeURIComponent(id) : '';

  const musicasDoArtista = useMemo(() => {
    return musicas.filter((m) => (m.artista || 'Sem Artista') === nomeArtista);
  }, [musicas, nomeArtista]);

  const maisTocadas = useMemo(() => {
    return [...musicasDoArtista].sort((a, b) => (b.vezesTocada || 0) - (a.vezesTocada || 0));
  }, [musicasDoArtista]);

  const albuns = useMemo(() => {
    const mapa = new Map<string, typeof musicasDoArtista>();
    musicasDoArtista.forEach((m) => {
      const key = m.artista || 'Sem Artista';
      const lista = mapa.get(key) || [];
      lista.push(m);
      mapa.set(key, lista);
    });
    return Array.from(mapa.entries()).map(([artista, lista]) => ({ artista, total: lista.length }));
  }, [musicasDoArtista]);

  if (loading) {
    return (
      <div className="app-page flex items-center justify-center min-h-[60vh]" style={{ backgroundColor: 'var(--fundo)' }}>
        <div className="w-8 h-8 border-2 border-[var(--primaria)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (musicasDoArtista.length === 0) {
    return (
      <main className="app-page space-y-6 pb-32 fade-in" style={{ backgroundColor: 'var(--fundo)' }}>
        <header className="flex items-center gap-3 pt-1">
          <button className="btn-ghost h-9 w-9 p-0" type="button" onClick={() => navigate('/artistas')} aria-label="Voltar">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-xl font-bold text-gradient">Artista</h1>
        </header>
        <EstadoVazio
          titulo="Artista não encontrado"
          texto="Não foram encontradas músicas registradas para este artista."
        />
      </main>
    );
  }

  const totalMusicas = musicasDoArtista.length;
  const totalCifras = musicasDoArtista.filter((m) => m.possuiCifra).length;

  return (
    <main className="app-page space-y-6 pb-32 fade-in" style={{ backgroundColor: 'var(--fundo)' }}>
      <header className="flex items-center gap-3 pt-1">
        <button className="btn-ghost h-9 w-9 p-0" type="button" onClick={() => navigate('/artistas')} aria-label="Voltar">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-bold text-gradient truncate">{nomeArtista}</h1>
      </header>

      <div className="card p-6 bg-[var(--primaria-dim)] border border-[var(--borda)] flex flex-col items-center gap-4 text-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[var(--primaria)] to-[var(--acento)] flex items-center justify-center font-bold text-white text-3xl border-2 border-white/20 shadow-lg shadow-purple-900/30">
          {nomeArtista.charAt(0).toUpperCase()}
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white">{nomeArtista}</h2>
          <div className="flex items-center justify-center gap-4">
            <span className="text-xs text-white/60">{totalMusicas} {totalMusicas === 1 ? 'música' : 'músicas'}</span>
            <span className="text-white/20">·</span>
            <span className="text-xs text-white/60">{totalCifras} {totalCifras === 1 ? 'cifra' : 'cifras'}</span>
          </div>
        </div>
        <button
          onClick={() => tocar(musicasDoArtista[0])}
          className="btn-primary py-2.5 px-5 text-xs flex items-center gap-2 shrink-0"
        >
          <Play size={16} />
          <span>Tocar Destaque</span>
        </button>
      </div>

      <section>
        <SectionHeader icone={<Play size={16} />} titulo="Mais Tocadas do Artista" />
        {maisTocadas.length === 0 ? (
          <EstadoVazio titulo="Nenhuma música" texto="Nenhuma música encontrada para este artista." />
        ) : (
          <div className="card divide-y divide-white/5">
            {maisTocadas.map((m) => (
              <div
                key={m.id}
                onClick={() => tocar(m)}
                className="flex items-center justify-between p-3 hover:bg-white/5 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <CapaMusica tom={m.tom} titulo={m.titulo} tamanho="sm" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate group-hover:text-[var(--primaria)] transition-colors">{m.titulo}</p>
                    <p className="text-[10px] text-white/50 truncate">{m.artista || 'Artista'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      tocar(m);
                    }}
                    className="p-2 rounded-lg bg-[var(--primaria-dim)] hover:bg-[var(--primaria)]/30 text-[var(--primaria)] hover:text-white transition-colors"
                    title="Tocar"
                  >
                    <Play size={14} fill="currentColor" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-white/5 text-white/30 hover:text-white transition-colors" title="Opções">
                    <MoreHorizontal size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {albuns.length > 0 && (
        <section>
          <SectionHeaderInner icon={<Disc size={16} />} titulo="Álbuns" verTodas="/albuns" />
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {albuns.map((album) => (
              <div
                key={album.artista}
                onClick={() => navigate(`/album/${encodeURIComponent(album.artista)}`)}
                className="card overflow-hidden rounded-2xl border border-white/10 bg-[#12142B]/90 hover:border-[var(--primaria)]/40 transition-all cursor-pointer group shadow-lg shrink-0 w-40"
              >
                <div className="flex h-24 items-center justify-center bg-gradient-to-br from-[var(--primaria)]/20 to-[var(--acento)]/20 p-2">
                  <CapaMusica tom={undefined} titulo={album.artista} tamanho="lg" />
                </div>
                <div className="p-2.5">
                  <p className="truncate text-xs font-semibold text-white">{album.artista}</p>
                  <p className="text-[10px] text-white/40">{album.total} {album.total === 1 ? 'música' : 'músicas'}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionHeaderInner icon={<User size={16} />} titulo="Cifras do Artista" verTodas="/cifra" />
        {musicasDoArtista.filter((m) => m.possuiCifra).length === 0 ? (
          <EstadoVazio titulo="Nenhuma cifra" texto="Nenhuma cifra disponível para este artista." />
        ) : (
          <div className="card divide-y divide-white/5">
            {musicasDoArtista.filter((m) => m.possuiCifra).map((m) => (
              <div
                key={m.id}
                onClick={() => navigate(`/musica/${m.id}`)}
                className="flex items-center justify-between p-3 hover:bg-white/5 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <CapaMusica tom={m.tom} titulo={m.titulo} tamanho="sm" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate group-hover:text-[var(--primaria)] transition-colors">{m.titulo}</p>
                    <p className="text-[10px] text-white/50 truncate">{m.artista || 'Artista'}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-white shrink-0" />
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function SectionHeaderInner({ icon, titulo, verTodas }: { icon: React.ReactNode; titulo: string; verTodas?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/70">
        {icon}{titulo}
      </h2>
      {verTodas && (
        <Link to={verTodas} className="flex items-center gap-0.5 text-xs font-medium text-[var(--primaria)] hover:text-purple-300 transition-colors">
          Ver todas <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}