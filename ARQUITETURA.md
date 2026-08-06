# ARQUITETURA.md — WorshipFlow
> Gerado por Claude Gestão a partir de inspeção direta do código real (`Worship-flow.zip`).
> v1.2 atualiza v1.1 (03/08/2026) com achados confirmados por leitura direta do zip + console de
> produção real em 05/08/2026: 3 bugs técnicos que bloqueiam a Camada Privada e a Comunidade
> (CORS ausente no proxy, credenciais do Navidrome vazias em produção, permission-denied no
> Firestore), suspeita de causa raiz do "app fica offline sozinho" (Service Worker), redesign
> visual da v14 REPROVADO no teste manual (telas foram mescladas, não substituídas). Toda
> IDE/agente deve ler este arquivo e confirmar antes de agir.
> Build: `tsc -b` e `vite build` seguem verdes conforme último relatório do Dev — não é garantia
> de funcionamento em produção (ver Seção 9, novo).

---

## 1. Stack real (confirmado no `package.json`)

| Camada | Tecnologia | Versão |
|---|---|---|
| Frontend | React + Vite + TypeScript | React 19, Vite 6, TS ~5.7 |
| Estilo | Tailwind CSS 3 + CSS Variables | — |
| Roteamento | React Router DOM | 6.28 |
| Backend | Firebase (Auth + Firestore) | firebase 11.10 |
| Player de áudio | Howler.js (real, mas sem fonte de áudio na camada comercial — ver Seção 4) | 2.2.4 |
| Metrônomo | Web Audio API própria (`utils/metronomo.ts`) | — |
| PWA | vite-plugin-pwa (Workbox, `generateSW`, `registerType: 'autoUpdate'`) | 0.21 |
| Export PDF | jsPDF | 4.2 |
| Export planilha | xlsx (SheetJS) | 0.18 |
| i18n | i18next + react-i18next, app inteiro | 24.2 / 15.4 |
| Ícones | lucide-react | 0.469 |

`chordsheetjs` removida do `package.json` (confirmado 03/08). Não existe `@dnd-kit`.

## 2. Firebase — estrutura real do Firestore

```
users/{uid}                                — perfil (useAuth/usePerfil)
users/{uid}/musicas/{musicaId}              — subcoleção real (useMusicas)
users/{uid}/favoritos/{musicaId}
users/{uid}/historico/{entradaId}
users/{uid}/estatisticas/geral
users/{uid}/medleys/{medleyId}
users/{uid}/playlists/{playlistId}
users/{uid}/espacos/{espacoId}              — mirror local dos espaços do usuário (useEspacos)
espacos/{espacoId}                          — observacoesEnsaio?: Record<string,string>
espacos/{espacoId}/membros/{uid}            — papel: dono/admin/editor/leitor
espacos/{espacoId}/musicas/{musicaId}
comunidade/{musicaComunidadeId}             — coleção FLAT
codigos/{codigo}                            — lookup de convite (get-only, sem list)
```

**⚠️ NOVO — `firestore.rules` NÃO está versionado no repositório.** As regras de segurança reais
só existem no Console do Firebase, fora de controle de versão e fora do nosso alcance de
auditoria via código. Isso impede confirmar por que os listeners de admin (`useComunidade.tsx`,
`pendentes` e `solicitacoesExclusao`) estão retornando `permission-denied` em produção mesmo com
`VITE_ADM_UID` configurado corretamente na Vercel (confirmado pelo Guilherme). **Pendência aberta
prioritária:** trazer o conteúdo real das regras pro repositório antes de tentar corrigir esse bug
às cegas.

Config Firebase em `src/utils/firebase.ts`, chaves hardcoded (projeto `worshipflow-ef662`).

## 3. Variáveis de ambiente client-side (`VITE_*`) — ATUALIZADO, achado crítico

Confirmado por leitura direta do código + console de produção + confirmação do Guilherme no
painel da Vercel:

| Variável | Usada em | Status confirmado em produção |
|---|---|---|
| `VITE_ADM_UID` | `useComunidade.tsx` (gate de admin) | ✅ Configurada |
| `VITE_PRIVADO_ALLOWLIST` | `useCamadaPrivada.ts` (allowlist da camada privada) | Não confirmado nesta sessão |
| `VITE_NAVIDROME_USER` | `useCamadaPrivada.ts` (`subsonicParams`) | 🔴 **NÃO EXISTE na Vercel** — cai em `''` |
| `VITE_NAVIDROME_PASS` | `useCamadaPrivada.ts` (`subsonicParams`) | 🔴 **NÃO EXISTE na Vercel** — cai em `''` |
| `VITE_PRIVADO_PROXY_URL` / `VITE_PROXY_URL` | `useCamadaPrivada.ts` | Não confirmado nesta sessão |

