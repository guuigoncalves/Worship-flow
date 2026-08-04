import { useState } from 'react';
import { ArrowLeft, Camera, Play, RefreshCw, Download, X, Music2, Settings2, Users, FileText, LogOut, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CapaMusica, SectionHeader } from '../components/aurora';
import { EstadoVazio } from '../components/compartilhado/EstadoVazio';
import { useCamadaPrivada } from '../hooks/useCamadaPrivada';
import type { NavidromeAlbum, NavidromeTrack } from '../hooks/useCamadaPrivada';
import { useAuth } from '../hooks/useAuth';

const abas = ['navidrome', 'frigate'] as const;

export const CamadaPrivada: React.FC = () => {
    const { autorizado, loading, erro, albuns, buscarFaixas, recarregar, solicitarMusica } = useCamadaPrivada();
    const { user } = useAuth();
    const navigate = useNavigate();
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
                    <button className="btn-ghost text-xs" type="button" onClick={() => navigate(-1)}>
                        <ArrowLeft size={16} />
                        <span>Voltar</span>
                    </button>
                    <h1 className="text-2xl font-bold text-gradient">Camada Privada</h1>
                </div>
                <div className="mt-6">
                    <EstadoVazio titulo="Acesso Restrito" texto="Você não está na allowlist para acessar a camada privada (Navidrome/Frigate)." />
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
        <div className="flex min-h-screen bg-[#0B0C10]">
            {/* Sidebar */}
            <aside className="hidden w-64 flex-col border-r border-white/10 bg-[#0D0E17] lg:flex">
                <div className="p-5">
                    <h2 className="font-display text-lg font-bold text-white">Área Privada</h2>
                    <p className="text-xs text-textoSecundario">Acesso restrito</p>
                </div>
                <nav className="mt-4 flex-1 space-y-1 px-3">
                    <button className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${aba === 'navidrome' ? 'bg-[#6C5CE7]/20 text-primaria' : 'text-textoSecundario hover:text-white'}`} onClick={() => setAba('navidrome')}>
                        <Music2 className="h-4 w-4" /> Músicas Pessoais
                    </button>
                    <button className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${aba === 'frigate' ? 'bg-[var(--primaria-dim)] text-[var(--primaria)]' : 'text-textoSecundario hover:text-white'}`} onClick={() => setAba('frigate')}>
                        <Camera className="h-4 w-4" /> Câmeras
                    </button>
                    <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-textoSecundario hover:text-white">
                        <Settings2 className="h-4 w-4" /> Configurações
                    </button>
                    <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-textoSecundario hover:text-white">
                        <Users className="h-4 w-4" /> Usuários
                    </button>
                    <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-textoSecundario hover:text-white">
                        <FileText className="h-4 w-4" /> Logs de Acesso
                    </button>
                </nav>
                <div className="p-4">
                    <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-perigo/80 hover:text-perigo" onClick={() => navigate('/')}>
                        <LogOut className="h-4 w-4" /> Sair da área privada
                    </button>
                </div>
            </aside>

            {/* Conteúdo principal */}
            <main className="flex-1 app-page space-y-6 pb-24 fade-in max-w-6xl">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <button className="btn-ghost text-xs lg:hidden" type="button" onClick={() => navigate(-1)}>
                            <ArrowLeft size={16} />
                            <span>Voltar</span>
                        </button>
                        <h1 className="text-2xl font-bold text-gradient">Camada Privada</h1>
                    </div>
                    <button className="btn-ghost h-9 w-9 p-0" onClick={() => recarregar()} aria-label="Recarregar">
                        <RefreshCw size={16} />
                    </button>
                </div>

                {loading ? (
                    <div className="card p-6 text-center text-textoSecundario">
                        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primaria border-t-transparent mb-2" />
                        <p>Carregando dados da camada privada…</p>
                    </div>
                ) : aba === 'navidrome' ? (
                    <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <SectionHeader icone={<Play size={16} />} titulo="Músicas Pessoais" />
                                <button type="button" className="btn-primary flex items-center gap-1.5 text-xs" onClick={() => setModalAberto(true)}>
                                    <Download size={14} /> Pedir Música
                                </button>
                            </div>

                            {erro && (
                                <div className="card border border-perigo/40 bg-perigo/10 p-4 text-sm text-perigo">
                                    <p className="font-semibold">Erro de conexão com o Navidrome</p>
                                    <p className="mt-1 text-xs opacity-90">{erro}</p>
                                </div>
                            )}

                            <div className="flex gap-2">
                                {['Todas', 'Álbuns', 'Artistas', 'Pastas'].map((tab) => (
                                    <button key={tab} className={`chip text-xs ${tab === 'Todas' ? 'chip-active' : ''}`} type="button">{tab}</button>
                                ))}
                            </div>

                            <div className="card rounded-2xl border border-white/10 bg-[#141522] shadow-lg shadow-purple-900/10">
                                <div className="p-3">
                                    <input className="input" placeholder="Buscar músicas pessoais..." />
                                </div>
                                <div className="divide-y divide-white/5">
                                    {albuns.map((album) => (
                                        <div key={album.id} className="p-3">
                                            <div className="flex cursor-pointer items-center gap-3" onClick={() => void handleExpandirAlbum(album)}>
                                                <CapaMusica titulo={album.titulo} tamanho="sm" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate font-semibold text-white">{album.titulo}</p>
                                                    <p className="truncate text-sm text-textoSecundario">{album.artista} {album.ano ? `· ${album.ano}` : ''}</p>
                                                </div>
                                                <PlayCircle className="h-5 w-5 text-primaria" />
                                            </div>
                                            {albumExpandido === album.id && faixasVisiveis[album.id] ? (
                                                <div className="mt-3 space-y-2">
                                                    {faixasVisiveis[album.id]!.map((track) => (
                                                        <div key={track.id} className={`flex items-center gap-2 rounded-xl p-2 ${reproduzindo === track.id ? 'bg-[#6C5CE7]/20' : ''}`}>
                                                            <button type="button" className="btn-text h-8 w-8 p-0 text-primaria" onClick={() => setReproduzindo(reproduzindo === track.id ? null : track.id)}>
                                                                {reproduzindo === track.id ? '⏸' : '▶'}
                                                            </button>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="truncate text-sm font-medium text-white">{track.titulo}</p>
                                                                <p className="truncate text-xs text-textoSecundario">{track.artista}</p>
                                                            </div>
                                                            <span className="text-xs text-textoSecundario">04:58</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : null}
                                        </div>
                                    ))}
                                    {albuns.length === 0 && !erro && <EstadoVazio titulo="Nenhum álbum encontrado" texto="Verifique a conexão com o Navidrome ou adicione músicas." />}
                                </div>
                            </div>
                        </div>

                        {/* Player em destaque */}
                        <div className="card rounded-2xl border border-white/10 bg-[#141522] shadow-lg shadow-purple-900/10 p-6">
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative">
                                    <div className="h-48 w-48 rounded-2xl bg-gradient-to-br from-[#6C5CE7] to-[#A259FF] shadow-2xl shadow-purple-900/40" />
                                    <div className="absolute -inset-4 rounded-3xl bg-purple-500/20 blur-2xl" />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-lg font-bold text-white">A Ele a Glória</h3>
                                    <p className="text-sm text-textoSecundario">Diante do Trono</p>
                                    <p className="text-xs text-textoSecundario">Tua Visão · 2012 · Worship · MP3 • 320kbps</p>
                                </div>

                                <div className="flex h-12 items-end gap-1">
                                    {[40, 70, 50, 90, 60, 80, 45].map((h, i) => (
                                        <span key={i} className="w-1.5 rounded-full bg-primaria animate-pulse" style={{ height: `${h}%`, animationDelay: `${i * 100}ms` }} />
                                    ))}
                                </div>

                                <div className="w-full">
                                    <div className="h-1.5 rounded-full bg-white/10">
                                        <div className="h-full rounded-full bg-primaria" style={{ width: '35%' }} />
                                    </div>
                                    <div className="mt-1 flex justify-between text-[10px] text-textoSecundario">
                                        <span>01:24</span>
                                        <span>05:24</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <button className="btn-text text-xs text-textoSecundario">🔀</button>
                                    <button className="btn-text text-texto">⏮</button>
                                    <button className="btn-primary h-14 w-14 rounded-full p-0">▶</button>
                                    <button className="btn-text text-texto">⏭</button>
                                    <button className="btn-text text-xs text-textoSecundario">🔁</button>
                                </div>

                                <div className="flex w-full items-center gap-2">
                                    <span className="text-xs text-textoSecundario">🔊</span>
                                    <div className="h-1 flex-1 rounded-full bg-white/10">
                                        <div className="h-full rounded-full bg-primaria" style={{ width: '70%' }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                ) : (
                    <section className="space-y-4">
                        <SectionHeader icone={<Camera size={16} />} titulo="Câmeras do Frigate" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {['Entrada', 'Palco', 'Estacionamento', 'Sala de Ensaios', 'Cozinha', 'Quintal'].map((camera) => (
                                <div key={camera} className="card overflow-hidden border border-white/10 group cursor-pointer">
                                    <div className="relative aspect-video bg-gradient-to-br from-[var(--superficie-alta)] to-[var(--superficie)] flex items-center justify-center">
                                        <Camera className="h-8 w-8 text-white/20 group-hover:text-[var(--primaria)] transition-colors" />
                                        <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-perigo/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                                            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                                            AO VIVO
                                        </span>
                                    </div>
                                    <div className="p-3 flex items-center justify-between">
                                        <p className="text-sm font-medium text-white">{camera}</p>
                                        <span className="text-[10px] text-textoSecundario">100.102.180.104:5000</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="card p-3 flex items-center justify-between text-xs text-textoSecundario border border-white/10">
                            <span>Status Tailscale: <span className="text-[var(--sucesso)] font-semibold">Conectado</span></span>
                            <span>Acesso exclusivo via Tailscale direto</span>
                        </div>
                    </section>
                )}

                {modalAberto ? (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <div className="card w-full max-w-md space-y-4 rounded-2xl border border-white/10 bg-[#141522] p-5 shadow-lg shadow-purple-900/10">
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
                                    <input className="input" value={nomeMusica} onChange={(event) => setNomeMusica(event.target.value)} placeholder="Ex: Oceans" />
                                </label>
                                <label className="block space-y-1">
                                    <span className="text-xs font-semibold text-textoSecundario">Artista / Banda</span>
                                    <input className="input" value={artista} onChange={(event) => setArtista(event.target.value)} placeholder="Ex: Hillsong" />
                                </label>
                                <label className="block space-y-1">
                                    <span className="text-xs font-semibold text-textoSecundario">Seu Nome / Usuário</span>
                                    <input className="input" value={usuario} onChange={(event) => setUsuario(event.target.value)} placeholder="Seu nome ou usuário" />
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
            </main>
        </div>
    );
};

export default CamadaPrivada;
