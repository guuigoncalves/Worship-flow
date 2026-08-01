import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMedleys } from '../hooks/useMedleys';
import { SectionHeader } from '../components/aurora';
import { EstadoVazio } from '../components/compartilhado/EstadoVazio';
import { Layers, Plus, Trash2, ArrowLeft, ChevronRight } from 'lucide-react';

export const Medleys: React.FC = () => {
    const navigate = useNavigate();
    const { medleys, loading, excluirMedley } = useMedleys();

    if (loading) {
        return (
            <div className="app-page flex items-center justify-center min-h-[60vh]">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="app-page space-y-6 pb-24 fade-in">
        <button
        onClick={() => navigate('/cifra')}
        className="btn-ghost text-xs flex items-center gap-2"
        >
        <ArrowLeft size={16} />
        <span>Voltar para Cifra</span>
        </button>

        <div className="flex items-center justify-between">
        <div>
        <h1 className="text-2xl font-bold text-gradient">Medleys</h1>
        <p className="text-xs text-white/60">
        Crie e gerencie sequências e transições de músicas
        </p>
        </div>
        <button
        onClick={() => navigate('/medley/novo')}
        className="btn-primary py-2 px-3 text-xs flex items-center gap-1.5"
        >
        <Plus size={16} />
        <span>Novo Medley</span>
        </button>
        </div>

        <SectionHeader icone={<Layers size={16} />} titulo="Seus Medleys" />

        {medleys.length === 0 ? (
            <EstadoVazio
            titulo="Nenhum medley criado"
            texto="Crie arranjos contínuos combinando blocos e transições de tom."
            />
        ) : (
            <div className="space-y-3">
            {medleys.map((m) => (
                <div
                key={m.id}
                onClick={() => navigate(`/medley/${m.id}`)}
                className="card p-4 hover:bg-white/10 transition-all border border-white/10 flex items-center justify-between gap-3 cursor-pointer group"
                >
                <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">
                {m.titulo || (m as any).nome}
                </p>
                <p className="text-xs text-white/50 truncate mt-0.5">
                {m.blocos ? m.blocos.length : 0} blocos configurados
                </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                <button
                onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Excluir este medley?')) {
                        excluirMedley(m.id);
                    }
                }}
                className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-red-400 transition-colors"
                title="Excluir"
                >
                <Trash2 size={16} />
                </button>
                <ChevronRight size={18} className="text-white/40 group-hover:text-white transition-colors" />
                </div>
                </div>
            ))}
            </div>
        )}
        </div>
    );
};

export default Medleys;
