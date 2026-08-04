import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMusicas } from '../hooks/useMusicas';
import { SectionHeader, CapaMusica } from '../components/aurora';
import { EstadoVazio } from '../components/compartilhado/EstadoVazio';
import { Disc, Info } from 'lucide-react';

export const Albuns: React.FC = () => {
    const navigate = useNavigate();
    const { musicas, loading } = useMusicas();

    const albuns = React.useMemo(() => {
        const mapa = new Map<string, typeof musicas>();
        musicas.forEach((m) => {
            const chave = m.artista ? m.artista : 'Sem Artista';
            const lista = mapa.get(chave) || [];
            lista.push(m);
            mapa.set(chave, lista);
        });

        return Array.from(mapa.entries()).map(([artista, lista]) => ({
            id: encodeURIComponent(artista),
                                                                     nome: `Coletânea ${artista}`,
                                                                     artista,
                                                                     totalMusicas: lista.length,
                                                                     primeiraMusica: lista[0],
        }));
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
        <h1 className="text-2xl font-bold text-gradient">Álbuns</h1>
        <p className="text-xs text-white/60">
        Coleções virtuais organizadas por artista
        </p>
        </div>

        <div className="card p-3 bg-[var(--primaria-dim)] border border-[var(--primaria)]/20 text-xs text-textoSecundario flex items-start gap-2.5">
        <Info size={16} className="text-[var(--primaria)] shrink-0 mt-0.5" />
        <p>
        Os álbuns são agrupamentos derivados automaticamente do artista das suas músicas cadastradas.
        </p>
        </div>

        <SectionHeader icone={<Disc size={16} />} titulo="Todos os Álbuns" />

        {albuns.length === 0 ? (
            <EstadoVazio
            titulo="Nenhum álbum disponível"
            texto="Cadastre músicas com artistas definidos para gerar suas coletâneas."
            />
        ) : (
            <div className="grid grid-cols-2 gap-3">
            {albuns.map((alb) => (
                <div
                key={alb.id}
                onClick={() => navigate(`/album/${alb.id}`)}
                className="card p-3.5 cursor-pointer hover:bg-white/10 transition-all border border-white/10 flex flex-col items-center text-center gap-3 group"
                >
                <CapaMusica
                tom={alb.primeiraMusica?.tom}
                titulo={alb.nome}
                tamanho="lg"
                className="group-hover:scale-105 transition-transform"
                />
                <div className="w-full min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                {alb.nome}
                </p>
                <p className="text-[10px] text-white/50 truncate mt-0.5">
                {alb.totalMusicas} {alb.totalMusicas === 1 ? 'música' : 'músicas'}
                </p>
                </div>
                </div>
            ))}
            </div>
        )}
        </div>
    );
};

export default Albuns;
