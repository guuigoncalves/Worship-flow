import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  MoreVertical,
  Copy,
  Share2,
  User,
  Play,
  Settings,
  LogOut,
  Trash2,
  GripVertical,
  ExternalLink,
  Music
} from 'lucide-react';
import { Avatar, SectionHeader } from '../components/aurora';
import { EstadoVazio } from '../components/compartilhado/EstadoVazio';
import { PainelDeslizante } from '../components/compartilhado/PainelDeslizante';
import { useEspacoDetalhe, useEspacos } from '../hooks/useEspacos';
import { useMusicas } from '../hooks/useMusicas';
import { useToast } from '../hooks/useToast';
import type { PapelEspaco } from '../types';

type AbaEspaco = 'visao-geral' | 'musicas' | 'repertorios' | 'configuracoes';

const corPapel: Record<PapelEspaco, string> = {
  dono: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  admin: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  editor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  leitor: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

const labelPapel: Record<PapelEspaco, string> = {
  dono: 'Dono',
  admin: 'Admin',
  editor: 'Editor',
  leitor: 'Leitor',
};

export default function Espaco() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { espacos, sairDoEspaco } = useEspacos();
  const {
    membros,
    musicas,
    meuPapel,
    podeEditar,
    podeGerenciarMembros,
    loading,
    compartilharMusica,
    removerMusica
  } = useEspacoDetalhe(id);
  const { musicas: minhasMusicas } = useMusicas();
  const { showToast } = useToast();
  const [aba, setAba] = useState<AbaEspaco>('visao-geral');
  const [compartilharAberto, setCompartilharAberto] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const espaco = espacos.find((item) => item.id === id);

  if (loading) {
    return (
      <main className="app-page flex items-center justify-center min-h-[60vh]" style={{ backgroundColor: '#0b0819' }}>
        <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (!meuPapel) {
    return (
      <main className="app-page fade-in" style={{ backgroundColor: '#0b0819' }}>
        <EstadoVazio titulo="Você não faz parte desse espaço" texto="Peça o código de convite pra quem administra esse espaço." />
      </main>
    );
  }

  const abas: { id: AbaEspaco; label: string }[] = [
    { id: 'visao-geral', label: 'Visão geral' },
    { id: 'musicas', label: 'Músicas e Cifras' },
    { id: 'repertorios', label: 'Repertórios' },
    { id: 'configuracoes', label: 'Configurações' },
  ];

  async function copiarCodigo(codigo: string) {
    await navigator.clipboard?.writeText(codigo);
    setCopiado(true);
    showToast('Código copiado!', 'sucesso');
    setTimeout(() => setCopiado(false), 2000);
  }

  async function compartilharCodigo() {
    if (espaco?.codigo && navigator.share) {
      await navigator.share({ title: 'Convite WorshipFlow', text: `Use o código ${espaco.codigo} para entrar no espaço ${espaco.nome}` });
    }
  }

  async function handleSair() {
    if (!espaco) return;
    await sairDoEspaco(espaco.id);
    navigate('/espacos');
  }

  return (
    <main className="app-page fade-in space-y-5 pb-32" style={{ backgroundColor: '#0b0819' }}>
      <header className="flex items-center justify-between gap-3">
        <button
          className="btn-ghost h-9 w-9 p-0 flex items-center justify-center rounded-xl bg-white/5 border border-[#2d264f] text-white hover:bg-white/10 transition-colors"
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Voltar"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-lg font-bold text-white">{espaco?.nome ?? '…'}</h1>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase border ${corPapel[meuPapel]}`}
            >
              {labelPapel[meuPapel]}
            </span>
          </div>
          <p className="text-[11px] text-[#8f85b8]">
            {espaco?.tipo === 'ministerio' ? 'Ministério' : espaco?.tipo === 'banda' ? 'Banda' : espaco?.tipo === 'estudo' ? 'Estudo' : 'Outro'}
          </p>
        </div>
        <button
          className="btn-ghost h-9 w-9 p-0 flex items-center justify-center rounded-xl bg-white/5 border border-[#2d264f] text-white hover:bg-white/10 transition-colors"
          type="button"
          aria-label="Mais opções"
        >
          <MoreVertical size={18} />
        </button>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {abas.map((a) => (
          <button
            key={a.id}
            type="button"
            className={`chip shrink-0 text-xs px-4 py-2 font-medium transition-all ${
              aba === a.id
                ? 'chip-active'
                : 'bg-[#120f24]/80 text-[#8f85b8] hover:text-white border border-[#2d264f]'
            }`}
            onClick={() => setAba(a.id)}
          >
            {a.label}
          </button>
        ))}
      </div>

      {aba === 'visao-geral' && (
        <div className="space-y-5">
          <div className="card p-4 border border-[#2d264f] bg-[#120f24] rounded-2xl">
            <SectionHeader
              titulo={`Membros (${membros.length})`}
              acaoTexto={podeGerenciarMembros ? 'Gerenciar' : undefined}
              onAcao={() => {}}
            />
            {membros.length === 0 ? (
              <EstadoVazio titulo="Nenhum membro" texto="Compartilhe o código do espaço para convidar pessoas." />
            ) : (
              <div className="space-y-1.5">
                {membros.slice(0, 6).map((membro) => (
                  <div
                    key={membro.uid}
                    className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar nome={membro.nome} tamanho="sm" />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-white">{membro.nome}</p>
                        <span
                          className={`inline-block rounded-full px-1.5 py-0.25 text-[9px] font-bold border ${corPapel[membro.papel]}`}
                        >
                          {labelPapel[membro.papel]}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {membros.length > 6 && (
                  <p className="text-[10px] text-[#8f85b8] text-center pt-1">+{membros.length - 6} membros</p>
                )}
              </div>
            )}
          </div>

          {espaco && (
            <div className="card p-4 border border-[#2d264f] bg-[#120f24] rounded-2xl">
              <SectionHeader titulo="Convite para o espaço" />
              <div className="flex items-center gap-3">
                <span className="flex-1 rounded-xl px-4 py-2.5 text-center font-mono text-sm font-bold tracking-widest bg-[#1a1b2e] text-purple-300 border border-[#2d264f] break-all min-w-0">
                  {espaco.codigo}
                </span>
                <button
                  type="button"
                  className="btn-ghost h-9 px-3 flex items-center gap-1.5 text-xs text-white/70 hover:text-white border border-[#2d264f] hover:border-purple-500/30 shrink-0"
                  onClick={() => copiarCodigo(espaco.codigo)}
                  aria-label={`Copiar código ${espaco.codigo}`}
                >
                  {copiado ? <span className="text-purple-400">Copiado!</span> : <Copy size={14} />}
                  <span>{copiado ? 'Copiado' : 'Copiar'}</span>
                </button>
                <button
                  type="button"
                  className="btn-ghost h-9 w-9 p-0 flex items-center justify-center shrink-0"
                  onClick={compartilharCodigo}
                  aria-label="Compartilhar convite"
                >
                  <Share2 size={16} className="text-purple-400" />
                </button>
              </div>
            </div>
          )}

          <div className="card p-4 border border-[#2d264f] bg-[#120f24] rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#a78bfa]">Modo de Preparação</h2>
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                Em edição
              </span>
            </div>

            <div className="mb-3">
              <p className="text-sm font-bold text-white">Culto de Domingo - 26/05</p>
              <p className="text-[10px] text-[#8f85b8]">Repertório em preparação</p>
            </div>

            {musicas.length === 0 ? (
              <EstadoVazio titulo="Nenhuma música no repertório" texto="Compartilhe músicas neste espaço para vê-las aqui." />
            ) : (
              <div className="space-y-1.5">
                {musicas.map((musica, idx) => (
                  <div
                    key={musica.id}
                    className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/5 transition-colors group"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold text-[#8f85b8]">
                      {idx + 1}
                    </span>
                    {podeEditar ? (
                      <GripVertical className="h-3 w-3 text-white/20 cursor-move" />
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-white">{musica.titulo}</p>
                      <p className="truncate text-[10px] text-[#8f85b8]">{musica.artista}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-purple-300 border border-purple-500/20">
                      {musica.tom}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              className="w-full mt-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 text-xs font-bold text-white shadow-lg shadow-purple-900/30 hover:brightness-105 transition-all flex items-center justify-center gap-2"
              onClick={() => navigate(`/espaco/${id}/preparacao`)}
            >
              <Play size={14} fill="currentColor" />
              Acessar Modo de Preparação
            </button>
          </div>
        </div>
      )}

      {aba === 'musicas' && (
        <section className="space-y-3">
          {podeEditar && (
            <button
              className="w-full btn-primary text-xs py-2.5 flex items-center justify-center gap-2"
              type="button"
              onClick={() => setCompartilharAberto(true)}
            >
              <Share2 className="h-4 w-4" />
              Compartilhar música
            </button>
          )}

          {musicas.length === 0 ? (
            <EstadoVazio titulo="Nenhuma música compartilhada" texto="Compartilhe músicas deste espaço para vê-las aqui." />
          ) : (
            <div className="card divide-y divide-[#2d264f] border border-[#2d264f] bg-[#120f24] rounded-2xl">
              {musicas.map((musica) => (
                <div
                  key={musica.id}
                  className="flex items-center justify-between gap-3 p-3 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-500/10">
                      <Music className="h-4 w-4 text-purple-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-white">{musica.titulo}</p>
                      <p className="truncate text-[10px] text-[#8f85b8]">{musica.artista}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-purple-300 border border-purple-500/20">
                      {musica.tom}
                    </span>
                    {podeEditar && (
                      <button
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors border border-red-500/20"
                        type="button"
                        onClick={() => void removerMusica(musica.id)}
                        aria-label="Remover música"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                    <ExternalLink
                      size={12}
                      className="text-[#8f85b8]"
                      onClick={() => navigate(`/musica/${musica.id}`)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {aba === 'repertorios' && (
        <section className="space-y-3">
          {musicas.length === 0 ? (
            <EstadoVazio titulo="Nenhum repertório" texto="Compartilhe músicas no espaço para criar repertórios." />
          ) : (
            <div className="card divide-y divide-[#2d264f] border border-[#2d264f] bg-[#120f24] rounded-2xl">
              {musicas.map((musica, idx) => (
                <div
                  key={musica.id}
                  className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold text-[#8f85b8]">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-white">{musica.titulo}</p>
                    <p className="truncate text-[10px] text-[#8f85b8]">{musica.artista}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-purple-300 border border-purple-500/20">
                    {musica.tom}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {aba === 'configuracoes' && (
        <section className="space-y-4">
          <div className="card p-4 space-y-3 border border-[#2d264f] bg-[#120f24] rounded-2xl">
            <div className="flex items-center gap-2 mb-1">
              <Settings size={16} className="text-purple-400" />
              <span className="font-semibold text-sm text-white">Configurações do espaço</span>
            </div>
            <button
              type="button"
              className="btn-ghost w-full text-sm justify-start border border-[#2d264f] text-red-400 hover:bg-red-500/10"
              onClick={handleSair}
            >
              <LogOut className="h-4 w-4" />
              Sair do espaço
            </button>
          </div>
        </section>
      )}

      <PainelDeslizante
        aberto={compartilharAberto}
        titulo="Compartilhar música"
        onClose={() => setCompartilharAberto(false)}
      >
        <div className="grid max-h-[60vh] gap-2 overflow-y-auto">
          {minhasMusicas.map((musica) => (
            <button
              key={musica.id}
              className="btn-ghost justify-between border border-[#2d264f]"
              type="button"
              onClick={() => {
                void compartilharMusica(musica);
                setCompartilharAberto(false);
              }}
            >
              <span className="truncate">{musica.titulo}</span>
              <span
                className="chip text-xs"
                style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.2)' }}
              >
                {musica.tom}
              </span>
            </button>
          ))}
          {!minhasMusicas.length && <p className="text-sm text-[#8f85b8]">Sua biblioteca pessoal está vazia.</p>}
        </div>
      </PainelDeslizante>
    </main>
  );
}
