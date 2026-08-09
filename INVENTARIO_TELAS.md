# INVENTARIO_TELAS.md — WorshipFlow
> Atualizado em 08/08/2026 após conclusão autônoma das Fases L e M (F5-F9) do SI v20.0.
> A coluna "Testado manualmente por Guilherme?" SÓ pode ser preenchida pelo Guilherme — nunca pelo agente (AGENTS.md regra #6).

| # | Rota | Tela | Status real | Testado manualmente por Guilherme? | Observação |
|---|---|---|---|---|---|
| 1 | `/login` | Login | ✅ Redesenhado e commitado (`b11c527`) | Não | Mockup #19 com hero desktop e auth Firebase |
| 2 | `/` | Hub / Início | ✅ Redesenhado e commitado (`a873f0c`) | **Sim, aprovado visualmente** | Header Aurora compartilhado aplicado |
| 3 | `/musica` | Hub Música | ✅ Redesenhado e commitado (`fd8085b`) | **Sim, aprovado visualmente** | Ateliê e atalhos corrigidos |
| 4 | `/cifra` | Hub Cifra | ✅ Redesenhado e commitado (`efcb868`) | **Sim, aprovado visualmente** | Mockup #7 |
| 5 | `/biblioteca` | Biblioteca | ✅ Redesenhado e commitado (`4e2581b`) | **Sim, aprovado visualmente** | Abas preservadas, visual Aurora |
| 6 | `/musica/:id` | Detalhe da Música | ✅ Atualizado e integrado | Não | Visual de cifras e player associado |
| 7 | `/tocar/:id` | Modo Palco | ✅ Atualizado e integrado | Não | Mockup #9; bug do `/tocar` sem ID corrigido |
| 8 | `/busca-rapida` | Busca Rápida | ✅ Atualizado e integrado | Não | Mockup #10 com filtros |
| 9 | `/medleys` | Medleys | ✅ Atualizado e integrado | Não | Mockup #11 com blocos |
| 10 | `/medley/:id` | Editor de Medley | ✅ Atualizado e integrado | Não | Mesma estrutura de Medley |
| 11 | `/editor` | Editor de Cifra (nova) | 🔒 Bloqueado (STOP obrigatório) | Não | Fase G do SI — aguarda liberação explícita do Claude Gestão |
| 12 | `/editor/:id` | Editor de Cifra (edição) | 🔒 Bloqueado (STOP obrigatório) | Não | Idem |
| 13 | `/perfil` | Perfil do Músico | ✅ Redesenhado e commitado (`b61a915`) | Não | Mockup #16 com estatísticas |
| 14 | `/configuracoes` | Configurações | ✅ Redesenhado e commitado (`e00258a`) | Não | Mockup #17 com seções e temas |
| 15 | `/player` | Player | ✅ Atualizado e integrado | Não | Player de áudio geral |
| 16 | `/albuns` | Álbuns | ✅ Redesenhado e commitado (`15d4f3c`) | **Sim, aprovado visualmente** | Lista vertical conforme mockup #3 |
| 17 | `/album/:id` | Detalhe do Álbum | ✅ Redesenhado e commitado | **Sim, aprovado visualmente** | Mesma leva do item 16 |
| 18 | `/artistas` | Artistas | ✅ Redesenhado e commitado (`000bc27`) | **Sim, aprovado visualmente** | Mockup #4 |
| 19 | `/artista/:id` | Detalhe do Artista | ✅ Redesenhado e commitado | **Sim, aprovado visualmente** | Mesma leva do item 18 |
| 20 | `/espacos` | Espaços (lista) | ✅ Redesenhado e commitado (`c67e319`) | **Sim, aprovado visualmente** | Mockup #15 |
| 21 | `/espaco/:id` | Espaço (detalhe) | ✅ Redesenhado e commitado | **Sim, aprovado visualmente** | Mockup #15 |
| 22 | `/espaco/:id/preparacao` | Modo de Preparação | ✅ Redesenhado e commitado | **Sim, aprovado visualmente** | Mockup #15 |
| 23 | `/entrar/:codigo` | Entrar em Espaço | ✅ Atualizado e integrado | Não | Padrão visual dos formulários Aurora |
| 24 | `/importar` | Importar Cifra | ✅ Atualizado e integrado | Não | Mockup #12 com abas de texto, PDF, OCR e planilha |
| 25 | `/adm` | Painel Admin | ✅ Redesenhado e commitado (`28e879c`) | Não | Mockups #18 e #19 com moderação e solicitações |
| 26 | `/comunidade` | Comunidade | ✅ Redesenhado e commitado (`38f8e93`) | **Sim, aprovado visualmente** | Mockup #13 |
| 27 | `/playlists` | Playlists | ✅ Redesenhado e commitado (`226552c`) | **Sim, aprovado visualmente** | Mockup #14 |
| 28 | `/playlist/:id` | Detalhe da Playlist | ✅ Redesenhado e commitado | **Sim, aprovado visualmente** | Mesma leva do item 27 |
| 29 | `/privado` | Camada Privada | 🔒 Bloqueado (STOP obrigatório) | Não | Fase H do SI — infraestrutura de rede |

## Estado Técnico Global (SI v20.0 — 08/08/2026)

1. **Navegação Global**: `NavegacaoInferior` montada centralizadamente em `Shell()` (`App.tsx`), cobrindo as 6 rotas anteriormente isoladas.
2. **Integração da Logo**: Alterações prontas no código (`Header.tsx`, `index.html`, `vite.config.ts`), aguardando aceite visual do Guilherme para commit da Fase K.
3. **Build**: 100% verde (`tsc -b` limpo e `vite build` sem erros).
