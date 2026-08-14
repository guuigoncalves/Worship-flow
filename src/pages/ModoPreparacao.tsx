import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUp, ArrowDown, Play, Plus, Trash2, Clock } from 'lucide-react';
import { useEspacos, useEspacoDetalhe } from '../hooks/useEspacos';
import { useMusicas } from '../hooks/useMusicas';
import { useToast } from '../hooks/useToast';
import { useFila } from '../hooks/useFila';
import { EstadoVazio } from '../components/compartilhado/EstadoVazio';
import { PainelDeslizante } from '../components/compartilhado/PainelDeslizante';
import { SectionHeader } from '../components/aurora';

export default function ModoPreparacao() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { espacos } = useEspacos();
  const {
    musicas,
    loading,
    observacoesEnsaio,
    salvarObservacaoEnsaio,
    compartilharMusica,
    removerMusica,
    podeEditar
  } = useEspacoDetalhe(id);
  const { musicas: minhasMusicas } = useMusicas();
  const { showToast } = useToast();
  const { tocarAgora, adicionarFila, limparFila } = useFila();

  const [adicionarAberto, setAdicionarAberto] = useState(false);
  const [ordem, setOrdem] = useState<string[]>([]);
  const [notaEditando, setNotaEditando] = useState<string | null>(null);
  const [notaTexto, setNotaTexto] = useState('');
  const [salvandoNota, setSalvandoNota] = useState(false);

  const espaco = espacos.find((item) => item.id === id);

  const musicasIds = useMemo(() => musicas.map((m) => m.id).join(','), [musicas]);

  useEffect(() => {
    setOrdem(musicas.map((m) => m.id));
  }, [musicasIds]);

  const musicasOrdenadas = useMemo(() => {
    if (ordem.length === 0) return musicas;
    const mapa = new Map(musicas.map((m) => [m.id, m]));
    return ordem.map((musicaId) => mapa.get(musicaId)).filter(Boolean) as typeof musicas;
  }, [musicas, ordem]);

  function handleMoverCima(index: number) {
    if (index === 0) return;
    setOrdem((prev) => {
      const nova = [...prev];
      [nova[index - 1], nova[index]] = [nova[index], nova[index - 1]];
      return nova;
    });
  }

  function handleMoverBaixo(index: number) {
    if (index === musicasOrdenadas.length - 1) return;
    setOrdem((prev) => {
      const nova = [...prev];
      [nova[index], nova[index + 1]] = [nova[index + 1], nova[index]];
      return nova;
    });
  }

  async function handleRemover(musicaId: string) {
    await removerMusica(musicaId);
    showToast('Música removida do repertório', 'sucesso');
  }

  function handleEditarNota(musicaId: string, textoAtual: string) {
    setNotaEditando(musicaId);
    setNotaTexto(textoAtual);
  }

  async function handleSalvarNota(musicaId: string) {
    setSalvandoNota(true);
    await salvarObservacaoEnsaio(musicaId, notaTexto);
    setSalvandoNota(false);
    setNotaEditando(null);
    setNotaTexto('');
    showToast('Anotação salva', 'sucesso');
  }

  function handleAdicionarMusica(musicaId: string) {
    const musica = minhasMusicas.find((m) => m.id === musicaId);
    if (!musica) return;
    void compartilharMusica(musica);
    showToast('Música adicionada ao repertório', 'sucesso');
  }

  function tocarRepertorio() {
    if (musicasOrdenadas.length === 0) return;
    limparFila();
    const primeira = musicasOrdenadas[0].id;
    tocarAgora(primeira);
    musicasOrdenadas.slice(1).forEach((musica, i) => {
      setTimeout(() => adicionarFila(musica.id), (i + 1) * 150);
    });
    navigate(`/tocar/${primeira}`);
    showToast(`Tocando repertório: ${espaco?.nome ?? ''}`, 'sucesso');
  }

  const musicasDisponiveis = minhasMusicas.filter(
    (m) => !musicas.some((esp) => esp.id === m.id)
  );

  if (loading) {
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
          onClick={() => navigate(`/espaco/${id}`)}
          aria-label="Voltar"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-lg font-bold text-white">Modo de Preparação</h1>
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
              Em edição
            </span>
          </div>
          <p className="text-[11px] text-[#8f85b8] truncate">
            {espaco?.nome ?? '…'} • {musicas.length} {musicas.length === 1 ? 'música' : 'músicas'}
          </p>
        </div>
        <button
          className="btn-ghost h-9 w-9 p-0 flex items-center justify-center rounded-xl bg-white/5 border border-[#2d264f] text-white hover:bg-white/10 transition-colors"
          type="button"
          onClick={() => setAdicionarAberto(true)}
          aria-label="Adicionar música"
        >
          <Plus size={18} />
        </button>
      </header>

      {musicasOrdenadas.length === 0 ? (
        <div className="card p-6 border border-[#2d264f] bg-[#120f24] rounded-2xl">
          <EstadoVazio
            titulo="Repertório vazio"
            texto="Adicione músicas da sua biblioteca para iniciar o modo de preparação."
          />
          <button
            className="btn-primary w-full mt-4 text-xs"
            type="button"
            onClick={() => setAdicionarAberto(true)}
          >
            <Plus size={14} />
            Adicionar Música da Biblioteca
          </button>
        </div>
      ) : (
        <>
          <div className="card divide-y divide-[#2d264f] border border-[#2d264f] bg-[#120f24] rounded-2xl overflow-hidden">
            {musicasOrdenadas.map((musica, index) => {
              const nota = observacoesEnsaio[musica.id] ?? '';
              const editandoNota = notaEditando === musica.id;

              return (
                <div key={musica.id} className="p-3 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold text-[#8f85b8]">
                      {index + 1}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <p className="truncate text-xs font-semibold text-white">{musica.titulo}</p>
                        <span className="shrink-0 rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-purple-300 border border-purple-500/20">
                          {musica.tom}
                        </span>
                      </div>
                      <p className="truncate text-[10px] text-[#8f85b8]">{musica.artista}</p>
                    </div>

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
                        disabled={index === musicasOrdenadas.length - 1}
                        aria-label="Mover para baixo"
                      >
                        <ArrowDown size={12} className="text-white/70" />
                      </button>
                      <button
                        type="button"
                        className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors"
                        style={{ background: 'rgba(224,64,64,0.08)', color: '#E04040' }}
                        onClick={() => handleRemover(musica.id)}
                        aria-label="Remover música"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-2 ml-7">
                    {editandoNota ? (
                      <div className="space-y-2">
                        <textarea
                          className="input min-h-[60px] resize-y text-xs w-full"
                          value={notaTexto}
                          onChange={(e) => setNotaTexto(e.target.value)}
                          placeholder="Ex: Intro só no teclado; repetir refrão 2x…"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            className="btn-primary flex-1 text-[11px] py-1.5"
                            type="button"
                            onClick={() => handleSalvarNota(musica.id)}
                            disabled={salvandoNota}
                          >
                            {salvandoNota ? 'Salvando...' : 'Salvar anotação'}
                          </button>
                          <button
                            className="btn-ghost text-[11px] py-1.5"
                            type="button"
                            onClick={() => setNotaEditando(null)}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="w-full text-left rounded-xl p-2 transition-colors hover:bg-white/5 border border-transparent hover:border-[#2d264f]"
                        onClick={() => handleEditarNota(musica.id, nota)}
                      >
                        <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider mb-0.5">Anotação do ensaio</p>
                        <p className={`text-xs ${nota ? 'text-white/80' : 'text-white/30 italic'}`}>
                          {nota || 'Toque para adicionar uma anotação...'}
                        </p>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            className="w-full btn-primary text-xs py-3 flex items-center justify-center gap-2"
            type="button"
            onClick={tocarRepertorio}
            disabled={musicasOrdenadas.length === 0}
          >
            <Play size={14} fill="currentColor" />
            Tocar Repertório no Modo Palco
          </button>
        </>
      )}

      <PainelDeslizante aberto={adicionarAberto} titulo="Adicionar Música da Biblioteca" onClose={() => setAdicionarAberto(false)}>
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {musicasDisponiveis.length === 0 ? (
            <p className="text-sm text-[#8f85b8]">Todas as músicas da sua biblioteca já estão no repertório.</p>
          ) : (
            musicasDisponiveis.map((musica) => (
              <button
                key={musica.id}
                className="btn-ghost w-full justify-between border border-[#2d264f]"
                type="button"
                onClick={() => handleAdicionarMusica(musica.id)}
              >
                <span className="truncate text-left">{musica.titulo}</span>
                <span
                  className="chip text-xs"
                  style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.2)' }}
                >
                  {musica.tom}
                </span>
              </button>
            ))
          )}
        </div>
      </PainelDeslizante>
    </main>
  );
}
