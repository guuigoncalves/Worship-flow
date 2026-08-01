import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ListMusic, Plus, Trash2 } from 'lucide-react';
import { CapaMusica, SectionHeader } from '../components/aurora';
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
        <div className="app-page space-y-6 pb-24 fade-in max-w-2xl mx-auto">
            <div className="flex items-center justify-between gap-3">
                <button
                    onClick={() => navigate(-1)}
                    className="btn-ghost text-xs flex items-center gap-2"
                >
                    <ArrowLeft size={16} />
                    <span>Voltar</span>
                </button>
                <h1 className="m-0 text-2xl font-bold text-gradient flex items-center gap-2">
                    <ListMusic className="h-6 w-6 text-primaria" />
                    Playlists
                </h1>
            </div>

            <p className="text-xs text-textoSecundario">
                Organize suas músicas em playlists para tocar no modo palco.
            </p>

            <button className="btn-primary w-full" type="button" onClick={() => setCriarAberto(true)}>
                <Plus className="h-4 w-4" />
                Criar Playlist
            </button>

            <SectionHeader icone={<ListMusic size={16} />} titulo="Suas playlists" />

            {loading ? (
                <p className="text-sm text-textoSecundario">Carregando…</p>
            ) : playlists.length === 0 ? (
                <EstadoVazio
                    titulo="Nenhuma playlist ainda"
                    texto="Crie sua primeira playlist para organizar músicas e tocá-las no modo palco."
                />
            ) : (
                <div className="card divide-y divide-borda">
                    {playlists.map((playlist) => (
                        <button
                            key={playlist.id}
                            className="flex items-center justify-between gap-3 p-3 text-left transition hover:bg-white/5"
                            onClick={() => navigate(`/playlist/${playlist.id}`)}
                        >
                            <div className="flex min-w-0 flex-1 items-center gap-3">
                                <CapaMusica titulo={playlist.nome} tamanho="sm" />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-semibold">{playlist.nome}</p>
                                    {playlist.descricao ? (
                                        <p className="truncate text-sm text-textoSecundario">{playlist.descricao}</p>
                                    ) : null}
                                </div>
                                <span className="text-xs text-textoSecundario">
                                    {playlist.faixas.length} {playlist.faixas.length === 1 ? 'faixa' : 'faixas'}
                                </span>
                            </div>
                            <button
                                type="button"
                                className="btn-text text-perigo h-8 w-8 p-0"
                                onClick={(e) => void onExcluir(playlist.id, e)}
                                aria-label={`Excluir ${playlist.nome}`}
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </button>
                    ))}
                </div>
            )}

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
