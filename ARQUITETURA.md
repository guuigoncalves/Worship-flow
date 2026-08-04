# ARQUITETURA.md — WorshipFlow
> Gerado por Claude Gestão a partir de inspeção direta do código real (`Worship-flow.zip`).
> v1.1 atualiza v1.0 (31/07/2026) com achados confirmados por leitura direta do zip em 03/08/2026:
> race condition de anotações de ensaio corrigida, dependência `chordsheetjs` removida, campos de
> exclusão segura confirmados, e um problema real e urgente na integração de câmera (código
> desatualizado em relação a uma decisão de infraestrutura mais recente). Toda IDE/agente deve ler
> este arquivo e confirmar antes de agir.
> Build verificado: `tsc -b` e `vite build` limpos (confirmado em sessão anterior); build desta
> sessão não foi reexecutado, apenas leitura de código.

---

## 1. Stack real (confirmado no `package.json`)

| Camada | Tecnologia | Versão |
|---|---|---|
| Frontend | React + Vite + TypeScript | React 19, Vite 6, TS ~5.7 |
| Estilo | Tailwind CSS 3 + CSS Variables | — |
| Roteamento | React Router DOM | 6.28 |
| Backend | Firebase (Auth + Firestore) | firebase 11.1 |
| Player de áudio | Howler.js (real, tocando `faixa.audioUrl` via `Howl`) | 2.2.4 |
| Metrônomo | Web Audio API própria (`utils/metronomo.ts`) | — |
| PWA | vite-plugin-pwa (Workbox, `generateSW`) | 0.21 |
| Export PDF | jsPDF | 4.2 |
| Export planilha | xlsx (SheetJS) | 0.18 |
| i18n | i18next + react-i18next, app inteiro | 24.2 / 15.4 |
| Ícones | lucide-react | 0.469 |

