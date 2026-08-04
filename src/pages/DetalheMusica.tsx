import React, { useEffect, useState } from 'react';
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
    Edit,
    Trash2,
    Star,
    Music
} from 'lucide-react';
import { Tom } from '../types';

export const DetalheMusica: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { musicas, loading, obterMusica, excluirMusica, alternarFavorita } = useMusicas();
    const { tocar } = usePlayer();
    const { deslocarTom } = useTransposicao();
    const [musica, setMusica] = useState<any>(null);
    const [tomAtual, setTomAtual] = useState<Tom>('C');

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

    const aumentarTom = () => {
        setTomAtual((prev) => deslocarTom(prev, 1));
    };

    const diminuirTom = () => {
        setTomAtual((prev) => deslocarTom(prev, -1));
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
            <div className="app-page space-y-6 pb-24 fade-in">
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

    const handleExcluir = async () => {
        if (window.confirm('Tem certeza que deseja excluir esta música?')) {
            await excluirMusica(musica.id);
            navigate('/biblioteca');
        }
    };

    return (
        <div className="app-page space-y-6 pb-24 fade-in">
        <button
        onClick={() => navigate(-1)}
        className="btn-ghost text-xs flex items-center gap-2"
        >
        <ArrowLeft size={16} />
        <span>Voltar</span>
        </button>

        <div className="card p-5 bg-gradient-to-r from-purple-900/40 to-indigo-900/30 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
        <CapaMusica tom={tomAtual} titulo={musica.titulo} tamanho="lg" className="w-16 h-16 text-xl" />
        <div className="min-w-0">
        <h1 className="text-xl font-bold text-white truncate">{musica.titulo}</h1>
        <p className="text-xs text-white/60 truncate">{musica.artista || 'Artista não informado'}</p>
        <div className="flex items-center gap-2 mt-2">
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/30 text-purple-300 border border-purple-500/40">
        Tom: {tomAtual}
        </span>
        {musica.dificuldade && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/10 text-white/70">
            {musica.dificuldade}
            </span>
        )}
        {musica.possuiCifra === false && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
            Só Letra
            </span>
        )}
        </div>
        </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
        <button
        onClick={() => tocar(musica)}
        className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5"
        >
        <Play size={14} />
        <span>Tocar</span>
        </button>
        <button
        onClick={() => navigate(`/tocar/${musica.id}`)}
        className="btn-ghost text-xs py-2 px-3 border border-white/10 flex items-center gap-1.5"
        >
        <Music size={14} />
        <span>Modo Palco</span>
        </button>
        <button
        onClick={() => navigate(`/editor/${musica.id}`)}
        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 transition-colors"
        title="Editar"
        >
        <Edit size={16} />
        </button>
        <button
        onClick={() => alternarFavorita(musica.id)}
        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-amber-400 transition-colors"
        title="Favoritar"
        >
        <Star size={16} fill={musica.eFavorita ? 'currentColor' : 'none'} />
        </button>
        <button
        onClick={handleExcluir}
        className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-red-400 transition-colors"
        title="Excluir"
        >
        <Trash2 size={16} />
        </button>
        </div>
        </div>

        <div className="card p-3 flex items-center justify-between text-xs bg-white/5 border border-white/10">
        <span className="font-semibold text-white/70">Transposição de Tom:</span>
        <div className="flex items-center gap-2">
        <button
        onClick={diminuirTom}
        className="btn-ghost py-1 px-3 border border-white/10 font-bold"
        >
        -1
        </button>
        <span className="font-bold text-purple-300 w-8 text-center">{tomAtual}</span>
        <button
        onClick={aumentarTom}
        className="btn-ghost py-1 px-3 border border-white/10 font-bold"
        >
        +1
        </button>
        </div>
        </div>

        <div className="card p-5 bg-black/30 border border-white/10">
        <ExibicaoCifra letra={musica.letra} acordesProibidos={[]} modo="ambos" tamanho="medio" possuiCifra={musica.possuiCifra ?? true} formato="acima" />
        </div>
        </div>
    );
};

export default DetalheMusica;
