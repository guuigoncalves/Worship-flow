# INVENTARIO_TELAS.md — WorshipFlow
> Atualizado em 13/08/2026, a partir de varredura direta do código-fonte (zip do projeto,
> `git log`, `git diff origin/main..HEAD`), não de relatório de agente/dev. A coluna "Testado
> manualmente por Guilherme?" SÓ pode ser preenchida pelo Guilherme (AGENTS.md regra #6) — aqui
> reflete apenas confirmações reais que já aconteceram (prints/vídeos reais enviados).

| # | Rota | Tela | Status real (confirmado no código) | Testado manualmente por Guilherme? | Observação |
|---|---|---|---|---|---|
| 1 | `/login` | Login | ✅ Código presente e commitado | **Sim** | Só Google + "Continuar sem login" |
| 2 | `/` | Hub / Início | ✅ Código presente e commitado; **Header revertido ao padrão** (violação de fase bloqueada corrigida nesta sessão — ver ARQUITETURA.md v1.10 Seção 2); card "Próximo Culto" restaurado; nova barra de navegação secundária em teste; capas reais em "Mais Ouvidas"/"Cifras em Destaque" | Não (versão desta sessão) | Widget de Metrônomo/Atividade ainda pendente — produto, não urgente |
| 3 | `/musica` | Hub Música | ✅ Código presente e commitado | **Sim** | Dev reporta faltar card "Tocando Agora" e carrossel de álbuns — pendência de produto |
| 4 | `/cifra` | Hub Cifra | ✅ Código presente e commitado, grid responsivo corrigido | Não | Botão Importar não vaza mais a largura (confirmado no diff) |
| 5 | `/biblioteca` | Biblioteca | ✅ Código presente e commitado | Não | — |
| 6 | `/musica/:id` | Detalhe da Música | ✅ Código presente e commitado, **confirmado por print real** | **Sim** | — |
| 7 | `/tocar/:id` | Modo Palco | 🟡 Sem alteração desta leva | Não | Nunca confirmado por print real com música tocando |
| 8 | `/busca-rapida` | Busca Rápida | ✅ Código presente e commitado, **confirmado por print** | **Sim** | — |
| 9 | `/medleys` | Medleys | ✅ Código presente e commitado, **confirmado por print** | **Sim** | — |
| 10 | `/medley/:id` | Editor de Medley | ✅ **NOVO nesta leva** — código presente e commitado (`bc2a281`) | Não | Mockup #11, usa `useMedleys` real, `EstadoVazio` — nunca visto por print |
| 11 | `/editor` | Editor de Cifra (nova) | 🔒 Bloqueado (STOP obrigatório) | Não | Fase G — confirmado sem diff nesta sessão |
| 12 | `/editor/:id` | Editor de Cifra (edição) | 🔒 Bloqueado (STOP obrigatório) | Não | Idem |
| 13 | `/perfil` | Perfil do Músico | ✅ Código presente e commitado | **Sim** | — |
| 14 | `/configuracoes` | Configurações | ✅ Código presente e commitado | Não | — |
| 15 | `/player` | Player | ✅ Código presente e commitado, refino de glow/capa (`dc15fa6`) | **Sim** (versão anterior) | Nova versão desta leva ainda não vista por print; dev pede seletor capa/artista/letra/cifra como próxima feature |
| 16 | `/albuns` | Álbuns | ✅ Código presente e commitado | **Sim** | — |
| 17 | `/album/:id` | Detalhe do Álbum | ✅ Código presente e commitado | **Sim** | — |
| 18 | `/artistas` | Artistas | ✅ Código presente e commitado | **Sim** | — |
| 19 | `/artista/:id` | Detalhe do Artista | ✅ Código presente e commitado | **Sim** | — |
| 20 | `/espacos` | Espaços (lista) | ✅ Código presente e commitado | **Sim** | — |
| 21 | `/espaco/:id` | Espaço (detalhe) | ✅ **NOVO nesta leva** — código presente e commitado (`1afc324`) | Não | Mockup #15: header, 4 abas, membros com papéis, código de convite — usa `useEspacoDetalhe`/`useEspacos` reais, `EstadoVazio` — nunca visto por print |
| 22 | `/espaco/:id/preparacao` | Modo de Preparação | ✅ **NOVO nesta leva** — código presente e commitado (`a88596b`) | Não | Mockup #15: numeração, reordenação ↑/↓, anotações de ensaio — usa hooks reais — nunca visto por print |
| 23 | `/entrar/:codigo` | Entrar em Espaço | ✅ Código presente e commitado, **confirmado por print** | **Sim** | — |
| 24 | `/importar` | Importar Cifra | ✅ Código presente e commitado, duplicação de formulário removida, parser de PDF corrigido | Não | Link de entrada em `Cifra.tsx` confirmado funcional |
| 25 | `/adm` | Painel Admin | ✅ Código presente e commitado | Não | — |
| 26 | `/comunidade` | Comunidade | ✅ Código presente e commitado | **Sim** | — |
| 27 | `/playlists` | Playlists | ✅ Código presente e commitado | **Sim** | — |
| 28 | `/playlist/:id` | Detalhe da Playlist | ✅ Código presente e commitado | **Sim** | — |
| 29 | `/privado` | Camada Privada | 🔒 Bloqueado (STOP obrigatório) | Não | Fase H — confirmado sem diff nesta sessão |

