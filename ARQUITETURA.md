# ARQUITETURA.md — WorshipFlow
> v1.3 atualiza v1.2 (05/08/2026) com: `firestore.rules` corrigido e aplicado em produção
> (06/08/2026), causa raiz da cor amarela identificada e corrigida (variável `--primaria`), bug de
> duplicação do componente de saudação identificado (sem `Header` compartilhado — texto repetido em
> 3 arquivos), e introdução do Antigravity como agente executor para a etapa de redesign visual,
> substituindo/complementando o fluxo Google AI Studio + Kilo Code nessa frente específica.

---

## 1. Stack real (confirmado no `package.json`, sem mudança de v1.2)

| Camada | Tecnologia | Versão |
|---|---|---|
| Frontend | React + Vite + TypeScript | React 19, Vite 6, TS ~5.7 |
| Estilo | Tailwind CSS 3 + CSS Variables | — |
| Roteamento | React Router DOM | 6.28 |
| Backend | Firebase (Auth + Firestore) | firebase 11.10 |
| Player de áudio | Howler.js | 2.2.4 |
| Metrônomo | Web Audio API própria (`utils/metronomo.ts`) | — |
| PWA | vite-plugin-pwa (Workbox, `generateSW`, `registerType: 'prompt'`) | 0.21 |
| Export PDF | jsPDF | 4.2 |
| Export planilha | xlsx (SheetJS) | 0.18 |
| i18n | i18next + react-i18next | 24.2 / 15.4 |
| Ícones | lucide-react | 0.469 |

`chordsheetjs` e `@dnd-kit` continuam ausentes, sem mudança.

## 2. Ferramental de execução — ATUALIZADO

| Etapa | Ferramenta | Papel |
|---|---|---|
| Governança/decisão | Claude Gestão (este chat) | Dá o plano, revisa segurança/schema, não executa código |
| Backend/infra (bugs técnicos, regras, proxy) | Google AI Studio + Kilo Code (fluxo original) | Segue funcionando aqui enquanto estiver eficaz — sem motivo pra trocar o que não está quebrado |
| Redesign visual (frontend, telas) | **Antigravity** (novo, a partir de 06/08/2026) | Assume o papel combinado de "Dev + IDE": recebe o plano completo, comanda a si mesmo, executa, se autoverifica por screenshot comparado ao mockup, avança de fase sem round-trip obrigatório pelo Claude Gestão |

Modelos dentro do Antigravity e quando usar cada um: ver AGENTS.md v1.3, regra #16.

**Por que a troca:** o gargalo identificado nas últimas rodadas não era o "Dev" ser ruim, era o
pipeline ser cego — nenhuma ferramenta anterior via o resultado renderizado antes de reportar
"pronto". Antigravity tem testagem de browser embutida e reporta via screenshots, o que ataca
diretamente a causa raiz dos relatórios "testado" que não batiam com a realidade.

## 3. Firebase — estrutura real do Firestore (confirmado por leitura direta do zip, 06/08/2026)

```
users/{uid}                                — perfil
users/{uid}/musicas/{musicaId}              — subcoleção privada (useMusicas)
users/{uid}/favoritos/{musicaId}
users/{uid}/historico/{entradaId}
users/{uid}/estatisticas/geral
users/{uid}/medleys/{medleyId}
users/{uid}/playlists/{playlistId}
users/{uid}/espacos/{espacoId}              — mirror local (useEspacos)
espacos/{espacoId}                          — donoUid, codigo, observacoesEnsaio?
espacos/{espacoId}/membros/{uid}            — papel: dono/admin/editor/leitor
espacos/{espacoId}/musicas/{musicaId}
comunidade/{musicaComunidadeId}             — coleção FLAT, campo de autor real: enviadaPor
codigos/{codigo}                            — campo real: espacoId, criadoPor, ativo
```

**⚠️ Nomes de coleção que NÃO existem, apesar de terem sido reportados como existentes em algum
momento — não confiar em relato, só em leitura direta do código:** `usuarios/`, `cifras/`,
`espacos/{id}/repertorios`, `espacos/{id}/anotacoes`, `solicitacoesComunidade/`. Confirmado por
`grep -rn "collection(db|doc(db" src/hooks/*.tsx` em 06/08/2026.

### `firestore.rules` — RESOLVIDO (06/08/2026)
Estava fora de controle de versão até 05/08. Nessa data foi escrito pelo Claude Gestão a partir de
leitura direta dos hooks, corrigindo uma tentativa anterior que usava `allow read, write: if
isAuthenticated()` como regra curinga (abria qualquer documento pra qualquer usuário logado — furo
de privacidade real, não só bug de permissão). Versão final:
- `users/{uid}` e subcoleções: só o dono.
- `espacos`: leitura/edição por papel real lido de `/membros`; delete só dono/admin do espaço.
- `comunidade`: create só como `pendente` e só o remetente; update/delete só admin
  (`Fy360vBRHeSmuMtzNJzn4jwZAKD2`).
