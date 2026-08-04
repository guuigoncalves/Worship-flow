import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Music, Play, Plus, Search, Trash2 } from 'lucide-react';
import { CapaMusica } from '../components/aurora';
import { EstadoVazio } from '../components/compartilhado/EstadoVazio';
import { PainelDeslizante } from '../components/compartilhado/PainelDeslizante';
import { usePlaylists } from '../hooks/usePlaylists';
import { useMusicas } from '../hooks/useMusicas';
import { useFila } from '../hooks/useFila';
import { useToast } from '../hooks/useToast';
import type { Musica } from '../types';

export const DetalhePlaylist: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playlists, adicionarFaixa, removerFaixa } = usePlaylists();
  const { musicas, obterMusica } = useMusicas();
  const { adicionarFila } = useFila();
  const { showToast } = useToast();
  const [adicionarAberto, setAdicionarAberto] = useState(false);
  const [consulta, setConsulta] = useState('');

  const playlist = playlists.find((p) => p.id === id);

  if (!playlist) {
    return (
      <div className="app-page fade-in">
        <EstadoVazio titulo="Playlist não encontrada" texto="Volte para as playlists e selecione outra." />
      </div>
    );
  }

  const faixasMusicas = playlist.faixas.map((faixaId) => obterMusica(faixaId)).filter(Boolean) as Musica[];

  async function handleRemoverFaixa(musicaId: string, event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    await removerFaixa(playlist!.id, musicaId);
  }

  async function handleAdicionarFaixa(musicaId: string) {
    await adicionarFaixa(playlist!.id, musicaId);
    setAdicionarAberto(false);
  }

  function tocarPlaylist() {
    const faixas = playlist!.faixas;
    if (!faixas.length) return;
    const primeira = faixas[0]!;
    navigate(`/tocar/${primeira}`);
    showToast(`Tocando playlist: ${playlist!.nome}`, 'sucesso');
    faixas.slice(1).forEach((faixaId, i) => {
      setTimeout(() => adicionarFila(faixaId), (i + 1) * 150);
    });
  }

  const resultadosBusca = musicas.filter((m) => {
    const q = consulta.trim().toLowerCase();
    if (!q) return true;
    return m.titulo.toLowerCase().includes(q) || m.artista.toLowerCase().includes(q);
  });

  return (
    <div className="app-page space-y-5 pb-24 fade-in">
      {/* Nav top */}
      <div className="flex items-center justify-between gap-3">
        <button onClick={() => navigate(-1)} className="btn-ghost h-9 w-9 p-0">
          <ArrowLeft size={16} />
        </button>
        <button
          className="btn-ghost py-2 px-3 text-sm flex items-center gap-2"
          type="button"
          onClick={() => setAdicionarAberto(true)}
        >
          <Plus className="h-4 w-4" />
          Adicionar
        </button>
      </div>

      {/* Banner da playlist */}
      <div
        className="rounded-2xl p-5 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(162,89,255,0.2) 0%, rgba(91,141,239,0.1) 100%)', border: '1px solid rgba(162,89,255,0.25)' }}
      >
        {/* Decoração de fundo */}
        <div
          className="absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #A259FF 0%, transparent 70%)' }}
        />

        <div className="relative flex items-center gap-4">
          <div className="shrink-0">
            <CapaMusica titulo={playlist.nome} tamanho="lg" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-gradient">{playlist.nome}</h1>
            {playlist.descricao && (
              <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{playlist.descricao}</p>
            )}
            <div className="mt-2 flex items-center gap-3">
              <span
                className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                style={{ background: 'rgba(162,89,255,0.2)', color: '#A259FF' }}
              >
                {playlist.faixas.length} {playlist.faixas.length === 1 ? 'faixa' : 'faixas'}
              </span>
            </div>
          </div>
        </div>

        {/* Botão hero Tocar */}
        <button
          className="btn-primary mt-4 w-full flex items-center justify-center gap-2"
          type="button"
          onClick={() => tocarPlaylist()}
          disabled={playlist.faixas.length === 0}
          style={{ opacity: playlist.faixas.length === 0 ? 0.5 : 1 }}
        >
          <Play className="h-5 w-5" fill="currentColor" />
          Tocar playlist
        </button>
      </div>

      {/* Lista de faixas */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Music size={14} style={{ color: '#A259FF' }} />
          <span className="text-sm font-semibold">Faixas</span>
        </div>

        {faixasMusicas.length === 0 ? (
          <EstadoVazio titulo="Nenhuma faixa adicionada" texto="Clique em 'Adicionar' para incluir músicas da sua biblioteca." />
        ) : (
          <div className="card divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            {faixasMusicas.map((musica, index) => (
              <div key={musica.id} className="flex items-center gap-3 p-3">
                {/* Número */}
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                  style={{ background: 'rgba(162,89,255,0.12)', color: '#A259FF' }}
                >
                  {index + 1}
                </span>

                <CapaMusica tom={musica.tom} titulo={musica.titulo} tamanho="sm" />

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-sm">{musica.titulo}</p>
                  <p className="truncate text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{musica.artista}</p>
                </div>

                {/* Badge tom */}
                <span
                  className="shrink-0 rounded-lg px-2 py-0.5 text-xs font-bold"
                  style={{ background: 'rgba(162,89,255,0.12)', color: '#A259FF', border: '1px solid rgba(162,89,255,0.25)' }}
                >
                  {musica.tom}
                </span>

                {/* Remover */}
                <button
                  type="button"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors"
                  style={{ background: 'rgba(224,64,64,0.08)', color: '#E04040' }}
                  onClick={(e) => void handleRemoverFaixa(musica.id, e)}
                  aria-label={`Remover ${musica.titulo}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Painel Adicionar */}
      <PainelDeslizante aberto={adicionarAberto} titulo="Adicionar música" onClose={() => setAdicionarAberto(false)}>
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-textoSecundario" aria-hidden="true" />
            <input
              className="input pl-10"
              value={consulta}
              onChange={(e) => setConsulta(e.target.value)}
              placeholder="Buscar na sua biblioteca…"
            />
          </div>
          <div className="max-h-[400px] space-y-1 overflow-y-auto">
            {resultadosBusca.map((musica) => {
              const jaTem = playlist.faixas.includes(musica.id);
              return (
                <button
                  key={musica.id}
                  className="btn-ghost w-full justify-between"
                  type="button"
                  disabled={jaTem}
                  onClick={() => void handleAdicionarFaixa(musica.id)}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <CapaMusica tom={musica.tom} titulo={musica.titulo} tamanho="sm" />
                    <span className="min-w-0 truncate">{musica.titulo}</span>
                  </div>
                  {jaTem ? (
                    <span className="text-xs text-sucesso">✓</span>
                  ) : (
                    <Plus className="h-4 w-4 text-primaria" />
                  )}
                </button>
              );
            })}
            {resultadosBusca.length === 0 ? <p className="text-sm text-textoSecundario">Nenhuma música encontrada.</p> : null}
          </div>
        </div>
      </PainelDeslizante>
    </div>
  );
};

export default DetalhePlaylist;
