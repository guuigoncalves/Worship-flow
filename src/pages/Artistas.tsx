import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMusicas } from '../hooks/useMusicas';
import { SectionHeader } from '../components/aurora';
import { EstadoVazio } from '../components/compartilhado/EstadoVazio';
import { User, ChevronRight } from 'lucide-react';

export const Artistas: React.FC = () => {
    const navigate = useNavigate();
    const { musicas, loading } = useMusicas();

    const artistas = React.useMemo(() => {
        const mapa = new Map<string, number>();
        musicas.forEach((m) => {
            const nome = m.artista ? m.artista.trim() : 'Sem Artista';
            mapa.set(nome, (mapa.get(nome) || 0) + 1);
        });

        return Array.from(mapa.entries())
        .map(([nome, total]) => ({ nome, total }))
        .sort((a, b) => a.nome.localeCompare(b.nome));
    }, [musicas]);

    if (loading) {
        return (
            <div className="app-page flex items-center justify-center min-h-[60vh]">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="app-page space-y-6 pb-24 fade-in">
        <div>
        <h1 className="text-2xl font-bold text-gradient">Artistas</h1>
        <p className="text-xs text-white/60">
        Artistas identificados no seu repertório
        </p>
        </div>

        <SectionHeader icone={<User size={16} />} titulo="Todos os Artistas" />

        {artistas.length === 0 ? (
            <EstadoVazio
            titulo="Nenhum artista cadastrado"
            texto="Adicione o nome do artista ao cadastrar músicas para listar aqui."
            />
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {artistas.map((art) => (
                <div
                key={art.nome}
                onClick={() => navigate(`/artista/${encodeURIComponent(art.nome)}`)}
                className="card p-3.5 cursor-pointer hover:bg-white/10 transition-all border border-white/10 flex items-center justify-between gap-3 group"
                >
                <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-white text-base shrink-0 border border-white/20 shadow-sm group-hover:scale-105 transition-transform">
                {art.nome.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                {art.nome}
                </p>
                <p className="text-xs text-white/50">
                {art.total} {art.total === 1 ? 'música' : 'músicas'}
                </p>
                </div>
                </div>
                <ChevronRight size={18} className="text-white/40 group-hover:text-white transition-colors shrink-0" />
                </div>
            ))}
            </div>
        )}
        </div>
    );
};

export default Artistas;
