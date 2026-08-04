import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Copy, LogOut, Share2, Trash2, User, Play } from 'lucide-react';
import { SectionHeader, CapaMusica } from '../components/aurora';
import { EstadoVazio } from '../components/compartilhado/EstadoVazio';
import { PainelDeslizante } from '../components/compartilhado/PainelDeslizante';
import { useEspacoDetalhe, useEspacos } from '../hooks/useEspacos';
import { useMusicas } from '../hooks/useMusicas';
import { useToast } from '../hooks/useToast';
import { COR_TOM } from '../data/cores-tom';
import type { PapelEspaco } from '../types';

const papeis: PapelEspaco[] = ['leitor', 'editor', 'admin', 'dono'];

export default function Espaco() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { espacos, sairDoEspaco } = useEspacos();
  const { membros, musicas, meuPapel, podeEditar, podeGerenciarMembros, loading, compartilharMusica, removerMusica, alterarPapel, removerMembro } = useEspacoDetalhe(id);
  const { musicas: minhasMusicas } = useMusicas();
  const { showToast } = useToast();
  const [aba, setAba] = useState<'musicas' | 'membros'>('musicas');
  const [compartilharAberto, setCompartilharAberto] = useState(false);

  const espaco = espacos.find((item) => item.id === id);

  if (loading) return <main className="app-page"><p className="text-textoSecundario">Carregando…</p></main>;
  if (!meuPapel)
    return (
      <main className="app-page">
        <EstadoVazio titulo="Você não faz parte desse espaço" texto="Peça o código de convite pra quem administra esse espaço." />
      </main>
    );

  return (
    <main className="app-page fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primaria">Espaço</p>
          <h1 className="m-0 font-display text-3xl font-bold text-gradient">{espaco?.nome ?? '…'}</h1>
        </div>
        <div className="flex gap-2">
          {espaco ? (
            <button
              className="btn-ghost"
              type="button"
              onClick={() => {
                void navigator.clipboard?.writeText(espaco.codigo);
                showToast('Código copiado', 'sucesso');
              }}
              aria-label={`Copiar código ${espaco.codigo}`}
              title={`Copiar código ${espaco.codigo}`}
            >
              <Copy className="h-4 w-4" />
              <span className="font-mono uppercase tracking-widest">{espaco.codigo}</span>
            </button>
          ) : null}
          <button className="btn-ghost text-perigo" type="button" onClick={() => void sairDoEspaco(id!).then(() => navigate('/espacos'))}>
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <button className={`chip ${aba === 'musicas' ? 'chip-active' : ''}`} type="button" onClick={() => setAba('musicas')}>
          Músicas ({musicas.length})
        </button>
        <button className={`chip ${aba === 'membros' ? 'chip-active' : ''}`} type="button" onClick={() => setAba('membros')}>
          Membros ({membros.length})
        </button>
      </div>

      {aba === 'musicas' ? (
        <section className="mt-6 space-y-4">
          {musicas.length > 0 && (
            <button className="btn-primary w-full" type="button" onClick={() => navigate(`/espaco/${id}/preparacao`)}>
              <Play className="h-4 w-4" />
              Iniciar Modo de Preparação
            </button>
          )}
          {podeEditar ? (
            <button className="btn-primary" type="button" onClick={() => setCompartilharAberto(true)}>
              <Share2 className="h-4 w-4" />
              Compartilhar música
            </button>
          ) : null}
          <SectionHeader icone={<Share2 size={16} />} titulo="Músicas compartilhadas" />

          {musicas.length ? (
            <div className="card divide-y divide-borda">
              {musicas.map((musica) => (
                <article key={musica.id} className="flex items-center justify-between gap-3 p-3">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <CapaMusica tom={musica.tom} titulo={musica.titulo} tamanho="sm" />
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate font-semibold">{musica.titulo}</h2>
                      <p className="truncate text-sm text-textoSecundario">{musica.artista} · {musica.tom}</p>
                    </div>
                  </div>
                  {podeEditar ? (
                    <button className="btn-text text-perigo" type="button" onClick={() => void removerMusica(musica.id)} aria-label="Remover">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <EstadoVazio titulo="Nenhuma música compartilhada" texto="Quem tem papel de editor ou dono pode compartilhar músicas da própria biblioteca aqui." />
          )}
        </section>
      ) : (
        <section className="mt-6 space-y-4">
          <SectionHeader icone={<User size={16} />} titulo="Membros" />

          {membros.length ? (
            <div className="card divide-y divide-borda">
              {membros.map((membro) => (
                <article key={membro.uid} className="flex items-center justify-between gap-3 p-3">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <User className="h-8 w-8 text-primaria" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate font-semibold">{membro.nome}</h2>
                      <p className="truncate text-sm text-textoSecundario capitalize">{membro.papel}</p>
                    </div>
                  </div>
                  {podeGerenciarMembros && membro.papel !== 'dono' ? (
                    <div className="flex items-center gap-2">
                      <select className="input w-auto" value={membro.papel} onChange={(event) => void alterarPapel(membro.uid, event.target.value as PapelEspaco)}>
                        {papeis.filter((papel) => papel !== 'dono').map((papel) => (
                          <option key={papel} value={papel}>
                            {papel}
                          </option>
                        ))}
                      </select>
                      <button className="btn-text text-perigo" type="button" onClick={() => void removerMembro(membro.uid)} aria-label="Remover membro">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <span className="chip capitalize">{membro.papel}</span>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <EstadoVazio titulo="Nenhum membro ainda" texto="Compartilhe o código de convite do espaço para pessoas entrarem." />
          )}
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
              <span className="chip">{musica.tom}</span>
            </button>
          ))}
          {!minhasMusicas.length && <p className="text-sm text-textoSecundario">Sua biblioteca pessoal está vazia.</p>}
        </div>
      </PainelDeslizante>
    </main>
  );
}
