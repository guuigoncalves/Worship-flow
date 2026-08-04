import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMusicas } from '../hooks/useMusicas';
import { usePlayer } from '../hooks/usePlayer';
import { SectionHeader, CapaMusica, LinhaLista, Avatar } from '../components/aurora';
import { EstadoVazio } from '../components/compartilhado/EstadoVazio';
import { User, Play, ArrowLeft } from 'lucide-react';

export const Artista: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { musicas, loading } = useMusicas();
    const { tocar } = usePlayer();

    const nomeArtista = id ? decodeURIComponent(id) : '';

    const musicasDoArtista = React.useMemo(() => {
        return musicas.filter((m) => (m.artista || 'Sem Artista') === nomeArtista);
    }, [musicas, nomeArtista]);

    if (loading) {
        return (
            <div className="app-page flex items-center justify-center min-h-[60vh]">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (musicasDoArtista.length === 0) {
        return (
            <div className="app-page space-y-6 pb-24 fade-in">
            <button
            onClick={() => navigate('/artistas')}
            className="btn-ghost text-xs flex items-center gap-2"
            >
            <ArrowLeft size={16} />
            <span>Voltar para Artistas</span>
            </button>
            <EstadoVazio
            titulo="Artista não encontrado"
            texto="Não foram encontradas músicas registradas para este artista."
            />
            </div>
        );
    }

    return (
        <div className="app-page space-y-6 pb-24 fade-in">
        <button
        onClick={() => navigate('/artistas')}
        className="btn-ghost text-xs flex items-center gap-2"
        >
        <ArrowLeft size={16} />
        <span>Voltar para Artistas</span>
        </button>

        <div className="card p-5 bg-[var(--primaria-dim)] border border-[var(--borda)] flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
        <Avatar nome={nomeArtista} tamanho="lg" />
        <div className="min-w-0 flex-1 space-y-1">
        <p className="text-[10px] uppercase font-bold text-[var(--primaria)] tracking-wider">
        Artista
        </p>
        <h1 className="text-xl font-bold text-white truncate">{nomeArtista}</h1>
        <p className="text-xs text-white/60">
        {musicasDoArtista.length} {musicasDoArtista.length === 1 ? 'música cadastrada' : 'músicas cadastradas'}
        </p>
        </div>
        <button
        onClick={() => tocar(musicasDoArtista[0])}
        className="btn-primary py-2.5 px-4 text-xs flex items-center gap-2 shrink-0"
        >
        <Play size={16} />
        <span>Tocar Destaque</span>
        </button>
        </div>

        <div>
        <SectionHeader icone={<User size={16} />} titulo="Músicas do Artista" />
        <div className="card divide-y divide-white/5">
        {musicasDoArtista.map((m) => (
            <LinhaLista
            key={m.id}
            prefixo={<CapaMusica tom={m.tom} titulo={m.titulo} tamanho="sm" />}
            titulo={m.titulo}
            subtitulo={`Tom: ${m.tom || 'N/A'}`}
            sufixo={
                <button
                onClick={(e) => {
                    e.stopPropagation();
                    tocar(m);
                }}
                className="p-2 rounded-lg bg-white/5 hover:bg-purple-500/30 text-white/80 hover:text-white transition-colors"
                title="Tocar"
                >
                <Play size={14} />
                </button>
            }
            onClick={() => navigate(`/musica/${m.id}`)}
            />
        ))}
        </div>
        </div>
        </div>
    );
};

export default Artista;
