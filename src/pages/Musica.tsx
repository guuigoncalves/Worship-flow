import { Link, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import {
  Search, Play, Disc, User, Folder, ChevronRight,
  Volume2
} from 'lucide-react';
import { useMusicas } from '../hooks/useMusicas';
import { usePlayer } from '../hooks/usePlayer';
import { useAuth } from '../hooks/useAuth';
import { SectionHeader, CapaMusica, Avatar } from '../components/aurora';
import { EstadoVazio } from '../components/compartilhado/EstadoVazio';
import type { Musica } from '../types';

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

export default function Musica() {
  const navigate = useNavigate();
  const { musicas, loading } = useMusicas();
  const { tocar } = usePlayer();
  const { user, perfilUsuario } = useAuth();

  const [termoBusca, setTermoBusca] = useState('');

  const primeiroNome = perfilUsuario?.nome?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'Músico';
  const fotoUsuario = perfilUsuario?.foto || user?.photoURL || undefined;

  const playlists = useMemo(() => {
    const mapa = new Map<string, Musica[]>();
    musicas.forEach((m) => {
      const key = (m as any).playlist || 'Sem Playlist';
      const lista = mapa.get(key) || [];
      lista.push(m);
      mapa.set(key, lista);
    });
    return Array.from(mapa.entries()).map(([nome, lista]) => ({ nome, total: lista.length }));
  }, [musicas]);

  const maisTocadas = useMemo(() => {
    let lista = [...musicas].sort((a, b) => (b.vezesTocada || 0) - (a.vezesTocada || 0));
    if (termoBusca.trim()) {
      const query = termoBusca.toLowerCase();
      lista = lista.filter(m =>
        m.titulo.toLowerCase().includes(query) ||
        (m.artista && m.artista.toLowerCase().includes(query))
      );
    }
    return lista;
  }, [musicas, termoBusca]);

  const artistasDerivados = useMemo(() => {
    const mapa = new Map<string, number>();
    musicas.forEach((m) => {
      if (m.artista) {
        mapa.set(m.artista, (mapa.get(m.artista) || 0) + 1);
      }
    });
    return Array.from(mapa.entries()).map(([nome, total]) => ({ nome, total })).sort((a, b) => b.total - a.total);
  }, [musicas]);

  const albuns = useMemo(() => {
    const mapa = new Map<string, Musica[]>();
    musicas.forEach((m) => {
      const key = m.artista || 'Sem Artista';
      const lista = mapa.get(key) || [];
      lista.push(m);
      mapa.set(key, lista);
    });
    return Array.from(mapa.entries()).map(([artista, lista]) => ({ artista, total: lista.length }));
  }, [musicas]);

  const pastasLocais = useMemo(() => {
    const mapa = new Map<string, number>();
    musicas.forEach((m) => {
      const pasta = (m as any).pasta || 'Raiz';
      mapa.set(pasta, (mapa.get(pasta) || 0) + 1);
    });
    return Array.from(mapa.entries()).map(([nome, total]) => ({ nome, total }));
  }, [musicas]);

  if (loading) {
    return (
      <div className="app-page flex items-center justify-center min-h-[60vh]" style={{ backgroundColor: '#0B0C10' }}>
        <div className="w-8 h-8 border-2 border-[var(--primaria)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="app-page space-y-6 pb-32 fade-in" style={{ backgroundColor: '#0B0C10' }}>
      <header className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-2xl bg-gradient-to-br from-[var(--primaria)] to-[var(--acento)] text-fundo">
            <Volume2 size={24} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gradient tracking-tight">WorshipFlow</h1>
            <p className="text-xs text-white/60">
              Olá, {primeiroNome} <span className="inline-block animate-bounce">🎵</span>
            </p>
          </div>
        </div>
        <Avatar nome={primeiroNome} fotoUrl={fotoUsuario} tamanho="md" />
      </header>

      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
        <input
          type="text"
          value={termoBusca}
          onChange={(e) => setTermoBusca(e.target.value)}
          placeholder="Buscar músicas, artistas, álbuns..."
          className="w-full bg-[#141522]/80 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[var(--primaria)]/50 focus:ring-1 focus:ring-[var(--primaria)]/50 backdrop-blur-xl transition-all shadow-inner"
        />
      </div>

      <section>
        <SectionHeaderInner icon={<Disc className="h-4 w-4 text-[var(--primaria)]" />} titulo="PLAYLISTS" verTodas="/playlists" />
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {playlists.length === 0 ? (
            <EstadoVazio titulo="Nenhuma playlist" texto="Nenhuma playlist encontrada." />
          ) : (
            playlists.map((playlist) => (
              <div
                key={playlist.nome}
                onClick={() => navigate('/playlists')}
                className="card overflow-hidden rounded-2xl border border-white/10 bg-[#141522]/90 hover:border-[var(--primaria)]/40 transition-all cursor-pointer group shadow-lg shrink-0 w-44"
              >
                <div className="relative">
                  <div className="flex h-24 items-center justify-center bg-gradient-to-br from-[var(--primaria)]/20 to-[var(--acento)]/20 p-2 text-center">
                    <span className="text-xs font-bold text-white/90 group-hover:text-[var(--primaria)] transition-colors">{playlist.nome}</span>
                  </div>
                </div>
                <div className="p-2.5">
                  <p className="truncate text-xs font-semibold text-white">{playlist.nome}</p>
                  <p className="text-[10px] text-white/40">{playlist.total} {playlist.total === 1 ? 'música' : 'músicas'}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section>
        <SectionHeaderInner icon={<Play className="h-4 w-4 text-[var(--primaria)]" />} titulo="MAIS TOCADAS" verTodas="/biblioteca" />
        {maisTocadas.length === 0 ? (
          <EstadoVazio titulo="Nenhuma música" texto="Nenhuma música encontrada." />
        ) : (
          <div className="card divide-y divide-white/5 rounded-2xl border border-white/10 bg-[#141522]/90 overflow-hidden shadow-xl">
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
                    <p className="text-[10px] text-white/50 truncate">{m.artista || 'Artista não informado'}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    tocar(m);
                  }}
                  className="p-2 rounded-xl bg-[var(--primaria-dim)] hover:bg-[var(--primaria)]/30 text-[var(--primaria)] hover:text-white transition-all border border-[var(--primaria)]/20 shrink-0"
                  title="Tocar"
                >
                  <Play size={14} fill="currentColor" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionHeaderInner icon={<Disc className="h-4 w-4 text-[var(--primaria)]" />} titulo="ÁLBUNS" verTodas="/albuns" />
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {albuns.length === 0 ? (
            <EstadoVazio titulo="Nenhum álbum" texto="Nenhum álbum encontrado." />
          ) : (
            albuns.map((album) => (
              <div
                key={album.artista}
                onClick={() => navigate(`/album/${encodeURIComponent(album.artista)}`)}
                className="card overflow-hidden rounded-2xl border border-white/10 bg-[#141522]/90 hover:border-[var(--primaria)]/40 transition-all cursor-pointer group shadow-lg shrink-0 w-40"
              >
                <div className="flex h-28 items-center justify-center bg-gradient-to-br from-[var(--primaria)]/20 to-[var(--acento)]/20 p-2">
                  <CapaMusica tom={album.artista ? undefined : undefined} titulo={album.artista} tamanho="lg" />
                </div>
                <div className="p-2.5">
                  <p className="truncate text-xs font-semibold text-white">{album.artista}</p>
                  <p className="text-[10px] text-white/40">{album.total} {album.total === 1 ? 'música' : 'músicas'}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section>
        <SectionHeaderInner icon={<User className="h-4 w-4 text-[var(--primaria)]" />} titulo="ARTISTAS" verTodas="/artistas" />
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {artistasDerivados.length === 0 ? (
            <EstadoVazio titulo="Nenhum artista" texto="Nenhum artista encontrado." />
          ) : (
            artistasDerivados.map((artista) => (
              <div
                key={artista.nome}
                onClick={() => navigate(`/artista/${encodeURIComponent(artista.nome)}`)}
                className="card min-w-[110px] rounded-2xl border border-white/10 bg-[#141522]/90 p-3 text-center shadow-lg hover:border-[var(--primaria)]/40 transition-all group shrink-0"
              >
                <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-gradient-to-tr from-[var(--primaria)]/40 to-[var(--acento)]/40 text-white font-bold text-xs border border-white/10">
                  {artista.nome[0].toUpperCase()}
                </div>
                <p className="mt-2 truncate text-xs font-bold text-white group-hover:text-[var(--primaria)] transition-colors">{artista.nome}</p>
                <p className="text-[10px] text-white/40">{artista.total} {artista.total === 1 ? 'música' : 'músicas'}</p>
              </div>
            ))
          )}
        </div>
      </section>

      <section>
        <SectionHeaderInner icon={<Folder className="h-4 w-4 text-[var(--primaria)]" />} titulo="PASTAS DE ÁUDIO LOCAIS" />
        {pastasLocais.length === 0 ? (
          <EstadoVazio titulo="Nenhuma pasta" texto="Nenhuma pasta de áudio local encontrada." />
        ) : (
          <div className="card divide-y divide-white/5 rounded-2xl border border-white/10 bg-[#141522]/90 overflow-hidden shadow-xl">
            {pastasLocais.map((pasta) => (
              <div
                key={pasta.nome}
                className="flex items-center justify-between p-3 hover:bg-white/5 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[var(--primaria-dim)] flex items-center justify-center shrink-0">
                    <Folder className="h-5 w-5 text-[var(--primaria)]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate group-hover:text-[var(--primaria)] transition-colors">{pasta.nome}</p>
                    <p className="text-[10px] text-white/50">{pasta.total} {pasta.total === 1 ? 'música' : 'músicas'}</p>
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