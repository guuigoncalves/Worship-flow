import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Music, Play, Plus, Search, Trash2, GripVertical } from 'lucide-react';
import { CapaMusica } from '../components/aurora';
import { EstadoVazio } from '../components/compartilhado/EstadoVazio';
import { PainelDeslizante } from '../components/compartilhado/PainelDeslizante';
import { usePlaylists } from '../hooks/usePlaylists';
import { useMusicas } from '../hooks/useMusicas';
import { useFila } from '../hooks/useFila';
import { useToast } from '../hooks/useToast';
import type { Musica } from '../types';

export default function DetalhePlaylist() {
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
      <main className="app-page fade-in" style={{ backgroundColor: '#0B0C10' }}>
        <EstadoVazio titulo="Playlist não encontrada" texto="Volte para as playlists e selecione outra." />
      </main>
    );
  }

  const faixasMusicas = playlist.faixas.map((faixaId) => obterMusica(faixaId)).filter(Boolean) as Musica[];

  async function handleRemoverFaixa(musicaId: string, event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    await removerFaixa(playlist!.id, musicaId);
    showToast('Faixa removida', 'sucesso');
  }

  async function handleAdicionarFaixa(musicaId: string) {
    await adicionarFaixa(playlist!.id, musicaId);
    setAdicionarAberto(false);
    showToast('Música adicionada', 'sucesso');
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
    <main className="app-page space-y-6 pb-32 fade-in" style={{ backgroundColor: '#0B0C10' }}>
      <header className="flex items-center justify-between gap-3">
        <button className="btn-ghost h-9 w-9 p-0" type="button" onClick={() => navigate(-1)} aria-label="Voltar">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-bold text-gradient truncate">{playlist.nome}</h1>
        <button className="btn-ghost h-9 w-9 p-0" type="button" onClick={() => setAdicionarAberto(true)} aria-label="Adicionar música">
          <Plus size={18} />
        </button>
      </header>

      <div className="card p-5 bg-[var(--primaria-dim)] border border-[var(--borda)] flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
        <CapaMusica titulo={playlist.nome} tamanho="lg" className="w-20 h-20 text-xl" />
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-[10px] uppercase font-bold text-[var(--primaria)] tracking-wider">Playlist</p>
          <h2 className="text-lg font-bold text-white truncate">{playlist.nome}</h2>
          {playlist.descricao && (
            <p className="text-xs text-white/50">{playlist.descricao}</p>
          )}
          <p className="text-xs text-white/40">{playlist.faixas.length} {playlist.faixas.length === 1 ? 'faixa' : 'faixas'}</p>
        </div>
        <button
          className="btn-primary py-3 px-5 text-xs flex items-center gap-2 shrink-0"
          type="button"
          onClick={() => tocarPlaylist()}
          disabled={playlist.faixas.length === 0}
        >
          <Play size={16} />
          <span>Tocar Tudo</span>
        </button>
      </div>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <Music size={14} className="text-[var(--primaria)]" />
          <span className="text-sm font-semibold text-white/70">Faixas</span>
          <span className="text-xs text-white/40">{faixasMusicas.length}</span>
        </div>

        {faixasMusicas.length === 0 ? (
          <EstadoVazio titulo="Nenhuma faixa adicionada" texto="Clique em 'Adicionar' para incluir músicas da sua biblioteca." />
        ) : (
          <div className="card divide-y divide-white/5">
            {faixasMusicas.map((musica, index) => (
              <div
                key={musica.id}
                className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors group"
              >
                <div className="flex items-center gap-2 shrink-0">
                  <GripVertical size={14} className="text-white/20 group-hover:text-white/40" />
                  <span className="text-xs font-mono font-bold text-white/40 w-5 text-center">{index + 1}</span>
                </div>
                <CapaMusica tom={musica.tom} titulo={musica.titulo} tamanho="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white truncate group-hover:text-[var(--primaria)] transition-colors">{musica.titulo}</p>
                  <p className="text-[10px] text-white/50 truncate">{musica.artista || 'Artista'}</p>
                </div>
                <button
                  className="p-2 rounded-lg bg-[var(--primaria-dim)] hover:bg-[var(--primaria)]/30 text-[var(--primaria)] hover:text-white transition-colors shrink-0"
                  title="Tocar"
                  onClick={() => adicionarFila(musica.id)}
                >
                  <Play size={14} fill="currentColor" />
                </button>
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors shrink-0"
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
      </section>

      <PainelDeslizante aberto={adicionarAberto} titulo="Adicionar música" onClose={() => setAdicionarAberto(false)}>
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" aria-hidden="true" />
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
                    <span className="min-w-0 truncate text-sm">{musica.titulo}</span>
                  </div>
                  {jaTem ? (
                    <span className="text-xs text-[var(--sucesso)]">✓</span>
                  ) : (
                    <Plus className="h-4 w-4 text-[var(--primaria)]" />
                  )}
                </button>
              );
            })}
            {resultadosBusca.length === 0 ? <p className="text-sm text-white/50">Nenhuma música encontrada.</p> : null}
          </div>
        </div>
      </PainelDeslizante>
    </main>
  );
}