import { useState } from 'react';
import { ArrowLeft, Camera, Play, RefreshCw, Download, X } from 'lucide-react';
import { CapaMusica, SectionHeader } from '../components/aurora';
import { EstadoVazio } from '../components/compartilhado/EstadoVazio';
import { useCamadaPrivada } from '../hooks/useCamadaPrivada';
import type { NavidromeAlbum, NavidromeTrack } from '../hooks/useCamadaPrivada';
import { useAuth } from '../hooks/useAuth';

const abas = ['navidrome', 'frigate'] as const;

export const CamadaPrivada: React.FC = () => {
    const { autorizado, loading, albuns, buscarFaixas, recarregar, solicitarMusica } = useCamadaPrivada();
    const { user } = useAuth();
    const [aba, setAba] = useState<'navidrome' | 'frigate'>('navidrome');
    const [albumExpandido, setAlbumExpandido] = useState<string | null>(null);
    const [faixasVisiveis, setFaixasVisiveis] = useState<Record<string, NavidromeTrack[]>>({});
    const [reproduzindo, setReproduzindo] = useState<string | null>(null);
    const [modalAberto, setModalAberto] = useState(false);
    const [nomeMusica, setNomeMusica] = useState('');
    const [artista, setArtista] = useState('');
    const [usuario, setUsuario] = useState(user?.displayName || user?.email || '');
    const [carregandoPedido, setCarregandoPedido] = useState(false);
    const [mensagemPedido, setMensagemPedido] = useState<string | null>(null);

    if (!autorizado) {
        return (
            <div className="app-page fade-in">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => window.history.back()}
                        className="btn-ghost text-xs flex items-center gap-2"
                    >
                        <ArrowLeft size={16} />
                        <span>Voltar</span>
                    </button>
                    <h1 className="text-2xl font-bold text-gradient">Camada Privada</h1>
                </div>
                <div className="mt-6">
                    <EstadoVazio
                        titulo="Acesso Restrito"
                        texto="Você não está na allowlist para acessar a camada privada (Navidrome/Frigate)."
                    />
                </div>
            </div>
        );
    }

    async function handleExpandirAlbum(album: NavidromeAlbum) {
        const albumId = album.id;
        if (albumExpandido === albumId) {
            setAlbumExpandido(null);
            return;
        }
        setAlbumExpandido(albumId);
        if (!faixasVisiveis[albumId]) {
            const faixas = await buscarFaixas(albumId);
            setFaixasVisiveis((prev) => ({ ...prev, [albumId]: faixas }));
        }
    }

    async function handleSolicitarMusica() {
        setCarregandoPedido(true);
        setMensagemPedido(null);
        const resultado = await solicitarMusica({
            nomeMusica: nomeMusica.trim(),
            artista: artista.trim(),
            usuario: usuario.trim(),
        });
        setCarregandoPedido(false);
        if (resultado.sucesso) {
            setMensagemPedido(resultado.mensagem);
            setNomeMusica('');
            setArtista('');
            setTimeout(() => {
                setModalAberto(false);
                setMensagemPedido(null);
            }, 2000);
        } else {
            setMensagemPedido(resultado.mensagem);
        }
    }

    return (
        <div className="app-page space-y-6 pb-24 fade-in max-w-4xl mx-auto">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => window.history.back()}
                        className="btn-ghost text-xs flex items-center gap-2"
                    >
                        <ArrowLeft size={16} />
                        <span>Voltar</span>
                    </button>
                    <h1 className="text-2xl font-bold text-gradient">Camada Privada</h1>
                </div>
                <button className="btn-ghost h-9 w-9 p-0" onClick={() => recarregar()} aria-label="Recarregar">
                    <RefreshCw size={16} />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-elevada p-1.5 text-sm font-medium">
                    {abas.map((tab) => {
                    const labels = { navidrome: 'Minha Música (Navidrome)', frigate: 'Câmeras (Frigate)' };
                    const icons = {
                        navidrome: <Play size={16} />,
                        frigate: <Camera size={16} />,
                    };
                    return (
                        <button
                            key={tab}
                            type="button"
                            className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 transition-all ${
                                aba === tab ? 'bg-primaria text-fundo' : 'text-textoSecundario hover:text-texto'
                            }`}
                            onClick={() => setAba(tab)}
                        >
                            {icons[tab]}
                            {labels[tab]}
                        </button>
                    );
                })}
            </div>

            {loading ? (
                <div className="card p-6 text-center text-textoSecundario">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primaria border-t-transparent mb-2" />
                    <p>Carregando dados da camada privada…</p>
                </div>
            ) : aba === 'navidrome' ? (
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <SectionHeader icone={<Play size={16} />} titulo="Álbuns do Navidrome" />
                        <button
                            type="button"
                            className="btn-primary flex items-center gap-1.5 text-xs"
                            onClick={() => setModalAberto(true)}
                        >
                            <Download size={14} />
                            Pedir Música
                        </button>
                    </div>
                    {albuns.length === 0 ? (
                        <EstadoVazio titulo="Nenhum álbum encontrado" texto="Verifique a conexão com o Navidrome ou adicione músicas." />
                    ) : (
                        <div className="space-y-2">
                            {albuns.map((album) => (
                                <article key={album.id} className="card p-3">
                                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => void handleExpandirAlbum(album)}>
                                        <CapaMusica titulo={album.titulo} tamanho="sm" />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-semibold">{album.titulo}</p>
                                            <p className="truncate text-sm text-textoSecundario">{album.artista} {album.ano ? `· ${album.ano}` : ''}</p>
                                        </div>
                                    </div>

                                    {albumExpandido === album.id && faixasVisiveis[album.id] ? (
                                        <div className="mt-3 space-y-2">
                                            {faixasVisiveis[album.id]!.map((track) => (
                                                <div key={track.id} className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        className="btn-text h-7 w-7 p-0"
                                                        onClick={() => setReproduzindo(reproduzindo === track.id ? null : track.id)}
                                                        aria-label={reproduzindo === track.id ? 'Pausar' : 'Tocar'}
                                                    >
                                                        {reproduzindo === track.id ? '⏸' : '▶'}
                                                    </button>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-medium">{track.titulo}</p>
                                                        <p className="truncate text-xs text-textoSecundario">{track.artista}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : null}
                                </article>
                            ))}
                        </div>
                    )}

                    {reproduzindo ? (
                        <div className="fixed bottom-20 right-4 z-40 w-64">
                            <audio
                                controls
                                autoPlay
                                src={faixasVisiveis[albumExpandido || '']?.find((t) => t.id === reproduzindo)?.streamUrl || ''}
                                className="w-full"
                                onEnded={() => setReproduzindo(null)}
                            />
                        </div>
                    ) : null}
                </section>
            ) : (
                <section className="space-y-4">
                    <SectionHeader icone={<Camera size={16} />} titulo="Câmeras do Frigate" />
                    <EstadoVazio
                        titulo="Câmeras disponíveis apenas via Tailscale"
                        texto="Para visualizar as câmeras de segurança, conecte-se ao Tailscale e acesse diretamente pelo endereço local (100.102.180.104:5000)."
                    />
                </section>
            )}

            {modalAberto ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="card w-full max-w-md space-y-4 p-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-white">Pedir Música</h2>
                            <button type="button" className="btn-text h-8 w-8 p-0 text-textoSecundario" onClick={() => setModalAberto(false)}>
                                <X size={18} />
                            </button>
                        </div>
                        <p className="text-xs text-textoSecundario">
                            Preencha os dados abaixo e o Hermes buscará a música no Navidrome para você.
                        </p>
                        <div className="space-y-3">
                            <label className="block space-y-1">
                                <span className="text-xs font-semibold text-textoSecundario">Nome da Música *</span>
                                <input
                                    className="input"
                                    value={nomeMusica}
                                    onChange={(event) => setNomeMusica(event.target.value)}
                                    placeholder="Ex: Oceans"
                                />
                            </label>
                            <label className="block space-y-1">
                                <span className="text-xs font-semibold text-textoSecundario">Artista / Banda</span>
                                <input
                                    className="input"
                                    value={artista}
                                    onChange={(event) => setArtista(event.target.value)}
                                    placeholder="Ex: Hillsong"
                                />
                            </label>
                            <label className="block space-y-1">
                                <span className="text-xs font-semibold text-textoSecundario">Seu Nome / Usuário</span>
                                <input
                                    className="input"
                                    value={usuario}
                                    onChange={(event) => setUsuario(event.target.value)}
                                    placeholder="Seu nome ou usuário"
                                />
                            </label>
                        </div>
                        {mensagemPedido ? (
                            <p className={`text-xs ${mensagemPedido.includes('sucesso') || mensagemPedido.includes('enviado') ? 'text-sucesso' : 'text-perigo'}`}>
                                {mensagemPedido}
                            </p>
                        ) : null}
                        <div className="flex items-center justify-end gap-2">
                            <button type="button" className="btn-ghost text-xs" onClick={() => setModalAberto(false)}>
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="btn-primary flex items-center gap-1.5 text-xs"
                                disabled={carregandoPedido || !nomeMusica.trim()}
                                onClick={() => void handleSolicitarMusica()}
                            >
                                {carregandoPedido ? (
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-fundo border-t-transparent" />
                                ) : (
                                    <Download size={14} />
                                )}
                                {carregandoPedido ? 'Enviando...' : 'Solicitar'}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default CamadaPrivada;
