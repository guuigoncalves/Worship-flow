import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMusicas } from '../hooks/useMusicas';
import { SectionHeader, CapaMusica, LinhaLista } from '../components/aurora';
import { EstadoVazio } from '../components/compartilhado/EstadoVazio';
import {
    FileText,
    PlusCircle,
    Layers,
    Search,
    Upload,
    Clock,
    ChevronRight
} from 'lucide-react';

export const Cifra: React.FC = () => {
    const navigate = useNavigate();
    const { musicas, loading } = useMusicas();

    const recentes = React.useMemo(() => {
        return [...musicas].slice(0, 5);
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
        <h1 className="text-2xl font-bold text-gradient">Cifra</h1>
        <p className="text-xs text-white/60">
        Central de cifras, medleys e ferramentas de estudo
        </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
        onClick={() => navigate('/biblioteca')}
        className="card p-3.5 flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-all cursor-pointer group border border-white/10"
        >
        <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">
        <FileText size={20} />
        </div>
        <span className="text-xs font-semibold text-white/90">Biblioteca</span>
        </button>

        <button
        onClick={() => navigate('/editor')}
        className="card p-3.5 flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-all cursor-pointer group border border-white/10"
        >
        <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
        <PlusCircle size={20} />
        </div>
        <span className="text-xs font-semibold text-white/90">Nova Cifra</span>
        </button>

        <button
        onClick={() => navigate('/medleys')}
        className="card p-3.5 flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-all cursor-pointer group border border-white/10"
        >
        <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform">
        <Layers size={20} />
        </div>
        <span className="text-xs font-semibold text-white/90">Medleys</span>
        </button>

        <button
        onClick={() => navigate('/busca-rapida')}
        className="card p-3.5 flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-all cursor-pointer group border border-white/10"
        >
        <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 group-hover:scale-110 transition-transform">
        <Search size={20} />
        </div>
        <span className="text-xs font-semibold text-white/90">Busca Rápida</span>
        </button>
        </div>

        <div
        onClick={() => navigate('/importar')}
        className="card p-4 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/30 flex items-center justify-between cursor-pointer hover:bg-white/10 transition-all group"
        >
        <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300">
        <Upload size={20} />
        </div>
        <div>
        <p className="text-xs font-bold text-white">Importar Cifras</p>
        <p className="text-[10px] text-white/60">
        Traga cifras de texto, arquivos ou Cifra Club
        </p>
        </div>
        </div>
        <ChevronRight size={18} className="text-white/40 group-hover:text-white transition-colors" />
        </div>

        <div>
        <SectionHeader
        icone={<Clock size={16} />}
        titulo="Cifras Recentes"
        acaoTexto="Ver todas"
        onAcao={() => navigate('/biblioteca')}
        />

        {recentes.length === 0 ? (
            <EstadoVazio
            titulo="Nenhuma cifra cadastrada"
            texto="Crie ou importe suas primeiras cifras para visualizá-las aqui."
            />
        ) : (
            <div className="card divide-y divide-white/5">
            {recentes.map((m) => (
                <LinhaLista
                key={m.id}
                prefixo={<CapaMusica tom={m.tom} titulo={m.titulo} tamanho="sm" />}
                titulo={m.titulo}
                subtitulo={m.artista || 'Artista não informado'}
                sufixo={
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {m.tom || 'N/A'}
                    </span>
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

export default Cifra;
