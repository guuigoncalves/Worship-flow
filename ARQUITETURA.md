# ARQUITETURA.md — WorshipFlow
> v1.8 atualiza v1.7. Escrita a partir de **varredura direta do código-fonte** (zip enviado pelo
> Guilherme em 13/08/2026) — `git log`, `git diff origin/main..HEAD`, `grep` nos arquivos reais,
> não relatório de agente/dev. Onde um item diz "confirmado no código", significa que eu (Claude
> Gestão) li o arquivo real.

---

## 1. Stack — sem mudança
React 19 + Vite + TypeScript + Firebase (Auth, Firestore). Design system Aurora.

## 2. Ferramental de execução — MUDANÇA DE MÉTODO (13/08/2026)
Guilherme abandonou o fluxo formal "SI v26 → dev (AI Studio) → Kilo Code → só volta em gatilhos" e
passou a trabalhar direto com o dev + Kilo Code, ajustando layout ponto a ponto via prints/vídeo
reais, sem intermediário formal e sem consultar o Claude Gestão a cada tela. Isso completou a fila
inteira da SI v26 na prática (ver Seção 8), mas o retorno ao Gestão só aconteceu quando o dev
"estourou os tokens" do chat — não por um gatilho formal da Seção 6 da SI.

**Achado crítico desta sessão**: o relatório de encerramento do dev marcava itens como "✅
Commitado e enviado" que na verdade só existiam como alterações não commitadas no zip (ver Seção
8). Corrigido nesta sessão — todos os itens têm commit real agora, aguardando `git push` do
Guilherme.

## 3-7. Sem mudança estrutural de v1.7 (Firestore, modelo de dado, rotas, Camada Privada, PWA/SW)
`firestore.rules` confirmado sem diff nesta sessão — nenhuma mudança de regra de segurança.
29 rotas registradas em `App.tsx`, sem mudança de contagem.

## 8. Redesign Visual — ESTADO REAL CONFIRMADO NO CÓDIGO (13/08/2026)

### Commits confirmados por `git log` desde o checkpoint de 09/08
| Commit | Descrição | Status no GitHub (`origin/main`) |
|---|---|---|
| `56b3b8a`, `411924e` | MiniPlayer (1ª leva), Cifra grid responsivo, Importar sem duplicação, pdfImporter preserva quebras | Já estava no GitHub antes desta sessão |
| `1afc324` | Espaço detalhe (`/espaco/:id`) — mockup #15 | Commitado nesta sessão, aguarda `git push` |
| `a88596b` | Modo de Preparação (`/espaco/:id/preparacao`) — mockup #15 | Idem |
| `bc2a281` | Editor de Medley (`/medley/:id`) — mockup #11 | Idem |
| `dc15fa6` | Player — refino glow/capa, mockup #2 | Idem |
| `95a06e0` | NavegacaoInferior — ajuste acompanhando Player | Idem |
| `500c8b0` | MiniPlayer — refinamento adicional, `<CapaMusica />` real, card inteiro clicável | Idem |
| `72e249f` | Paleta Aurora global (fundo obsidiana `#080711`, bordas `#2a224f`, texto `#ffffff`) via variáveis CSS centrais | Idem |
| `daf91ec` | Fix de tipo: campo opcional `tom` em `FaixaAudio` | Idem (2ª vez que esse fix precisou ser reaplicado — não sobreviveu ao histórico da sessão de 09/08) |
| `c393428` | Assets de logo/favicons faltantes (referenciados desde `f32f3f8`, nunca versionados) | Idem (2ª vez — mesma lacuna da sessão de 09/08) |
| `887714e` | `.gitignore`: ignorar `test-results/` | Idem |

**IMPORTANTE**: os commits marcados "idem" existem no repositório local do zip que devolvi ao
Guilherme, mas dependem dele rodar `git push` na própria máquina para chegarem ao GitHub. Até lá,
`origin/main` só tem os dois primeiros commits desta leva.

### Verificação técnica feita nesta sessão (não substitui verificação visual)
- `rm -rf node_modules && npm install` limpo (o `node_modules` do zip veio corrompido — comum em
  zip/unzip de binários, sempre reinstalar antes de confiar em build de um zip recebido).
- `tsc -b` + `vite build`: **0 erros**, com tudo aplicado.
- `git diff` em `firestore.rules`, `Editor.tsx`, `CamadaPrivada.tsx`: **sem alteração** — nenhuma
  fase bloqueada foi tocada.
- `chordsheetjs`, `@dnd-kit`: confirmados ausentes, sem regressão.
- `Espaco.tsx`, `ModoPreparacao.tsx`, `EditorMedley.tsx`: usam hooks reais (`useEspacoDetalhe`,
  `useMusicas`, `useMedleys`) e `EstadoVazio` para dados vazios — sem dado inventado (R1).

### Telas — status por rota (29 rotas)
Todas as 29 rotas têm código de redesign presente e commitado localmente (ver `INVENTARIO_TELAS.md`
para a tabela completa, coluna "Testado manualmente" continua sendo preenchida só pelo Guilherme,
nunca por mim). **Nenhuma tela desta leva de 13/08 foi confirmada por print/vídeo real ainda** —
verificação visual é sempre responsabilidade do Guilherme; meu ambiente não tem acesso a
`cdn.playwright.dev` (fora da allowlist de rede), então não consigo tirar screenshot real de
nenhuma tela deste projeto no meu sandbox.

### Bloqueadas — sem mudança
Editor de Cifra (`/editor`, `/editor/:id`), Camada Privada (`/privado`), `firestore.rules`, Fase 19
(tema/cor/layout customizável). Confirmado sem diff nesta sessão.

## 9. Pendências de produto reportadas pelo dev nesta sessão (não urgentes, não bloqueiam)
- Player (`/player`): seletor de conteúdo central (capa / foto do artista / letra sincronizada /
  cifra com transposição) — feature nova, não um bug. Decisão de produto, não urgente.
- Home (`/`) e Hub Música (`/musica`): ainda usam placeholders de letra (`C`, `D`, `G`) em vez de
  capas reais de álbum (`<CapaMusica />`) em algumas listagens — inconsistência visual, não bug
  funcional.
- Aviso de domínio Firebase Auth para `127.0.0.1` no console do navegador — é configuração
  (adicionar `127.0.0.1` aos domínios autorizados no Firebase Console), não um bug de código.

## 10. Sem mudança de v1.7 (demais seções)

---
*ARQUITETURA.md v1.8 | Claude (Gestão) | 13/Ago/2026 — reconstruída a partir de varredura direta*
*do código-fonte (zip enviado pelo Guilherme), incluindo `git log`/`git diff origin/main..HEAD`.*