**Contagem real (13/08/2026)**: 27 de 29 rotas navegáveis com código de redesign presente e
commitado (todas exceto Modo Palco, que não teve alteração nesta leva, e as 2 bloqueadas por
decisão de arquitetura). Das 27, apenas as marcadas "Sim" foram confirmadas por print/vídeo real
— a maioria das telas novas ou refinadas nesta leva (Espaço, Preparação, Medley, Player refinado)
**ainda não foi vista pelo Guilherme**.

## MiniPlayer — status consolidado (18/08)
Passou por várias tentativas de redesenho nas sessões de 15/08 e 16/08 (nenhuma fiel ao original).
Em 18/08, Claude Gestão recuperou o código-fonte EXATO do design original do Guilherme direto do
histórico do git e usou ele como base, corrigindo só os 3 bugs reais (dado inventado, tempo
estático, sem clique). Confirmado pelo Guilherme como correto. Handler de clique pra abrir
`/player` funcional, anterior/próxima usando a fila real.

## `/importar` sem ponto de entrada — RESOLVIDO
Confirmado no código: `Cifra.tsx` agora tem botão "Importar" no grid, ao lado de "Nova Cifra",
navegando para `/importar`. Duplicação de campos no formulário de upload também foi corrigida
(`Importar.tsx`, `pdfImporter.ts`).

## Pendências transversais
| Item | Status | Observação |
|---|---|---|
| `firestore.rules` | ✅ Sem mudança | Confirmado sem diff nesta sessão |
| Paleta Aurora global | ✅ Atualizada via variável central | `72e249f` — fundo obsidiana, bordas, texto — pendente de aprovação visual |
| Campo `tom` ausente no tipo `FaixaAudio` | ✅ Resolvido (2ª vez) | `daf91ec` — não sobreviveu ao histórico da sessão anterior, reaplicado |
| Assets de logo/favicon nunca versionados | ✅ Resolvido (2ª vez) | `c393428` — mesma lacuna do commit `f32f3f8`, arquivos binários nunca tinham sido dados `git add` |
| Push pro GitHub | 🟡 **Pendente — depende do Guilherme** | Todos os commits desta sessão estão só no zip local devolvido, não em `origin/main` ainda |
| Verificação visual das telas novas/refinadas | 🟡 **Pendente — depende do Guilherme** | Espaço, Preparação, Medley — nunca vistas por print/vídeo real |
| Navegação global | ✅ Resolvida — dock (`NavegacaoInferior`) é a navegação oficial | Barra secundária (`Navegacao.tsx`) existe no código, não montada em lugar nenhum — futuro em aberto |
| Service Worker preso em versão antiga | ✅ Resolvido (`registerType: autoUpdate`) | Explica boa parte dos "código novo não funciona" — pedir 1 hard-reload/reabertura do app |
| Header.tsx com link não autorizado pra `/privado` | ✅ Revertido nesta sessão | Violação de fase bloqueada, corrigida — ver ARQUITETURA.md v1.10 Seção 2 |
| Card "Próximo Culto" sumiu do Início | ✅ Restaurado nesta sessão | Perdido durante reestruturação com a nova barra de navegação secundária |
| Barra de navegação secundária (Início) | 🟡 Em teste pelo Guilherme | `components/layout/Navegacao.tsx`, cores padronizadas pra Aurora nesta sessão |
| Modo Palco (`/tocar/:id`) | 🟡 Sem alteração, sem confirmação | Segue como estava — nunca visto por print real |
| Player: seletor capa/artista/letra/cifra | ⚪ Feature nova solicitada | Não é bug, é pendência de produto pra próxima leva |
| Fase 19 — tema/cor/layout customizável | ⚪ Bloqueada | Aguarda redesign considerado suficiente |

---
*Reconstruído por Claude Gestão, 13/08/2026, a partir de varredura direta do código-fonte —*
*substitui qualquer versão anterior escrita por relatório de agente/dev.*
