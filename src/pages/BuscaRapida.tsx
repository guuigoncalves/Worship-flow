import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMusicas } from '../hooks/useMusicas';
import { SectionHeader, CapaMusica, LinhaLista } from '../components/aurora';
import { EstadoVazio } from '../components/compartilhado/EstadoVazio';
import { Search, ArrowLeft, Zap } from 'lucide-react';

export const BuscaRapida: React.FC = () => {
    const navigate = useNavigate();
    const { musicas, loading } = useMusicas();
    const [termo, setTermo] = useState('');

    const resultados = useMemo(() => {
        if (!termo.trim()) return [];
        const t = termo.toLowerCase();
        return musicas.filter(
            (m) =>
            m.titulo.toLowerCase().includes(t) ||
            (m.artista && m.artista.toLowerCase().includes(t)) ||
            (m.tags && m.tags.some((tag) => tag.toLowerCase().includes(t)))
        );
    }, [musicas, termo]);

    if (loading) {
        return (
            <div className="app-page flex items-center justify-center min-h-[60vh]">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="app-page space-y-6 pb-24 fade-in">
        <button
        onClick={() => navigate(-1)}
        className="btn-ghost text-xs flex items-center gap-2"
        >
        <ArrowLeft size={16} />
        <span>Voltar</span>
        </button>

        <div>
        <h1 className="text-2xl font-bold text-gradient">Busca Rápida</h1>
        <p className="text-xs text-white/60">
        Encontre rapidamente qualquer música, tom ou tag no seu repertório
        </p>
        </div>

        <div className="relative">
        <Search size={18} className="absolute left-3.5 top-3.5 text-purple-400" />
        <input
        type="text"
        value={termo}
        onChange={(e) => setTermo(e.target.value)}
        placeholder="Digite título, artista ou palavra-chave..."
        autoFocus
        className="input pl-10 text-sm w-full py-3 bg-white/5 border-purple-500/30 focus:border-purple-500"
        />
        </div>

        <div>
        <SectionHeader icone={<Zap size={16} />} titulo="Resultados" />

        {!termo.trim() ? (
            <EstadoVazio
            titulo="Digite para buscar"
            texto="Comece a digitar no campo acima para pesquisar instantaneamente."
            />
        ) : resultados.length === 0 ? (
            <EstadoVazio
            titulo="Nenhum resultado encontrado"
            texto={`Não encontramos nada para "${termo}". Tente outras palavras.`}
            />
        ) : (
            <div className="card divide-y divide-white/5">
            {resultados.map((m) => (
                <LinhaLista
                key={m.id}
                prefixo={<CapaMusica tom={m.tom} titulo={m.titulo} tamanho="sm" />}
                titulo={m.titulo}
                subtitulo={m.artista || 'Artista não informado'}
                sufixo={
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {m.tom || 'N/A'}
                    </span>
                }
                onClick={() => navigate(`/musica/${m.id}`)}
                />
            ))}
            </div>
        )}
        </div>
        </div>
    );
};

export default BuscaRapida;
