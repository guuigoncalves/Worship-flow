SYSTEM INSTRUCTION — AGENTE EXECUTOR WORSHIPFLOW (Antigravity)
WorshipFlow — App de Cifra e Musica (comercial + privada)
Versao: 18.0 | 06/08/2026 | Gerado por: Claude Gestao
SUBSTITUI: SYSTEM_INSTRUCTION_CHAT_DEV.md v17.0.
MUDANCA DE FORMATO: a partir desta versao, este documento e um PLANO completo, nao uma instrucao
de comando unico. Voce (agente executor) tem autonomia pra avancar entre as fases abaixo SEM
esperar aprovacao do Guilherme a cada etapa — ele so precisa ser consultado nos casos de STOP
listados explicitamente. Leia tambem `AGENTS.md` (regras invioláveis, especialmente #13 e #16
sobre autonomia e escolha de modelo) e `ARQUITETURA.md` (estado tecnico real) antes de comecar.

--------------------------------------------------------------------
COMO USAR ESTE DOCUMENTO (leia antes de tudo)
--------------------------------------------------------------------
- Cada FASE abaixo (letras A, B, C...) e uma unidade de trabalho. Dentro de uma fase pode haver
  subfases numeradas (A1, A2...).
- Fases marcadas [AUTONOMO] voce executa, autoverifica, e AVANCA SOZINHO pra proxima fase
  [AUTONOMO] da fila, sem parar pra perguntar.
- Fases marcadas [STOP OBRIGATORIO] voce PARA, reporta o que encontrou, e espera resposta do
  Guilherme (que leva ao Claude Gestao se for decisao de arquitetura/seguranca) antes de tocar
  nelas.
- Ao final de TODAS as fases [AUTONOMO] da fila autorizada, gere UM relatorio consolidado (formato
  no final deste documento) — nao um relatorio por tela.
- Modelo a usar por fase esta indicado entre colchetes. Na duvida, use Flash; so suba pra Sonnet
  se a tarefa exigir julgamento real (ambiguidade, dependencia entre arquivos).

--------------------------------------------------------------------
FASE A — CONTEXTO: O QUE JA ESTA CONFIRMADO CORRETO (nao mexer de novo)
--------------------------------------------------------------------
Sem acao nesta fase, so leitura de contexto:
- `firestore.rules` aplicado corretamente (commit `f460e94`), publicado no Console do Firebase.
- Causa raiz da cor amarela corrigida via variavel `--primaria` em `src/index.css` (`#8B5CF6`).
- Barra de navegacao inferior antiga removida da Tela Inicial.
- CORS do proxy Navidrome, Service Worker (`prompt` + `NetworkOnly`), credenciais da Camada
  Privada na Vercel: tudo aplicado e confirmado em rodadas anteriores.

--------------------------------------------------------------------
FASE B — [AUTONOMO] [Flash] FIX DA SAUDACAO DUPLICADA
--------------------------------------------------------------------
Nao existe componente `Header`/`Saudacao` compartilhado. O texto "Ola, Guilherme / Vamos fazer
musica hoje?" esta duplicado em tres arquivos: `pages/Inicio.tsx`, `pages/Musica.tsx`,
`pages/Cifra.tsx`.

Acao: mover a saudacao para a direita, ao lado da foto de perfil (ver Mockup 1), nos TRES
arquivos. Pode ser um commit unico, ja que e a mesma correcao repetida.
Opcional (nao obrigatorio, so se nao atrasar): extrair pra um componente reusavel em
`components/aurora/SaudacaoHeader.tsx`.

Autoverificacao antes de marcar concluido: screenshot das 3 telas em producao/preview, saudacao
visivelmente a direita ao lado do avatar nas tres.

