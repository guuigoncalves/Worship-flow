# ARQUITETURA.md — WorshipFlow
> Gerado por Claude Gestão a partir de inspeção direta do código real (`Worship-flow.zip`, 31/07/2026).
> Este documento existe porque o projeto nunca teve uma ARQUITETURA.md técnica formal — só documentos de decisão/visão. Toda IDE/agente deve ler este arquivo e confirmar antes de agir.
> Build verificado nesta sessão: `tsc -b` e `vite build` limpos, node_modules reinstalado do zero.

---

## 1. Stack real (confirmado no `package.json`, não em relatório antigo)

| Camada | Tecnologia | Versão |
|---|---|---|
| Frontend | React + Vite + TypeScript | React 19, Vite 6, TS ~5.7 |
| Estilo | Tailwind CSS 3 + CSS Variables | — |
| Roteamento | React Router DOM | 6.28 |
| Backend | Firebase (Auth + Firestore) | firebase 11.1 |
| Player de áudio | **Howler.js** (real, tocando `faixa.audioUrl` via `Howl`) | 2.2.4 |
| Metrônomo | Web Audio API própria (`utils/metronomo.ts`) | — |
| PWA | vite-plugin-pwa (Workbox, `generateSW`) | 0.21 |
| Export PDF | jsPDF | 4.2 |
| Export planilha | xlsx (SheetJS) | 0.18 |
| i18n | i18next + react-i18next, **app inteiro**, não só o Editor | 24.2 / 15.4 |
| Ícones | lucide-react | 0.469 |

**Dependência instalada mas não usada em lugar nenhum do código: `chordsheetjs` (14.6.1).** O parser de cifra real é uma implementação própria em `src/utils/acordes.ts` (regex sobre `[Acorde]texto`), não a biblioteca. Ou remover a dependência morta, ou decidir migrar o parser pra ela — não fazer nada com isso sem decisão explícita.

**Não existe `@dnd-kit` no projeto.** O componente `BlocoArrastavel.tsx` (medley) tem um ícone de grip (`GripVertical`) sugerindo arraste, mas a reordenação real é por botões ↑/↓ em `ConstrutorBlocos.tsx` (`mover(index, direcao)`). Funciona, só o ícone é enganoso — considerar trocar o ícone ou implementar drag de verdade, decisão de produto, não bug.

## 2. Firebase — estrutura real do Firestore (confirmada em `useMusicas.tsx` e afins)

```
users/{uid}                                — perfil (useAuth/usePerfil)
users/{uid}/musicas/{musicaId}              — subcoleção real (useMusicas)
users/{uid}/favoritos/{musicaId}
users/{uid}/historico/{entradaId}
users/{uid}/estatisticas/geral
users/{uid}/medleys/{medleyId}              — (useMedleys)
espacos/{espacoId}                          — useEspacos
espacos/{espacoId}/membros/{uid}            — papel: dono/admin/editor/leitor
espacos/{espacoId}/musicas/{musicaId}
codigos/{codigo}                            — lookup de convite (get-only, sem list)
```

**Não existe** `users/{uid}/albuns` como coleção real — `Albuns.tsx` deriva álbuns virtualmente agrupando por `Musica.artista`, com aviso explícito na tela ("Os álbuns são agrupamentos derivados automaticamente do artista"). Isso é intencional e correto, não um bug a corrigir.

**Não existe** coleção `comunidade/musicas` nem rota `/comunidade` no código atual — é trabalho novo, ainda não iniciado (ver Fase 8 no SI do Dev).

Config Firebase em `src/utils/firebase.ts`, chaves hardcoded (projeto `worshipflow-ef662`), sem `.env` necessário pra isso. **Exceção:** `VITE_ADM_UID` é lido via `import.meta.env` em `NavegacaoInferior.tsx` e `AdminPanel.tsx` pra decidir se o usuário é admin — essa variável precisa ser configurada nas Environment Variables da Vercel (não commitada), senão o Admin nunca aparece pra ninguém.

## 3. Modelo de dado — `Musica` (tipo real, `src/types/index.ts`)

```ts
interface Musica {
  id: string;
  titulo: string;
  artista: string;
  tom: Tom;
  acordes: string[];
  letra: string;
  tags: TagMusica[];
  dificuldade: Nivel;
  eFavorita: boolean;
  vezesTocada: number;
  ultimaTocada: string | null;
  criadaEm: string;
  versoes: VersaoMusica[];
}
```
**Não tem** `capaUrl`, `bpm`, `capo` nem `visibilidade`. Qualquer feature que precise desses campos (ex: capa de álbum de verdade, BPM automático) exige migração de schema — não existe hoje, apesar de ter sido mencionado como existente em um relatório de outra fonte.

## 4. Player — estado real de funcionamento

`usePlayer()` usa Howler de verdade: se `faixa.audioUrl` existir, cria um `Howl` e toca. **Mas:** `modo` (`'normal' | 'fundo' | 'pad' | 'metronomo'`) é armazenado e exposto, só isso — **não existe nenhum branch de lógica que mude o comportamento de playback por modo**. É hoje um seletor visual sem efeito real. Além disso, o Firebase Storage não está ativado no projeto e não há fluxo de upload de áudio em nenhuma tela — ou seja, na prática, dificilmente algo tem `audioUrl` preenchido hoje. Isso resolve a pendência antiga sobre "os modos tocam áudio real?": a resposta é **o player em si é real, mas os modos são placeholder, e a fonte de áudio em si ainda não tem de onde vir**.

## 5. Rotas (`src/App.tsx`) — lista completa e real

```
/login, /, /musica, /cifra, /biblioteca, /musica/:id, /tocar/:id, /busca-rapida,
/medleys, /medley/:id, /editor, /editor/:id, /perfil, /configuracoes, /player,
/albuns, /album/:id, /artistas, /artista/:id, /espacos, /espaco/:id,
/entrar/:codigo, /importar, /adm
```
Todas em Aurora (Fases 0-7 concluídas). Não existe `/comunidade`, `/playlists` nem qualquer rota de camada privada.

## 6. Componentes e hooks — ver `SYSTEM_INSTRUCTION_CHAT_DEV.md` (Parte 2) pro mapa completo por pasta; este documento cobre só o que diverge do que estava documentado antes.

## 7. Convenções obrigatórias (herdadas do projeto, confirmadas no código)
- Nomes em português (variáveis, tipos, rotas, componentes).
- `export default NomeDaPagina` em toda página (exigido pelo `React.lazy()`).
- `EstadoVazio` usa prop `texto`, não `descricao`.
- `useTransposicao()` só tem funções puras — estado de tom fica no componente.
- Sistema visual Aurora em `src/index.css` — não criar classe/paleta paralela.
- Ambiente do Guilherme: CachyOS, Fish Shell, Kate. Fish não aceita `>` encadeado — usar `touch`/`truncate -s 0`/`kate`.

---
*ARQUITETURA.md v1.0 | Claude (Gestão) | 31/Jul/2026 — gerado por inspeção direta do código, não por relatório de terceiros.*
