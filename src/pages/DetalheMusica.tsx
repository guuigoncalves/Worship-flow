import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMusicas } from '../hooks/useMusicas';
import { usePlayer } from '../hooks/usePlayer';
import { useTransposicao } from '../hooks/useTransposicao';
import { CapaMusica } from '../components/aurora';
import { EstadoVazio } from '../components/compartilhado/EstadoVazio';
import { ExibicaoCifra } from '../components/apresentacao/ExibicaoCifra';
import {
    ArrowLeft,
    Play,
    Pause,
    Edit,
    Trash2,
    Star,
    Radio,
    Minus,
    Plus,
    Zap,
    SlidersHorizontal,
    AlignLeft,
    Type,
    MoreVertical,
} from 'lucide-react';
import { Tom } from '../types';

export const DetalheMusica: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { musicas, loading, obterMusica, excluirMusica, alternarFavorita } = useMusicas();
    const { faixa, tocando, tocar, pausar } = usePlayer();
    const { deslocarTom } = useTransposicao();

    const [musica, setMusica] = useState<any>(null);
    const [tomAtual, setTomAtual] = useState<Tom>('C');
    const [formatoVisualizacao, setFormatoVisualizacao] = useState<'acima' | 'inline'>('acima');
    const [autoScroll, setAutoScroll] = useState(false);
    const [tamanhoFonte, setTamanhoFonte] = useState<'pequeno' | 'medio' | 'grande'>('medio');
    const [bpm, setBpm] = useState(120);
    const [menuAberto, setMenuAberto] = useState(false);

    const scrollIntervalRef = useRef<any>(null);

    useEffect(() => {
        if (id) {
            const encontrada = obterMusica(id) || musicas.find((m) => m.id === id);
            if (encontrada) {
                setMusica(encontrada);
                if (encontrada.tom) setTomAtual(encontrada.tom as Tom);
            }
        }
    }, [id, musicas, obterMusica]);

    useEffect(() => {
        if (autoScroll) {
            scrollIntervalRef.current = setInterval(() => {
                window.scrollBy({ top: 1, behavior: 'smooth' });
            }, 50);
        } else {
            if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
        }
        return () => {
            if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
        };
    }, [autoScroll]);

    const aumentarTom = () => setTomAtual((prev) => deslocarTom(prev, 1));
    const diminuirTom = () => setTomAtual((prev) => deslocarTom(prev, -1));

    const handleExcluir = async () => {
        if (window.confirm('Tem certeza que deseja excluir esta música?')) {
            await excluirMusica(musica.id);
            navigate('/biblioteca');
        }
    };

    if (loading) {
        return (
            <div className="app-page flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!musica) {
        return (
            <div className="app-page space-y-6 pb-28 fade-in">
                <button
                    onClick={() => navigate('/biblioteca')}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors inline-flex items-center gap-2 text-sm"
                >
                    <ArrowLeft size={16} />
                    Voltar para Biblioteca
                </button>
                <EstadoVazio
                    titulo="Música não encontrada"
                    texto="A cifra selecionada não foi encontrada na sua biblioteca."
                />
            </div>
        );
    }

    const estaTocandoEstaMusica = faixa?.id === musica.id && tocando;

    return (
        <div className="app-page space-y-4 pb-40 fade-in relative">

            {/* ── Header de navegação ─────────────────────────────────── */}
            <div className="flex items-center justify-between pt-1">
                <button
                    id="detalhe-musica-voltar"
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                    aria-label="Voltar"
                >
                    <ArrowLeft size={18} />
                </button>

                <div className="flex items-center gap-1.5">
                    <button
                        id="detalhe-musica-favoritar"
                        onClick={() => alternarFavorita(musica.id)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                        title={musica.eFavorita ? 'Remover dos favoritos' : 'Favoritar'}
                        aria-label="Favoritar"
                    >
                        <Star
                            size={18}
                            fill={musica.eFavorita ? 'currentColor' : 'none'}
                            className={musica.eFavorita ? 'text-amber-400' : 'text-white/70'}
                        />
                    </button>
                    <button
                        id="detalhe-musica-editar"
                        onClick={() => navigate(`/editor/${musica.id}`)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                        title="Editar"
                        aria-label="Editar"
                    >
                        <Edit size={18} />
                    </button>
                    <div className="relative">
                        <button
                            id="detalhe-musica-mais"
                            onClick={() => setMenuAberto(!menuAberto)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                            aria-label="Mais opções"
                        >
                            <MoreVertical size={18} />
                        </button>
                        {menuAberto && (
                            <div className="absolute right-0 top-10 z-50 min-w-[160px] bg-[#1A1B28] border border-white/10 rounded-2xl shadow-2xl py-1 overflow-hidden">
                                <button
                                    onClick={() => { setMenuAberto(false); handleExcluir(); }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                >
                                    <Trash2 size={15} />
                                    Excluir música
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Banner principal ────────────────────────────────────── */}
            <div className="rounded-3xl bg-gradient-to-br from-[#141522] via-[#141522] to-purple-950/40 border border-white/10 p-5 space-y-4 shadow-2xl">

                {/* Capa + título + tom */}
                <div className="flex items-center gap-4">
                    <CapaMusica
                        tom={tomAtual}
                        titulo={musica.titulo}
                        tamanho="lg"
                        className="w-24 h-24 text-2xl shrink-0 shadow-xl shadow-purple-950/50 rounded-2xl"
                    />
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold text-white truncate tracking-tight">{musica.titulo}</h1>
                        <p className="text-xs text-white/60 truncate mt-0.5">{musica.artista || 'Artista não informado'}</p>

                        {/* Tom atual inline */}
                        <div className="mt-3 flex items-center gap-2">
                            <span className="text-[10px] uppercase font-bold text-white/40">Tom atual</span>
                            <div className="flex items-center gap-2 bg-[#12131C] rounded-xl border border-white/10 px-2 py-1">
                                <button
                                    id="detalhe-musica-diminuir-tom"
                                    onClick={diminuirTom}
                                    className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors active:scale-95"
                                    aria-label="Diminuir tom"
                                >
                                    <Minus size={12} />
                                </button>
                                <span className="font-mono text-base font-extrabold text-purple-300 w-7 text-center">
                                    {tomAtual}
                                </span>
                                <button
                                    id="detalhe-musica-aumentar-tom"
                                    onClick={aumentarTom}
                                    className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors active:scale-95"
                                    aria-label="Aumentar tom"
                                >
                                    <Plus size={12} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs de visualização */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5">
                    <button
                        id="detalhe-musica-tab-acima"
                        onClick={() => setFormatoVisualizacao('acima')}
                        className={`py-2 px-2 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all ${
                            formatoVisualizacao === 'acima'
                                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50'
                                : 'bg-white/5 text-white/60 hover:text-white border border-white/5'
                        }`}
                    >
                        <AlignLeft size={13} />
                        <span>Cifra (acorde acima)</span>
                    </button>

                    <button
                        id="detalhe-musica-tab-inline"
                        onClick={() => setFormatoVisualizacao('inline')}
                        className={`py-2 px-2 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all ${
                            formatoVisualizacao === 'inline'
                                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50'
                                : 'bg-white/5 text-white/60 hover:text-white border border-white/5'
                        }`}
                    >
                        <Type size={13} />
                        <span>Inline (na letra)</span>
                    </button>

                    <button
                        id="detalhe-musica-modo-palco"
                        onClick={() => navigate(`/tocar/${musica.id}`)}
                        className="py-2 px-2 rounded-xl text-[11px] font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/20 flex items-center justify-center gap-1.5 hover:brightness-110 transition-all"
                    >
                        <Radio size={13} />
                        <span>Modo Palco</span>
                    </button>
                </div>

                {/* Badges de metadados */}
                <div className="flex items-center justify-around text-center pt-3 border-t border-white/5">
                    <div>
                        <span className="block text-[9px] uppercase font-bold text-white/40">Capotraste</span>
                        <span className="text-xs font-semibold text-white/80">
                            {musica.capo ? `${musica.capo}ª casa` : 'Não utilizado'}
                        </span>
                    </div>
                    <div className="w-px h-6 bg-white/10" />
                    <div>
                        <span className="block text-[9px] uppercase font-bold text-white/40">Dificuldade</span>
                        <span className="text-xs font-semibold text-emerald-400 capitalize">
                            {musica.dificuldade || 'Fácil'}
                        </span>
                    </div>
                    <div className="w-px h-6 bg-white/10" />
                    <div>
                        <span className="block text-[9px] uppercase font-bold text-white/40">Tom original</span>
                        <span className="text-xs font-semibold text-purple-300 font-mono">
                            {musica.tom || 'C'}
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Área da cifra ───────────────────────────────────────── */}
            <div className="rounded-3xl bg-[#0E0E18]/90 border border-white/10 p-5 backdrop-blur-xl shadow-2xl overflow-x-auto">
                <ExibicaoCifra
                    letra={musica.letra}
                    acordesProibidos={[]}
                    modo="ambos"
                    tamanho={tamanhoFonte}
                    possuiCifra={musica.possuiCifra ?? true}
                    formato={formatoVisualizacao}
                />
            </div>

            {/* ── Toolbar inferior flutuante ───────────────────────────── */}
            <div
                id="detalhe-musica-toolbar"
                className="fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-lg bg-[#141522]/95 border border-white/15 backdrop-blur-2xl rounded-2xl p-2 shadow-2xl shadow-purple-950/80"
            >
                <div className="grid grid-cols-5 gap-1">
                    {/* Ouvir */}
                    <button
                        id="detalhe-musica-ouvir"
                        onClick={() => { if (estaTocandoEstaMusica) pausar(); else tocar(musica); }}
                        className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all ${
                            estaTocandoEstaMusica ? 'bg-purple-600 text-white' : 'hover:bg-white/10 text-white/80'
                        }`}
                    >
                        {estaTocandoEstaMusica
                            ? <Pause size={18} />
                            : <Play size={18} fill="currentColor" />}
                        <span className="text-[9px] font-bold">Ouvir</span>
                    </button>

                    {/* Rolagem Automática */}
                    <button
                        id="detalhe-musica-rolagem"
                        onClick={() => setAutoScroll(!autoScroll)}
                        className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all ${
                            autoScroll ? 'bg-purple-600 text-white' : 'hover:bg-white/10 text-white/80'
                        }`}
                    >
                        <Zap size={18} className={autoScroll ? 'animate-bounce' : ''} />
                        <span className="text-[9px] font-bold">Rolagem</span>
                    </button>

                    {/* Transpor */}
                    <button
                        id="detalhe-musica-transpor"
                        onClick={aumentarTom}
                        className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl hover:bg-white/10 text-white/80 transition-all"
                    >
                        <SlidersHorizontal size={18} />
                        <span className="text-[9px] font-bold">Transpor</span>
                    </button>

                    {/* Tamanho da fonte */}
                    <button
                        id="detalhe-musica-fonte"
                        onClick={() => setTamanhoFonte(t => t === 'pequeno' ? 'medio' : t === 'medio' ? 'grande' : 'pequeno')}
                        className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl hover:bg-white/10 text-white/80 transition-all"
                        title={`Fonte: ${tamanhoFonte}`}
                    >
                        <span className="text-sm font-black leading-none">A</span>
                        <span className="text-[9px] font-bold">Capotraste</span>
                    </button>

                    {/* BPM */}
                    <div className="flex flex-col items-center justify-center gap-0.5 p-2 rounded-xl text-purple-300 font-mono">
                        <span className="text-sm font-extrabold leading-none">{bpm}</span>
                        <span className="text-[9px] font-bold text-white/50">BPM</span>
                    </div>
                </div>
            </div>

            {/* Overlay para fechar menu */}
            {menuAberto && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setMenuAberto(false)}
                />
            )}
        </div>
    );
};

export default DetalheMusica;
