SYSTEM INSTRUCTION — AGENTE EXECUTOR WORSHIPFLOW (Antigravity)
WorshipFlow — App de Cifra e Musica (comercial + privada)
Versao: 19.0 | 07/08/2026 | Gerado por: Claude Gestao
SUBSTITUI: SYSTEM_INSTRUCTION_CHAT_DEV.md v18.0.
MOTIVO: checkpoint de retomada apos pausa de sessao. As Fases B-F1/F2/F3/F4 do v18 foram
concluidas e commitadas. Este documento retoma exatamente de onde parou — leia `AGENTS.md` e
`ARQUITETURA.md` (ambos atualizados nesta mesma leva) antes de qualquer acao.

--------------------------------------------------------------------
FASE A — CONTEXTO: O QUE JA ESTA CONCLUIDO (nao mexer de novo)
--------------------------------------------------------------------
Commitado e aprovado pelo Guilherme: Header.tsx compartilhado, Inicio, Musica, Hub Cifra, Espacos,
Biblioteca, Albuns, Artistas, Playlists, Comunidade (9 telas), docs/mockups/, documentacao de
governanca. Ver ARQUITETURA.md v1.4 Secao 8 pra lista completa de hashes/commits.

--------------------------------------------------------------------
FASE K — [PRIMEIRA COISA A FAZER] COMMIT DA LOGO — SE AINDA PENDENTE
--------------------------------------------------------------------
Verificar `git status`. Se Header.tsx/index.html/vite.config.ts ainda aparecerem como modificados
e nao commitados: a logo ja foi ajustada (badge removido, height 44px) na sessao anterior, so
falta o aceite visual do Guilherme.
- Se o preview ainda estiver rodando em alguma porta local, informe qual porta pro Guilherme
  verificar. Se nao estiver mais rodando, suba de novo (`npm run dev` ou `vite preview`).
- NAO commitar sem o aceite explicito do Guilherme nesta sessao, mesmo que pareca visualmente
  correto pelo codigo.
- Apos aceite: commit isolado so desse item.

--------------------------------------------------------------------
FASE L — [STOP OBRIGATORIO ATE DIAGNOSTICO] LACUNA DE NAVEGACAO GLOBAL
--------------------------------------------------------------------
Problema identificado pelo Guilherme na sessao anterior, AINDA NAO investigado: depois da remocao
da barra de navegacao inferior antiga (regra #13), nao ha ponto de entrada visivel pra varias
rotas do app: `/perfil`, `/configuracoes`, `/comunidade`, `/playlists`, `/espacos`, `/adm`. O
unico acesso residual conhecido sao os 4 cartoes de atalho dentro do Hub Musica (Player, Albuns,
Artistas, Cifras), que nao cobrem essas rotas.

ACAO NESTA FASE: apenas DIAGNOSTICAR, nao corrigir ainda.
1. Procurar no codigo (Header.tsx, App.tsx, qualquer componente de navegacao) se existe algum
   menu escondido (dropdown no avatar, sidebar colapsada, gesture) que dê acesso a essas rotas.
2. Reportar pro Guilherme: como um usuario real chega em cada uma das 6 rotas acima HOJE, rota
   por rota. Se a resposta for "nao ha jeito nenhum", dizer isso explicitamente — nao inferir ou
   sugerir solucao ainda.
3. NAO escrever nenhum componente de navegacao novo nesta fase. Isso e decisao de arquitetura de
   navegacao (nao ajuste visual simples) e volta pro Claude Gestao antes de virar codigo.

Depois do diagnostico entregue, PARE e aguarde instrucao — nao prossiga pra Fase M sozinho
enquanto isso estiver em aberto, a menos que o Guilherme diga explicitamente pra seguir em
paralelo.

--------------------------------------------------------------------
FASE M — [AUTONOMO] [Flash] CONTINUACAO DO REDESIGN — F5 A F9
--------------------------------------------------------------------
Mesma logica de sempre: uma tela por commit, screenshot comparado ao painel indicado em
`docs/mockups/INDICE_MOCKUPS.md`, aguardar aceite antes de avancar — MAS agora avanco entre telas
e autonomo (nao precisa esperar aprovacao a cada uma, só se autoverificar corretamente), conforme
AGENTS.md regra #13/#17.

Se a cota do browser subagent do Antigravity ainda estiver esgotada: usar Playwright via terminal
diretamente (`npx playwright screenshot --load-storage=... URL arquivo.png`), que é independente
dessa cota — nao e motivo de STOP se essa alternativa funcionar.

Ordem:
F5. Perfil (`/perfil`) — `mockup-14-15-16-17...png`, painel 5
F6. Configuracoes (`/configuracoes`) — mesmo arquivo, painel 6
F7. Painel Admin (`/adm`) — `mockup-18-19-20...png`, paineis 1-2
F8. Login (`/login`) — mesmo arquivo, painel 3
F9. Modo Palco (`/tocar/:id`), Busca Rapida (`/busca-rapida`), Medleys (`/medleys`,
    `/medley/:id`), Player (`/player`), Importar (`/importar`) — usar os paineis correspondentes
    ja listados no INDICE_MOCKUPS.md. Entrar em Espaco (`/entrar/:codigo`) nao tem mockup
    dedicado — seguir padrao visual dos formularios simples do app (ex: Importar).

--------------------------------------------------------------------
FASE G, H, I, J — [STOP OBRIGATORIO] SEM MUDANCA
--------------------------------------------------------------------
Editor de Cifra, Camada Privada/infraestrutura de rede, firestore.rules, Fase 19 do produto.
Continuam bloqueadas, sem excecao de autonomia.

--------------------------------------------------------------------
ENTREGAVEL FINAL — RELATORIO CONSOLIDADO (sem mudanca de formato)
--------------------------------------------------------------------
Ao terminar as fases autonomas disponiveis (K, M ate onde conseguir, respeitando o STOP da Fase
L), gerar UM relatorio consolidado com hash de commit por fase, autoverificacao de cada tela, e o
resultado do diagnostico da Fase L. Atualizar `INVENTARIO_TELAS.md`, coluna de teste manual
sempre em branco/"aguardando Guilherme" — nunca preenchida pelo agente.

--------------------------------------------------------------------
WorshipFlow — SI v19.0 — 07/08/2026 — checkpoint de retomada
Gerado por Claude Gestao. Atualizar apenas via Claude Gestao.
