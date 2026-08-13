import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Image, Upload, FileSpreadsheet, X, CheckCircle, Loader2 } from 'lucide-react';
import { useMusicas } from '../hooks/useMusicas';
import { SectionHeader } from '../components/aurora';
import { parsearCifra, type MusicaRascunho } from '../utils/importarParser';
import { extrairTextoPDF } from '../utils/importacao/pdfImporter';
import { extrairTextoOCR } from '../utils/importacao/ocrImporter';
import { lerPlanilha } from '../utils/importacao/planilhaImporter';
import { CONFIANCA_MINIMA_REVISAO } from '../utils/importacao/tipos';
import type { ResultadoLeitura } from '../utils/importacao/tipos';
import type { Tom } from '../types';

type Aba = 'texto' | 'pdf' | 'imagem' | 'planilha';

export const Importar: React.FC = () => {
    const navigate = useNavigate();
    const { salvarMusica } = useMusicas();
    const [aba, setAba] = useState<Aba>('texto');

    const [textoCifra, setTextoCifra] = useState('');
    const [titulo, setTitulo] = useState('');
    const [artista, setArtista] = useState('');
    const [tom, setTom] = useState('C');
    const [sucesso, setSucesso] = useState(false);

    const [arquivo, setArquivo] = useState<File | null>(null);
    const [processando, setProcessando] = useState(false);
    const [progressoOCR, setProgressoOCR] = useState(0);
    const [resultadoLeitura, setResultadoLeitura] = useState<ResultadoLeitura | null>(null);
    const [revisando, setRevisando] = useState(false);
    const [rascunhoRevisao, setRascunhoRevisao] = useState<MusicaRascunho | null>(null);

    const [resultadosPlanilha, setResultadosPlanilha] = useState<MusicaRascunho[]>([]);
    const [salvandoPlanilha, setSalvandoPlanilha] = useState(false);

    const tabs: { id: Aba; label: string; icone: React.ReactNode }[] = [
        { id: 'texto', label: 'Texto', icone: <FileText className="h-4 w-4" /> },
        { id: 'pdf', label: 'PDF', icone: <FileSpreadsheet className="h-4 w-4" /> },
        { id: 'imagem', label: 'Imagem', icone: <Image className="h-4 w-4" /> },
        { id: 'planilha', label: 'Planilha', icone: <FileSpreadsheet className="h-4 w-4" /> },
    ];

    const handleImportarTexto = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!titulo.trim() || !textoCifra.trim()) return;

        await salvarMusica({
            titulo,
            artista,
            tom: tom as Tom,
            letra: textoCifra,
            tags: [],
            dificuldade: 'intermediario',
        });

        setSucesso(true);
        setTimeout(() => {
            navigate('/biblioteca');
        }, 1200);
    };

    async function processarPDF(file: File) {
        setProcessando(true);
        try {
            const resultado = await extrairTextoPDF(file);
            setResultadoLeitura(resultado);
            preencherDoParse(resultado.texto);
        } catch (err) {
            setResultadoLeitura({ texto: '', confianca: 0 });
        } finally {
            setProcessando(false);
        }
    }

    async function processarImagem(file: File) {
        setProcessando(true);
        setProgressoOCR(0);
        try {
            const resultado = await extrairTextoOCR(file, (pct) => setProgressoOCR(pct));
            setResultadoLeitura(resultado);
            if (resultado.confianca < CONFIANCA_MINIMA_REVISAO) {
                const rascunho = parsearCifra(resultado.texto);
                setRascunhoRevisao(rascunho);
                setRevisando(true);
            } else {
                preencherDoParse(resultado.texto);
            }
        } catch {
            setResultadoLeitura({ texto: '', confianca: 0 });
        } finally {
            setProcessando(false);
            setProgressoOCR(0);
        }
    }

    async function processarPlanilha(file: File) {
        setProcessando(true);
        try {
            const musicas = await lerPlanilha(file);
            setResultadosPlanilha(musicas);
        } catch {
            setResultadosPlanilha([]);
        } finally {
            setProcessando(false);
        }
    }

    function preencherDoParse(texto: string) {
        const rascunho = parsearCifra(texto);
        setTitulo(rascunho.titulo);
        setArtista(rascunho.artista);
        setTom(rascunho.tom);
        setTextoCifra(rascunho.letra || texto);
    }

    function handleSalvarRascunho(rascunho: MusicaRascunho) {
        setTitulo(rascunho.titulo);
        setArtista(rascunho.artista);
        setTom(rascunho.tom);
        setTextoCifra(rascunho.letra);
        setRevisando(false);
    }

    async function salvarPlanejada(rascunho: MusicaRascunho) {
        await salvarMusica({
            titulo: rascunho.titulo,
            artista: rascunho.artista,
            tom: rascunho.tom,
            letra: rascunho.letra,
            tags: rascunho.tags,
            dificuldade: rascunho.dificuldade,
        });
    }

    async function salvarTodasPlanilha() {
        if (resultadosPlanilha.length === 0) return;
        setSalvandoPlanilha(true);
        try {
            for (const rascunho of resultadosPlanilha) {
                await salvarPlanejada(rascunho);
            }
            setSucesso(true);
            setTimeout(() => navigate('/biblioteca'), 1200);
        } finally {
            setSalvandoPlanilha(false);
        }
    }

    function renderTabSelector() {
        return (
            <div className="grid grid-cols-4 gap-1.5 rounded-2xl bg-[#141522]/80 p-1.5 border border-white/10">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-xs font-bold transition-all border ${
                            aba === tab.id
                                ? 'bg-purple-600/30 text-white border-purple-500/50 shadow-lg shadow-purple-950/50'
                                : 'bg-transparent text-white/40 border-transparent hover:text-white'
                        }`}
                        onClick={() => {
                            setAba(tab.id);
                            setTitulo('');
                            setArtista('');
                            setTom('C');
                            setTextoCifra('');
                            setArquivo(null);
                            setResultadoLeitura(null);
                            setResultadosPlanilha([]);
                            setRevisando(false);
                            setRascunhoRevisao(null);
                            setSucesso(false);
                            setProgressoOCR(0);
                        }}
                    >
                        {tab.icone}
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>
        );
    }

    function renderMetadataForm() {
        return (
            <div className="grid gap-3 sm:grid-cols-3">
                <div>
                    <label className="text-xs font-medium text-white/60 block mb-1">Título</label>
                    <input
                        className="w-full bg-[#141522]/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-purple-500 transition-all"
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        placeholder="Nome da música"
                    />
                </div>
                <div>
                    <label className="text-xs font-medium text-white/60 block mb-1">Artista</label>
                    <input
                        className="w-full bg-[#141522]/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-purple-500 transition-all"
                        value={artista}
                        onChange={(e) => setArtista(e.target.value)}
                        placeholder="Artista / Banda"
                    />
                </div>
                <div>
                    <label className="text-xs font-medium text-white/60 block mb-1">Tom</label>
                    <input
                        className="w-full bg-[#141522]/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-white/30 focus:outline-none focus:border-purple-500 transition-all"
                        value={tom}
                        onChange={(e) => setTom(e.target.value)}
                        placeholder="Tom (ex: C, G...)"
                    />
                </div>
            </div>
        );
    }

    function renderTextoContent() {
        return (
            <div className="space-y-2">
                <label className="text-xs font-medium text-white/60 block">Conteúdo da Cifra</label>
                <textarea
                    required
                    rows={12}
                    value={textoCifra}
                    onChange={(e) => setTextoCifra(e.target.value)}
                    placeholder="Cole aqui a letra com os acordes..."
                    className="w-full bg-[#141522]/80 border border-white/10 rounded-2xl p-4 font-mono text-xs text-white leading-relaxed placeholder-white/30 focus:outline-none focus:border-purple-500 transition-all"
                />
            </div>
        );
    }

    function renderPdfContent() {
        return (
            <div className="space-y-4">
                <label className="flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/15 bg-[#141522]/50 p-6 text-center transition-all hover:border-purple-500/50 hover:bg-[#141522]/80">
                    <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                setArquivo(file);
                                void processarPDF(file);
                            }
                        }}
                    />
                    <div className="flex flex-col items-center gap-2 text-white/60">
                        <div className="p-3 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
                            <Upload className="h-6 w-6" />
                        </div>
                        <span className="text-xs font-semibold text-white">Clique para selecionar um PDF</span>
                        <span className="text-[10px] text-white/40">Suporta arquivos PDF de cifras e partituras</span>
                        {arquivo ? <span className="text-xs text-purple-400 font-medium mt-1">{arquivo.name}</span> : null}
                    </div>
                </label>

                {processando ? (
                    <div className="flex items-center justify-center gap-3 p-6 rounded-2xl bg-[#141522]/80 border border-white/10 text-white/60">
                        <Loader2 className="h-5 w-5 animate-spin text-purple-400" />
                        <span className="text-xs">Extraindo texto do PDF…</span>
                    </div>
                ) : resultadoLeitura?.texto ? (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-white/60 block">Texto Extraído</label>
                            <textarea
                                rows={12}
                                value={textoCifra}
                                onChange={(e) => setTextoCifra(e.target.value)}
                                placeholder="Texto extraído do PDF…"
                                className="w-full bg-[#141522]/80 border border-white/10 rounded-2xl p-4 font-mono text-xs text-white leading-relaxed placeholder-white/30 focus:outline-none focus:border-purple-500 transition-all"
                            />
                        </div>
                    </div>
                ) : null}
            </div>
        );
    }

    function renderImagemContent() {
        return (
            <div className="space-y-4">
                <label className="flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/15 bg-[#141522]/50 p-6 text-center transition-all hover:border-purple-500/50 hover:bg-[#141522]/80">
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                setArquivo(file);
                                void processarImagem(file);
                            }
                        }}
                    />
                    <div className="flex flex-col items-center gap-2 text-white/60">
                        <div className="p-3 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
                            <Image className="h-6 w-6" />
                        </div>
                        <span className="text-xs font-semibold text-white">Clique para selecionar uma Imagem</span>
                        <span className="text-[10px] text-white/40">Suporta PNG, JPG e fotos de papéis com cifras</span>
                        {arquivo ? <span className="text-xs text-purple-400 font-medium mt-1">{arquivo.name}</span> : null}
                    </div>
                </label>

                {processando ? (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#141522]/80 border border-white/10 text-white/60">
                        <Loader2 className="h-5 w-5 animate-spin text-purple-400" />
                        <span className="flex-1 text-xs">Reconhecendo texto com OCR…</span>
                        <span className="text-xs font-bold text-purple-400">{Math.round(progressoOCR * 100)}%</span>
                    </div>
                ) : null}

                {revisando && rascunhoRevisao ? (
                    <FormRevisaoCifra rascunho={rascunhoRevisao} onCancelar={() => setRevisando(false)} onConfirmar={handleSalvarRascunho} />
                ) : resultadoLeitura?.texto && !revisando ? (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-white/60 block">Texto Reconhecido (OCR)</label>
                            <textarea
                                rows={12}
                                value={textoCifra}
                                onChange={(e) => setTextoCifra(e.target.value)}
                                placeholder="Texto extraído da imagem…"
                                className="w-full bg-[#141522]/80 border border-white/10 rounded-2xl p-4 font-mono text-xs text-white leading-relaxed placeholder-white/30 focus:outline-none focus:border-purple-500 transition-all"
                            />
                        </div>
                    </div>
                ) : null}
            </div>
        );
    }

    function renderPlanilhaContent() {
        return (
            <div className="space-y-4">
                <label className="flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/15 bg-[#141522]/50 p-6 text-center transition-all hover:border-purple-500/50 hover:bg-[#141522]/80">
                    <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                setArquivo(file);
                                void processarPlanilha(file);
                            }
                        }}
                    />
                    <div className="flex flex-col items-center gap-2 text-white/60">
                        <div className="p-3 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
                            <FileSpreadsheet className="h-6 w-6" />
                        </div>
                        <span className="text-xs font-semibold text-white">Clique para selecionar uma Planilha</span>
                        <span className="text-[10px] text-white/40">Suporta arquivos Excel (.xlsx) ou CSV em lote</span>
                        {arquivo ? <span className="text-xs text-purple-400 font-medium mt-1">{arquivo.name}</span> : null}
                    </div>
                </label>

                {processando ? (
                    <div className="flex items-center justify-center gap-3 p-6 rounded-2xl bg-[#141522]/80 border border-white/10 text-white/60">
                        <Loader2 className="h-5 w-5 animate-spin text-purple-400" />
                        <span className="text-xs">Processando planilha…</span>
                    </div>
                ) : resultadosPlanilha.length > 0 ? (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Músicas na planilha</h3>
                            <span className="text-xs font-semibold text-purple-400">{resultadosPlanilha.length} encontradas</span>
                        </div>
                        <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                            {resultadosPlanilha.map((musica, index) => (
                                <div key={`${musica.titulo}-${index}`} className="p-3 flex items-center justify-between gap-3 border border-white/10 bg-[#141522]/80 rounded-2xl">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-semibold text-white truncate">{musica.titulo}</p>
                                        <p className="text-[10px] text-white/40 truncate">{musica.artista}</p>
                                    </div>
                                    <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 text-xs font-semibold border border-purple-500/20">
                                        {musica.tom}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <button
                            className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all"
                            type="button"
                            disabled={salvandoPlanilha}
                            onClick={() => void salvarTodasPlanilha()}
                        >
                            {salvandoPlanilha ? 'Salvando...' : 'Salvar todas as músicas'}
                        </button>
                    </div>
                ) : arquivo && !processando ? (
                    <p className="text-xs text-white/40 text-center">Nenhuma música encontrada na planilha.</p>
                ) : null}
            </div>
        );
    }

    function renderTabContent() {
        if (sucesso) {
            return (
                <div className="p-8 text-center space-y-3 rounded-3xl bg-[#141522]/90 border border-white/10 shadow-2xl">
                    <CheckCircle size={48} className="mx-auto text-emerald-400" />
                    <h2 className="text-lg font-bold text-white">Importação concluída!</h2>
                    <p className="text-xs text-white/40">Redirecionando para a biblioteca…</p>
                </div>
            );
        }

        switch (aba) {
            case 'texto':
                return renderTextoContent();
            case 'pdf':
                return renderPdfContent();
            case 'imagem':
                return renderImagemContent();
            case 'planilha':
                return renderPlanilhaContent();
            default:
                return renderTextoContent();
        }
    }

    return (
        <main className="app-page space-y-6 pb-32 fade-in w-full max-w-full overflow-x-hidden max-w-xl mx-auto" style={{ backgroundColor: '#0B0C10' }}>
            {/* Header */}
            <header className="flex items-center gap-3 pt-1">
                <button
                    onClick={() => navigate(-1)}
                    className="btn-ghost h-9 w-9 p-0 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                    type="button"
                    aria-label="Voltar"
                >
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-white">Importar Cifra</h1>
                    <p className="text-[10px] text-white/40">Adicione repertório via texto, PDF, foto ou planilha</p>
                </div>
            </header>

            {renderTabSelector()}

            <form onSubmit={aba !== 'planilha' ? handleImportarTexto : undefined} className="space-y-5">
                {(aba === 'texto' || (aba === 'pdf' && resultadoLeitura?.texto) || (aba === 'imagem' && resultadoLeitura?.texto && !revisando)) ? (
                    <>
                        {renderMetadataForm()}
                        {renderTabContent()}
                        <button
                            type="submit"
                            className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all"
                            disabled={!titulo.trim() || !textoCifra.trim()}
                        >
                            <Upload size={16} />
                            <span>Salvar na Biblioteca</span>
                        </button>
                    </>
                ) : (
                    renderTabContent()
                )}
            </form>
        </main>
    );
};

function FormRevisaoCifra({ rascunho, onCancelar, onConfirmar }: { rascunho: MusicaRascunho; onCancelar: () => void; onConfirmar: (rascunho: MusicaRascunho) => void }) {
    const [titulo, setTitulo] = useState(rascunho.titulo);
    const [artista, setArtista] = useState(rascunho.artista);
    const [tom, setTom] = useState(rascunho.tom);
    const [letra, setLetra] = useState(rascunho.letra);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        onConfirmar({ ...rascunho, titulo, artista, tom: tom as Tom, letra });
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <SectionHeader icone={<FileText size={16} />} titulo="Revisar cifra extraída" />
            <p className="text-xs text-textoSecundario">A confiança da leitura foi baixa. Revise os campos antes de salvar.</p>
            <div className="card grid gap-3 p-4 sm:grid-cols-2">
                <input className="input" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título" />
                <input className="input" value={artista} onChange={(e) => setArtista(e.target.value)} placeholder="Artista" />
                <input className="input" value={tom} onChange={(e) => setTom(e.target.value as Tom)} placeholder="Tom" />
            </div>
            <textarea
                required
                rows={10}
                value={letra}
                onChange={(e) => setLetra(e.target.value)}
                placeholder="Letra e acordes…"
                className="input font-mono text-xs w-full leading-relaxed p-3"
            />
            <div className="flex gap-2">
                <button type="button" className="btn-ghost flex-1" onClick={onCancelar}>
                    <X className="h-4 w-4" />
                    Cancelar
                </button>
                <button type="submit" className="btn-primary flex-1">
                    <Upload className="h-4 w-4" />
                    Salvar
                </button>
            </div>
        </form>
    );
}

export default Importar;
