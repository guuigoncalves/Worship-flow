import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMusicas } from '../hooks/useMusicas';
import { usePlayer } from '../hooks/usePlayer';
import { SectionHeader, CapaMusica, LinhaLista } from '../components/aurora';
import { EstadoVazio } from '../components/compartilhado/EstadoVazio';
import { Music, Disc, User, Play, Radio, ArrowRight } from 'lucide-react';

export const Musica: React.FC = () => {
    const navigate = useNavigate();
    const { musicas, loading } = useMusicas();
    const { faixa, tocar } = usePlayer();

    const artistasDerivados = React.useMemo(() => {
        const mapa = new Map<string, number>();
        musicas.forEach((m) => {
            if (m.artista) {
                const total = mapa.get(m.artista) || 0;
                mapa.set(m.artista, total + 1);
            }
        });
        return Array.from(mapa.entries()).map(([nome, qtd]) => ({ nome, qtd }));
    }, [musicas]);

    const maisTocadas = React.useMemo(() => {
        return [...musicas]
        .sort((a, b) => (b.vezesTocada || 0) - (a.vezesTocada || 0))
        .slice(0, 5);
    }, [musicas]);

    if (loading) {
        return (
            <div className="app-page flex items-center justify-center min-h-[60vh]">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const faixaTom = (faixa as any)?.tom;

    return (
        <div className="app-page space-y-6 pb-24 fade-in">
        <div>
        <h1 className="text-2xl font-bold text-gradient">Música</h1>
        <p className="text-xs text-white/60">
        Hub de navegação e reprodução do seu repertório
        </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
        <button
        onClick={() => navigate('/player')}
        className="card p-3 flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-all cursor-pointer group border border-white/10"
        >
        <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">
        <Radio size={20} />
        </div>
        <span className="text-xs font-medium text-white/90">Player</span>
        </button>

        <button
        onClick={() => navigate('/albuns')}
        className="card p-3 flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-all cursor-pointer group border border-white/10"
        >
        <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 group-hover:scale-110 transition-transform">
        <Disc size={20} />
        </div>
        <span className="text-xs font-medium text-white/90">Álbuns</span>
        </button>

        <button
        onClick={() => navigate('/artistas')}
        className="card p-3 flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-all cursor-pointer group border border-white/10"
        >
        <div className="p-2.5 rounded-xl bg-pink-500/20 text-pink-400 group-hover:scale-110 transition-transform">
        <User size={20} />
        </div>
        <span className="text-xs font-medium text-white/90">Artistas</span>
        </button>
        </div>

        {faixa && (
            <div className="card p-4 bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/30">
            <SectionHeader icone={<Radio size={16} />} titulo="Tocando Agora" />
            <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
            <CapaMusica tom={faixaTom} titulo={faixa.titulo} tamanho="md" />
            <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">
            {faixa.titulo}
            </p>
            <p className="text-xs text-white/60 truncate">
            {faixa.artista || 'Artista desconhecido'}
            </p>
            </div>
            </div>
            <button
            onClick={() => navigate('/player')}
            className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5 shrink-0"
            >
            <span>Abrir</span>
            <ArrowRight size={14} />
            </button>
            </div>
            </div>
        )}

        <div>
        <SectionHeader
        icone={<Music size={16} />}
        titulo="Mais Tocadas"
        acaoTexto="Ver biblioteca"
        onAcao={() => navigate('/biblioteca')}
        />

        {maisTocadas.length === 0 ? (
            <EstadoVazio
            titulo="Nenhuma música cadastrada"
            texto="Cadastre suas primeiras músicas para visualizar os destaques aqui."
            />
        ) : (
            <div className="card divide-y divide-white/5">
            {maisTocadas.map((m) => (
                <LinhaLista
                key={m.id}
                prefixo={<CapaMusica tom={m.tom} titulo={m.titulo} tamanho="sm" />}
                titulo={m.titulo}
                subtitulo={m.artista || 'Artista não informado'}
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
        )}
        </div>

        <div>
        <SectionHeader
        icone={<User size={16} />}
        titulo="Artistas"
        acaoTexto="Ver todos"
        onAcao={() => navigate('/artistas')}
        />

        {artistasDerivados.length === 0 ? (
            <EstadoVazio
            titulo="Nenhum artista encontrado"
            texto="Ao adicionar músicas com nome do artista, eles aparecerão aqui."
            />
        ) : (
            <div className="grid grid-cols-2 gap-2.5">
            {artistasDerivados.slice(0, 4).map((art) => (
                <div
                key={art.nome}
                onClick={() => navigate(`/artista/${encodeURIComponent(art.nome)}`)}
                className="card p-3 flex items-center gap-3 cursor-pointer hover:bg-white/10 transition-all border border-white/5"
                >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600/40 to-pink-600/40 flex items-center justify-center font-bold text-white text-sm shrink-0 border border-white/10">
                {art.nome.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">
                {art.nome}
                </p>
                <p className="text-[10px] text-white/50">
                {art.qtd} {art.qtd === 1 ? 'música' : 'músicas'}
                </p>
                </div>
                </div>
            ))}
            </div>
        )}
        </div>
        </div>
    );
};

export default Musica;
