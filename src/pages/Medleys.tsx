import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMedleys } from '../hooks/useMedleys';
import { EstadoVazio } from '../components/compartilhado/EstadoVazio';
import { Layers, Plus, Trash2, ArrowLeft, ChevronRight, Clock } from 'lucide-react';

export const Medleys: React.FC = () => {
  const navigate = useNavigate();
  const { medleys, loading, excluirMedley } = useMedleys();

  if (loading) {
    return (
      <div className="app-page flex items-center justify-center min-h-[60vh]" style={{ backgroundColor: 'var(--fundo)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-white/40">Carregando medleys…</p>
        </div>
      </div>
    );
  }

  return (
    <main className="app-page space-y-6 pb-32 fade-in" style={{ backgroundColor: 'var(--fundo)' }}>
      {/* Header */}
      <header className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/cifra')}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white transition-colors"
            type="button"
            aria-label="Voltar"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Medleys</h1>
            <p className="text-[10px] text-white/40">Sequências contínuas de músicas</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/medley/novo')}
          className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/20 transition-all flex items-center gap-1.5"
          type="button"
        >
          <Plus size={16} />
          <span>Novo Medley</span>
        </button>
      </header>

      {/* Banner info */}
      <div className="rounded-2xl p-4 flex items-center gap-3 bg-[#12142B]/80 border border-purple-500/20 shadow-lg">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
          <Layers size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-white">Monte sequências de músicas</p>
          <p className="text-[10px] text-white/40">Ideal para cultos, eventos e momentos especiais</p>
        </div>
        <span className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
          {medleys.length}
        </span>
      </div>

      {/* Lista */}
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
              className="card p-3.5 flex items-center justify-between gap-3 border border-white/10 bg-[#12142B]/80 rounded-2xl hover:border-purple-500/40 transition-all cursor-pointer group shadow-lg"
            >
              {/* Ícone */}
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
                <Layers size={20} />
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate group-hover:text-purple-400 transition-colors">
                  {m.titulo || (m as any).nome}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    {m.blocos ? m.blocos.length : 0} blocos
                  </span>
                  {m.blocos && m.blocos.length > 0 && (
                    <span className="flex items-center gap-1 text-[10px] text-white/40">
                      <Clock size={12} />
                      ~{Math.round(m.blocos.length * 3.5)} min
                    </span>
                  )}
                </div>
              </div>

              {/* Ações */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Excluir este medley?')) {
                      excluirMedley(m.id);
                    }
                  }}
                  className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors border border-red-500/20"
                  title="Excluir"
                  aria-label="Excluir medley"
                >
                  <Trash2 size={16} />
                </button>
                <ChevronRight size={18} className="text-white/30 group-hover:text-white transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default Medleys;

