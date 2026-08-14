import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Pencil, Plus, Trash2, ArrowUp, ArrowDown, Music, Clock } from 'lucide-react';
import { useMedleys } from '../hooks/useMedleys';
import { SectionHeader } from '../components/aurora';
import { EstadoVazio } from '../components/compartilhado/EstadoVazio';
import type { BlocoMedley } from '../types';

type TipoBloco = BlocoMedley['tipo'];

const rotuloTipo: Record<TipoBloco, string> = {
  musica: 'Música',
  verso: 'Verso',
  refrao: 'Refrão',
  ponte: 'Ponte',
  instrumental: 'Instrumental',
  pausa: 'Pausa',
  transicao: 'Transição',
  espontaneo: 'Espontâneo',
  'subida-tom': 'Subida de Tom',
};

export default function EditorMedley() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { obterMedley, salvarMedley } = useMedleys();

  const [titulo, setTitulo] = useState('');
  const [blocos, setBlocos] = useState<BlocoMedley[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [editandoTitulo, setEditandoTitulo] = useState(false);

  useEffect(() => {
    if (id && id !== 'novo') {
      const medley = obterMedley(id);
      if (medley) {
        setTitulo(medley.titulo);
        setBlocos(medley.blocos || []);
      }
    }
  }, [id, obterMedley]);

  function handleAdicionarBloco() {
    const novo: BlocoMedley = {
      id: crypto.randomUUID(),
      tipo: 'musica',
      tituloMusica: 'Nova seção',
      repeticoes: 1,
      tom: 'G',
    };
    setBlocos((prev) => [...prev, novo]);
  }

  function handleRemoverBloco(blocoId: string) {
    setBlocos((prev) => prev.filter((b) => b.id !== blocoId));
  }

  function handleMoverCima(index: number) {
    if (index === 0) return;
    setBlocos((prev) => {
      const copia = [...prev];
      [copia[index - 1], copia[index]] = [copia[index], copia[index - 1]];
      return copia;
    });
  }

  function handleMoverBaixo(index: number) {
    if (index === blocos.length - 1) return;
    setBlocos((prev) => {
      const copia = [...prev];
      [copia[index], copia[index + 1]] = [copia[index + 1], copia[index]];
      return copia;
    });
  }

  function handleSalvar() {
    if (!titulo.trim()) return;
    setSalvando(true);
    salvarMedley({
      id: id === 'novo' ? crypto.randomUUID() : id,
      titulo: titulo.trim(),
      blocos,
    }).then(() => {
      navigate('/medleys');
    }).finally(() => {
      setSalvando(false);
    });
  }

  const tempoTotalMinutos = useMemo(() => {
    const totalSegundos = blocos.reduce((acc, bloco) => acc + (bloco.duracaoSegundos || 210), 0);
    return Math.round(totalSegundos / 60);
  }, [blocos]);

  const tempoTotalFormatado = useMemo(() => {
    const horas = Math.floor(tempoTotalMinutos / 60);
    const minutos = tempoTotalMinutos % 60;
    if (horas > 0) {
      return `${horas}h ${minutos.toString().padStart(2, '0')}min`;
    }
    return `${minutos} min`;
  }, [tempoTotalMinutos]);

  if (!id) {
    return (
      <main className="app-page flex items-center justify-center min-h-[60vh]" style={{ backgroundColor: '#0b0819' }}>
        <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="app-page fade-in space-y-5 pb-32" style={{ backgroundColor: '#0b0819' }}>
      <header className="flex items-center justify-between gap-3">
        <button
          className="btn-ghost h-9 w-9 p-0 flex items-center justify-center rounded-xl bg-white/5 border border-[#2d264f] text-white hover:bg-white/10 transition-colors"
          type="button"
          onClick={() => navigate('/medleys')}
          aria-label="Voltar"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-sm font-bold uppercase tracking-wider text-[#a78bfa]">Editar medley</h1>
        <button
          className="btn-ghost h-9 px-3 flex items-center gap-1.5 text-xs font-bold text-white border border-[#2d264f] hover:border-purple-500/30 disabled:opacity-50"
          type="button"
          onClick={handleSalvar}
          disabled={!titulo.trim() || salvando}
        >
          <Check size={14} />
          <span>{salvando ? 'Salvando...' : 'Salvar'}</span>
        </button>
      </header>

      <div className="card p-4 border border-[#2d264f] bg-[#120f24] rounded-2xl">
        <div className="flex items-start gap-3">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white border border-white/10"
            style={{ background: 'linear-gradient(135deg, rgba(162,89,255,0.35), rgba(96,165,250,0.15))' }}
          >
            <Music size={24} className="text-purple-300" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {editandoTitulo ? (
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  onBlur={() => setEditandoTitulo(false)}
                  autoFocus
                  className="input flex-1 py-1.5 text-sm"
                  placeholder="Nome do medley"
                />
              ) : (
                <>
                  <h2 className="truncate text-base font-bold text-white">{titulo || 'Sem título'}</h2>
                  <button
                    type="button"
                    className="btn-ghost h-7 w-7 p-0 shrink-0"
                    onClick={() => setEditandoTitulo(true)}
                    aria-label="Editar título"
                  >
                    <Pencil size={12} className="text-purple-400" />
                  </button>
                </>
              )}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-300 border border-purple-500/20">
                {blocos.length} {blocos.length === 1 ? 'bloco' : 'blocos'}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-[#8f85b8]">
                <Clock size={12} />
                {tempoTotalFormatado}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <SectionHeader
          icone={<Music size={16} />}
          titulo="Blocos do medley"
          acaoTexto="Adicionar bloco"
          onAcao={handleAdicionarBloco}
        />

        {blocos.length === 0 ? (
          <EstadoVazio titulo="Nenhum bloco" texto="Clique em 'Adicionar bloco' para montar seu medley." />
        ) : (
          <div className="card divide-y divide-[#2d264f] border border-[#2d264f] bg-[#120f24] rounded-2xl overflow-hidden">
            {blocos.map((bloco, index) => (
              <div key={bloco.id} className="p-3 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold text-[#8f85b8]">
                    {index + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <p className="truncate text-xs font-semibold text-white">
                        {bloco.tituloMusica || rotuloTipo[bloco.tipo] || bloco.tipo}
                      </p>
                      <span className="shrink-0 rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-purple-300 border border-purple-500/20">
                        {bloco.tom ? `Tom ${bloco.tom}` : 'Tom G'}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="text-[10px] text-[#8f85b8] capitalize">{rotuloTipo[bloco.tipo]}</span>
                      {bloco.repeticoes > 1 && (
                        <span className="text-[10px] text-[#8f85b8]">×{bloco.repeticoes}</span>
                      )}
                    </div>
                  </div>

                  <span className="shrink-0 text-[10px] font-mono text-[#8f85b8]">
                    {bloco.duracaoSegundos ? formatarDuracao(bloco.duracaoSegundos) : '02:15'}
                  </span>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors disabled:opacity-25"
                      style={{ background: 'rgba(255,255,255,0.06)' }}
                      onClick={() => handleMoverCima(index)}
                      disabled={index === 0}
                      aria-label="Mover para cima"
                    >
                      <ArrowUp size={12} className="text-white/70" />
                    </button>
                    <button
                      type="button"
                      className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors disabled:opacity-25"
                      style={{ background: 'rgba(255,255,255,0.06)' }}
                      onClick={() => handleMoverBaixo(index)}
                      disabled={index === blocos.length - 1}
                      aria-label="Mover para baixo"
                    >
                      <ArrowDown size={12} className="text-white/70" />
                    </button>
                    <button
                      type="button"
                      className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors"
                      style={{ background: 'rgba(224,64,64,0.08)', color: '#E04040' }}
                      onClick={() => handleRemoverBloco(bloco.id)}
                      aria-label="Remover bloco"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {blocos.length > 0 && (
        <button
          className="w-full btn-primary text-xs py-3 flex items-center justify-center gap-2"
          type="button"
          onClick={handleAdicionarBloco}
        >
          <Plus size={14} />
          <span>Adicionar bloco</span>
        </button>
      )}

      {blocos.length > 0 && (
        <div
          className="fixed bottom-0 left-0 right-0 flex items-center justify-center gap-2 px-4 py-3 z-20"
          style={{ background: 'rgba(11,8,25,0.92)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(162,89,255,0.15)' }}
        >
          <Clock size={14} style={{ color: '#A259FF' }} />
          <span className="text-sm font-medium text-white">
            Tempo total:
            <span style={{ color: '#A259FF' }} className="ml-1 font-bold">{tempoTotalFormatado}</span>
          </span>
          <span className="text-xs text-[#8f85b8]">
            ({blocos.length} {blocos.length === 1 ? 'bloco' : 'blocos'})
          </span>
        </div>
      )}
    </main>
  );
}

function formatarDuracao(segundos: number): string {
  const minutos = Math.floor(segundos / 60);
  const segundosRestantes = Math.round(segundos % 60);
  return `${minutos.toString().padStart(2, '0')}:${segundosRestantes.toString().padStart(2, '0')}`;
}
