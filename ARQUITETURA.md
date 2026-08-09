# ARQUITETURA.md — WorshipFlow
> v1.6 atualiza v1.4 (checkpoint 07/08) com o estado real no ponto de pausa da sessão de
> 08/08/2026, à noite: bateu a cota do Claude usado pelo Antigravity no meio da execução do
> SI v22.0, na Fase P (setup de sessão autenticada para screenshots). Nenhum código da v22 foi
> commitado ainda — a sessão travou em debug, sem chegar a alterar nenhum arquivo de produto.

---

## 1. Stack real — sem mudança de v1.4

## 2. Ferramental de execução — ATUALIZADO nesta revisão
Antigravity segue como executor da frente visual. **Nota de cota (nova, 08/08 noite):** a cota do
modelo Claude usado internamente pelo Antigravity nesta conta se esgotou durante a Fase P do
SI v22.0. Diferente da pausa anterior (cota do browser subagent/Playwright, 07/08), desta vez é a
cota do próprio modelo de raciocínio — o agente não consegue continuar gerando código até resetar
ou até trocar de conta/modelo.

## 3-7. Sem mudança de v1.4 (Firestore, modelo de dado, rotas, Camada Privada, PWA/SW)

## 8. Redesign Visual — ESTADO REAL NO PONTO DE PAUSA (08/08/2026, noite)

### Commitado e aprovado (sem mudança da v1.4)
9 telas originais: Início, Música, Hub Cifra, Espaços, Biblioteca, Álbuns, Artistas, Playlists,
Comunidade.

### Commitado nesta leva (SI v20/v21), com hash confirmado
| Fase | Tela/mudança | Hash | Verificação visual |
|---|---|---|---|
| L | `NavegacaoInferior` montada no `Shell` + fix `navigate('/tocar')` → `/player` | `752130f` | Confirmada por leitura de código, não por clique real — pendente teste manual do Guilherme quando houver tempo |
| F5 | Perfil (`/perfil`) — redesign mockup #16 | `b61a915` | ⚠️ Screenshot automatizado falhou (caiu em `/login`) — **não confirmada visualmente**, código presumido correto mas não provado |
| F6 | Configurações (`/configuracoes`) — redesign mockup #17 | `e00258a` | Build verde, verificação visual não confirmada explicitamente no relatório |
| F7 | Painel Admin (`/adm`) — redesign mockups #18/#19 | `28e879c` | Build verde; **bug conhecido**: botões de ação sem ícone (só um ponto), reportado pelo Guilherme, correção pendente (era a Fase N do SI v21, execução não confirmada nos relatórios recebidos) |
| F8 | Login (`/login`) — redesign mockup #19 | `b11c527` | Build verde, verificação visual não confirmada |
| O | Estilo Aurora na `NavegacaoInferior` mobile | `69f1cd9` | ✅ **Confirmada pelo Guilherme via screenshot real** (fundo escuro vítreo, roxo no ativo) |

### Correções pendentes de confirmação de execução (pedidas na SI v21, sem relatório de conclusão recebido)
- **Fase N (v21)** — ícones ausentes nos botões do Painel Admin. Guilherme reportou depois que o
  bug **persiste** em `/perfil` também — ou seja, mesmo se a Fase N do Admin tiver sido feita, o
  mesmo problema não foi replicado/corrigido no Perfil. Está reincluída como Fase R no SI v22.
- **Regressão nova, ainda não corrigida**: o nome/logo do app sumiu do topo do Header, notada pelo
  Guilherme após as Fases O/M1. Suspeita: efeito colateral da limpeza de código duplicado via `sed`
  em `DetalheMusica.tsx` (Fase M1) ou algo quebrado no `Shell`/`Header.tsx` entre as Fases L-O.
  Incluída como Fase Q (urgente) no SI v22 — **não executada ainda**, sessão pausou antes de
  chegar nela.

### Logo oficial — CONFIRMADA visualmente pelo Guilherme, commit deveria estar liberado
Guilherme confirmou em `localhost:5175`: logo sem fundo, correta. SI v21 liberou o commit da
Fase K logo no início da execução daquela SI. **Não há confirmação explícita nos relatórios
recebidos de que esse commit de fato aconteceu** — hash não identificado em nenhum log visto até
agora. Verificar com `git log --oneline --all -- src/assets/logo.png Header.tsx index.html` na
retomada, antes de assumir que está commitado.

### Lacuna de navegação global — RESOLVIDA (não é mais lacuna)
Diagnóstico do agente confirmou: `NavegacaoInferior` já existia completa e fiel aos mockups, só
não estava montada no `Shell`. Montada na Fase L (`752130f`). As 6 rotas (`/perfil`,
`/configuracoes`, `/comunidade`, `/playlists`, `/espacos`, `/adm`) estão navegáveis. Confirmado
parcialmente pelo Guilherme (abriu no PC, funcionou). Item fechado, não é mais pendência aberta.

### 🔴 NOVO — Sessão travou na Fase P do SI v22 (setup de autenticação automatizada)
Não existe conta de teste documentada no projeto. O agente tentou usar o fluxo de "Continuar sem
login" (auth anônima do Firebase, `signInAnon`) via Playwright pra gerar uma sessão reutilizável
(`storageState`) e parar de precisar de login manual do Guilherme a cada screenshot. O clique no
botão não estava navegando pra fora de `/login` — investigação do `useAuth.tsx` em andamento
quando a cota do Claude (Antigravity) se esgotou. **Nenhum arquivo de produto foi alterado nesta
tentativa** — só um script de diagnóstico (`.auth/`, adicionado ao `.gitignore`) e leitura de
código. Nada a reverter.

### Telas ainda NÃO tocadas — Fase M do SI v22 (M1 parcialmente pronto)
- **M1 — Detalhe da Música (`/musica/:id`)**: código já reescrito seguindo mockup #8, `tsc -b` e
  `vite build` limpos, **mas NÃO commitado** — travou em STOP parcial por falta de verificação
  visual (mesmo problema de sessão da Fase P). Ao retomar: ou completar a Fase P primeiro, ou
  pedir confirmação visual manual do Guilherme uma vez, então commitar.
- **M2-M7 — não iniciadas**: Player (`/player`), Modo Palco (`/tocar/:id` — cuidado, relatório
  anterior alegou "já pronto" sem prova, não confiar sem screenshot real), Busca Rápida
  (`/busca-rapida`), Importar (`/importar`), Medleys (`/medleys`, `/medley/:id`), Entrar em Espaço
  (`/entrar/:codigo`).
- **Fase S (SI v22, não iniciada)**: simplificar `/login` para apenas "Entrar com Google" e
  "Continuar sem login" (remover e-mail/senha da UI, manter o hook se já existir).

### Fases G-J — continuam corretamente intocadas (STOP obrigatório)
Editor de Cifra, Camada Privada/infraestrutura de rede, `firestore.rules`, Fase 19 do produto.

## 9-10. Sem mudança de v1.4

---
*ARQUITETURA.md v1.6 | Claude (Gestão) | 08/Ago/2026 — checkpoint de pausa por esgotamento de*
*cota do Claude (Antigravity), meio da Fase P do SI v22.0*
