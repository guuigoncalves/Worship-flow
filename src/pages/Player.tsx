import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../hooks/usePlayer';
import { CapaMusica } from '../components/aurora';
import { EstadoVazio } from '../components/compartilhado/EstadoVazio';
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Volume2,
    VolumeX,
    Music,
    ArrowLeft,
    List
} from 'lucide-react';

export const Player: React.FC = () => {
    const navigate = useNavigate();
    const {
        faixa,
        fila,
        tocando,
        progresso,
        duracao,
        volume,
        modo,
        tocar,
        pausar,
        seek,
        setVolume,
        setModo
    } = usePlayer();

    const formatarTempo = (segundos: number) => {
        const min = Math.floor(segundos / 60);
        const seg = Math.floor(segundos % 60);
        return `${min}:${seg < 10 ? '0' : ''}${seg}`;
    };

    if (!faixa) {
        return (
            <div className="app-page space-y-6 pb-24 fade-in">
            <button
            onClick={() => navigate(-1)}
            className="btn-ghost text-xs flex items-center gap-2"
            >
            <ArrowLeft size={16} />
            <span>Voltar</span>
            </button>
            <EstadoVazio
            titulo="Nenhuma faixa selecionada"
            texto="Selecione uma música da biblioteca para iniciar a reprodução."
            />
            </div>
        );
    }

    const faixaTom = (faixa as any)?.tom;

    return (
        <div className="app-page space-y-6 pb-24 fade-in max-w-lg mx-auto">
        <button
        onClick={() => navigate(-1)}
        className="btn-ghost text-xs flex items-center gap-2"
        >
        <ArrowLeft size={16} />
        <span>Voltar</span>
        </button>

        <div className="flex flex-col items-center justify-center pt-4">
        <div className="relative group">
        <CapaMusica
        tom={faixaTom}
        titulo={faixa.titulo}
        tamanho="lg"
        className="w-48 h-48 text-4xl shadow-2xl rounded-3xl border border-white/20"
        />
        {tocando && (
            <div className="absolute inset-0 bg-purple-500/20 rounded-3xl blur-xl -z-10 animate-pulse" />
        )}
        </div>

        <div className="text-center mt-6 space-y-1 w-full px-4">
        <h1 className="text-xl font-bold text-white truncate">
        {faixa.titulo}
        </h1>
        <p className="text-xs text-white/60 truncate">
        {faixa.artista || 'Artista não informado'}
        </p>
        {faixaTom && (
            <span className="inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Tom: {faixaTom}
            </span>
        )}
        </div>
        </div>

        <div className="space-y-1.5 px-2">
        <input
        type="range"
        min={0}
        max={duracao || 100}
        value={progresso}
        onChange={(e) => seek(Number(e.target.value))}
        className="w-full accent-purple-500 bg-white/10 rounded-lg h-1.5 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-white/40 font-mono">
        <span>{formatarTempo(progresso)}</span>
        <span>{formatarTempo(duracao)}</span>
        </div>
        </div>

        <div className="card p-4 flex items-center justify-around bg-white/5 border border-white/10">
        <button
        onClick={() => setModo(modo === 'pad' ? 'normal' : 'pad')}
        className={`p-2 rounded-lg transition-colors text-xs font-semibold ${
            modo === 'pad'
            ? 'bg-purple-500 text-white'
            : 'text-white/40 hover:text-white'
        }`}
        title="Modo Pad contínuo"
        >
        PAD
        </button>

        <button
        onClick={() => {}}
        className="p-3 text-white/70 hover:text-white transition-colors"
        title="Anterior"
        >
        <SkipBack size={22} />
        </button>

        <button
        onClick={() => (tocando ? pausar() : tocar(faixa))}
        className="p-4 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-lg hover:scale-105 active:scale-95 transition-all"
        >
        {tocando ? <Pause size={24} /> : <Play size={24} className="ml-0.5" />}
        </button>

        <button
        onClick={() => {}}
        className="p-3 text-white/70 hover:text-white transition-colors"
        title="Próxima"
        >
        <SkipForward size={22} />
        </button>

        <div className="flex items-center gap-1">
        <button
        onClick={() => setVolume(volume === 0 ? 0.8 : 0)}
        className="p-2 text-white/60 hover:text-white"
        >
        {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        </div>
        </div>

        {fila.length > 0 && (
            <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-white/70 px-1">
            <List size={14} className="text-purple-400" />
            <span>Fila ({fila.length})</span>
            </div>
            <div className="card divide-y divide-white/5 max-h-48 overflow-y-auto">
            {fila.map((item, idx) => (
                <div
                key={item.id + idx}
                onClick={() => tocar(item)}
                className="p-2.5 flex items-center justify-between text-xs hover:bg-white/5 cursor-pointer"
                >
                <div className="flex items-center gap-2 min-w-0">
                <Music size={12} className="text-purple-400 shrink-0" />
                <span className="text-white/90 truncate">{item.titulo}</span>
                </div>
                <span className="text-white/40 text-[10px] shrink-0">
                {(item as any).tom || ''}
                </span>
                </div>
            ))}
            </div>
            </div>
        )}
        </div>
    );
};

export default Player;
