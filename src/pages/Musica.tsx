import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMusicas } from '../hooks/useMusicas';
import { usePlayer } from '../hooks/usePlayer';
import { useAuth } from '../hooks/useAuth';
import { SectionHeader, CapaMusica, LinhaLista, Avatar } from '../components/aurora';
import { EstadoVazio } from '../components/compartilhado/EstadoVazio';
import { 
    Search, 
    Play, 
    Disc, 
    User, 
    FileText, 
    Music2, 
    Plus, 
    MessageSquare, 
    Users, 
    MoreVertical,
    ChevronRight,
    Minus,
    Volume2
} from 'lucide-react';

export const Musica: React.FC = () => {
    const navigate = useNavigate();
    const { musicas, loading } = useMusicas();
    const { faixa, tocar } = usePlayer();
    const { user, perfilUsuario } = useAuth();

    const [termoBusca, setTermoBusca] = useState('');
    const [metronomoBpm, setMetronomoBpm] = useState(120);

    const nomeUsuario = perfilUsuario?.nome || user?.displayName || 'Músico';
    const fotoUsuario = perfilUsuario?.foto || user?.photoURL || undefined;

    const artistasDerivados = React.useMemo(() => {
        const mapa = new Map<string, number>();
        musicas.forEach((m) => {
            if (m.artista) {
                const total = mapa.get(m.artista) || 0;
                mapa.set(m.artista, total + 1);
            }
        });
        return Array.from(mapa.entries()).map(([nome, qtd]) => ({ nome, qtd }));
    }, [musicas]);

    const maisTocadas = React.useMemo(() => {
        let lista = [...musicas].sort((a, b) => (b.vezesTocada || 0) - (a.vezesTocada || 0));
        if (termoBusca.trim()) {
            const query = termoBusca.toLowerCase();
            lista = lista.filter(m => 
                m.titulo.toLowerCase().includes(query) || 
                (m.artista && m.artista.toLowerCase().includes(query))
            );
        }
        return lista;
    }, [musicas, termoBusca]);

    if (loading) {
        return (
            <div className="app-page flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="app-page space-y-6 pb-28 fade-in">
            {/* Header com Saudação do Usuário */}
            <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                        <Volume2 size={24} className="animate-pulse" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gradient tracking-tight">WorshipFlow</h1>
                        <p className="text-xs text-white/60">
                            Olá, {nomeUsuario} <span className="inline-block animate-bounce">🎵</span>
                        </p>
                        <p className="text-[10px] text-white/40">Vamos fazer música hoje?</p>
                    </div>
                </div>
                <Avatar nome={nomeUsuario} fotoUrl={fotoUsuario} tamanho="md" />
            </div>

            {/* Barra de Busca Estilizada */}
            <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                    type="text"
                    value={termoBusca}
                    onChange={(e) => setTermoBusca(e.target.value)}
                    placeholder="Buscar músicas, artistas, álbuns, pastas..."
                    className="w-full bg-[#12131C]/80 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-xs text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 backdrop-blur-xl transition-all shadow-inner"
                />
            </div>

            {/* Seção Acesso Rápido */}
            <div>
                <SectionHeader titulo="Acesso rápido" />
                <div className="grid grid-cols-4 gap-2.5">
                    <button
                        onClick={() => navigate('/player')}
                        className="card p-3 flex flex-col items-center justify-center gap-1.5 hover:border-purple-500/40 transition-all cursor-pointer group bg-[#141522]/90 border border-white/10 rounded-2xl"
                    >
                        <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400 group-hover:scale-110 transition-transform">
                            <Play size={18} fill="currentColor" className="ml-0.5" />
                        </div>
                        <span className="text-xs font-semibold text-white">Player</span>
                        <span className="text-[9px] text-white/40 -mt-1">Continuar ouvindo</span>
                    </button>

                    <button
                        onClick={() => navigate('/albuns')}
                        className="card p-3 flex flex-col items-center justify-center gap-1.5 hover:border-purple-500/40 transition-all cursor-pointer group bg-[#141522]/90 border border-white/10 rounded-2xl"
                    >
                        <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400 group-hover:scale-110 transition-transform">
                            <Disc size={18} />
                        </div>
                        <span className="text-xs font-semibold text-white">Álbuns</span>
                        <span className="text-[9px] text-white/40 -mt-1">Sua coleção</span>
                    </button>

                    <button
                        onClick={() => navigate('/artistas')}
                        className="card p-3 flex flex-col items-center justify-center gap-1.5 hover:border-purple-500/40 transition-all cursor-pointer group bg-[#141522]/90 border border-white/10 rounded-2xl"
                    >
                        <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400 group-hover:scale-110 transition-transform">
                            <User size={18} />
                        </div>
                        <span className="text-xs font-semibold text-white">Artistas</span>
                        <span className="text-[9px] text-white/40 -mt-1">Seus artistas</span>
                    </button>

                    <button
                        onClick={() => navigate('/cifra')}
                        className="card p-3 flex flex-col items-center justify-center gap-1.5 hover:border-purple-500/40 transition-all cursor-pointer group bg-[#141522]/90 border border-white/10 rounded-2xl"
                    >
                        <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400 group-hover:scale-110 transition-transform">
                            <FileText size={18} />
                        </div>
                        <span className="text-xs font-semibold text-white">Cifras</span>
                        <span className="text-[9px] text-white/40 -mt-1">Minhas cifras</span>
                    </button>
                </div>
            </div>

            {/* Grid 2 colunas para Mais Tocadas e Widgets (Cifras/Metrônomo) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Mais tocadas (Ocupa 2 colunas no desktop) */}
                <div className="lg:col-span-2 space-y-3">
                    <SectionHeader
                        titulo="Mais tocadas"
                        acaoTexto="Ver todas"
                        onAcao={() => navigate('/biblioteca')}
                    />

                    {maisTocadas.length === 0 ? (
                        <EstadoVazio
                            titulo="Nenhuma música encontrada"
                            texto="Cadastre suas primeiras músicas ou ajuste sua busca."
                        />
                    ) : (
                        <div className="card divide-y divide-white/5 bg-[#141522]/90 rounded-2xl border border-white/10 overflow-hidden shadow-xl">
                            {maisTocadas.slice(0, 5).map((m, index) => (
                                <div
                                    key={m.id}
                                    onClick={() => navigate(`/musica/${m.id}`)}
                                    className="flex items-center justify-between p-3 hover:bg-white/5 transition-colors cursor-pointer group"
                                >
                                    <div className="flex items-center gap-3.5 min-w-0">
                                        <span className="text-xs font-mono font-bold text-white/40 w-5 text-center shrink-0">
                                            {String(index + 1).padStart(2, '0')}
                                        </span>
                                        <CapaMusica tom={m.tom} titulo={m.titulo} tamanho="md" className="shadow-purple-900/20" />
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
                                                {m.titulo}
                                            </p>
                                            <p className="text-[11px] text-white/50 truncate">
                                                {m.artista || 'Artista não informado'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                tocar(m);
                                            }}
                                            className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/30 text-purple-300 hover:text-white transition-all border border-purple-500/20"
                                            title="Tocar"
                                        >
                                            <Play size={14} fill="currentColor" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/musica/${m.id}`);
                                            }}
                                            className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                                        >
                                            <MoreVertical size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Coluna Lateral: Cifras recentes e Metrônomo */}
                <div className="space-y-6">
                    {/* Cifras Recentes */}
                    <div className="space-y-3">
                        <SectionHeader
                            titulo="Cifras recentes"
                            acaoTexto="Ver todas"
                            onAcao={() => navigate('/cifra')}
                        />
                        {musicas.length === 0 ? (
                            <EstadoVazio titulo="Sem cifras recentes" texto="Suas cifras visualizadas recentemente aparecerão aqui." />
                        ) : (
                            <div className="card p-3 space-y-2 bg-[#141522]/90 border border-white/10 rounded-2xl">
                                {musicas.slice(0, 3).map((m) => (
                                    <div
                                        key={`cifra-${m.id}`}
                                        onClick={() => navigate(`/musica/${m.id}`)}
                                        className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-8 h-8 rounded-lg bg-purple-900/40 border border-purple-500/30 flex items-center justify-center text-xs font-bold text-purple-300 shrink-0">
                                                {m.tom || 'C'}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold text-white truncate group-hover:text-purple-300">
                                                    {m.titulo}
                                                </p>
                                                <p className="text-[10px] text-white/50 truncate">
                                                    {m.artista || 'Artista'}
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronRight size={14} className="text-white/30 group-hover:text-white shrink-0" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Widget Metrônomo */}
                    <div className="card p-4 bg-[#141522]/90 border border-white/10 rounded-2xl flex flex-col justify-between space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-white/70">Metrônomo</span>
                            <div className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
                        </div>

                        <div className="flex items-center justify-around py-2">
                            {/* Pêndulo visual estilizado */}
                            <div className="relative w-12 h-16 flex items-center justify-center">
                                <div className="absolute inset-0 border-b-2 border-purple-500/40 clip-triangle" />
                                <div className="w-1 h-14 bg-gradient-to-t from-purple-500 to-purple-300 rounded-full transform rotate-12 origin-bottom animate-bounce" />
                            </div>

                            <div className="text-center">
                                <span className="text-3xl font-extrabold text-white font-mono">{metronomoBpm}</span>
                                <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest">BPM</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-3 pt-1">
                            <button
                                onClick={() => setMetronomoBpm((b) => Math.max(30, b - 1))}
                                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors border border-white/10"
                            >
                                <Minus size={14} />
                            </button>
                            <button
                                onClick={() => setMetronomoBpm((b) => Math.min(240, b + 1))}
                                className="w-10 h-10 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center transition-all shadow-lg shadow-purple-600/30"
                            >
                                <Play size={16} fill="currentColor" className="ml-0.5" />
                            </button>
                            <button
                                onClick={() => setMetronomoBpm((b) => Math.min(240, b + 1))}
                                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors border border-white/10"
                            >
                                <Plus size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Seção Comunidade / Ações rápidas */}
            <div className="pt-2">
                <SectionHeader
                    titulo="Comunidade"
                    acaoTexto="Ver todas"
                    onAcao={() => navigate('/comunidade')}
                />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <button
                        onClick={() => navigate('/editor')}
                        className="card p-4 flex flex-col items-center justify-center gap-2 bg-[#141522]/80 hover:bg-purple-900/20 border border-white/10 hover:border-purple-500/40 rounded-2xl transition-all group"
                    >
                        <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                            <Music2 size={20} />
                        </div>
                        <span className="text-xs font-semibold text-white">Adicionar Música</span>
                    </button>

                    <button
                        onClick={() => navigate('/editor')}
                        className="card p-4 flex flex-col items-center justify-center gap-2 bg-[#141522]/80 hover:bg-purple-900/20 border border-white/10 hover:border-purple-500/40 rounded-2xl transition-all group"
                    >
                        <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                            <Plus size={20} />
                        </div>
                        <span className="text-xs font-semibold text-white">Adicionar Cifra</span>
                    </button>

                    <button
                        onClick={() => navigate('/comunidade')}
                        className="card p-4 flex flex-col items-center justify-center gap-2 bg-[#141522]/80 hover:bg-purple-900/20 border border-white/10 hover:border-purple-500/40 rounded-2xl transition-all group"
                    >
                        <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                            <MessageSquare size={20} />
                        </div>
                        <span className="text-xs font-semibold text-white">Nova Sugestão</span>
                    </button>

                    <button
                        onClick={() => navigate('/comunidade')}
                        className="card p-4 flex flex-col items-center justify-center gap-2 bg-[#141522]/80 hover:bg-purple-900/20 border border-white/10 hover:border-purple-500/40 rounded-2xl transition-all group"
                    >
                        <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                            <Users size={20} />
                        </div>
                        <span className="text-xs font-semibold text-white">Ver Comunidade</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Musica;

