import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMusicas } from '../hooks/useMusicas';
import { SectionHeader, CapaMusica, LinhaLista } from '../components/aurora';
import { EstadoVazio } from '../components/compartilhado/EstadoVazio';
import { Search, Plus, Music, Star } from 'lucide-react';

export const Biblioteca: React.FC = () => {
    const navigate = useNavigate();
    const { musicas, loading, alternarFavorita } = useMusicas();
    const [busca, setBusca] = useState('');
    const [filtroTom, setFiltroTom] = useState<string>('TODOS');

    const tonsDisponiveis = useMemo(() => {
        const setTons = new Set<string>();
        musicas.forEach((m) => {
            if (m.tom) setTons.add(m.tom);
        });
            return ['TODOS', ...Array.from(setTons)];
    }, [musicas]);

    const musicasFiltradas = useMemo(() => {
        return musicas.filter((m) => {
            const atendeBusca =
            m.titulo.toLowerCase().includes(busca.toLowerCase()) ||
            (m.artista && m.artista.toLowerCase().includes(busca.toLowerCase()));
            const atendeTom = filtroTom === 'TODOS' || m.tom === filtroTom;
            return atendeBusca && atendeTom;
        });
    }, [musicas, busca, filtroTom]);

    if (loading) {
        return (
            <div className="app-page flex items-center justify-center min-h-[60vh]">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="app-page space-y-6 pb-24 fade-in">
        <div className="flex items-center justify-between">
        <div>
        <h1 className="text-2xl font-bold text-gradient">Biblioteca</h1>
        <p className="text-xs text-white/60">
        {musicas.length} {musicas.length === 1 ? 'música cadastrada' : 'músicas cadastradas'}
        </p>
        </div>
        <button
        onClick={() => navigate('/editor')}
        className="btn-primary py-2 px-3 text-xs flex items-center gap-1.5"
        >
        <Plus size={16} />
        <span>Nova</span>
        </button>
        </div>

        <div className="relative">
        <Search size={16} className="absolute left-3.5 top-3.5 text-white/40" />
        <input
        type="text"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar por música ou artista..."
        className="input pl-10 text-xs w-full"
        />
        </div>

        {tonsDisponiveis.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {tonsDisponiveis.map((t) => (
                <button
                key={t}
                onClick={() => setFiltroTom(t)}
                className={`chip text-xs px-3 py-1 shrink-0 ${
                    filtroTom === t
                    ? 'bg-purple-600 text-white font-semibold'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
                >
                {t}
                </button>
            ))}
            </div>
        )}

        <div>
        <SectionHeader icone={<Music size={16} />} titulo="Músicas" />

        {musicasFiltradas.length === 0 ? (
            <EstadoVazio
            titulo="Nenhuma música encontrada"
            texto={
                busca || filtroTom !== 'TODOS'
                ? 'Tente ajustar os filtros ou a busca para encontrar suas cifras.'
                : 'Sua biblioteca está vazia. Adicione novas cifras para começar!'
            }
            />
        ) : (
            <div className="card divide-y divide-white/5">
            {musicasFiltradas.map((m) => (
                <LinhaLista
                key={m.id}
                prefixo={<CapaMusica tom={m.tom} titulo={m.titulo} tamanho="sm" />}
                titulo={m.titulo}
                subtitulo={m.artista || 'Artista não informado'}
                sufixo={
                    <div className="flex items-center gap-2">
                    <button
                    onClick={(e) => {
                        e.stopPropagation();
                        alternarFavorita(m.id);
                    }}
                    className="p-1.5 text-amber-400 hover:scale-110 transition-transform"
                    title={m.eFavorita ? 'Remover dos favoritos' : 'Favoritar'}
                    >
                    <Star size={16} fill={m.eFavorita ? 'currentColor' : 'none'} />
                    </button>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {m.tom || 'N/A'}
                    </span>
                    </div>
                }
                onClick={() => navigate(`/musica/${m.id}`)}
                />
            ))}
            </div>
        )}
        </div>
        </div>
    );
};

export default Biblioteca;
