import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ListMusic, Plus, Trash2, Play } from 'lucide-react';
import { CapaMusica } from '../components/aurora';
import { EstadoVazio } from '../components/compartilhado/EstadoVazio';
import { PainelDeslizante } from '../components/compartilhado/PainelDeslizante';
import { usePlaylists } from '../hooks/usePlaylists';

export const Playlists: React.FC = () => {
  const navigate = useNavigate();
  const { playlists, loading, criarPlaylist, excluirPlaylist } = usePlaylists();
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
    } catch (err) {
      console.error(err);
    } finally {
      setEnviando(false);
    }
  }

  async function onExcluir(id: string, event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (window.confirm('Excluir playlist?')) {
      await excluirPlaylist(id);
    }
  }

  return (
    <div className="app-page space-y-5 pb-24 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn-ghost h-9 w-9 p-0">
            <ArrowLeft size={16} />
          </button>
          <div className="flex items-center gap-2">
            <ListMusic size={20} style={{ color: '#A259FF' }} />
            <h1 className="text-2xl font-bold text-gradient">Playlists</h1>
          </div>
        </div>
        <button className="btn-primary py-2 px-4 text-sm" type="button" onClick={() => setCriarAberto(true)}>
          <Plus className="h-4 w-4" />
          Nova playlist
        </button>
      </div>

      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
        Organize músicas para tocar no modo palco.
      </p>

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 rounded-full border-2 animate-spin" style={{ borderColor: '#A259FF', borderTopColor: 'transparent' }} />
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
              className="card group relative cursor-pointer overflow-hidden p-4"
              onClick={() => navigate(`/playlist/${playlist.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/playlist/${playlist.id}`)}
            >
              {/* Banner de fundo decorativo */}
              <div
                className="absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                style={{ background: 'rgba(162,89,255,0.04)' }}
              />

              <div className="relative flex items-center gap-3">
                <CapaMusica titulo={playlist.nome} tamanho="md" />

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{playlist.nome}</p>
                  {playlist.descricao && (
                    <p className="truncate text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {playlist.descricao}
                    </p>
                  )}
                  <div className="mt-1.5 flex items-center gap-2">
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={{ background: 'rgba(162,89,255,0.12)', color: 'rgba(162,89,255,0.9)' }}
                    >
                      {playlist.faixas.length} {playlist.faixas.length === 1 ? 'faixa' : 'faixas'}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-center gap-1.5">
                  {/* Tocar hover */}
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl opacity-0 transition-all duration-200 group-hover:opacity-100"
                    style={{ background: 'linear-gradient(120deg, #A259FF, #5B8DEF)' }}
                  >
                    <Play size={14} fill="white" style={{ color: 'white' }} />
                  </div>
                  {/* Excluir */}
                  <button
                    type="button"
                    className="flex h-7 w-7 items-center justify-center rounded-lg opacity-0 transition-all duration-200 group-hover:opacity-100"
                    style={{ background: 'rgba(224,64,64,0.1)', color: '#E04040' }}
                    onClick={(e) => void onExcluir(playlist.id, e)}
                    aria-label={`Excluir ${playlist.nome}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Painel Criar */}
      <PainelDeslizante aberto={criarAberto} titulo="Criar Playlist" onClose={() => setCriarAberto(false)}>
        <div className="space-y-3">
          <input
            className="input"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome da playlist"
            autoFocus
          />
          <input
            className="input"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descrição (opcional)"
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
    </div>
  );
};

export default Playlists;
