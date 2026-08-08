import { useNavigate } from 'react-router-dom';
import { useMusicas } from '../hooks/useMusicas';
import { SectionHeader, Avatar, Header } from '../components/aurora';
import { EstadoVazio } from '../components/compartilhado/EstadoVazio';

import { User, Search, ArrowLeft } from 'lucide-react';
import { useMemo } from 'react';

export default function Artistas() {
  const navigate = useNavigate();
  const { musicas, loading } = useMusicas();

  const artistas = useMemo(() => {
    const mapa = new Map<string, number>();
    musicas.forEach((m) => {
      const nome = m.artista ? m.artista.trim() : 'Sem Artista';
      mapa.set(nome, (mapa.get(nome) || 0) + 1);
    });
    return Array.from(mapa.entries())
      .map(([nome, total]) => ({ nome, total }))
      .sort((a, b) => b.total - a.total);
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
      <Header subtitulo="Artistas e Ministérios" />

      <div className="flex items-center justify-between gap-3 pt-1">
        <button className="h-9 w-9 p-0 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors" type="button" onClick={() => navigate(-1)} aria-label="Voltar">
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-xs font-bold uppercase tracking-wider text-white/70">Artistas ({artistas.length})</h2>
        <button className="h-9 w-9 p-0 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors" type="button" aria-label="Buscar" onClick={() => navigate('/busca-rapida')}>
          <Search size={18} />
        </button>
      </div>

      {artistas.length === 0 ? (
        <EstadoVazio
          titulo="Nenhum artista cadastrado"
          texto="Adicione o nome do artista ao cadastrar músicas para listar aqui."
        />
      ) : (
        <div className="space-y-2">
          {artistas.map((art) => (
            <div
              key={art.nome}
              onClick={() => navigate(`/artista/${encodeURIComponent(art.nome)}`)}
              className="card flex items-center gap-4 p-4 cursor-pointer hover:bg-white/5 transition-all border border-white/10 rounded-2xl group"
            >
              <Avatar nome={art.nome} tamanho="md" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate group-hover:text-[var(--primaria)] transition-colors">
                  {art.nome}
                </p>
                <p className="text-xs text-white/50">{art.total} {art.total === 1 ? 'música' : 'músicas'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}