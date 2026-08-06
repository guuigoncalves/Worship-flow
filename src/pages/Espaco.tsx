import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Copy, LogOut, Share2, Trash2, User, Play, ChevronRight, Settings, Clock, Calendar } from 'lucide-react';
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

  if (loading) return (
    <main className="app-page flex items-center justify-center min-h-[60vh]" style={{ backgroundColor: '#0B0C10' }}>
      <div className="w-8 h-8 border-2 border-[var(--primaria)] border-t-transparent rounded-full animate-spin" />
    </main>
  );

  if (!meuPapel) {
    return (
      <main className="app-page fade-in" style={{ backgroundColor: '#0B0C10' }}>
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
    <main className="app-page fade-in space-y-5 pb-32" style={{ backgroundColor: '#0B0C10' }}>
      <header className="flex items-center justify-between gap-3">
        <button className="btn-ghost h-9 w-9 p-0" type="button" onClick={() => navigate(-1)} aria-label="Voltar">
          <ChevronRight size={18} />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold text-gradient truncate">{espaco?.nome ?? '…'}</h1>
          <p className="text-xs text-white/50 flex items-center gap-1">
            <Calendar size={12} /> Culto · {espaco?.tipo ?? ''}
          </p>
        </div>
        <button
          className="btn-ghost text-sm flex items-center gap-2"
          type="button"
          onClick={() => void sairDoEspaco(id!).then(() => navigate('/espacos'))}
          style={{ color: '#E04040', borderColor: 'rgba(224,64,64,0.3)' }}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
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

      {aba === 'visao-geral' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold text-gradient">{musicas.length}</p>
              <p className="text-xs mt-1 text-white/50">Músicas no repertório</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold text-gradient">{membros.length}</p>
              <p className="text-xs mt-1 text-white/50">Membros</p>
            </div>
          </div>

          {espaco && (
            <div className="rounded-2xl p-4 border border-white/10 bg-[#141522]/90">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/50">Código do espaço</p>
              <div className="flex items-center gap-3">
                <span className="flex-1 rounded-xl px-4 py-2.5 text-center font-mono text-xl font-bold tracking-widest bg-[var(--primaria-dim)] text-[var(--primaria)] border border-[var(--primaria)]/20">
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
            </div>
          )}

          {musicas.length > 0 && (
            <button
              type="button"
              className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2"
              onClick={() => navigate(`/espaco/${id}/preparacao`)}
            >
              <Play size={16} />
              Entrar em Modo de Preparação
            </button>
          )}
        </div>
      )}

      {aba === 'musicas' && (
        <section className="space-y-4">
          {podeEditar && (
            <button className="btn-primary w-full text-sm" type="button" onClick={() => setCompartilharAberto(true)}>
              <Share2 className="h-4 w-4" />
              Compartilhar música
            </button>
          )}

          {musicas.length > 0 ? (
            <div className="card divide-y divide-white/5">
              {musicas.map((musica) => (
                <article key={musica.id} className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors">
                  <CapaMusica tom={musica.tom} titulo={musica.titulo} tamanho="sm" />
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-semibold text-sm">{musica.titulo}</h2>
                    <p className="truncate text-xs text-white/50">{musica.artista} · {musica.tom}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                      onClick={() => navigate(`/musica/${musica.id}`)}
                      title="Ver cifra"
                    >
                      <Play size={14} />
                    </button>
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
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EstadoVazio titulo="Nenhuma música compartilhada" texto="Quem tem papel de editor ou dono pode compartilhar músicas da própria biblioteca aqui." />
          )}
        </section>
      )}

      {aba === 'membros' && (
        <section className="space-y-3">
          {membros.length > 0 ? (
            <div className="card divide-y divide-white/5">
              {membros.map((membro) => (
                <article key={membro.uid} className="flex items-center gap-3 p-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primaria-dim)]">
                    <User className="h-5 w-5 text-[var(--primaria)]" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-semibold text-sm">{membro.nome}</h2>
                    <span className="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: corPapel[membro.papel] || 'rgba(255,255,255,0.08)', color: textoPapel[membro.papel] || 'rgba(255,255,255,0.5)' }}>
                      {membro.papel}
                    </span>
                  </div>
                  {podeGerenciarMembros && membro.papel !== 'dono' && (
                    <div className="flex items-center gap-2 shrink-0">
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

      {aba === 'configuracoes' && (
        <section className="space-y-4">
          <div className="card p-4 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Settings size={16} className="text-[var(--primaria)]" />
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
              <span className="chip text-xs" style={{ background: 'var(--primaria-dim)', color: 'var(--primaria)' }}>
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