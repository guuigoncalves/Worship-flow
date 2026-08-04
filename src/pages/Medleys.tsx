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
      <div className="app-page flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div
            className="h-10 w-10 rounded-full border-2 animate-spin"
            style={{ borderColor: '#A259FF', borderTopColor: 'transparent' }}
          />
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Carregando medleys…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-page space-y-6 pb-24 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/cifra')} className="btn-ghost h-9 w-9 p-0">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gradient">Medleys</h1>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Sequências contínuas de músicas
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/medley/novo')}
          className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Novo Medley</span>
        </button>
      </div>

      {/* Banner info */}
      <div
        className="rounded-2xl p-4 flex items-center gap-3"
        style={{ background: 'rgba(162,89,255,0.08)', border: '1px solid rgba(162,89,255,0.2)' }}
      >
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ background: 'rgba(162,89,255,0.2)' }}
        >
          <Layers size={18} style={{ color: '#A259FF' }} />
        </div>
        <div>
          <p className="text-sm font-semibold">Monte sequências de músicas</p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Ideal para cultos, eventos e momentos especiais
          </p>
        </div>
        <span
          className="ml-auto shrink-0 rounded-full px-3 py-1 text-xs font-bold"
          style={{ background: 'rgba(162,89,255,0.2)', color: '#A259FF' }}
        >
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
              className="card group cursor-pointer p-4 flex items-center gap-3"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/medley/${m.id}`)}
            >
              {/* Ícone */}
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                style={{ background: 'rgba(162,89,255,0.15)', border: '1px solid rgba(162,89,255,0.25)' }}
              >
                <Layers size={20} style={{ color: '#A259FF' }} />
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{m.titulo || (m as any).nome}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                    style={{ background: 'rgba(162,89,255,0.15)', color: '#A259FF' }}
                  >
                    {m.blocos ? m.blocos.length : 0} blocos
                  </span>
                  {m.blocos && m.blocos.length > 0 && (
                    <span className="flex items-center gap-1 text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      <Clock size={10} />
                      ~{Math.round(m.blocos.length * 3.5)} min
                    </span>
                  )}
                </div>
              </div>

              {/* Ações */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Excluir este medley?')) {
                      excluirMedley(m.id);
                    }
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg opacity-0 transition-all group-hover:opacity-100"
                  style={{ background: 'rgba(224,64,64,0.12)', color: '#E04040' }}
                  title="Excluir"
                  aria-label="Excluir medley"
                >
                  <Trash2 size={14} />
                </button>
                <ChevronRight size={18} style={{ color: 'rgba(255,255,255,0.3)' }} className="group-hover:text-white transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Medleys;
