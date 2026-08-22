import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMusicas } from '../hooks/useMusicas';
import { usePlayer } from '../hooks/usePlayer';
import { SectionHeader, CapaMusica, Header } from '../components/aurora';
import { EstadoVazio } from '../components/compartilhado/EstadoVazio';

import {
  Search,
  Plus,
  Music,
  Star,
  Play,
  FileText,
  Layers,
  Download,
  MoreVertical,
  ChevronRight
} from 'lucide-react';

type AbaFiltro = 'todas' | 'musicas' | 'cifras' | 'medleys' | 'importadas';

export default function Biblioteca() {
  const navigate = useNavigate();
  const { musicas, loading, alternarFavorita } = useMusicas();
  const { tocar } = usePlayer();

  const [busca, setBusca] = useState('');
  const [abaAtiva, setAbaAtiva] = useState<AbaFiltro>('todas');

  const musicasFiltradas = useMemo(() => {
    return musicas.filter((m) => {
      const query = busca.toLowerCase().trim();
      const atendeBusca = !query ||
        m.titulo.toLowerCase().includes(query) ||
        (m.artista && m.artista.toLowerCase().includes(query));

      let atendeAba = true;
      if (abaAtiva === 'musicas') {
        atendeAba = !m.possuiCifra;
      } else if (abaAtiva === 'cifras') {
        atendeAba = Boolean(m.possuiCifra) || Boolean(m.letra) || (m.acordes && m.acordes.length > 0);
      } else if (abaAtiva === 'medleys') {
        atendeAba = false;
      } else if (abaAtiva === 'importadas') {
        atendeAba = false;
      }

      return atendeBusca && atendeAba;
    });
  }, [musicas, busca, abaAtiva]);

  if (loading) {
    return (
      <div className="app-page flex items-center justify-center min-h-[60vh]" style={{ backgroundColor: 'var(--fundo)' }}>
        <div className="w-8 h-8 border-2 border-[var(--primaria)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="app-page space-y-6 pb-32 fade-in" style={{ backgroundColor: 'var(--fundo)' }}>
      <Header subtitulo="Sua biblioteca musical completa" />

      <div className="flex items-center justify-between gap-3 pt-1">
        <h2 className="text-sm font-bold uppercase tracking-wider text-white/70">Acervo Musical</h2>
        <button
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[var(--primaria)] to-[var(--acento)] text-xs font-bold text-fundo shadow-lg shadow-purple-900/20 hover:opacity-90 transition-all flex items-center gap-1.5"
          type="button"
          onClick={() => navigate('/editor')}
        >
          <Plus size={14} />
          <span>Nova Cifra</span>
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar músicas, artistas, coleções..."
          className="w-full bg-[#12142B]/80 border border-white/10 rounded-2xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[var(--primaria)]/50 focus:ring-1 focus:ring-[var(--primaria)]/50 backdrop-blur-xl transition-all"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'todas', label: 'Todas' },
          { id: 'musicas', label: 'Músicas' },
          { id: 'cifras', label: 'Cifras' },
          { id: 'medleys', label: 'Medleys' },
          { id: 'importadas', label: 'Importadas' },
        ].map((aba) => (
          <button
            key={aba.id}
            type="button"
            className={`chip shrink-0 text-xs px-4 py-2 transition-all font-medium ${
              abaAtiva === aba.id
                ? 'bg-gradient-to-r from-[var(--primaria)] to-[var(--acento)] text-fundo border-transparent font-bold'
                : 'bg-[#12142B]/80 text-white/60 hover:text-white border border-white/10 hover:border-white/20'
            }`}
            onClick={() => setAbaAtiva(aba.id as AbaFiltro)}
          >
            {aba.label}
          </button>
        ))}
      </div>

      <section>
        <SectionHeader icone={<Music size={16} />} titulo={`${musicasFiltradas.length} ${musicasFiltradas.length === 1 ? 'item' : 'itens'}`} />

        {musicasFiltradas.length === 0 ? (
          <EstadoVazio
            titulo="Nenhum item encontrado"
            texto={
              busca || abaAtiva !== 'todas'
                ? 'Tente ajustar os filtros ou a pesquisa para encontrar o que procura.'
                : 'Sua biblioteca está vazia. Adicione novas cifras para começar!'
            }
          />
        ) : (
          <div className="card divide-y divide-white/5 rounded-2xl border border-white/10 bg-[#12142B]/90 overflow-hidden shadow-xl">
            {musicasFiltradas.map((m) => (
              <div
                key={m.id}
                onClick={() => navigate(`/musica/${m.id}`)}
                className="flex items-center justify-between p-3.5 hover:bg-white/5 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <CapaMusica tom={m.tom} titulo={m.titulo} tamanho="sm" />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-bold text-white truncate group-hover:text-[var(--primaria)] transition-colors">
                      {m.titulo}
                    </h3>
                    <p className="text-[11px] text-white/50 truncate">
                      {m.artista || 'Artista não informado'} · {m.tom}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {m.possuiCifra && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[var(--primaria-dim)] text-[var(--primaria)] border border-[var(--primaria)]/20 font-mono">
                      Cifra
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      tocar(m);
                    }}
                    className="p-2 rounded-xl bg-[var(--primaria-dim)] hover:bg-[var(--primaria)]/30 text-[var(--primaria)] hover:text-white transition-all border border-[var(--primaria)]/20"
                    title="Tocar"
                  >
                    <Play size={14} fill="currentColor" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      alternarFavorita(m.id);
                    }}
                    className="p-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-amber-400 transition-colors"
                    title={m.eFavorita ? 'Remover dos favoritos' : 'Favoritar'}
                  >
                    <Star size={16} fill={m.eFavorita ? 'currentColor' : 'none'} className={m.eFavorita ? 'text-amber-400' : ''} />
                  </button>
                  <button className="p-2 rounded-xl hover:bg-white/5 text-white/30 hover:text-white transition-colors" title="Opções">
                    <MoreVertical size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}