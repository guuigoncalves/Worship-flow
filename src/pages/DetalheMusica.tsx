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
    Volume2,
    Sliders,
    Zap,
    Maximize2,
    SlidersHorizontal,
    AlignLeft,
    Type
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

    const scrollIntervalRef = useRef<any>(null);

    useEffect(() => {
        if (id) {
            const encontrada = obterMusica(id) || musicas.find((m) => m.id === id);
            if (encontrada) {
                setMusica(encontrada);
                if (encontrada.tom) {
                    setTomAtual(encontrada.tom as Tom);
                }
            }
        }
    }, [id, musicas, obterMusica]);

    // Lógica do AutoScroll
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

    const aumentarTom = () => {
        setTomAtual((prev) => deslocarTom(prev, 1));
    };

    const diminuirTom = () => {
        setTomAtual((prev) => deslocarTom(prev, -1));
    };

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
                    className="btn-ghost text-xs flex items-center gap-2"
                >
                    <ArrowLeft size={16} />
                    <span>Voltar para Biblioteca</span>
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
        <div className="app-page space-y-6 pb-36 fade-in relative">
            {/* Header de Navegação Superior */}
            <div className="flex items-center justify-between pt-1">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                >
                    <ArrowLeft size={18} />
                </button>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => alternarFavorita(musica.id)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-amber-400 transition-colors"
                        title={musica.eFavorita ? 'Remover dos favoritos' : 'Favoritar'}
                    >
                        <Star size={18} fill={musica.eFavorita ? 'currentColor' : 'none'} />
                    </button>
                    <button
                        onClick={() => navigate(`/editor/${musica.id}`)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                        title="Editar"
                    >
                        <Edit size={18} />
                    </button>
                    <button
                        onClick={handleExcluir}
                        className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-red-400 transition-colors"
                        title="Excluir"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            {/* Banner Principal da Música (Header do Mockup 8) */}
            <div className="card p-5 bg-gradient-to-br from-[#141522] via-[#141522] to-purple-950/40 border border-white/10 rounded-3xl space-y-5 shadow-2xl">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
                    {/* Capa e Dados */}
                    <div className="flex items-center gap-4 min-w-0">
                        <CapaMusica tom={tomAtual} titulo={musica.titulo} tamanho="lg" className="w-20 h-20 text-2xl shadow-xl shadow-purple-950/50" />
                        <div className="min-w-0">
                            <h1 className="text-xl sm:text-2xl font-bold text-white truncate tracking-tight">{musica.titulo}</h1>
                            <p className="text-xs text-white/60 truncate mt-0.5">{musica.artista || 'Artista não informado'}</p>
                        </div>
                    </div>

                    {/* Controles do Tom Atual */}
                    <div className="flex flex-col items-center bg-[#12131C] p-3 rounded-2xl border border-white/10 w-full sm:w-auto">
                        <span className="text-[10px] uppercase font-bold text-white/40 mb-1">Tom atual</span>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={diminuirTom}
                                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center font-bold transition-colors border border-white/10 active:scale-95"
                            >
                                <Minus size={14} />
                            </button>
                            <span className="font-mono text-xl font-extrabold text-purple-300 w-8 text-center">{tomAtual}</span>
                            <button
                                onClick={aumentarTom}
                                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center font-bold transition-colors border border-white/10 active:scale-95"
                            >
                                <Plus size={14} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Seletores de Modo de Visualização */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5">
                    <button
                        onClick={() => setFormatoVisualizacao('acima')}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                            formatoVisualizacao === 'acima'
                                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50 shadow-md'
                                : 'bg-white/5 text-white/60 hover:text-white border border-white/5'
                        }`}
                    >
                        <AlignLeft size={14} />
                        <span>Cifra (acorde acima)</span>
                    </button>

                    <button
                        onClick={() => setFormatoVisualizacao('inline')}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                            formatoVisualizacao === 'inline'
                                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50 shadow-md'
                                : 'bg-white/5 text-white/60 hover:text-white border border-white/5'
                        }`}
                    >
                        <Type size={14} />
                        <span>Inline (na letra)</span>
                    </button>

                    <button
                        onClick={() => navigate(`/tocar/${musica.id}`)}
                        className="py-2 px-3 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/20 flex items-center justify-center gap-1.5 hover:brightness-110 transition-all"
                    >
                        <Radio size={14} />
                        <span>Modo Palco</span>
                    </button>
                </div>

                {/* Badges Informativas */}
                <div className="flex items-center justify-around text-center pt-2 text-[11px] text-white/60 border-t border-white/5">
                    <div>
                        <span className="block text-[9px] uppercase font-bold text-white/40">Capotraste</span>
                        <span className="font-semibold text-white/90">{musica.capo ? `${musica.capo}ª casa` : 'Não utilizado'}</span>
                    </div>
                    <div className="w-[1px] h-6 bg-white/10" />
                    <div>
                        <span className="block text-[9px] uppercase font-bold text-white/40">Dificuldade</span>
                        <span className="font-semibold text-emerald-400 capitalize">{musica.dificuldade || 'Fácil'}</span>
                    </div>
                    <div className="w-[1px] h-6 bg-white/10" />
                    <div>
                        <span className="block text-[9px] uppercase font-bold text-white/40">Tom original</span>
                        <span className="font-semibold text-purple-300 font-mono">{musica.tom || 'C'}</span>
                    </div>
                </div>
            </div>

            {/* Container da Cifra */}
            <div className="card p-6 bg-[#0E0E18]/90 border border-white/10 rounded-3xl backdrop-blur-xl shadow-2xl overflow-x-auto">
                <ExibicaoCifra
                    letra={musica.letra}
                    acordesProibidos={[]}
                    modo="ambos"
                    tamanho={tamanhoFonte}
                    possuiCifra={musica.possuiCifra ?? true}
                    formato={formatoVisualizacao}
                />
            </div>

            {/* Toolbar Inferior de Ações Rápidas (Padrão Mockup 8) */}
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-lg bg-[#141522]/95 border border-white/15 backdrop-blur-2xl rounded-2xl p-2.5 shadow-2xl shadow-purple-950/80">
                <div className="grid grid-cols-5 gap-1 text-center">
                    {/* Botão Ouvir */}
                    <button
                        onClick={() => {
                            if (estaTocandoEstaMusica) pausar();
                            else tocar(musica);
                        }}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
                            estaTocandoEstaMusica ? 'bg-purple-600 text-white' : 'hover:bg-white/10 text-white/80'
                        }`}
                    >
                        {estaTocandoEstaMusica ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
                        <span className="text-[9px] font-bold mt-1">Ouvir</span>
                    </button>

                    {/* Botão Rolagem Automática */}
                    <button
                        onClick={() => setAutoScroll(!autoScroll)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
                            autoScroll ? 'bg-purple-600 text-white' : 'hover:bg-white/10 text-white/80'
                        }`}
                    >
                        <Zap size={18} className={autoScroll ? 'animate-bounce' : ''} />
                        <span className="text-[9px] font-bold mt-1">Rolagem</span>
                    </button>

                    {/* Botão Transpor */}
                    <button
                        onClick={aumentarTom}
                        className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-white/10 text-white/80 transition-all"
                    >
                        <SlidersHorizontal size={18} />
                        <span className="text-[9px] font-bold mt-1">Transpor</span>
                    </button>

                    {/* Alternar Fonte */}
                    <button
                        onClick={() => {
                            setTamanhoFonte(t => t === 'pequeno' ? 'medio' : t === 'medio' ? 'grande' : 'pequeno');
                        }}
                        className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-white/10 text-white/80 transition-all"
                    >
                        <Sliders size={18} />
                        <span className="text-[9px] font-bold mt-1">Fonte</span>
                    </button>

                    {/* Metrônomo BPM */}
                    <div className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-white/10 text-purple-300 transition-all font-mono">
                        <span className="text-xs font-extrabold">{bpm}</span>
                        <span className="text-[9px] font-bold text-white/50 mt-0.5">BPM</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetalheMusica;

