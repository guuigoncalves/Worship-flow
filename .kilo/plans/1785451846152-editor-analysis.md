# Análise Técnica — Editor de Música

> **Objetivo:** Levantamento completo do `Editor.tsx` e suas dependências, sem alterações de código.
> **Escopo:** `src/pages/Editor.tsx`, `src/components/editor/*`, `src/utils/acordes.ts`, `src/utils/transposicao.ts`, `src/components/apresentacao/ExibicaoCifra.tsx`, hooks consumidos.

---

## 1. O que o Editor faz atualmente

### 1.1 Estados locais (`src/pages/Editor.tsx`)

| Estado | Tipo | Inicial | Observações |
|---|---|---|---|
| `titulo` | `string` | `musica?.titulo ?? ''` | Campo de texto livre |
| `artista` | `string` | `musica?.artista ?? ''` | Campo de texto livre |
| `tom` | `Tom` | `musica?.tom ?? 'G'` | Selecionado via `<select>` |
| `letra` | `string` | `musica?.letra ?? '[G]Digite a letra [C]aqui'` | Textarea — formato "cifra" com acordes em colchetes `[G]` |
| `dificuldade` | `'iniciante' \| 'intermediario' \| 'avancado'` | `musica?.dificuldade ?? 'intermediario'` | Selecionado via `<select>` |
| `tags` | `TagMusica[]` | `musica?.tags ?? ['louvor']` | Múltiplas — toggle via chips |
| `aba` | `'editar' \| 'preview'` | `'editar'` | Controle de abas — visível apenas em mobile (`lg:hidden`) |
| `insertRef` | `Ref<(texto: string) => void>` | `() => undefined` | Callback registrado pelo `EditorLetra` para inserção programática de acordes |

### 1.2 Sincronização com dados externos

- **`useEffect` de carregamento (`Editor.tsx:35-43`):** Quando `musica` muda (obtida via `obterMusica(id)`), todos os estados locais são sobrescrito com os valores da música. Isso acontece sempre que a instância do objeto `musica` muda na store.

### 1.3 Ações disponíveis

| Ação | Função | Detalhes |
|---|---|---|
| **Salvar música** | `salvar()` | Chama `salvarMusica({ titulo, artista, tom, letra, tags, dificuldade }, id)`. Se `id` não existir (criação), gera `crypto.randomUUID()`. Navega para `/musica/${salva.id}` após salvar. Mostra toast de sucesso. |
| **Exportar (copiar letra)** | `exportar()` | Copia o conteúdo da `letra` para o clipboard via `navigator.clipboard.writeText`. Não há toast de confirmação. |
| **Duplicar** | — | **NÃO existe botão de duplicar direto no Editor.** O hook `useMusicas` expõe `duplicarMusica`, mas o Editor não o consome. Duplicar é feito em outras telas. |
| **Salvar versão** | `salvarVersao(musica.id, {...})` | Só aparece quando `musica` existe (edição). Cria uma nova versão com `rotulo`, `tom` e `letra` atuais. Usa `crypto.randomUUID()` internamente. |
| **Transpor tudo** | `transporTudo(destino: Tom)` | Chama `transpor(letra, tom, destino)` e atualiza `letra` + `tom`. Percorre todos os acordes em `[...]` e transpõe semitom adiante. |
| **Sugestão de tom** | `tomSugerido` (useMemo) | Calculado via `sugerir(extrairAcordes(letra))`. Mostra o tom mais fácil baseado no perfil do músico (acordes proibidos, tons preferidos, capo). |
| **Toggle de tags** | `toggleTag(tag)` | Adiciona/remove tag do array `tags`. |
| **Alternar abas** | `setAba('editar' \| 'preview')` | Mobile only — em telas `lg` ambas as colunas ficam visíveis simultaneamente. |

### 1.4 Layout responsivo

- **Desktop (`lg`):** Grid de 2 colunas — coluna esquerda = formulário/edição, coluna direita = preview + transposição. Ambas visíveis ao mesmo tempo.
- **Mobile:** Abas alternam entre "Editar" e "Prévia". O botão "Salvar" fixo aparece no bottom em mobile (`fixed bottom-[76px]`).

---

## 2. Lógica do parser de acordes/cifras

