# Plano de Arquitetura — Fase 8: Importação de Arquivos na Tela Importar

> **Status:** Planejamento | **Base:** `src/pages/Importar.tsx`, `src/utils/importarParser.ts`, `src/utils/exportar.ts`, `src/hooks/useMusicas.tsx`
> **Dependências já instaladas:** `pdfjs-dist@^6.2.108`, `tesseract.js@^7.0.0`, `xlsx@^0.18.5`, `jspdf@^4.2.1`

---

## 1. Contexto Atual

### `src/pages/Importar.tsx`
- Tela única com formulário de texto: título, artista, tom, textarea de cifra
- Salva via `salvarMusica({ titulo, artista, tom, letra, tags: [], dificuldade: 'intermediario' }, undefined)`
- Estados: `textoCifra`, `titulo`, `artista`, `tom`, `sucesso`
- UI: `card`, `input`, `btn-primary`, `SectionHeader`, `text-gradient` — já no padrão Aurora

### `src/utils/importarParser.ts` (existente, não usado pela tela atual)
- `parsearCifra(texto: string): MusicaRascunho` — parseia texto crú de cifra:
  - Detecta BPM/Capo em metadados
  - Detecta marcadores de seção (Intro, Verso, Refrão, Ponte, Final) → converte para `[Verso]` etc.
  - Une linha de acordes + linha de letra em `[G]Letra da música`
  - Extrai acordes via `extrairAcordes()`, inferência de tom da primeira nota
  - Tipo `MusicaRascunho`: `titulo`, `artista`, `tom`, `letra`, `acordes`, `dificuldade`, `tags`, `bpm?`, `capo?`, `sourceUrl?`

### `src/hooks/useMusicas.tsx`
- `salvarMusica(input, id?)` — salva música e retorna `Musica` com `id`
- `importarMusica(texto)` — usa `parsearCifra` internamente, mas **não é usado pela tela Importar.tsx**

### `src/utils/exportar.ts` (formato de referência para XLSX)
- Colunas: `Titulo`, `Artista`, `Tom`, `BPM`, `Capo`, `Tags`, `Dificuldade`
- `exportarListaExcel(musicas)` — exporta array de `Musica[]` para XLSX

---

## 2. Arquitetura Proposta

### Camada de Utils — `src/utils/importacao/`

| Arquivo | Responsabilidade | Funções principais |
|---|---|---|
| `pdfImporter.ts` | Extrair texto de PDF | `extrairTextoPDF(file: File): Promise<{ texto: string; confianca: number }>` — usa `pdfjs-dist` para ler páginas e concatenar texto |
| `ocrImporter.ts` | OCR de imagem | `extrairTextoOCR(file: File, onProgress?: (pct: number) => void): Promise<{ texto: string; confianca: number }>` — usa `tesseract.js` worker, retorna confiança média |
| `planilhaImporter.ts` | Ler XLSX/CSV | `lerPlanilha(file: File): Promise<MusicaRascunho[]>` — usa `xlsx` (SheetJS), mapeia colunas para `MusicaRascunho[]` |

### Fluxo de dados unificado

```
Arquivo/File/Button
  → utilitário de importação (pdf/ocr/planilha)
  → texto raw extraído
  → parsearCifra(texto) → MusicaRascunho
  → [se confianca < threshold] → tela de revisão
  → salvarMusica(rascunho) → navega para /musica/:id
```

### Nova pasta: `src/utils/importacao/`
```
src/utils/importacao/
├── pdfImporter.ts      # pdfjs-dist text extraction
├── ocrImporter.ts      # tesseract.js OCR
├── planilhaImporter.ts # xlsx/csv reading
└── tipos.ts            # ConfidenceResult interface, threshold constants
```

### Novos componentes (opcionais, se necessário):
| Componente | Local | Descrição |
|---|---|---|
| `BarraProgressoOCR` | `src/components/importacao/BarraProgressoOCR.tsx` | Barra de progresso para OCR/PDF processing |
| `FormRevisaoCifra` | `src/components/importacao/FormRevisaoCifra.tsx` | Formulário de revisão do `MusicaRascunho` antes de salvar |

---

## 3. Detalhamento por Fonte de Dados

### 3.1 PDF (`pdfImporter.ts`)
- **Biblioteca:** `pdfjs-dist` (já instalada)
- **API:**
  ```ts
  import { getDocument } from 'pdfjs-dist';
  export async function extrairTextoPDF(file: File): Promise<ConfidenceResult> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: arrayBuffer }).promise;
    const textos: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      textos.push(content.items.map((item: any) => item.str).join(' '));
    }
    return { texto: textos.join('\n\n'), confianca: 0.95 }; // PDF = alta confiança
  }
  ```
- **Confiança:** 0.95 (texto estruturado) → salvar direto, sem revisão
- **Workflow:** arquivo → texto → `parsearCifra(texto)` → `MusicaRascunho` → `salvarMusica`

### 3.2 Imagem / OCR (`ocrImporter.ts`)
- **Biblioteca:** `tesseract.js` (já instalada)
- **API:**
  ```ts
  import Tesseract from 'tesseract.js';
  export async function extrairTextoOCR(
    file: File,
    onProgress?: (pct: number) => void
  ): Promise<ConfidenceResult> {
    const { data } = await Tesseract.recognize(file, 'por', {
      logger: (m) => { if (m.status === 'recognizing') onProgress?.(m.progress); }
    });
    return { texto: data.text, confianca: data.confidence / 100 };
  }
  ```
