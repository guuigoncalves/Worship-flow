import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Globe, Loader2, Music, Search } from 'lucide-react';
import { CapaMusica, SectionHeader } from '../components/aurora';
import { EstadoVazio } from '../components/compartilhado/EstadoVazio';
import { useComunidade } from '../hooks/useComunidade';
import { useMusicas } from '../hooks/useMusicas';
import { useToast } from '../hooks/useToast';

export const Comunidade: React.FC = () => {
    const navigate = useNavigate();
    const { musicas, loading: loadingComunidade } = useComunidade();
    const { salvarMusica } = useMusicas();
    const { showToast } = useToast();
    const [consulta, setConsulta] = useState('');
    const [salvandoIds, setSalvandoIds] = useState<Set<string>>(new Set());

    const resultados = useMemo(() => {
        const q = consulta.trim().toLowerCase();
        if (!q) return musicas;
        return musicas.filter((musica) => musica.titulo.toLowerCase().includes(q) || musica.artista.toLowerCase().includes(q) || musica.tags.some((tag) => tag.includes(q as never)));
    }, [musicas, consulta]);

    async function adicionarBiblioteca(musicaId: string) {
        const musica = musicas.find((m) => m.id === musicaId);
        if (!musica) return;
        setSalvandoIds((prev) => prev.add(musicaId));
        try {
            await salvarMusica({
                titulo: musica.titulo,
                artista: musica.artista,
                tom: musica.tom,
                letra: musica.letra,
                tags: musica.tags,
                dificuldade: musica.dificuldade,
            });
            showToast('Adicionada à sua biblioteca!', 'sucesso');
        } catch {
            showToast('Não foi possível adicionar. Tente novamente.', 'erro');
        } finally {
            setSalvandoIds((prev) => {
                const copy = new Set(prev);
                copy.delete(musicaId);
                return copy;
            });
        }
    }

    function baixarCifra(musica: { titulo: string; letra: string }) {
        const link = document.createElement('a');
        link.href = `data:text/plain;charset=utf-8,${encodeURIComponent(musica.letra)}`;
        link.download = `${musica.titulo}.txt`;
        link.click();
    }

    const loading = loadingComunidade;

    return (
        <div className="app-page space-y-6 pb-24 fade-in max-w-2xl mx-auto">
            <div className="flex items-center gap-3">
                <button
                    onClick={() => navigate(-1)}
                    className="btn-ghost text-xs flex items-center gap-2"
                >
                    <ArrowLeft size={16} />
                    <span>Voltar</span>
                </button>
                <h1 className="text-2xl font-bold text-gradient flex items-center gap-2">
                    <Globe className="h-6 w-6 text-primaria" />
                    Comunidade
                </h1>
            </div>

            <p className="text-xs text-textoSecundario">
                Cifras aprovadas pela comunidade — adicione à sua biblioteca e leve ao vivo.
            </p>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-textoSecundario" aria-hidden="true" />
                <input
                    className="input pl-10"
                    value={consulta}
                    onChange={(e) => setConsulta(e.target.value)}
                    placeholder="Buscar por título, artista ou tag…"
                />
            </div>

            {loading ? (
                <div className="card p-6 text-center text-textoSecundario">
                    <Loader2 size={32} className="mx-auto animate-spin text-primaria mb-2" />
                    <p>Carregando cifras da comunidade…</p>
                </div>
            ) : resultados.length === 0 ? (
                <EstadoVazio
                    titulo="Nenhuma cifra na comunidade"
                    texto="Compartilhe suas cifras aprovadas na comunidade. Quando houver músicas aprovadas, aparecerão aqui."
                />
            ) : (
                <div className="space-y-3">
                    <SectionHeader icone={<Music size={16} />} titulo={`${resultados.length} cifra(s) disponível(e)s`} />
                    {resultados.map((musica) => (
                        <article key={musica.id} className="card flex items-center gap-3 p-4">
                            <CapaMusica tom={musica.tom} titulo={musica.titulo} tamanho="sm" />
                            <div className="min-w-0 flex-1">
                                <h2 className="truncate font-semibold">{musica.titulo}</h2>
                                <p className="truncate text-sm text-textoSecundario">{musica.artista} · {musica.tom}</p>
                                {musica.tags.length > 0 && (
                                    <div className="mt-1 flex flex-wrap gap-1">
                                        {musica.tags.slice(0, 3).map((tag) => (
                                            <span key={tag} className="chip text-xs">{tag}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    className="btn-text h-9 w-9 p-0"
                                    onClick={() => baixarCifra(musica)}
                                    aria-label="Baixar cifra"
                                    title="Baixar cifra"
                                >
                                    <Download className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    className="btn-ghost h-9 px-2 text-xs"
                                    disabled={salvandoIds.has(musica.id)}
                                    onClick={() => void adicionarBiblioteca(musica.id)}
                                >
                                    {salvandoIds.has(musica.id) ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <span>Adicionar</span>
                                    )}
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Comunidade;