### 2.1 Arquivo: `src/utils/acordes.ts`

| Função | Assinatura | Descrição |
|---|---|---|
| `extrairAcordes` | `(letra: string) => string[]` | Extrai todos os acordes entre colchetes `[...]` usando regex `/\[([^\]]+)]/g`. Valida cada um com `validarAcorde`. Retorna array único (Set). |
| `validarAcorde` | `(acorde: string) => boolean` | Regex validadora: raiz (A-G + opcional #/b), tipo (m, maj, dim, aug, sus, add), número (0-9), extensão (maj7, m7, sus2, sus4, add9, dim, aug), e bassta `/[A-G](#|b)?`. |
| `raizDoAcorde` | `(acorde: string) => string` | Extrai a raiz (nota base) usando `raizRegex`. Ex: `C#m7` → `C#`. |
| `normalizarAcorde` | `(acorde: string) => string` | Trim + remove espaços internos. |
| `temAcordeProibido` | `(acordes: string[], proibidos: string[]) => boolean` | Verifica se algum acorde da lista está na lista de proibidos (normalizados). |
| `acordeAlternativoFacil` | `(acorde: string) => string` | Mapeia acordes complexos para versões mais fáceis (ex: `F` → `Fmaj7`, `Bm` → `D`). Fallback: raiz do acorde. |
| `importarTextoLivre` | `(texto: string) => string` | Converte texto livre em formato de cifra. Duas transformações: (1) regex `\b([A-G]...)` envolve acordes em colchetes; (2) `{chord: X}` → `[X]`. |

### 2.2 Arquivo: `src/utils/transposicao.ts`

| Função | Assinatura | Descrição |
|---|---|---|
| `semitonsEntre` | `(origem: Tom, destino: Tom) => number` | Calcula semitons entre dois tons usando o mapa `aliases` (12 notas, com aliases de bemóis e sustenções). |
| `transporAcorde` | `(acorde: string, semitons: number, tomDestino?: Tom) => string` | Transpõe um acorde. Trata acordes com baixo (`/`): separa, transpõe corpo e baixo individualmente. |
| `transporParteAcorde` | `(parte: string, semitons: number, tomDestino?: Tom) => string` | Função interna. Extrai raiz + sufixo via regex, transpõe a raiz usando `aliases`, mantém sufixo. Usa `notasFlat` ou `notasSharp` baseado em `preferirBemol(tomDestino)`. |
| `transporLetra` | `(letra: string, tomOriginal: Tom, tomAlvo: Tom) => string` | Transpõe TODOS os acordes `[...]` na letra. Calcula semitons via `semitonsEntre`. |
| `transporPorSemitom` | `(letra: string, semitons: number, tomAlvo?: Tom) => string` | Variante — transpõe por número fixo de semitons (não usado pelo Editor). |
| `tomPorDeslocamento` | `(tom: Tom, semitons: number) => Tom` | Transpõe apenas um tom (não uma letra). |
| `sugerirTomMaisFacil` | `(acordes: string[], perfil: PerfilMusico) => Tom` | **Algoritmo de sugestão:** para cada um dos 12 tons, transpõe todos os acordes, aplica penalidades: -10 por acorde proibido, -2 se é tom preferido, -1 se usa capo. Retorna o tom com menor pontuação. |
| `extrairAcordesTranspostos` | `(letra: string, tomOriginal: Tom, tomAlvo: Tom) => string[]` | Extrai acordes já transpostos (não usado pelo Editor). |

### 2.3 Arquivo: `src/components/apresentacao/ExibicaoCifra.tsx`

- **Responsabilidade:** Renderiza a letra com acordes posicionados acima das sílabas.
- **`renderLinha`:** Split da linha por `\[[^\]]+]` (mantém grupos). Acordes ficam como `pendente` e são renderizados sobre a próxima parte de texto.
- **`modo`:** `'cifra'` (acordes como botões coloridos), `'letra'` (apenas texto), `'ambos'` (acordes sobre o texto — usado no preview).
- **`acordesProibidos`:** No preview do Editor, passa `[]` (nenhum proibido).

---

## 3. Atalhos de teclado e comportamentos de digitação

### 3.1 Editor de música (`Editor.tsx`)

**Nenhum atalho de teclado está implementado no Editor.** Não há listeners de `keydown`, `onKeyDown`, ou hotkeys em:
- `Editor.tsx`
- `EditorLetra.tsx`
- `SeletorAcorde.tsx`
- `PreviewCifra.tsx`

### 3.2 Comportamento de digitação no `EditorLetra`

- **`<textarea>` puro** — digitação normal. `onChange` atualiza `letra` diretamente.
- **Inserção programática:** `SeletorAcorde` chama `onInsert(acorde)` → `insertRef.current(acorde)` → `EditorLetra.insert()`.
  - Insere texto na posição do cursor (`selectionStart`/`selectionEnd`).
  - Preserva foco e reposiciona cursor após o texto inserido via `requestAnimationFrame`.
- **Formato de cifra:** Acordes em colchetes `[G]`, `[C]`. Texto fora de colchetes é considerado letra.

### 3.3 Padrão de atalhos no codebase (apenas em `Tocar.tsx`)

- `Space` → toggle auto-scroll
- `+` / `-` → transpor +1/-1 semitom
- `=` → aumentar velocidade
- `F` → fullscreen
- **Ignora atalhos quando foco está em `<input>` ou `<textarea>`**

---

## 4. Hooks consumidos

### 4.1 Hooks consumidos diretamente pelo `Editor.tsx`

| Hook | Import | Funções/valores usados |
|---|---|---|
| `useMusicas` | `../hooks/useMusicas` | `obterMusica(id)`, `salvarMusica(input, id?)`, `salvarVersao(musicaId, versao)` |
| `useTransposicao` | `../hooks/useTransposicao` | `transpor(letra, origem, destino)`, `sugerir(acordes)` |
| `useTranslation` | `react-i18next` | `t` — traduções: `editor.title`, `editor.export`, `editor.saveSong`, `editor.transposeAll`, `editor.saveVersion`, `common.error`, `toast.saved`, `toast.deleted` |

### 4.2 Hooks transitivos (via dependências)

| Hook | Cadeia | Observações |
|---|---|---|
| `usePerfil` | `useTransposicao` → `usePerfil` | Fornece `perfil` usado por `sugerir`. Inclui `acordesProibidos`, `tonsPreferidos`, `preferirCapo`. |
| `useAuth` | `useMusicas` → `useAuth`, `usePerfil` → `useAuth` | Usuário autenticado determina se sincroniza com Firestore. |
| `useToast` | `useMusicas` → `useToast` | `showToast` chamado internamente em `salvarMusica`, `salvarVersao`, etc. |

### 4.3 Hooks disponíveis no projeto (NÃO usados pelo Editor)

| Hook | Uso em outras telas |
|---|---|
| `useAuth` | Login, navegação, AuthProvider |
| `useToast` | Sistema de toasts globais |
| `useOffline` | Indicador de conexão |
| `useTema` | Configurações de tema |
| `usePlayer` | Tocar, Musica, Album, Artista |
| `useFila` | Tocar (fila de reprodução) |
| `useMedleys` | EditorMedley, Medleys |
| `useEspacos` | Espaco, Espacos, EntrarEspaco |
| `useHistorico` | Perfil (estatísticas) |

---

## 5. Pontos de atenção / oportunidades

1. **Sem atalhos no Editor** — `Tocar.tsx` tem atalhos (`+`, `-`, `Space`), mas `Editor.tsx` não. Oportunidade de unificar padrão.
2. **Sem duplicar** — `useMusicas.duplicarMusica` existe mas não é exposta no Editor.
3. **`tomSugerido`** é calculado mas **não tem ação associada** — é apenas exibido como texto informativo. Não há botão "Aplicar sugestão".
4. **`insertRef` padrão é `() => undefined`** — se `EditorLetra` não montar ainda, `SeletorAcorde` não faz nada. Funciona, mas é um padrão frágil.
5. **`exportar()`** não confirma ao usuário — copia silenciosamente.
6. **`salvarVersao`** não atualiza o `tom` local após salvar — mantém o tom da sessão, não o da versão salva.
7. **Regex de `validarAcorde`** — permite combinações inválidas como `Cmaj7maj7`. Não há validação semântica, apenas formato.
