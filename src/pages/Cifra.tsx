import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMusicas } from '../hooks/useMusicas';
import { useAuth } from '../hooks/useAuth';
import { SectionHeader, CapaMusica, Avatar } from '../components/aurora';
import { EstadoVazio } from '../components/compartilhado/EstadoVazio';
import {
    BookOpen,
    Plus,
    Layers,
    Search,
    Download,
    Star,
    Sparkles,
    ChevronRight
} from 'lucide-react';

export const Cifra: React.FC = () => {
    const navigate = useNavigate();
    const { musicas, loading, alternarFavorita } = useMusicas();
    const { user, perfilUsuario } = useAuth();

    const [termoBusca, setTermoBusca] = useState('');

    const nomeUsuario = perfilUsuario?.nome || user?.displayName || 'Músico';
    const fotoUsuario = perfilUsuario?.foto || user?.photoURL || undefined;

    const cifrasRecentes = useMemo(() => {
        let lista = [...musicas];
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
            {/* Header Hub Cifra */}
            <div className="flex items-center justify-between pt-1">
                <div>
                    <h1 className="text-2xl font-bold text-gradient tracking-tight">Hub Cifra</h1>
                    <p className="text-xs text-white/60 mt-0.5">
                        Tudo que você precisa para criar, organizar e compartilhar cifras.
                    </p>
                </div>
                <Avatar nome={nomeUsuario} fotoUrl={fotoUsuario} tamanho="md" />
            </div>

            {/* Banner de Ilustração Neon e Ações Principais (Grid de Ações Rápida) */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-950/60 via-[#141522] to-indigo-950/40 border border-purple-500/20 p-5 shadow-2xl">
                {/* Glow decorativo de fundo */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 space-y-4">
                    {/* Grid 2x2 com cards de atalhos estilizados igual mockup 5 */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => navigate('/biblioteca')}
                            className="card p-4 flex flex-col items-start justify-between min-h-[100px] bg-[#141522]/90 border border-white/10 hover:border-purple-500/50 rounded-2xl transition-all cursor-pointer group"
                        >
                            <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400 group-hover:scale-110 transition-transform">
                                <BookOpen size={22} />
                            </div>
                            <div>
                                <span className="text-sm font-bold text-white block group-hover:text-purple-300 transition-colors">
                                    Biblioteca
                                </span>
                                <span className="text-[10px] text-white/50">Minhas cifras salvas</span>
                            </div>
                        </button>

                        <button
                            onClick={() => navigate('/editor')}
                            className="card p-4 flex flex-col items-start justify-between min-h-[100px] bg-[#141522]/90 border border-white/10 hover:border-purple-500/50 rounded-2xl transition-all cursor-pointer group"
                        >
                            <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400 group-hover:scale-110 transition-transform">
                                <Plus size={22} />
                            </div>
                            <div>
                                <span className="text-sm font-bold text-white block group-hover:text-purple-300 transition-colors">
                                    Nova cifra
                                </span>
                                <span className="text-[10px] text-white/50">Criar do zero</span>
                            </div>
                        </button>

                        <button
                            onClick={() => navigate('/medleys')}
                            className="card p-4 flex flex-col items-start justify-between min-h-[100px] bg-[#141522]/90 border border-white/10 hover:border-purple-500/50 rounded-2xl transition-all cursor-pointer group"
                        >
                            <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400 group-hover:scale-110 transition-transform">
                                <Layers size={22} />
                            </div>
                            <div>
                                <span className="text-sm font-bold text-white block group-hover:text-purple-300 transition-colors">
                                    Medleys
                                </span>
                                <span className="text-[10px] text-white/50">Agrupe várias músicas</span>
                            </div>
                        </button>

                        <button
                            onClick={() => navigate('/busca-rapida')}
                            className="card p-4 flex flex-col items-start justify-between min-h-[100px] bg-[#141522]/90 border border-white/10 hover:border-purple-500/50 rounded-2xl transition-all cursor-pointer group"
                        >
                            <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400 group-hover:scale-110 transition-transform">
                                <Search size={22} />
                            </div>
                            <div>
                                <span className="text-sm font-bold text-white block group-hover:text-purple-300 transition-colors">
                                    Busca rápida
                                </span>
                                <span className="text-[10px] text-white/50">Encontre cifras rapidamente</span>
                            </div>
                        </button>
                    </div>

                    {/* Card Importar Cifra em Destaque no Hub */}
                    <div
                        onClick={() => navigate('/importar')}
                        className="card p-3.5 bg-gradient-to-r from-purple-900/40 via-[#141522] to-indigo-900/30 border border-purple-500/30 hover:border-purple-500/60 rounded-2xl flex items-center justify-between cursor-pointer transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 group-hover:scale-110 transition-transform">
                                <Download size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                                    Importar cifra
                                </p>
                                <p className="text-[10px] text-white/50">
                                    Importe de arquivo ou link externo
                                </p>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-white/40 group-hover:text-white transition-colors" />
                    </div>
                </div>
            </div>

            {/* Campo de filtro rápido */}
            <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                    type="text"
                    value={termoBusca}
                    onChange={(e) => setTermoBusca(e.target.value)}
                    placeholder="Filtrar cifras recentes por nome ou artista..."
                    className="w-full bg-[#12131C]/80 border border-white/10 rounded-2xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 backdrop-blur-xl transition-all"
                />
            </div>

            {/* Seção Cifras Recentes no Formato de Cards Horizontais/Grid Estilizado */}
            <div>
                <SectionHeader
                    titulo="Cifras recentes"
                    acaoTexto="Ver todas"
                    onAcao={() => navigate('/biblioteca')}
                />

                {cifrasRecentes.length === 0 ? (
                    <EstadoVazio
                        titulo="Nenhuma cifra encontrada"
                        texto="Crie ou importe suas primeiras cifras para visualizar os destaques aqui."
                    />
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {cifrasRecentes.slice(0, 4).map((m) => (
                            <div
                                key={m.id}
                                onClick={() => navigate(`/musica/${m.id}`)}
                                className="card p-3.5 bg-[#141522]/90 border border-white/10 hover:border-purple-500/40 rounded-2xl cursor-pointer group flex flex-col justify-between h-[160px] transition-all relative overflow-hidden shadow-lg"
                            >
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <CapaMusica tom={m.tom} titulo={m.titulo} tamanho="sm" className="shadow-purple-900/30" />
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                alternarFavorita(m.id);
                                            }}
                                            className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-amber-400 transition-colors"
                                        >
                                            <Star
                                                size={14}
                                                fill={m.eFavorita ? 'currentColor' : 'none'}
                                                className={m.eFavorita ? 'text-amber-400' : ''}
                                            />
                                        </button>
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                                            {m.titulo}
                                        </h3>
                                        <p className="text-[10px] text-white/50 truncate">
                                            {m.artista || 'Artista não informado'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                                        {m.tom || 'C'}
                                    </span>
                                    {m.acordes && m.acordes.length > 0 && (
                                        <span className="text-[9px] font-mono text-white/40">
                                            {m.acordes.length} acordes
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cifra;

