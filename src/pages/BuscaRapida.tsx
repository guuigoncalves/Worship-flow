import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMusicas } from '../hooks/useMusicas';
import { EstadoVazio } from '../components/compartilhado/EstadoVazio';
import { CapaMusica } from '../components/aurora';
import { Search, ArrowLeft, Star, FileText, Filter } from 'lucide-react';

type FiltroTipo = 'todas' | 'musicas' | 'cifras' | 'artistas';

const filtros: { id: FiltroTipo; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'musicas', label: 'Músicas' },
  { id: 'cifras', label: 'Cifras' },
  { id: 'artistas', label: 'Artistas' },
];

export const BuscaRapida: React.FC = () => {
  const navigate = useNavigate();
  const { musicas, loading, alternarFavorita } = useMusicas();
  const [termo, setTermo] = useState('');
  const [filtro, setFiltro] = useState<FiltroTipo>('todas');

  const resultados = useMemo(() => {
    if (!termo.trim()) return [];
    const t = termo.toLowerCase();
    let lista = musicas.filter(
      (m) =>
        m.titulo.toLowerCase().includes(t) ||
        (m.artista && m.artista.toLowerCase().includes(t)) ||
        (m.tags && m.tags.some((tag) => tag.toLowerCase().includes(t)))
    );
    if (filtro === 'musicas') lista = lista.filter((m) => m.possuiCifra !== true);
    if (filtro === 'cifras') lista = lista.filter((m) => m.possuiCifra === true);
    if (filtro === 'artistas') {
      const vistos = new Set<string>();
      lista = lista.filter((m) => {
        if (vistos.has(m.artista)) return false;
        vistos.add(m.artista);
        return true;
      });
    }
    return lista;
  }, [musicas, termo, filtro]);

  if (loading) {
    return (
      <main className="app-page flex items-center justify-center min-h-[60vh]" style={{ backgroundColor: '#0B0C10' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
          <p className="text-xs text-white/40">Carregando repertório…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="app-page space-y-6 pb-32 fade-in" style={{ backgroundColor: '#0B0C10' }}>
      {/* Header */}
      <header className="flex items-center gap-3 pt-1">
        <button
          onClick={() => navigate(-1)}
          className="btn-ghost h-9 w-9 p-0 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
          type="button"
          aria-label="Voltar"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Busca Rápida</h1>
          <p className="text-[10px] text-white/40">Pesquise músicas, cifras e artistas em tempo real</p>
        </div>
      </header>

      {/* Input de Busca com Estilo Aurora */}
      <div className="relative">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none"
        />
        <input
          type="text"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="Digite título, artista ou tag…"
          autoFocus
          className="w-full bg-[#141522]/90 border border-white/10 rounded-2xl pl-12 pr-10 py-3.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-purple-500 transition-all shadow-xl"
        />
        {termo && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-white/60 hover:text-white text-xs"
            onClick={() => setTermo('')}
            aria-label="Limpar busca"
          >
            ×
          </button>
        )}
      </div>

      {/* Filtros em Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {filtros.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border shrink-0 flex items-center gap-1.5 ${
              filtro === f.id
                ? 'bg-purple-600/30 text-white border-purple-500/50 shadow-lg shadow-purple-950/50'
                : 'bg-[#141522]/80 text-white/40 border-white/10 hover:text-white'
            }`}
            onClick={() => setFiltro(f.id)}
          >
            <Filter size={12} />
            {f.label}
          </button>
        ))}
      </div>

      {/* Resultados da Pesquisa */}
      {!termo.trim() ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="p-4 rounded-3xl bg-purple-600/10 text-purple-400 border border-purple-500/20">
            <Search size={32} />
          </div>
          <p className="text-xs text-white/40">Digite para pesquisar em todo o repertório</p>
        </div>
      ) : resultados.length === 0 ? (
        <EstadoVazio
          titulo="Nenhum resultado encontrado"
          texto={`Não encontramos correspondências para "${termo}".`}
        />
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">Resultados da busca</p>
            <span className="text-xs font-semibold text-purple-400">{resultados.length} encontrados</span>
          </div>

          <div className="space-y-2">
            {resultados.map((m) => (
              <div
                key={m.id}
                className="card p-3 flex items-center justify-between gap-3 border border-white/10 bg-[#141522]/80 hover:bg-[#1A1040]/50 transition-all rounded-2xl cursor-pointer"
              >
                <div
                  className="flex items-center gap-3 min-w-0 flex-1"
                  onClick={() => navigate(`/musica/${m.id}`)}
                >
                  <CapaMusica tom={m.tom} titulo={m.titulo} tamanho="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate">{m.titulo}</p>
                    <p className="text-xs text-white/40 truncate">{m.artista || 'Artista não informado'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 text-xs font-semibold border border-purple-500/20">
                    {m.tom || 'C'}
                  </span>
                  <button
                    type="button"
                    onClick={() => void alternarFavorita(m.id)}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white transition-colors"
                  >
                    <Star
                      size={16}
                      className={m.eFavorita ? 'fill-yellow-400 text-yellow-400' : ''}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/musica/${m.id}`)}
                    className="p-2 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600/30 transition-colors"
                  >
                    <FileText size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
};

export default BuscaRapida;
