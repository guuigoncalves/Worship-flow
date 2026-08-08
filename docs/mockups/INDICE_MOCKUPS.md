# ÍNDICE DE MOCKUPS — WorshipFlow
> Colocar a pasta `mockups/` inteira em `docs/mockups/` na raiz do projeto. Os arquivos são
> compostos (várias telas lado a lado numa imagem só) — o agente deve olhar o painel específico
> indicado, não a imagem inteira.

| # | Tela | Rota | Arquivo | Painel dentro do arquivo |
|---|---|---|---|---|
| — | Início (Hub geral) | `/` | `mockup-00-inicio.png` | Imagem única, sem legenda numerada — é a referência da Tela Inicial completa (busca, playlists, mais ouvidas, cifras recentes, metrônomo, comunidade, mini player) |
| 1 | Hub Música | `/musica` | `mockup-01-03-04-hubmusica-albuns-artistas.png` | Painel 1 (esquerda) — **versão oficial**, com busca + grade de acesso rápido (Player/Álbuns/Artistas/Cifras). Já usada pelo Dev numa rodada anterior e aceita. |
| 2 | Player | `/player` | `mockup-02-player-albuns-RASCUNHO-hubmusica-antigo.png` | Painel 2 (centro) |
| 3 | Álbuns + Detalhe do Álbum | `/albuns`, `/album/:id` | `mockup-01-03-04-hubmusica-albuns-artistas.png` | Painéis 2 e 3 |
| 4 | Artistas + Detalhe do Artista | `/artistas`, `/artista/:id` | `mockup-01-03-04-hubmusica-albuns-artistas.png` | Painéis 4 e 5 |
| 5 | Hub Cifra | `/cifra` | `mockup-05-06-07-hubcifra-biblioteca-editor.png` | Painel 1 (esquerda) |
| 6 | Biblioteca | `/biblioteca` | `mockup-05-06-07-hubcifra-biblioteca-editor.png` | Painel 2 (centro) |
| 7 | Editor de Cifra | `/editor`, `/editor/:id` | `mockup-05-06-07-hubcifra-biblioteca-editor.png` | Painel 3 (direita) — **fora do pacote de autonomia atual (Fase G, STOP obrigatório)** |
| 8 | Detalhe da Música / Exibição da Cifra | `/musica/:id` | `mockup-08-09-10-detalhemusica-modopalco-busca.png` | Painel 1 (esquerda) |
| 9 | Modo Palco (Tocar) | `/tocar/:id` | `mockup-08-09-10-detalhemusica-modopalco-busca.png` | Painel 2 (centro) |
| 10 | Busca Rápida | `/busca-rapida` | `mockup-08-09-10-detalhemusica-modopalco-busca.png` | Painel 3 (direita) |
| 11 | Medleys | `/medleys` | `mockup-11-12-13-medleys-importar-comunidade.png` | Painel 1 (esquerda) |
| 12 | Editor de Medley | `/medley/:id` | `mockup-11-12-13-medleys-importar-comunidade.png` | Painel 1 também (mesmo layout base do Medleys) |
| 12 | Importar Cifra (2 etapas) | `/importar` | `mockup-11-12-13-medleys-importar-comunidade.png` | Painéis 2 e 3 |
| 13 | Comunidade | `/comunidade` | `mockup-11-12-13-medleys-importar-comunidade.png` | Painel 4 (direita) |
| 14 | Playlists (lista + detalhe) | `/playlists`, `/playlist/:id` | `mockup-14-15-16-17-playlists-espacos-perfil-config.png` | Painéis 1 e 2 |
| 15 | Espaços (lista + detalhe) | `/espacos`, `/espaco/:id`, `/espaco/:id/preparacao` | `mockup-14-15-16-17-playlists-espacos-perfil-config.png` | Painéis 3 e 4 (Modo de Preparação usa a mesma referência do detalhe) |
| 16 | Perfil | `/perfil` | `mockup-14-15-16-17-playlists-espacos-perfil-config.png` | Painel 5 (direita) |
| 17 | Configurações | `/configuracoes` | `mockup-14-15-16-17-playlists-espacos-perfil-config.png` | Painel 6 (linha de baixo, esquerda) |
| 18 | Painel Admin (Moderação + Solicitações) | `/adm` | `mockup-18-19-20-admin-login-privada.png` | Painéis 1 e 2 |
| 19 | Login | `/login` | `mockup-18-19-20-admin-login-privada.png` | Painel 3 |
| 20 | Camada Privada | `/privado` | `mockup-18-19-20-admin-login-privada.png` | Painel 4 (direita, mais largo — Música + Câmeras) |

## Sem mockup dedicado (usar bom senso / padrão Aurora geral)
- Entrar em Espaço (`/entrar/:codigo`) — não há tela específica; seguir o padrão visual dos outros
  formulários simples do app (ex: Importar).

## Arquivo descartado — não usar como referência
`mockup-02-player-albuns-RASCUNHO-hubmusica-antigo.png`, painel 1 (a versão do Hub Música com
barra de navegação inferior antiga) — é um rascunho anterior, superado pela versão oficial do
item #1 acima. O painel 2 (Player) e painel 3/4 (Álbuns, mesma arte do item #3) desse mesmo
arquivo continuam válidos — só o painel 1 é descartado.
