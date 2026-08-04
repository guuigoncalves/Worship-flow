import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMusicas } from '../hooks/useMusicas';
import { usePlayer } from '../hooks/usePlayer';
import { SectionHeader, CapaMusica } from '../components/aurora';
import { EstadoVazio } from '../components/compartilhado/EstadoVazio';
import { 
  Search, 
  Plus, 
  Music, 
  Star, 
  Play, 
  LayoutGrid, 
  List, 
  SlidersHorizontal,
  FileText,
  MoreVertical,
  Sliders,
  Sparkles
} from 'lucide-react';

type AbaFiltro = 'todas' | 'cifras' | 'favoritas' | 'tom';

export const Biblioteca: React.FC = () => {
    const navigate = useNavigate();
    const { musicas, loading, alternarFavorita } = useMusicas();
    const { tocar } = usePlayer();
    
    const [busca, setBusca] = useState('');
    const [abaAtiva, setAbaAtiva] = useState<AbaFiltro>('todas');
    const [filtroTom, setFiltroTom] = useState<string>('TODOS');
    const [modoExibicao, setModoExibicao] = useState<'lista' | 'grid'>('lista');

    const tonsDisponiveis = useMemo(() => {
        const setTons = new Set<string>();
        musicas.forEach((m) => {
            if (m.tom) setTons.add(m.tom);
        });
        return ['TODOS', ...Array.from(setTons)];
    }, [musicas]);

    const estatisticas = useMemo(() => {
        const totalMusicas = musicas.length;
        const totalCifras = musicas.filter(m => m.letra || m.acordes?.length > 0 || m.possuiCifra).length;
        const totalFavoritas = musicas.filter(m => m.eFavorita).length;
        return { totalMusicas, totalCifras, totalFavoritas };
    }, [musicas]);

    const musicasFiltradas = useMemo(() => {
        return musicas.filter((m) => {
            const query = busca.toLowerCase().trim();
            const atendeBusca = !query || 
                m.titulo.toLowerCase().includes(query) ||
                (m.artista && m.artista.toLowerCase().includes(query));

            let atendeAba = true;
            if (abaAtiva === 'cifras') {
                atendeAba = Boolean(m.letra || (m.acordes && m.acordes.length > 0) || m.possuiCifra);
            } else if (abaAtiva === 'favoritas') {
                atendeAba = Boolean(m.eFavorita);
            }

            const atendeTom = filtroTom === 'TODOS' || m.tom === filtroTom;

            return atendeBusca && atendeAba && atendeTom;
        });
    }, [musicas, busca, abaAtiva, filtroTom]);

    if (loading) {
        return (
            <div className="app-page flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="app-page space-y-6 pb-28 fade-in">
            {/* Header com Estatísticas */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                <div>
                    <h1 className="text-2xl font-bold text-gradient tracking-tight">Biblioteca</h1>
                    <p className="text-xs text-white/60 mt-0.5">
                        {estatisticas.totalMusicas} músicas • {estatisticas.totalCifras} cifras • {estatisticas.totalFavoritas} favoritas
                    </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                        onClick={() => setModoExibicao(m => m === 'lista' ? 'grid' : 'lista')}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-colors"
                        title={modoExibicao === 'lista' ? 'Ver em Grid' : 'Ver em Lista'}
                    >
                        {modoExibicao === 'lista' ? <LayoutGrid size={18} /> : <List size={18} />}
                    </button>
                    <button
                        onClick={() => navigate('/editor')}
                        className="btn-primary py-2 px-4 text-xs flex items-center gap-1.5 font-bold shadow-lg shadow-purple-600/30"
                    >
                        <Plus size={16} />
                        <span>Nova Cifra</span>
                    </button>
                </div>
            </div>

            {/* Barra de Busca + Filtro Rápido */}
            <div className="relative flex items-center gap-2">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                        type="text"
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        placeholder="Buscar por músicas, artistas, coleções..."
                        className="w-full bg-[#12131C]/80 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-xs text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 backdrop-blur-xl transition-all shadow-inner"
                    />
                </div>
                <button
                    onClick={() => setAbaAtiva(a => a === 'tom' ? 'todas' : 'tom')}
                    className={`p-3 rounded-2xl border transition-all ${
                        abaAtiva === 'tom' || filtroTom !== 'TODOS'
                            ? 'bg-purple-600/20 border-purple-500/50 text-purple-300'
                            : 'bg-[#141522]/90 border-white/10 text-white/60 hover:text-white'
                    }`}
                    title="Filtro de Tom"
                >
                    <SlidersHorizontal size={18} />
                </button>
            </div>

            {/* Abas de Categorias */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {[
                    { id: 'todas', label: 'Todas as cifras' },
                    { id: 'cifras', label: 'Com Cifra' },
                    { id: 'favoritas', label: 'Favoritas' },
                    { id: 'tom', label: 'Por Tom' },
                ].map((aba) => (
                    <button
                        key={aba.id}
                        onClick={() => setAbaAtiva(aba.id as AbaFiltro)}
                        className={`chip text-xs px-4 py-2 shrink-0 transition-all font-medium ${
                            abaAtiva === aba.id
                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-transparent shadow-md shadow-purple-600/20 font-bold'
                                : 'bg-[#141522]/80 text-white/60 hover:text-white border border-white/10 hover:border-white/20'
                        }`}
                    >
                        {aba.label}
                    </button>
                ))}
            </div>

            {/* Seletor de Tons quando aba 'tom' ativa */}
            {(abaAtiva === 'tom' || filtroTom !== 'TODOS') && tonsDisponiveis.length > 1 && (
                <div className="p-3 bg-[#141522]/90 border border-purple-500/20 rounded-2xl space-y-2">
                    <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider block">Filtrar por Tom</span>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                        {tonsDisponiveis.map((t) => (
                            <button
                                key={t}
                                onClick={() => setFiltroTom(t)}
                                className={`text-xs px-3 py-1 rounded-xl shrink-0 transition-all font-mono font-bold ${
                                    filtroTom === t
                                        ? 'bg-purple-600 text-white shadow-sm'
                                        : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Listagem de Conteúdo */}
            <div>
                <SectionHeader 
                    icone={<Music size={16} />} 
                    titulo={`${musicasFiltradas.length} ${musicasFiltradas.length === 1 ? 'música' : 'músicas'}`} 
                />

                {musicasFiltradas.length === 0 ? (
                    <EstadoVazio
                        titulo="Nenhuma música encontrada"
                        texto={
                            busca || filtroTom !== 'TODOS' || abaAtiva !== 'todas'
                                ? 'Tente ajustar os filtros ou a pesquisa para encontrar o que procura.'
                                : 'Sua biblioteca está vazia. Adicione novas cifras para começar!'
                        }
                    />
                ) : modoExibicao === 'lista' ? (
                    /* Visualização em Lista Estilizada (Padrão Mockup 6) */
                    <div className="card divide-y divide-white/5 bg-[#141522]/90 rounded-2xl border border-white/10 overflow-hidden shadow-xl">
                        {musicasFiltradas.map((m) => (
                            <div
                                key={m.id}
                                onClick={() => navigate(`/musica/${m.id}`)}
                                className="flex items-center justify-between p-3.5 hover:bg-white/5 transition-colors cursor-pointer group"
                            >
                                <div className="flex items-center gap-3.5 min-w-0">
                                    <CapaMusica tom={m.tom} titulo={m.titulo} tamanho="md" className="shadow-purple-900/20" />
                                    <div className="min-w-0">
                                        <h3 className="text-xs font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                                            {m.titulo}
                                        </h3>
                                        <p className="text-[11px] text-white/50 truncate">
                                            {m.artista || 'Artista não informado'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                                        {m.tom || 'C'}
                                    </span>

                                    {m.dificuldade && (
                                        <span className="text-[9px] font-semibold px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 capitalize hidden sm:inline-block">
                                            {m.dificuldade}
                                        </span>
                                    )}

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            tocar(m);
                                        }}
                                        className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/30 text-purple-300 hover:text-white transition-all border border-purple-500/20"
                                        title="Tocar"
                                    >
                                        <Play size={14} fill="currentColor" />
                                    </button>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            alternarFavorita(m.id);
                                        }}
                                        className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-amber-400 transition-colors"
                                        title={m.eFavorita ? 'Remover dos favoritos' : 'Favoritar'}
                                    >
                                        <Star size={16} fill={m.eFavorita ? 'currentColor' : 'none'} className={m.eFavorita ? 'text-amber-400' : ''} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Visualização em Grid de Cards */
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {musicasFiltradas.map((m) => (
                            <div
                                key={`grid-${m.id}`}
                                onClick={() => navigate(`/musica/${m.id}`)}
                                className="card p-3.5 bg-[#141522]/90 border border-white/10 hover:border-purple-500/40 rounded-2xl cursor-pointer group flex flex-col justify-between h-[165px] transition-all relative overflow-hidden shadow-lg"
                            >
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <CapaMusica tom={m.tom} titulo={m.titulo} tamanho="sm" />
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                alternarFavorita(m.id);
                                            }}
                                            className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-amber-400 transition-colors"
                                        >
                                            <Star size={14} fill={m.eFavorita ? 'currentColor' : 'none'} className={m.eFavorita ? 'text-amber-400' : ''} />
                                        </button>
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                                            {m.titulo}
                                        </h3>
                                        <p className="text-[10px] text-white/50 truncate">
                                            {m.artista || 'Artista não informado'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                                        {m.tom || 'C'}
                                    </span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            tocar(m);
                                        }}
                                        className="p-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/30 text-purple-300 hover:text-white transition-all"
                                    >
                                        <Play size={12} fill="currentColor" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Biblioteca;