O código não tem fallback de aviso — quando `VITE_NAVIDROME_USER`/`PASS` estão vazias, a chamada
Subsonic sai com `u=&p=` na URL e falha com erro genérico de rede, sem indicar que é problema de
configuração (violação de R1, correção pendente no SI v15 Parte 1).

## 4. Modelo de dado — `Musica` (tipo real, `src/types/index.ts`)

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
  possuiCifra?: boolean;
  solicitacaoExclusao?: boolean;
  dataSolicitacaoExclusao?: string;
}
```
**Confirmado: NÃO existe campo `audioUrl`.** Nenhuma página da camada comercial (Player, Álbuns,
Artistas) tem fonte real de áudio — só a camada privada (Navidrome) toca áudio de verdade. Isso é
decisão de produto em aberto (de onde vem o áudio comercial: upload? Storage? link externo?),
não uma tarefa técnica — ver SI mais recente. Correção aplicada: `usePlayer.tsx` agora avisa via
toast quando `!audioUrl` em vez de falhar silenciosamente (confirmado corrigido).

`Espaco`, `MusicaComunidade` — sem mudança desde v1.1, ver histórico anterior.

## 5. Rotas (`src/App.tsx`)

27 rotas confirmadas, sem mudança de lista desde v1.1 — ver `INVENTARIO_TELAS.md` para status
atual por rota (fonte única, não repetido aqui).

## 6. Camada Privada — Câmera CONFIRMADA correta, Música com bugs novos confirmados

**Câmera (Frigate):** correção da v13 confirmada correta e estável — não mexer.

**Navidrome — bugs reais confirmados via console de produção real (05/08):**
1. **CORS:** `server/proxy.js` não define nenhum header `Access-Control-Allow-Origin`. Toda
   chamada de `worship-flow-jade.vercel.app` é bloqueada pelo navegador antes mesmo de chegar no
   Navidrome.
2. **Credenciais vazias:** ver Seção 3. Mesmo corrigindo o CORS, a chamada falharia por falta de
   `u`/`p` reais.

Os dois bugs se mascaravam um ao outro — corrigir CORS sem corrigir credenciais ainda vai falhar,
e vice-versa. Ambos precisam ser resolvidos juntos (ver SI v15 Parte 1).

## 7. PWA / Service Worker — NOVO, suspeita de causa do "app fica offline sozinho"

`vite.config.ts`: `VitePWA` com `registerType: 'autoUpdate'` e `generateSW`. Esse modo troca o
Service Worker em background sem aviso — suspeita forte (a confirmar após correção) de que isso
está causando o sintoma relatado pelo Guilherme de app "travando offline" até fechar e reabrir a
página, especialmente logo após um novo deploy. Correção proposta no SI v15 Parte 2: trocar para
`registerType: 'prompt'` com aviso visível de atualização disponível, e revisar `runtimeCaching`
para nunca cachear chamadas de API como `NetworkFirst`/`CacheFirst` indevido.

## 8. Redesign Visual — histórico de tentativas

- v13→v14: redesign das 20 telas de referência solicitado, tela por tela com aprovação.
- Execução real: 26 telas alteradas num commit só (`fa1e1aa`), layout antigo **mesclado** com
  elementos novos em vez de substituído.
- **Teste manual real do Guilherme (05/08) reprovou o resultado inteiro** — nenhuma tela bate com
  os mockups de referência; relatado com detalhamento tela por tela (ver
  `INVENTARIO_TELAS.md` e SI v15 Parte 3 para a lista completa de correções literais).
- Regra reforçada no SI v15 e no AGENTS.md v1.2 (regra #13): substituir nunca mesclar, uma tela por
  commit, conferência do Guilherme em produção antes de seguir.

## 9. ⚠️ Lição confirmada nesta sessão: build verde não garante produção funcional

Três bugs reais (CORS, credenciais, Firestore) só apareceram no console de um teste manual real em
produção — nenhum deles quebra `tsc -b` nem `vite build`. Reforça, de forma concreta e não mais
teórica, a regra já registrada (L14 do `GESTAO_FERRAMENTAS.md`): build limpo é condição necessária,
nunca suficiente, para considerar algo pronto.

## 10. Convenções obrigatórias (sem mudança)
- Nomes em português. `export default NomeDaPagina`. `EstadoVazio` usa prop `texto`.
- `useTransposicao()` só tem funções puras. Sistema visual Aurora em `src/index.css`.
- Ambiente: CachyOS, Fish Shell, Kate. `touch`/`truncate -s 0`/`kate`.
- Erro de infraestrutura/configuração nunca renderiza como "nenhum dado encontrado".
- Redesign = substituir, nunca mesclar (Seção 8).

---
*ARQUITETURA.md v1.2 | Claude (Gestão) | 05/Ago/2026 — atualizado por inspeção direta do código
real + console de produção, não por relatório de terceiros.*
