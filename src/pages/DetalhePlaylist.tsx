import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Music, Play, Plus, Search, Trash2 } from 'lucide-react';
import { CapaMusica, SectionHeader } from '../components/aurora';
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
        <div className="app-page space-y-6 pb-24 fade-in max-w-2xl mx-auto">
            <div className="flex items-center justify-between gap-3">
                <button
                    onClick={() => navigate(-1)}
                    className="btn-ghost text-xs flex items-center gap-2"
                >
                    <ArrowLeft size={16} />
                    <span>Voltar</span>
                </button>
                <div className="flex gap-2">
                    <button
                        className="btn-ghost text-xs"
                        type="button"
                        onClick={() => setAdicionarAberto(true)}
                    >
                        <Plus className="h-4 w-4" />
                        Adicionar
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <CapaMusica titulo={playlist.nome} tamanho="lg" />
                <div className="min-w-0 flex-1">
                    <h1 className="text-2xl font-bold text-gradient">{playlist.nome}</h1>
                    {playlist.descricao ? <p className="text-sm text-textoSecundario">{playlist.descricao}</p> : null}
                    <span className="text-xs text-textoSecundario">
                        {playlist.faixas.length} {playlist.faixas.length === 1 ? 'faixa' : 'faixas'}
                    </span>
                </div>
            </div>

            <div className="flex gap-2">
                <button
                    className="btn-primary flex-1"
                    type="button"
                    onClick={() => tocarPlaylist()}
                    disabled={playlist.faixas.length === 0}
                >
                    <Play className="h-4 w-4" />
                    Tocar Playlist
                </button>
            </div>

            <SectionHeader icone={<Music size={16} />} titulo="Faixas" />

            {faixasMusicas.length === 0 ? (
                <EstadoVazio titulo="Nenhuma faixa adicionada" texto="Clique em 'Adicionar' para incluir músicas da sua biblioteca." />
            ) : (
                <div className="card divide-y divide-borda">
                    {faixasMusicas.map((musica, index) => (
                        <div key={musica.id} className="flex items-center justify-between gap-3 p-3">
                            <div className="flex min-w-0 flex-1 items-center gap-3">
                                <span className="text-xs font-bold text-primaria w-5">{index + 1}</span>
                                <CapaMusica tom={musica.tom} titulo={musica.titulo} tamanho="sm" />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-semibold">{musica.titulo}</p>
                                    <p className="truncate text-sm text-textoSecundario">{musica.artista} · {musica.tom}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="btn-text text-perigo h-8 w-8 p-0"
                                onClick={(e) => void handleRemoverFaixa(musica.id, e)}
                                aria-label={`Remover ${musica.titulo}`}
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

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