- `codigos`: get-only sem list; create valida contra `donoUid` do doc de `espacos` (não contra
  `/membros`, que ainda não existe no instante da criação do espaço).
- Fallback nega tudo não listado.
Aplicado (commit `f460e94`), publicado no Console. **Pendente de confirmação com evidência real**
(print de erro, não só relato) dos testes de permissão cruzada entre contas — ver SI vigente.

## 4. Modelo de dado — `Musica`, `MusicaComunidade`, `Espaco` (sem mudança de campo desde v1.2)

Campo de autor real em `MusicaComunidade` é **`enviadaPor`** (confirmado em `types/index.ts`),
não `autorUid` como chegou a ser reportado incorretamente. `Espaco.donoUid` existe e é usado nas
regras de segurança (Seção 3). Resto sem mudança — ver v1.2 para os tipos completos.

## 5. Rotas (`src/App.tsx`)
27 rotas, sem mudança de lista — ver `INVENTARIO_TELAS.md`.

## 6. Camada Privada — sem mudança de mérito desde v1.2
Câmera confirmada correta, não mexer. Navidrome: CORS corrigido, credenciais cadastradas na Vercel
pelo Guilherme. Acesso no celular depende do app Tailscale ativo — confirmado como causa da falha
de acesso durante teste em 05/08 (não é bug de código). **Proposta de Cloudflare Tunnel para
expor o Navidrome via HTTPS público está REGISTRADA, NÃO AUTORIZADA** — decisão de infraestrutura
da Camada Privada, pendente de decisão explícita do Claude Gestão (AGENTS.md regra #7).

## 7. PWA / Service Worker — RESOLVIDO
`registerType: 'prompt'` aplicado, `NetworkOnly` nas rotas de API (`/proxy`, `/n8n`,
`firestore.googleapis.com`). Reportado como corrigido; comportamento "offline sozinho" não
reapareceu nos relatos mais recentes — considerar fechado até evidência em contrário.

## 8. Redesign Visual — estado atual (atualiza Seção 8 da v1.2)

- **Causa raiz da cor amarela identificada e corrigida**: variável `--primaria` em
  `src/index.css` estava `#E4B429`, alterada para `#8B5CF6` (roxo Aurora). Resolver na variável
  central foi a abordagem certa — evita ter que caçar classe `amber-*`/`yellow-*` espalhada pelo
  código, e deve ser o padrão para qualquer ajuste de cor futuro.
- **Barra de navegação inferior antiga removida** da Tela Inicial — confirmado nos prints de
  produção enviados pelo Guilherme.
- **Bug de duplicação identificado**: não existe componente `Header`/`Saudacao` compartilhado — o
  texto "Olá, Guilherme" está duplicado em `pages/Inicio.tsx`, `pages/Musica.tsx` e
  `pages/Cifra.tsx`. Fix precisa tocar os 3 arquivos; extração pra componente reusável é
  recomendada mas não obrigatória na rodada atual.
- **Telas ainda pendentes de redesign**: Hub Cifra (`/cifra`), Espaços (`/espacos` — bug técnico
  do loop já resolvido, falta só visual), Biblioteca, e demais da lista original — ver SI vigente
  para ordem e detalhamento.
- Regra de execução revisada: ver AGENTS.md v1.3 regra #13 — uma tela por commit continua, mas
  avanço entre telas agora é autônomo (autoverificação por screenshot substitui o checkpoint
  humano intermediário).

## 9. Lição confirmada: build verde não garante produção funcional (mantida da v1.2)
Sem mudança de princípio. Reforçada pela descoberta do furo de segurança nas regras do Firestore,
que também não quebrava build nenhum.

## 10. Convenções obrigatórias (sem mudança)
- Nomes em português. `export default NomeDaPagina`. `EstadoVazio` usa prop `texto`.
- `useTransposicao()` só tem funções puras. Sistema visual Aurora em `src/index.css`.
- Ambiente: CachyOS, Fish Shell, Kate. `touch`/`truncate -s 0`/`kate`.
- Erro de infraestrutura/configuração nunca renderiza como "nenhum dado encontrado".
- Redesign = substituir, nunca mesclar (Seção 8).
- Nome de coleção/campo do Firestore: sempre confirmar por leitura direta do código-fonte antes de
  escrever qualquer regra de segurança ou documentação — relato de terceiro já causou erro real
  mais de uma vez neste projeto (Seção 3).

---
*ARQUITETURA.md v1.3 | Claude (Gestão) | 06/Ago/2026*
