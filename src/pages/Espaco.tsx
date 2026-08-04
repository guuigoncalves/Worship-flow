import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Copy, LogOut, Share2, Trash2, User, Play, ChevronRight, Settings } from 'lucide-react';
import { CapaMusica } from '../components/aurora';
import { EstadoVazio } from '../components/compartilhado/EstadoVazio';
import { PainelDeslizante } from '../components/compartilhado/PainelDeslizante';
import { useEspacoDetalhe, useEspacos } from '../hooks/useEspacos';
import { useMusicas } from '../hooks/useMusicas';
import { useToast } from '../hooks/useToast';
import type { PapelEspaco } from '../types';

type AbaEspaco = 'visao-geral' | 'musicas' | 'membros' | 'configuracoes';

const papeis: PapelEspaco[] = ['leitor', 'editor', 'admin', 'dono'];
const corPapel: Record<string, string> = { dono: 'rgba(228,180,41,0.2)', admin: 'rgba(162,89,255,0.2)', editor: 'rgba(91,141,239,0.2)', leitor: 'rgba(255,255,255,0.08)' };
const textoPapel: Record<string, string> = { dono: '#E4B429', admin: '#A259FF', editor: '#5B8DEF', leitor: 'rgba(255,255,255,0.5)' };

export default function Espaco() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { espacos, sairDoEspaco } = useEspacos();
  const { membros, musicas, meuPapel, podeEditar, podeGerenciarMembros, loading, compartilharMusica, removerMusica, alterarPapel, removerMembro } = useEspacoDetalhe(id);
  const { musicas: minhasMusicas } = useMusicas();
  const { showToast } = useToast();
  const [aba, setAba] = useState<AbaEspaco>('visao-geral');
  const [compartilharAberto, setCompartilharAberto] = useState(false);

  const espaco = espacos.find((item) => item.id === id);

  if (loading) return <main className="app-page"><p className="text-textoSecundario">Carregando…</p></main>;
  if (!meuPapel) {
    return (
      <main className="app-page">
        <EstadoVazio titulo="Você não faz parte desse espaço" texto="Peça o código de convite pra quem administra esse espaço." />
      </main>
    );
  }

  const abas: { id: AbaEspaco; label: string }[] = [
    { id: 'visao-geral', label: 'Visão geral' },
    { id: 'musicas', label: `Músicas (${musicas.length})` },
    { id: 'membros', label: `Membros (${membros.length})` },
    ...(podeGerenciarMembros ? [{ id: 'configuracoes' as AbaEspaco, label: 'Configurações' }] : []),
  ];

  return (
    <main className="app-page fade-in space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#A259FF' }}>Espaço</p>
          <h1 className="m-0 font-display text-3xl font-bold text-gradient">{espaco?.nome ?? '…'}</h1>
          <p className="text-sm capitalize" style={{ color: 'rgba(255,255,255,0.45)' }}>{espaco?.tipo}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn-ghost text-sm flex items-center gap-2"
            type="button"
            onClick={() => void sairDoEspaco(id!).then(() => navigate('/espacos'))}
            style={{ color: '#E04040', borderColor: 'rgba(224,64,64,0.3)' }}
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </div>

      {/* Abas */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {abas.map((a) => (
          <button
            key={a.id}
            type="button"
            className={`chip shrink-0 text-sm ${aba === a.id ? 'chip-active' : ''}`}
            onClick={() => setAba(a.id)}
          >
            {a.label}
          </button>
        ))}
      </div>

      {/* Conteúdo por aba */}

      {/* Visão Geral */}
      {aba === 'visao-geral' && (
        <div className="space-y-4">
          {/* Card de estatísticas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold text-gradient">{musicas.length}</p>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>Músicas compartilhadas</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold text-gradient">{membros.length}</p>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>Membros</p>
            </div>
          </div>

          {/* Convite por código */}
          {espaco && (
            <div
              className="rounded-2xl p-4"
              style={{ background: 'rgba(162,89,255,0.07)', border: '1px solid rgba(162,89,255,0.2)' }}
            >
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Convite para o espaço
              </p>
              <div className="flex items-center gap-3">
                <span
                  className="flex-1 rounded-xl px-4 py-2.5 text-center font-mono text-xl font-bold tracking-widest"
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(162,89,255,0.3)', color: '#A259FF' }}
                >
                  {espaco.codigo}
                </span>
                <button
                  type="button"
                  className="btn-ghost flex items-center gap-2 text-sm"
                  onClick={() => {
                    void navigator.clipboard?.writeText(espaco.codigo);
                    showToast('Código copiado', 'sucesso');
                  }}
                  aria-label={`Copiar código ${espaco.codigo}`}
                >
                  <Copy className="h-4 w-4" />
                  Copiar
                </button>
              </div>
              <p className="mt-2 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Compartilhe este código para que outros usuários entrem neste espaço.
              </p>
            </div>
          )}

          {/* Card Modo de Preparação */}
          {musicas.length > 0 && (
            <button
              type="button"
              className="card group w-full flex items-center gap-4 p-4 text-left"
              onClick={() => navigate(`/espaco/${id}/preparacao`)}
            >
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                style={{ background: 'linear-gradient(120deg, rgba(162,89,255,0.3), rgba(91,141,239,0.2))' }}
              >
                <Play size={20} style={{ color: '#A259FF' }} fill="#A259FF" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold">Modo de Preparação</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Organize o culto com anotações de ensaio por música
                </p>
              </div>
              <ChevronRight size={16} style={{ color: 'rgba(255,255,255,0.3)' }} className="group-hover:text-white transition-colors" />
            </button>
          )}
        </div>
      )}

      {/* Músicas */}
      {aba === 'musicas' && (
        <section className="space-y-4">
          {podeEditar && (
            <button className="btn-primary w-full text-sm" type="button" onClick={() => setCompartilharAberto(true)}>
              <Share2 className="h-4 w-4" />
              Compartilhar música
            </button>
          )}

          {musicas.length > 0 ? (
            <div className="card divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              {musicas.map((musica) => (
                <article key={musica.id} className="flex items-center gap-3 p-3">
                  <CapaMusica tom={musica.tom} titulo={musica.titulo} tamanho="sm" />
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-semibold text-sm">{musica.titulo}</h2>
                    <p className="truncate text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                      {musica.artista} · <span style={{ color: '#A259FF' }}>{musica.tom}</span>
                    </p>
                  </div>
                  {podeEditar && (
                    <button
                      className="flex h-8 w-8 items-center justify-center rounded-lg"
                      style={{ background: 'rgba(224,64,64,0.1)', color: '#E04040' }}
                      type="button"
                      onClick={() => void removerMusica(musica.id)}
                      aria-label="Remover"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <EstadoVazio titulo="Nenhuma música compartilhada" texto="Quem tem papel de editor ou dono pode compartilhar músicas da própria biblioteca aqui." />
          )}
        </section>
      )}

      {/* Membros */}
      {aba === 'membros' && (
        <section className="space-y-3">
          {membros.length > 0 ? (
            <div className="card divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              {membros.map((membro) => (
                <article key={membro.uid} className="flex items-center gap-3 p-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: 'rgba(162,89,255,0.12)', border: '1px solid rgba(162,89,255,0.2)' }}
                  >
                    <User className="h-5 w-5" style={{ color: '#A259FF' }} aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-semibold text-sm">{membro.nome}</h2>
                    <span
                      className="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold"
                      style={{ background: corPapel[membro.papel] || 'rgba(255,255,255,0.08)', color: textoPapel[membro.papel] || 'rgba(255,255,255,0.5)' }}
                    >
                      {membro.papel}
                    </span>
                  </div>
                  {podeGerenciarMembros && membro.papel !== 'dono' && (
                    <div className="flex items-center gap-2">
                      <select
                        className="input w-auto text-sm py-1"
                        value={membro.papel}
                        onChange={(event) => void alterarPapel(membro.uid, event.target.value as PapelEspaco)}
                      >
                        {papeis.filter((papel) => papel !== 'dono').map((papel) => (
                          <option key={papel} value={papel}>{papel}</option>
                        ))}
                      </select>
                      <button
                        className="flex h-8 w-8 items-center justify-center rounded-lg"
                        style={{ background: 'rgba(224,64,64,0.1)', color: '#E04040' }}
                        type="button"
                        onClick={() => void removerMembro(membro.uid)}
                        aria-label="Remover membro"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <EstadoVazio titulo="Nenhum membro ainda" texto="Compartilhe o código de convite do espaço para pessoas entrarem." />
          )}
        </section>
      )}

      {/* Configurações */}
      {aba === 'configuracoes' && (
        <section className="space-y-4">
          <div className="card p-4 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Settings size={16} style={{ color: '#A259FF' }} />
              <span className="font-semibold text-sm">Configurações do espaço</span>
            </div>
            <button
              className="btn-ghost w-full text-sm justify-start"
              style={{ color: '#E04040', borderColor: 'rgba(224,64,64,0.3)' }}
              type="button"
              onClick={() => void sairDoEspaco(id!).then(() => navigate('/espacos'))}
            >
              <LogOut className="h-4 w-4" />
              Sair do espaço
            </button>
          </div>
        </section>
      )}

      {/* Painel compartilhar */}
      <PainelDeslizante aberto={compartilharAberto} titulo="Compartilhar música" onClose={() => setCompartilharAberto(false)}>
        <div className="grid max-h-[60vh] gap-2 overflow-y-auto">
          {minhasMusicas.map((musica) => (
            <button
              key={musica.id}
              className="btn-ghost justify-between"
              type="button"
              onClick={() => {
                void compartilharMusica(musica);
                setCompartilharAberto(false);
              }}
            >
              <span className="truncate">{musica.titulo}</span>
              <span
                className="chip text-xs"
                style={{ background: 'rgba(162,89,255,0.15)', color: '#A259FF' }}
              >
                {musica.tom}
              </span>
            </button>
          ))}
          {!minhasMusicas.length && <p className="text-sm text-textoSecundario">Sua biblioteca pessoal está vazia.</p>}
        </div>
      </PainelDeslizante>
    </main>
  );
}
