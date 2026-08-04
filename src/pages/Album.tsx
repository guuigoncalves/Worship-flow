import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMusicas } from '../hooks/useMusicas';
import { usePlayer } from '../hooks/usePlayer';
import { SectionHeader, CapaMusica, LinhaLista } from '../components/aurora';
import { EstadoVazio } from '../components/compartilhado/EstadoVazio';
import { Disc, Play, ArrowLeft } from 'lucide-react';

export const Album: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { musicas, loading } = useMusicas();
    const { tocar } = usePlayer();

    const nomeArtista = id ? decodeURIComponent(id) : '';

    const musicasDoAlbum = React.useMemo(() => {
        return musicas.filter((m) => (m.artista || 'Sem Artista') === nomeArtista);
    }, [musicas, nomeArtista]);

    if (loading) {
        return (
            <div className="app-page flex items-center justify-center min-h-[60vh]">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (musicasDoAlbum.length === 0) {
        return (
            <div className="app-page space-y-6 pb-24 fade-in">
            <button
            onClick={() => navigate('/albuns')}
            className="btn-ghost text-xs flex items-center gap-2"
            >
            <ArrowLeft size={16} />
            <span>Voltar para Álbuns</span>
            </button>
            <EstadoVazio
            titulo="Álbum não encontrado"
            texto="Não foram encontradas músicas registradas para este álbum."
            />
            </div>
        );
    }

    const primeira = musicasDoAlbum[0];

    return (
        <div className="app-page space-y-6 pb-24 fade-in">
        <button
        onClick={() => navigate('/albuns')}
        className="btn-ghost text-xs flex items-center gap-2"
        >
        <ArrowLeft size={16} />
        <span>Voltar para Álbuns</span>
        </button>

        <div className="card p-5 bg-[var(--primaria-dim)] border border-[var(--borda)] flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
        <CapaMusica
        tom={primeira.tom}
        titulo={`Coletânea ${nomeArtista}`}
        tamanho="lg"
        className="w-20 h-20 text-xl"
        />
        <div className="min-w-0 flex-1 space-y-1">
        <p className="text-[10px] uppercase font-bold text-[var(--primaria)] tracking-wider">
        Álbum Virtual
        </p>
        <h1 className="text-xl font-bold text-white truncate">
        Coletânea {nomeArtista}
        </h1>
        <p className="text-xs text-white/60">
        {nomeArtista} • {musicasDoAlbum.length} {musicasDoAlbum.length === 1 ? 'música' : 'músicas'}
        </p>
        </div>
        <button
        onClick={() => tocar(primeira)}
        className="btn-primary py-2.5 px-4 text-xs flex items-center gap-2 shrink-0"
        >
        <Play size={16} />
        <span>Tocar Tudo</span>
        </button>
        </div>

        <div>
        <SectionHeader icone={<Disc size={16} />} titulo="Faixas do Álbum" />
        <div className="card divide-y divide-white/5">
        {musicasDoAlbum.map((m, idx) => (
            <LinhaLista
            key={m.id}
            prefixo={
                <span className="text-xs font-semibold text-white/40 w-5 text-center">
                {idx + 1}
                </span>
            }
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

export default Album;
