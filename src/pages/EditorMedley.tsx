import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMedleys } from '../hooks/useMedleys';
import { ArrowLeft, Save, Plus, Trash2, ChevronUp, ChevronDown, Music, Clock } from 'lucide-react';

const TOMS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

export const EditorMedley: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { obterMedley, salvarMedley } = useMedleys();

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [blocos, setBlocos] = useState<any[]>([]);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (id && id !== 'novo') {
      const medley = obterMedley(id);
      if (medley) {
        setTitulo(medley.titulo || (medley as any).nome || '');
        setDescricao((medley as any).descricao || '');
        setBlocos(medley.blocos || []);
      }
    }
  }, [id, obterMedley]);

  function handleAdicionarBloco() {
    const novo = {
      id: String(Date.now()),
      tipo: 'musica',
      titulo: 'Novo Bloco',
      tom: 'G',
      compasso: '4/4',
    };
    setBlocos([...blocos, novo]);
  }

  function handleRemoverBloco(blocoId: string) {
    setBlocos(blocos.filter((b) => b.id !== blocoId));
  }

  function handleMoverCima(idx: number) {
    if (idx === 0) return;
    const copia = [...blocos];
    [copia[idx - 1], copia[idx]] = [copia[idx], copia[idx - 1]];
    setBlocos(copia);
  }

  function handleMoverBaixo(idx: number) {
    if (idx === blocos.length - 1) return;
    const copia = [...blocos];
    [copia[idx], copia[idx + 1]] = [copia[idx + 1], copia[idx]];
    setBlocos(copia);
  }

  const handleSalvar = async () => {
    if (!titulo.trim()) return;
    setSalvando(true);
    try {
      await salvarMedley({
        id: id === 'novo' ? String(Date.now()) : id,
        titulo,
        blocos,
      } as any);
      navigate('/medleys');
    } finally {
      setSalvando(false);
    }
  };

  const tempoTotal = blocos.length > 0 ? Math.round(blocos.length * 3.5) : 0;

  return (
    <div className="app-page space-y-5 pb-32 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/medleys')} className="btn-ghost h-9 w-9 p-0">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gradient">
              {id === 'novo' ? 'Novo Medley' : 'Editar Medley'}
            </h1>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {blocos.length} bloco{blocos.length !== 1 ? 's' : ''} · ~{tempoTotal} min
            </p>
          </div>
        </div>
        <button
          onClick={() => void handleSalvar()}
          disabled={!titulo.trim() || salvando}
          className="btn-primary py-2 px-4 text-sm flex items-center gap-2 disabled:opacity-50"
        >
          <Save size={16} />
          {salvando ? 'Salvando…' : 'Salvar'}
        </button>
      </div>

      {/* Campos do medley */}
      <div className="card p-4 space-y-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Título do Medley *
          </label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ex: Medley de Celebração"
            className="input text-sm w-full"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Descrição (opcional)
          </label>
          <input
            type="text"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Observações do arranjo…"
            className="input text-sm w-full"
          />
        </div>
      </div>

      {/* Seção de blocos */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music size={16} style={{ color: '#A259FF' }} />
            <span className="font-semibold text-sm">Blocos do Medley</span>
          </div>
          <button
            onClick={handleAdicionarBloco}
            className="btn-ghost py-1.5 px-3 text-xs flex items-center gap-1.5"
          >
            <Plus size={14} />
            Adicionar Bloco
          </button>
        </div>

        {blocos.length === 0 ? (
          <div
            className="rounded-2xl p-8 flex flex-col items-center gap-3 text-center"
            style={{ border: '1px dashed rgba(162,89,255,0.3)', background: 'rgba(162,89,255,0.04)' }}
          >
            <Music size={28} style={{ color: 'rgba(162,89,255,0.5)' }} />
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Nenhum bloco adicionado.<br />Clique em "Adicionar Bloco" acima.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {blocos.map((bloco, idx) => (
              <div
                key={bloco.id}
                className="card flex items-center gap-3 p-3"
              >
                {/* Número */}
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                  style={{ background: 'rgba(162,89,255,0.18)', color: '#A259FF' }}
                >
                  {idx + 1}
                </span>

                {/* Título */}
                <input
                  type="text"
                  value={bloco.titulo}
                  onChange={(e) => {
                    const copia = [...blocos];
                    copia[idx] = { ...copia[idx], titulo: e.target.value };
                    setBlocos(copia);
                  }}
                  className="input flex-1 py-1.5 text-sm"
                  placeholder="Nome do bloco"
                />

                {/* Tom */}
                <select
                  value={bloco.tom || 'G'}
                  onChange={(e) => {
                    const copia = [...blocos];
                    copia[idx] = { ...copia[idx], tom: e.target.value };
                    setBlocos(copia);
                  }}
                  className="input w-16 py-1.5 text-xs"
                  style={{ background: 'rgba(162,89,255,0.1)', borderColor: 'rgba(162,89,255,0.25)', color: '#A259FF' }}
                >
                  {TOMS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>

                {/* Compasso */}
                <select
                  value={bloco.compasso || '4/4'}
                  onChange={(e) => {
                    const copia = [...blocos];
                    copia[idx] = { ...copia[idx], compasso: e.target.value };
                    setBlocos(copia);
                  }}
                  className="input w-16 py-1.5 text-xs hidden sm:block"
                >
                  {['4/4', '3/4', '6/8', '2/4'].map((c) => <option key={c}>{c}</option>)}
                </select>

                {/* Botões reordenar */}
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => handleMoverCima(idx)}
                    disabled={idx === 0}
                    className="flex h-6 w-6 items-center justify-center rounded-md transition-colors disabled:opacity-25"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                    aria-label="Mover para cima"
                  >
                    <ChevronUp size={12} />
                  </button>
                  <button
                    onClick={() => handleMoverBaixo(idx)}
                    disabled={idx === blocos.length - 1}
                    className="flex h-6 w-6 items-center justify-center rounded-md transition-colors disabled:opacity-25"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                    aria-label="Mover para baixo"
                  >
                    <ChevronDown size={12} />
                  </button>
                </div>

                {/* Excluir */}
                <button
                  onClick={() => handleRemoverBloco(bloco.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                  style={{ background: 'rgba(224,64,64,0.1)', color: '#E04040' }}
                  aria-label="Remover bloco"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rodapé: tempo total */}
      {blocos.length > 0 && (
        <div
          className="fixed bottom-0 left-0 right-0 flex items-center justify-center gap-2 px-4 py-3 z-20"
          style={{ background: 'rgba(11,12,16,0.92)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(162,89,255,0.15)' }}
        >
          <Clock size={14} style={{ color: '#A259FF' }} />
          <span className="text-sm font-medium">
            Tempo total estimado:
            <span style={{ color: '#A259FF' }} className="ml-1 font-bold">~{tempoTotal} min</span>
          </span>
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
            ({blocos.length} blocos × 3,5 min)
          </span>
        </div>
      )}
    </div>
  );
};

export default EditorMedley;
