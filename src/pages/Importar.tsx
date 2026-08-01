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
            <div className="grid grid-cols-4 gap-1 rounded-xl bg-elevada p-1.5 text-sm font-medium">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 transition-all ${
                            aba === tab.id ? 'bg-primaria text-fundo' : 'text-textoSecundario hover:text-texto'
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
                        {tab.label}
                    </button>
                ))}
            </div>
        );
    }

    function renderMetadataForm() {
        return (
            <div className="card grid gap-3 p-4 sm:grid-cols-2">
                <input className="input" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título" />
                <input className="input" value={artista} onChange={(e) => setArtista(e.target.value)} placeholder="Artista" />
                <input className="input" value={tom} onChange={(e) => setTom(e.target.value)} placeholder="Tom (ex: C, G, Am...)" />
            </div>
        );
    }

    function renderTextoContent() {
        return (
            <>
                <SectionHeader icone={<FileText size={16} />} titulo="Conteúdo da Cifra" />
                <textarea
                    required
                    rows={12}
                    value={textoCifra}
                    onChange={(e) => setTextoCifra(e.target.value)}
                    placeholder="Cole aqui a cifra com acordes e letra..."
                    className="input font-mono text-xs w-full leading-relaxed p-3"
                />
            </>
        );
    }

    function renderPdfContent() {
        return (
            <>
                <SectionHeader icone={<FileSpreadsheet size={16} />} titulo="Upload de PDF" />
                <label className="card flex min-h-[120px] cursor-pointer items-center justify-center border-2 border-dashed border-borda p-4 text-center transition-colors hover:border-primaria">
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
                    <div className="flex flex-col items-center gap-2 text-textoSecundario">
                        <Upload className="h-8 w-8 text-primaria" />
                        <span className="text-sm">Clique para selecionar um PDF</span>
                        {arquivo ? <span className="text-xs">{arquivo.name}</span> : null}
                    </div>
                </label>

                {processando ? (
                    <div className="card flex items-center justify-center gap-3 p-6 text-textoSecundario">
                        <Loader2 className="h-6 w-6 animate-spin text-primaria" />
                        <span>Extraindo texto do PDF…</span>
                    </div>
                ) : resultadoLeitura?.texto ? (
                    <div className="space-y-3">
                        {renderMetadataForm()}
                        <SectionHeader icone={<FileText size={16} />} titulo="Texto extraído (revise antes de salvar)" />
                        <textarea
                            rows={12}
                            value={textoCifra}
                            onChange={(e) => setTextoCifra(e.target.value)}
                            placeholder="Texto extraído do PDF…"
                            className="input font-mono text-xs w-full leading-relaxed p-3"
                        />
                    </div>
                ) : null}
            </>
        );
    }

    function renderImagemContent() {
        return (
            <>
                <SectionHeader icone={<Image size={16} />} titulo="Upload de Imagem (OCR)" />
                <label className="card flex min-h-[120px] cursor-pointer items-center justify-center border-2 border-dashed border-borda p-4 text-center transition-colors hover:border-primaria">
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
                    <div className="flex flex-col items-center gap-2 text-textoSecundario">
                        <Image className="h-8 w-8 text-primaria" />
                        <span className="text-sm">Clique para selecionar uma imagem (PNG/JPG)</span>
                        {arquivo ? <span className="text-xs">{arquivo.name}</span> : null}
                    </div>
                </label>

                {processando ? (
                    <div className="card flex items-center gap-3 p-4 text-textoSecundario">
                        <Loader2 className="h-5 w-5 animate-spin text-primaria" />
                        <span className="flex-1">Lendo imagem com OCR…</span>
                        <span className="text-xs">{Math.round(progressoOCR * 100)}%</span>
                    </div>
                ) : null}

                {revisando && rascunhoRevisao ? (
                    <FormRevisaoCifra rascunho={rascunhoRevisao} onCancelar={() => setRevisando(false)} onConfirmar={handleSalvarRascunho} />
                ) : resultadoLeitura?.texto && !revisando ? (
                    <div className="space-y-3">
                        {renderMetadataForm()}
                        <SectionHeader icone={<FileText size={16} />} titulo="Texto extraído (revise antes de salvar)" />
                        <textarea
                            rows={12}
                            value={textoCifra}
                            onChange={(e) => setTextoCifra(e.target.value)}
                            placeholder="Texto extraído da imagem…"
                            className="input font-mono text-xs w-full leading-relaxed p-3"
                        />
                    </div>
                ) : null}
            </>
        );
    }

    function renderPlanilhaContent() {
        return (
            <>
                <SectionHeader icone={<FileSpreadsheet size={16} />} titulo="Upload de Planilha" />
                <label className="card flex min-h-[120px] cursor-pointer items-center justify-center border-2 border-dashed border-borda p-4 text-center transition-colors hover:border-primaria">
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
                    <div className="flex flex-col items-center gap-2 text-textoSecundario">
                        <FileSpreadsheet className="h-8 w-8 text-primaria" />
                        <span className="text-sm">Clique para selecionar XLSX ou CSV</span>
                        {arquivo ? <span className="text-xs">{arquivo.name}</span> : null}
                    </div>
                </label>

                {processando ? (
                    <div className="card flex items-center justify-center gap-3 p-6 text-textoSecundario">
                        <Loader2 className="h-6 w-6 animate-spin text-primaria" />
                        <span>Lendo planilha…</span>
                    </div>
                ) : resultadosPlanilha.length > 0 ? (
                    <div className="space-y-3">
                        <SectionHeader icone={<FileText size={16} />} titulo={`Músicas encontradas (${resultadosPlanilha.length})`} />
                        <div className="card divide-y divide-borda max-h-[400px] overflow-y-auto">
                            {resultadosPlanilha.map((musica, index) => (
                                <div key={`${musica.titulo}-${index}`} className="flex items-center justify-between gap-3 p-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-semibold">{musica.titulo}</p>
                                        <p className="truncate text-sm text-textoSecundario">{musica.artista} · {musica.tom}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button
                            className="btn-primary w-full"
                            type="button"
                            disabled={salvandoPlanilha}
                            onClick={() => void salvarTodasPlanilha()}
                        >
                            {salvandoPlanilha ? 'Salvando…' : 'Salvar Todas'}
                        </button>
                    </div>
                ) : arquivo && !processando ? (
                    <p className="text-sm text-textoSecundario">Nenhuma música encontrada na planilha.</p>
                ) : null}
            </>
        );
    }

    function renderTabContent() {
        if (sucesso) {
            return (
                <div className="card p-6 text-center space-y-3">
                    <CheckCircle size={40} className="mx-auto text-sucesso" />
                    <h2 className="text-base font-bold text-texto">Importado com Sucesso!</h2>
                    <p className="text-xs text-textoSecundario">Redirecionando para a biblioteca…</p>
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
        <div className="app-page space-y-6 pb-24 fade-in max-w-xl mx-auto">
            <button
                onClick={() => navigate(-1)}
                className="btn-ghost text-xs flex items-center gap-2"
            >
                <ArrowLeft size={16} />
                <span>Voltar</span>
            </button>

            <div>
                <h1 className="text-2xl font-bold text-gradient">Importar Cifra</h1>
                <p className="text-xs text-textoSecundario">
                    Importe cifras de texto, PDF, imagem (OCR) ou planilhas
                </p>
            </div>

            {renderTabSelector()}

            <form onSubmit={aba !== 'planilha' ? handleImportarTexto : undefined} className="space-y-4">
                {(aba === 'texto' || (aba === 'pdf' && resultadoLeitura?.texto) || (aba === 'imagem' && resultadoLeitura?.texto && !revisando)) ? (
                    <>
                        {renderMetadataForm()}
                        <div className="space-y-3">{renderTabContent()}</div>
                        <button
                            type="submit"
                            className="btn-primary w-full py-3 text-xs flex items-center justify-center gap-2"
                            disabled={!titulo.trim() || !textoCifra.trim()}
                        >
                            <Upload size={16} />
                            <span>Salvar na Biblioteca</span>
                        </button>
                    </>
                ) : (
                    <div className="space-y-3">{renderTabContent()}</div>
                )}
            </form>
        </div>
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