- **Confiança:** `data.confidence / 100` (varia de 0-1)
- **Threshold:** se `confianca < 0.75`, abrir tela de revisão (`FormRevisaoCifra`)

### 3.3 Planilha (`planilhaImporter.ts`)
- **Biblioteca:** `xlsx` (já instalada)
- **Formato esperado** (baseado em `exportarListaExcel`):
  | Titulo | Artista | Tom | BPM | Capo | Tags | Dificuldade |
  |---|---|---|---|---|---|---|
  | Tua Presença | Ministério | G | 80 | 2 | louvor,adoracao | intermediario |
- **API:**
  ```ts
  import * as XLSX from 'xlsx';
  export async function lerPlanilha(file: File): Promise<MusicaRascunho[]> {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);
    return rows.map((row) => ({
      titulo: row.Titulo || row.titulo || 'Nova música',
      artista: row.Artista || row.artista || '',
      tom: normalizarTom(row.Tom || row.tom || 'G'),
      letra: row.Letra || row.letra || '',
      acordes: [],
      dificuldade: row.Dificuldade || 'intermediario',
      tags: parseTags(row.Tags),
      bpm: Number(row.BPM) || undefined,
      capo: Number(row.Capo) || undefined,
    }));
  }
  ```
- **Confiança:** 0.99 (dados estruturados) → salvar direto
- **CSV:** `xlsx` lê CSV nativamente — mesmo código funciona com `.csv`

---

## 4. Redesign da Tela `Importar.tsx`

### Interface com abas:

```
[aurora-bg] (já em App.tsx)
  <main className="app-page fade-in">
    <header>
      <button btn-ghost> <ArrowLeft /> Voltar </button>
      <h1 text-gradient>Importar Cifra</h1>
    </header>

    [TabSelector]
      Texto | PDF | Imagem | Planilha

    [TabContent — dependendo da aba selecionada]

    Tab Texto:
      - textarea (existing) → parsearCifra → preview → salvar

    Tab PDF:
      - file input (accept .pdf)
      - loading spinner
      - preview do texto extraído
      - botão salvar

    Tab Imagem:
      - file input (accept .png,.jpg,.jpeg,.webp)
      - barra de progresso OCR
      - preview do texto extraído
      - botão salvar

    Tab Planilha:
      - file input (accept .xlsx,.csv)
      - lista de músicas parseadas
      - botão salvar todas / salvar individualmente
  </main>
```

### Estados adicionais:
```ts
const [aba, setAba] = useState<'texto' | 'pdf' | 'imagem' | 'planilha'>('texto');
const [arquivo, setArquivo] = useState<File | null>(null);
const [processando, setProcessando] = useState(false);
const [resultado, setResultado] = useState<MusicaRascunho | null>(null);
const [resultadosPlanilha, setResultadosPlanilha] = useState<MusicaRascunho[]>([]);
const [progressoOCR, setProgressoOCR] = useState(0);
```

### Fluxo de revisão (confiança baixa):
- Se `confianca < 0.75` (imagens OCR), abrir `FormRevisaoCifra` — mostra formulário com os campos do `MusicaRascunho` preenchidos, permitindo correção antes de salvar
- Se `confianca >= 0.75` (PDF, texto, planilha), navega direto para preview → salvar

---

## 5. Aurora Design Application

| Elemento | Classe Aurora |
|---|---|
| Container principal | `app-page fade-in` |
| Header com voltar | `btn-ghost` + `ArrowLeft` |
| Título | `text-gradient` |
| Tab selector | `card p-1` com `chip` ativo `chip-active` |
| File input | `input` estilizado (via label custom) |
| Loading | spinner `border-2 border-primaria border-t-transparent rounded-full animate-spin` |
| Barra progresso OCR | `card` com barra `bg-primaria` animada |
| Preview de texto | `card` com `textarea font-mono` |
| FormRevisaoCifra | `card space-y-3` com `input`, `btn-primary` |

---

## 6. Pontos de Atenção

- **pdfjs-dist:** requer configurar worker em Vite. Usar `pdfjs-dist/legacy/build/pdf.worker.min.js` ou import inline
- **tesseract.js:** worker carregado via CDN — pode precisar de configuração do Vite para workers
- **xlsx:** leitura síncrona de arrayBuffer funciona no browser
- **Confiança OCR:** Tesseract retorna `data.confidence` em 0-100 — converter para 0-1
- **Planilha múltipla:** quando XLSX tem múltiplas músicas, salvar todas de uma vez via loop `salvarMusica`

---

## 7. Checklist de Validação
- [ ] `tsc --noEmit` passa sem erros
- [ ] Importação de texto continua funcionando (fluxo existente preservado)
- [ ] PDF: upload → extração → parse → save
- [ ] Imagem: upload → OCR progresso → revisão (se < 75%) → save
- [ ] Planilha: upload → lista de músicas → save todas
- [ ] `aurora-bg` visível no fundo
- [ ] Mobile (375px): file inputs e tabs funcionam
- [ ] Desktop: layout em duas colunas para preview