--------------------------------------------------------------------
FASE C — [AUTONOMO] [Flash, subir pra Sonnet se a estrutura nao bater com o mockup de primeira]
HUB CIFRA (/cifra)
--------------------------------------------------------------------
Reconstruir seguindo a imagem de referencia #7. SUBSTITUIR a estrutura visual antiga, nunca
mesclar (AGENTS.md regra #13).
- Header padrao do app (mesmo padrao das outras telas) com saudacao + foto (ja corrigido na
  FASE B).
- Subtitulo: "Hub Cifra: tudo o que voce precisa para criar, organizar e compartilhar cifras".
- Remover fundo estranho atras dos botoes "Biblioteca" e "Nova Cifra".
- "Cifras Recentes" e "Biblioteca": reconstruir do zero.
- NAO incluir o Editor (`/editor`, `/editor/:id`) nesta fase — fica pra fase futura, fora deste
  pacote.

Autoverificacao: screenshot da tela renderizada comparado com a imagem #7 — checar cor, presenca
e ausencia de elemento, estrutura geral. So marca concluido se bater.

Se o mockup #7 nao deixar claro algo especifico: **[STOP OBRIGATORIO]** — nao interpretar e
seguir, perguntar primeiro.

--------------------------------------------------------------------
FASE D — [AUTONOMO] [Flash] ESPACOS (/espacos) — SO VISUAL
--------------------------------------------------------------------
Bug tecnico do loop infinito ja foi resolvido em rodada anterior — nao mexer na logica de
carregamento, so na estrutura visual, seguindo a imagem de referencia correspondente (ver lista
de imagens do plano original, imagem #15 pra Espaco/detalhe e Modo de Preparacao).

Autoverificacao: confirmar que a tela ainda carrega sem loop (screenshot ou video curto) E que o
visual bate com o mockup.

--------------------------------------------------------------------
FASE E — [AUTONOMO] [Flash] BIBLIOTECA (/biblioteca)
--------------------------------------------------------------------
Reconstruir seguindo a imagem de referencia #6. Abas "Todas/Musicas/Cifras/Medleys" (confirmado
existir no codigo — nao remover, so redesenhar visual).

Autoverificacao: screenshot comparado a imagem #6.

--------------------------------------------------------------------
FASE F — [AUTONOMO] [Flash] DEMAIS TELAS, NA ORDEM ABAIXO
--------------------------------------------------------------------
Seguir esta ordem, uma tela por commit, autoverificacao por screenshot antes de avancar pra
proxima:
F1. Albuns (`/albuns`) e Detalhe do Album (`/album/:id`) → imagem #3. Lista VERTICAL, nao grid.
F2. Artistas (`/artistas`) e Detalhe do Artista (`/artista/:id`) → imagem #4.
F3. Playlists (`/playlists`, `/playlist/:id`) → imagem #14.
F4. Comunidade (`/comunidade`) → imagem #13.
F5. Perfil (`/perfil`) → imagem #16.
F6. Configuracoes (`/configuracoes`) → imagem #17.
F7. Painel Admin (`/adm`) → imagem #18.
F8. Login (`/login`) → imagem #19.
F9. Modo Palco (`/tocar/:id`), Busca Rapida (`/busca-rapida`), Medleys (`/medleys`,
    `/medley/:id`), Player (`/player`), Importar Cifra (`/importar`), Entrar em Espaco
    (`/entrar/:codigo`) → seguir as imagens de referencia correspondentes indicadas no material
    original enviado pelo Guilherme.

Se qualquer imagem de referencia estiver faltando ou ilegivel pra alguma tela desta lista:
**[STOP OBRIGATORIO]** nessa tela especifica — pular pra proxima da fila e reportar a pendencia,
nao travar o pacote inteiro por causa de uma tela.

--------------------------------------------------------------------
FASE G — [STOP OBRIGATORIO] EDITOR DE CIFRA (/editor, /editor/:id)
--------------------------------------------------------------------
NAO EXECUTAR sem instrucao explicita do Claude Gestao sobre esta fase especifica. Hoje o editor
transborda a tela — e um bug conhecido, mas a reconstrucao visual completa fica de fora deste
pacote de autonomia por ser uma tela mais sensivel (edicao de dado real). Reportar como pendente
no relatorio final, nao tentar resolver sozinho.

--------------------------------------------------------------------
FASE H — [STOP OBRIGATORIO] CAMADA PRIVADA E QUALQUER INFRAESTRUTURA DE REDE
--------------------------------------------------------------------
NAO implementar Cloudflare Tunnel ou qualquer mudanca de rede/infraestrutura da Camada Privada.
NAO mexer em `server/proxy.js`, Tailscale, ou qualquer coisa relacionada a Navidrome/Frigate além
do que ja foi confirmado corrigido. Isso e decisao do Claude Gestao (AGENTS.md regra #7), mesmo
que pareca tecnicamente simples.

--------------------------------------------------------------------
FASE I — [STOP OBRIGATORIO] FIRESTORE.RULES E QUALQUER REGRA DE SEGURANCA
--------------------------------------------------------------------
NAO alterar `firestore.rules` por conta propria em nenhuma circunstancia, mesmo que pareca
resolver um erro de permissao. Reportar o erro exato ao Guilherme/Claude Gestao — AGENTS.md
regra #15, sem excecao de autonomia.

--------------------------------------------------------------------
FASE J — [STOP OBRIGATORIO] FASE 19 DO PRODUTO (tema/cor/layout customizavel)
--------------------------------------------------------------------
Continua bloqueada ate TODAS as fases B-F estarem aprovadas pelo Guilherme em producao. Nao
comecar por conta propria mesmo que o schema ja esteja definido em documento anterior.

--------------------------------------------------------------------
ENTREGAVEL FINAL — RELATORIO CONSOLIDADO (nao um relatorio por tela)
--------------------------------------------------------------------
Ao terminar todas as fases [AUTONOMO] disponiveis (B ate F, ou ate onde conseguir sem bater em
STOP), gerar UM relatorio unico:

RELATORIO CONSOLIDADO — [DD/MM/AAAA]
Fases concluidas: [lista com hash de commit de cada uma]
Autoverificacao: [screenshot ou descricao de cada tela comparada ao mockup — o que bateu]
Fases em STOP (aguardando decisao): [lista com o motivo exato de cada STOP]
Build: VERDE / VERMELHO
Pendencia tecnica encontrada pelo caminho (nao decidida por voce): [...]
Para o Guilherme testar manualmente: [lista objetiva do que ele precisa conferir — nao "tudo",
                                       seja especifico sobre o que a autoverificacao NAO cobre]
Para o Claude Gestao (só se houver STOP ou decisão pendente): [...]

Atualizar `INVENTARIO_TELAS.md` com o status tecnico real por tela, coluna "Testado manualmente
por Guilherme?" SEMPRE em branco ou "aguardando teste do Guilherme" — nunca preenchida por voce
(AGENTS.md regra #6).

--------------------------------------------------------------------
WorshipFlow — SI v18.0 — 06/08/2026
Gerado por Claude Gestao. Atualizar apenas via Claude Gestao.
