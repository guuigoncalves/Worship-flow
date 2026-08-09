# INVENTARIO_TELAS.md — WorshipFlow
> Checkpoint 08/08/2026, noite — cota do Claude (Antigravity) esgotada no meio da Fase P do
> SI v22.0. Atualizado por Claude Gestão a partir dos commits confirmados e relatórios recebidos.
> A coluna "Testado manualmente por Guilherme?" SÓ pode ser preenchida pelo Guilherme — nunca pelo
> agente (AGENTS.md regra #6).

| # | Rota | Tela | Status real | Testado manualmente por Guilherme? | Observação |
|---|---|---|---|---|---|
| 1 | `/login` | Login | ✅ Redesenhado e commitado (`b11c527`) | Não | Verificação visual automatizada não confirmada. Fase S (simplificar pra Google/sem login) ainda não executada |
| 2 | `/` | Hub / Início | ✅ Redesenhado e commitado | **Sim, aprovado visualmente** | — |
| 3 | `/musica` | Hub Música | ✅ Redesenhado e commitado | **Sim, aprovado visualmente** | — |
| 4 | `/cifra` | Hub Cifra | ✅ Redesenhado e commitado | **Sim, aprovado visualmente** | — |
| 5 | `/biblioteca` | Biblioteca | ✅ Redesenhado e commitado | **Sim, aprovado visualmente** | — |
| 6 | `/musica/:id` | Detalhe da Música | 🟡 Código pronto (Fase M1), build verde, **não commitado** | Não | Travou em STOP por falta de verificação visual (bug de sessão da Fase P) |
| 7 | `/tocar/:id` | Modo Palco | ⚪ Não iniciado (Fase M3) | Não | ⚠️ Relatório anterior alegou "já pronto" sem screenshot — não confiar, verificar do zero |
| 8 | `/busca-rapida` | Busca Rápida | ⚪ Não iniciado (Fase M4) | Não | — |
| 9 | `/medleys` | Medleys | ⚪ Não iniciado (Fase M6) | Não | — |
| 10 | `/medley/:id` | Editor de Medley | ⚪ Não iniciado (Fase M6) | Não | — |
| 11 | `/editor` | Editor de Cifra (nova) | 🔒 Bloqueado (STOP obrigatório) | Não | Fase G — aguarda liberação explícita do Claude Gestão |
| 12 | `/editor/:id` | Editor de Cifra (edição) | 🔒 Bloqueado (STOP obrigatório) | Não | Idem |
| 13 | `/perfil` | Perfil do Músico | 🟡 Redesenhado e commitado (`b61a915`), **verificação visual não confirmada** | Não | Bug conhecido: botões sem ícone (só ponto) — correção pendente (Fase R do SI v22, não executada) |
| 14 | `/configuracoes` | Configurações | ✅ Redesenhado e commitado (`e00258a`) | Não | Verificação visual não confirmada explicitamente |
| 15 | `/player` | Player | ⚪ Não iniciado (Fase M2) | Não | — |
| 16 | `/albuns` | Álbuns | ✅ Redesenhado e commitado | **Sim, aprovado visualmente** | — |
| 17 | `/album/:id` | Detalhe do Álbum | ✅ Redesenhado e commitado | **Sim, aprovado visualmente** | — |
| 18 | `/artistas` | Artistas | ✅Redesenhado e commitado | **Sim, aprovado visualmente** | — |
| 19 | `/artista/:id` | Detalhe do Artista | ✅ Redesenhado e commitado | **Sim, aprovado visualmente** | — |
| 20 | `/espacos` | Espaços (lista) | ✅ Redesenhado e commitado | **Sim, aprovado visualmente** | — |
| 21 | `/espaco/:id` | Espaço (detalhe) | ⚪ Não iniciado | Não | — |
| 22 | `/espaco/:id/preparacao` | Modo de Preparação | ⚪ Não iniciado | Não | — |
| 23 | `/entrar/:codigo` | Entrar em Espaço | ⚪ Não iniciado (Fase M7) | Não | — |
| 24 | `/importar` | Importar Cifra | ⚪ Não iniciado (Fase M5) | Não | — |
| 25 | `/adm` | Painel Admin | ✅ Redesenhado e commitado (`28e879c`) | Não | Bug conhecido: botões sem ícone — status da correção (Fase N do SI v21) não confirmado por relatório |
| 26 | `/comunidade` | Comunidade | ✅ Redesenhado e commitado | **Sim, aprovado visualmente** | — |
| 27 | `/playlists` | Playlists | ✅ Redesenhado e commitado | **Sim, aprovado visualmente** | — |
| 28 | `/playlist/:id` | Detalhe da Playlist | ✅ Redesenhado e commitado | **Sim, aprovado visualmente** | — |
| 29 | `/privado` | Camada Privada | 🔒 Bloqueado (STOP obrigatório) | Não | Fase H — infraestrutura de rede |

## Navegação global — RESOLVIDA
`NavegacaoInferior` montada no `Shell` (`752130f`), estilo Aurora corrigido no mobile (`69f1cd9`,
**confirmado visualmente pelo Guilherme**). As 6 rotas antes isoladas estão navegáveis — testado
parcialmente no PC pelo Guilherme, funcionando.

## Pendências transversais

| Item | Status | Observação |
|---|---|---|
| `firestore.rules` | ✅ Resolvido | Versionado, corrigido, aplicado em produção |
| Logo oficial | 🟡 **Confirmada visualmente pelo Guilherme**, commit liberado desde SI v21 | Hash do commit não confirmado nos relatórios recebidos — checar `git log` na retomada antes de assumir feito |
| Regressão: nome do app sumiu do Header | 🔴 **Novo, não corrigido** | Reportado pelo Guilherme após Fases O/M1. Fase Q (urgente) do SI v22, não executada — sessão travou antes de chegar nela |
| Bug de ícones (Admin e Perfil) | 🟡 Parcial/não confirmado | Admin: correção pedida (Fase N v21), execução não confirmada. Perfil: mesmo bug, correção pedida como Fase R (v22), não executada |
| Setup de sessão autenticada (Fase P, v22) | 🔴 **Travado, sem solução** | Login anônimo via Playwright não navega para fora de `/login` — causa não identificada quando a cota acabou |
| Login simplificado (Google / sem login) | ⚪ Pedido (Fase S, v22), não executado | — |
| Fase 19 — tema/cor/layout customizável | ⚪ Bloqueada | Aguarda redesign 100% aprovado |

---
*Atualizado por Claude Gestão, 08/08/2026, checkpoint de pausa por esgotamento de cota do Claude*
*usado internamente pelo Antigravity. Nenhum arquivo de produto foi alterado após o commit*
*`69f1cd9` — a tentativa da Fase P só criou um script de diagnóstico, sem impacto no app.*