**`chordsheetjs` foi REMOVIDA do `package.json`** (confirmado por inspeção direta do zip,
03/08/2026 — pendência #10 do GESTAO_APP_CIFRA_MUSICA fechada). O parser de cifra real continua
sendo a implementação própria em `src/utils/acordes.ts`.

**Não existe `@dnd-kit` no projeto.** Sem mudança — reordenação de medley continua por botões
↑/↓ em `ConstrutorBlocos.tsx`.

## 2. Firebase — estrutura real do Firestore

```
users/{uid}                                — perfil (useAuth/usePerfil)
users/{uid}/musicas/{musicaId}              — subcoleção real (useMusicas)
users/{uid}/favoritos/{musicaId}
users/{uid}/historico/{entradaId}
users/{uid}/estatisticas/geral
users/{uid}/medleys/{medleyId}              — (useMedleys)
users/{uid}/playlists/{playlistId}          — (Fase 10)
espacos/{espacoId}                          — useEspacos
                                               NOVO campo: observacoesEnsaio?: Record<string,string>
espacos/{espacoId}/membros/{uid}            — papel: dono/admin/editor/leitor
espacos/{espacoId}/musicas/{musicaId}
comunidade/{musicaComunidadeId}             — coleção FLAT (confirmado, não é subcoleção)
codigos/{codigo}                            — lookup de convite (get-only, sem list)
```

**Não existe** `users/{uid}/albuns` como coleção real — segue derivado virtualmente por artista.

Config Firebase em `src/utils/firebase.ts`, chaves hardcoded (projeto `worshipflow-ef662`).
`VITE_ADM_UID` e `VITE_PRIVADO_ALLOWLIST` lidas via `import.meta.env` — precisam estar nas
Environment Variables da Vercel.

## 3. Modelo de dado — `Musica` (tipo real, `src/types/index.ts`) — ATUALIZADO

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
  possuiCifra?: boolean;                    // default true (Fase 13)
  solicitacaoExclusao?: boolean;            // NOVO — Fase 16, confirmado por leitura direta
  dataSolicitacaoExclusao?: string;         // NOVO — Fase 16, confirmado por leitura direta
}
```
**Ainda não tem** `capaUrl`, `bpm`, `capo` nem `visibilidade`.

`MusicaComunidade` (coleção `comunidade/{id}`) ganhou os mesmos dois campos de exclusão. Segue
**sem** `'removida'` como status possível, e sem `denuncias`/`visualizacoes`/`downloads`.

`Espaco` (tipo real, `src/types/index.ts`) — NOVO campo confirmado:
```ts
interface Espaco {
  id: string;
  nome: string;
  tipo: 'ministerio' | 'banda' | 'estudo' | 'outro';
  donoUid: string;
  codigo: string;
  criadoEm: string;
  observacoesEnsaio?: Record<string, string>;   // NOVO — Fase 17, musicaId -> texto
}
```
Escrita confirmada como `updateDoc` com dot notation (`observacoesEnsaio.${musicaId}`) em
`useEspacos.tsx` — atômica por música, corrigido corretamente (era `setDoc` do objeto inteiro
antes, com risco de sobrescrita entre edições simultâneas; correção verificada por leitura direta
do código, não apenas relatório).

## 4. Player — estado real de funcionamento

Sem mudança desde v1.0: Howler real, mas `modo` (`'normal'|'fundo'|'pad'|'metronomo'`) continua
placeholder visual sem branch de lógica real. Firebase Storage ainda não ativado, sem fluxo de
upload de áudio em nenhuma tela.

## 5. Rotas (`src/App.tsx`) — ATUALIZADO

```
/login, /, /musica, /cifra, /biblioteca, /musica/:id, /tocar/:id, /busca-rapida,
/medleys, /medley/:id, /editor, /editor/:id, /perfil, /configuracoes, /player,
/albuns, /album/:id, /artistas, /artista/:id, /espacos, /espaco/:id,
/entrar/:codigo, /importar, /adm, /comunidade, /playlists, /playlist/:id, /privado,
/espaco/:id/preparacao   ← NOVO (Fase 17, Modo de Preparação)
```
Total 27 rotas. `/adm` protegida por `VITE_ADM_UID`, `/privado` por `VITE_PRIVADO_ALLOWLIST`.

## 6. Camada Privada — Proxy — ⚠️ DIVERGÊNCIA CONFIRMADA ENTRE CÓDIGO E INFRA REAL (NOVO)

**Decisão de infraestrutura fechada em 03/08/2026 (fora deste chat, no chat responsável pelo
servidor):** a rota `/frigate/*` foi **removida do proxy público** (`worshipflow-proxy`). Câmera
passou a ser acessível **somente via Tailscale direto** (`100.102.180.104:5000`), nunca mais pelo
proxy público, nem autenticada. Motivo: câmera é o dado mais sensível do produto — isolamento
total é mais seguro que o desenho original (URL assinada via proxy). Testado pela infra: `/frigate/*`
no proxy retorna 404 fixo; Tailscale direto retorna 200 OK.

**O código do app NUNCA foi atualizado pra essa decisão — confirmado por leitura direta do zip:**
- `src/hooks/useCamadaPrivada.ts`, função `buscarCameras()`, ainda chama
  `${proxyUrl}/frigate/api/config`.
- `server/proxy.js` ainda tem a rota `app.all('/frigate/*', verifyToken, checkAllowlist, ...)`
  ativa e funcional no código-fonte (mesmo que a instância real do servidor já a tenha removido).

**Efeito, se testado sem correção:** a chamada bate 404, o código tem `if (!response.ok) return []`,
e a tela mostra "Nenhuma câmera encontrada" como se fosse falta de dado — mascarando erro de
arquitetura como ausência de conteúdo. Terceira vez que esse padrão aparece neste projeto (as
outras duas foram variável de ambiente do proxy e caminho da API do Navidrome).

**Correção necessária, documentada como tarefa urgente no SI do Dev v13.0 Parte 3** — não testar a
aba de câmera até isso ser corrigido.

**Música (Navidrome) segue via proxy público normalmente** — confirmado funcional: versão real do
Navidrome é 0.63.2 (be10f89c), protocolo Subsonic v1.16.1 respondendo corretamente, autenticação
validada via `worshipflow-proxy`. Essa parte está OK, sem pendência.

## 7. Fila de Exclusão Segura (R15) — NOVO, confirmado por leitura direta

`useComunidade.tsx` tem `aprovarExclusaoPermanente()` (delete real do doc em `comunidade`) e
`rejeitarExclusaoRestaurar()` (`solicitacaoExclusao: false`, limpa `dataSolicitacaoExclusao` via
`deleteField()`). `useMusicas.tsx` tem `excluirMusica()` fazendo `updateDoc` com
`solicitacaoExclusao: true` em vez de deletar direto. `AdminPanel.tsx` tem aba de moderação
listando essas solicitações. Código confirmado correto por leitura direta; **validação manual real
(clicar, aprovar, restaurar) ainda não foi feita** — ver pendência no GESTAO_APP_CIFRA_MUSICA.

## 8. Convenções obrigatórias (sem mudança)
- Nomes em português.
- `export default NomeDaPagina` em toda página.
- `EstadoVazio` usa prop `texto`, não `descricao`.
- `useTransposicao()` só tem funções puras.
- Sistema visual Aurora em `src/index.css`.
- Ambiente: CachyOS, Fish Shell, Kate. `touch`/`truncate -s 0`/`kate`, não redirecionamento
  encadeado.
- **NOVO:** erro de infraestrutura/configuração nunca deve renderizar como "nenhum dado
  encontrado" — terceira ocorrência confirmada deste padrão neste projeto (ver Seção 6).

---
*ARQUITETURA.md v1.1 | Claude (Gestão) | 03/Ago/2026 — atualizado por inspeção direta do código
real do zip, não por relatório de terceiros.*
