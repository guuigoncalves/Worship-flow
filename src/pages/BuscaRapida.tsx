import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMusicas } from '../hooks/useMusicas';
import { EstadoVazio } from '../components/compartilhado/EstadoVazio';
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
      <div className="app-page flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#A259FF', borderTopColor: 'transparent' }} />
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Carregando músicas…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-page space-y-5 pb-24 fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="btn-ghost h-9 w-9 p-0">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gradient">Busca Rápida</h1>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Encontre músicas, artistas e cifras no seu repertório
          </p>
        </div>
      </div>

      {/* Barra de busca destaque */}
      <div className="relative">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2"
          style={{ color: '#A259FF' }}
        />
        <input
          type="text"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="Digite título, artista ou palavra-chave…"
          autoFocus
          className="input pl-12 py-3.5 text-sm"
          style={{
            background: 'rgba(162,89,255,0.06)',
            borderColor: termo ? 'rgba(162,89,255,0.5)' : 'rgba(162,89,255,0.2)',
            boxShadow: termo ? '0 0 0 3px rgba(162,89,255,0.12)' : 'none',
          }}
        />
        {termo && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full text-xs"
            style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}
            onClick={() => setTermo('')}
            aria-label="Limpar busca"
          >
            ×
          </button>
        )}
      </div>

      {/* Filtros por chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {filtros.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`chip shrink-0 text-sm ${filtro === f.id ? 'chip-active' : ''}`}
            onClick={() => setFiltro(f.id)}
          >
            <Filter size={12} />
            {f.label}
          </button>
        ))}
      </div>

      {/* Resultados */}
      {!termo.trim() ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ background: 'rgba(162,89,255,0.1)', border: '1px solid rgba(162,89,255,0.2)' }}
          >
            <Search size={28} style={{ color: '#A259FF' }} />
          </div>
          <p className="text-center text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Digite para pesquisar instantaneamente
          </p>
        </div>
      ) : resultados.length === 0 ? (
        <EstadoVazio
          titulo="Nenhum resultado encontrado"
          texto={`Não encontramos nada para "${termo}". Tente outras palavras.`}
        />
      ) : (
        <div className="space-y-2">
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {resultados.length} resultado{resultados.length !== 1 ? 's' : ''}
          </p>
          <div className="card divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            {resultados.map((m) => (
              <div key={m.id} className="flex items-center gap-3 p-3">
                {/* Capa / avatar */}
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold"
                  style={{
                    background: `hsl(${(m.titulo.charCodeAt(0) * 17) % 360}, 50%, 20%)`,
                    color: `hsl(${(m.titulo.charCodeAt(0) * 17) % 360}, 80%, 70%)`,
                    border: `1px solid hsl(${(m.titulo.charCodeAt(0) * 17) % 360}, 50%, 30%)`,
                  }}
                >
                  {m.tom || m.titulo.slice(0, 2)}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1" onClick={() => navigate(`/musica/${m.id}`)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && navigate(`/musica/${m.id}`)}>
                  <p className="truncate font-semibold text-sm">{m.titulo}</p>
                  <p className="truncate text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    {m.artista || 'Artista não informado'}
                  </p>
                </div>

                {/* Badge tom */}
                <span
                  className="shrink-0 rounded-lg px-2 py-0.5 text-xs font-bold"
                  style={{ background: 'rgba(162,89,255,0.18)', color: '#A259FF', border: '1px solid rgba(162,89,255,0.3)' }}
                >
                  {m.tom || '—'}
                </span>

                {/* Botões ação */}
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                    onClick={() => void alternarFavorita(m.id)}
                    aria-label={m.eFavorita ? 'Remover favorito' : 'Favoritar'}
                  >
                    <Star
                      size={14}
                      className={m.eFavorita ? 'fill-current' : ''}
                      style={{ color: m.eFavorita ? '#E4B429' : 'rgba(255,255,255,0.35)' }}
                    />
                  </button>
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                    style={{ background: 'rgba(162,89,255,0.12)' }}
                    onClick={() => navigate(`/musica/${m.id}`)}
                    aria-label="Ver cifra"
                  >
                    <FileText size={14} style={{ color: '#A259FF' }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BuscaRapida;
