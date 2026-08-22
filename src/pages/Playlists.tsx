import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ListMusic, Plus, Trash2, Play, ChevronRight } from 'lucide-react';
import { CapaMusica, Header } from '../components/aurora';

import { EstadoVazio } from '../components/compartilhado/EstadoVazio';
import { PainelDeslizante } from '../components/compartilhado/PainelDeslizante';
import { usePlaylists } from '../hooks/usePlaylists';
import { useToast } from '../hooks/useToast';

export default function Playlists() {
  const navigate = useNavigate();
  const { playlists, loading, criarPlaylist, excluirPlaylist } = usePlaylists();
  const { showToast } = useToast();
  const [criarAberto, setCriarAberto] = useState(false);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function onCriar() {
    if (!nome.trim()) return;
    setEnviando(true);
    try {
      await criarPlaylist(nome.trim(), descricao.trim() || undefined);
      setCriarAberto(false);
      setNome('');
      setDescricao('');
      showToast('Playlist criada', 'sucesso');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao criar playlist', 'erro');
    } finally {
      setEnviando(false);
    }
  }

  async function onExcluir(id: string, event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (window.confirm('Excluir playlist?')) {
      await excluirPlaylist(id);
      showToast('Playlist excluída', 'sucesso');
    }
  }

  return (
    <main className="app-page space-y-6 pb-32 fade-in" style={{ backgroundColor: 'var(--fundo)' }}>
      <Header subtitulo="Suas listas de reprodução" />

      <div className="flex items-center justify-between gap-3 pt-1">
        <button className="h-9 w-9 p-0 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors" type="button" onClick={() => navigate(-1)} aria-label="Voltar">
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-xs font-bold uppercase tracking-wider text-white/70">Playlists ({playlists.length})</h2>
        <button
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[var(--primaria)] to-[var(--acento)] text-xs font-bold text-fundo shadow-lg shadow-purple-900/20 hover:opacity-90 transition-all flex items-center gap-1.5"
          type="button"
          onClick={() => setCriarAberto(true)}
        >
          <Plus size={14} />
          <span>Nova Playlist</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-[var(--primaria)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : playlists.length === 0 ? (
        <EstadoVazio
          titulo="Nenhuma playlist ainda"
          texto="Crie sua primeira playlist para organizar músicas e tocá-las no modo palco."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              className="card group relative cursor-pointer overflow-hidden p-4 border border-white/10 rounded-2xl hover:border-[var(--primaria)]/40 transition-all"
              onClick={() => navigate(`/playlist/${playlist.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/playlist/${playlist.id}`)}
            >
              <div className="relative flex items-center gap-3">
                <CapaMusica titulo={playlist.nome} tamanho="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{playlist.nome}</p>
                  {playlist.descricao && (
                    <p className="truncate text-xs text-white/50 mt-0.5">{playlist.descricao}</p>
                  )}
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold bg-[var(--primaria-dim)] text-[var(--primaria)] border border-[var(--primaria)]/20">
                      {playlist.faixas.length} {playlist.faixas.length === 1 ? 'faixa' : 'faixas'}
                    </span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-white/30 group-hover:text-[var(--primaria)] transition-colors shrink-0" />
              </div>
            </div>
          ))}
        </div>
      )}

      <PainelDeslizante aberto={criarAberto} titulo="Criar Playlist" onClose={() => setCriarAberto(false)}>
        <div className="space-y-3">
          <input
            className="input"
            placeholder="Nome da playlist"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            autoFocus
          />
          <input
            className="input"
            placeholder="Descrição (opcional)"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
          <button
            className="btn-primary w-full"
            type="button"
            disabled={enviando || !nome.trim()}
            onClick={() => void onCriar()}
          >
            {enviando ? 'Criando…' : 'Criar'}
          </button>
        </div>
      </PainelDeslizante>
    </main>
  );
}