# INVENTARIO_TELAS — WorshipFlow

> Arquivo de controle de telas do projeto.
> Coluna "Status real" reflete o estado atual do código.
> Coluna "Testado manualmente por Guilherme?" indica se o teste manual em produção foi feito.

| # | Tela | Rota | Arquivo | Status real | Testado manualmente por Guilherme? |
|---|------|------|---------|-------------|-------------------------------------|
| 1 | Início (Hub) | `/` | `src/pages/Inicio.tsx` | 🟡 Código atualizado (Aguardando teste) | Não |
| 2 | Música | `/musica` | `src/pages/Musica.tsx` | 🟡 Código atualizado (Aguardando teste) | Não |
| 3 | Hub Cifra | `/cifra` | `src/pages/Cifra.tsx` | 🟡 Código atualizado (Aguardando teste) | Não |
| 4 | Biblioteca | `/biblioteca` | `src/pages/Biblioteca.tsx` | 🟡 Código atualizado (Aguardando teste) | Não |
| 5 | Detalhe da Música | `/musica/:id` | `src/pages/DetalheMusica.tsx` | 🟡 Código atualizado (Aguardando teste) | Não |
| 6 | Tocar | `/tocar/:id` | `src/pages/Tocar.tsx` | 🟡 Código atualizado (Aguardando teste) | Não |
| 7 | Busca Rápida | `/busca-rapida` | `src/pages/BuscaRapida.tsx` | 🟡 Código atualizado (Aguardando teste) | Não |
| 8 | Medleys | `/medleys` | `src/pages/Medleys.tsx` | 🟡 Código atualizado (Aguardando teste) | Não |
| 9 | Editor de Medley | `/medley/:id` | `src/pages/EditorMedley.tsx` | 🟡 Código atualizado (Aguardando teste) | Não |
| 10 | Editor de Cifra | `/editor` | `src/pages/Editor.tsx` | 🟡 Código atualizado (Aguardando teste) | Não |
| 11 | Perfil do Músico | `/perfil` | `src/pages/Perfil.tsx` | 🟡 Código atualizado (Aguardando teste) | Não |
| 12 | Configurações | `/configuracoes` | `src/pages/Configuracoes.tsx` | 🟡 Código atualizado (Aguardando teste) | Não |
| 13 | Player | `/player` | `src/pages/Player.tsx` | 🟡 Código atualizado (Aguardando teste) | Não |
| 14 | Álbuns | `/albuns` | `src/pages/Albuns.tsx` | 🟡 Código atualizado (Aguardando teste) | Não |
| 15 | Álbum | `/album/:id` | `src/pages/Album.tsx` | 🟡 Código atualizado (Aguardando teste) | Não |
| 16 | Artistas | `/artistas` | `src/pages/Artistas.tsx` | 🟡 Código atualizado (Aguardando teste) | Não |
| 17 | Artista | `/artista/:id` | `src/pages/Artista.tsx` | 🟡 Código atualizado (Aguardando teste) | Não |
| 18 | Espaços | `/espacos` | `src/pages/Espacos.tsx` | 🟡 Código atualizado (Aguardando teste) | Não |
| 19 | Espaço | `/espaco/:id` | `src/pages/Espaco.tsx` | 🟡 Código atualizado (Aguardando teste) | Não |
| 20 | Modo de Preparação | `/espaco/:id/preparacao` | `src/pages/ModoPreparacao.tsx` | 🟡 Código atualizado (Aguardando teste) | Não |
| 21 | Entrar no Espaço | `/entrar/:codigo` | `src/pages/EntrarEspaco.tsx` | 🟡 Código atualizado (Aguardando teste) | Não |
| 22 | Importar | `/importar` | `src/pages/Importar.tsx` | 🟡 Código atualizado (Aguardando teste) | Não |
| 23 | Comunidade | `/comunidade` | `src/pages/Comunidade.tsx` | 🟡 Código atualizado (Aguardando teste) | Não |
| 24 | Playlists | `/playlists` | `src/pages/Playlists.tsx` | 🟡 Código atualizado (Aguardando teste) | Não |
| 25 | Detalhe da Playlist | `/playlist/:id` | `src/pages/DetalhePlaylist.tsx` | 🟡 Código atualizado (Aguardando teste) | Não |
| 26 | Camada Privada | `/privado` | `src/pages/CamadaPrivada.tsx` | 🟡 Código atualizado (Aguardando teste) | Não |
| 27 | Painel Administrativo | `/adm` | `src/pages/AdminPanel.tsx` | 🟡 Código atualizado (Aguardando teste) | Não |
| 28 | Login | `/login` | `src/pages/Login.tsx` | 🟡 Código atualizado (Aguardando teste) | Não |
| 29 | Tela de Preparação (Espaco) | `/espaco/:id/preparacao` | `src/pages/ModoPreparacao.tsx` | 🟡 Código atualizado (Aguardando teste) | Não |

## Nota de conclusão

A reconstrução de código do SI v15.0 foi concluída em todos os 29 componentes de tela. Todas as telas foram reescritas com o layout Aurora (fundo `#0B0C10`, cards `#141522`, bordas `border-white/10 rounded-2xl`, acentos via variáveis CSS `var(--primaria)`/`var(--acento)`), `pb-32` aplicado em todas as telas para evitar sobreposição com o Mini Player, e verificação de build (`tsc -b` e `npm run build`) passaram sem erros. Os testes manuais em produção aguardam a execução pelo Guilherme.