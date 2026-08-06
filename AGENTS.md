# AGENTS.md — WorshipFlow
> Lido automaticamente por agentes compatíveis (Kilo Code, OpenCode, Cline). Confirme a leitura
> deste arquivo e do `ARQUITETURA.md` antes de qualquer alteração.

## O que este projeto é
App de cifra/letra/player musical (React 19 + Vite + TypeScript + Firebase), com sistema visual
Aurora. Ver `ARQUITETURA.md` pro estado técnico real e `SYSTEM_INSTRUCTION_CHAT_DEV.md` pro plano
de fases em andamento.

## Regras invioláveis
1. **Nenhuma tela mostra dado inventado.** Todo número/status/lista vem de um hook real. Sem dado
   real → usar `EstadoVazio` (prop `texto`, não `descricao`). **Isso inclui erro de infraestrutura:**
   se uma chamada falha por proxy fora do ar, rota removida, CORS bloqueando, credencial ausente,
   ou variável de ambiente ausente, a mensagem não pode se disfarçar de "nenhum dado encontrado" —
   já aconteceu repetidas vezes neste projeto (variável de ambiente do proxy, caminho da API do
   Navidrome, rota de câmera removida, credenciais do Navidrome vazias em produção). **Também
   inclui nunca gravar dado de exemplo/demonstração na conta real de um usuário** — já aconteceu
   uma vez (auto-seed de músicas falsas), corrigido, não repetir em nenhuma outra coleção.
2. **Não criar sistema visual paralelo ao Aurora.** Classes já existem em `src/index.css`. Reusar
   componentes prontos, não recriar.
3. **Uma tarefa por vez.** Não encadear múltiplas mudanças não relacionadas na mesma sessão.
4. **`export default NomeDaPagina`** em toda página nova.
5. **Nomes em português.**
6. **Build limpo antes de considerar qualquer tarefa concluída:** `tsc -b` e `vite build`, ambos
   sem erro. **Para telas críticas (Editor, Tocar, Login, Modo de Preparação, Camada Privada) isso
   não basta** — precisa de teste manual REAL no navegador de PRODUÇÃO (não só localhost): navegar,
   clicar, ver dado carregar, abrir o console e checar se não há erro. Subir `npm run dev` sem erro
   de console **não é teste manual**. **A coluna "testado manualmente" do `INVENTARIO_TELAS.md` só
   pode ser preenchida pelo Guilherme, nunca pelo agente** — já aconteceu de um agente marcar como
   testado sem ter sido, não repetir.
7. **Não tocar na camada privada** (Navidrome/câmeras/proxy autenticado) sem instrução explícita —
   é território separado e protegido, mesmo depois de decidido que vai ser construído.
8. **Comunidade:** todo conteúdo enviado nasce com `status: 'pendente'`, nunca `'aprovada'` direto.
9. **Não editar `.git` via agente autônomo.** Versionamento é manual, feito pelo Guilherme.
10. **`vercel.json` já existe na raiz** — não duplicar nem sobrescrever sem necessidade real.
11. **Uma fase marcada como bloqueada/"não começar" no SI do Dev só é liberada por instrução
    explícita sobre AQUELA fase específica.** Responder uma pergunta técnica pontual (ex: sobre uma
    URL, uma variável) NUNCA é autorização para destravar uma fase inteira. Se houver qualquer
    dúvida sobre se algo está liberado: parar e perguntar antes de escrever código, não assumir e
    reportar depois.
12. **Câmera (Frigate) nunca passa pelo proxy público** (`worshipflow-proxy`). Acesso é
    exclusivamente via Tailscale direto. Se encontrar código chamando `/frigate/*` no proxy
    público, está desatualizado — reportar ao Claude Gestão antes de decidir o que fazer.
13. **(NOVA) Redesign visual = SUBSTITUIR, nunca mesclar.** Ao redesenhar uma tela pra bater com um
    mockup de referência, a estrutura visual antiga (JSX, classes) é apagada e reescrita do zero
    seguindo a imagem — nunca adicionar elemento novo em cima do layout antigo. Elemento que não
    aparece no mockup é removido da tela, não deixado desligado/oculto. Uma tela por vez, um commit
    por tela, build limpo e conferência do Guilherme antes de seguir pra próxima. Já aconteceu de
    20+ telas serem "mescladas" de uma vez e reprovadas inteiras no teste manual — não repetir.
14. **(NOVA) Variáveis de ambiente client-side (`VITE_*`) não têm valor default silencioso em
    produção.** Se uma env var crítica (credenciais, UID de admin, URL de proxy) estiver ausente,
    a tela correspondente deve mostrar aviso explícito de configuração ausente — nunca deixar a
    chamada sair com valor vazio (`u=&p=`) e falhar com erro genérico de rede.
15. **(NOVA) `firestore.rules` deve ser trazido para o repositório** (hoje só existe no Console do
    Firebase, fora de controle de versão e fora de auditoria). Qualquer mudança de regra de
    segurança precisa ser revisada pelo Claude Gestão antes de aplicada — não é decisão do agente
    (Regra de Ouro #4).

## Ambiente
CachyOS (Linux), Fish Shell (Konsole), editor Kate. Fish não aceita redirecionamento encadeado —
usar `touch caminho/arquivo.tsx; truncate -s 0 caminho/arquivo.tsx; kate caminho/arquivo.tsx`.

## Dependências com ressalva
- `chordsheetjs` foi **removida** do projeto (03/08/2026, pendência antiga fechada). Se aparecer
  de novo em algum diff, é regressão — reportar.
- Não existe `@dnd-kit` — reordenação de medley é por botões ↑/↓, não drag. Fase 19 (personalização
  de layout) segue essa mesma lógica quando liberada.

## Antes de fechar qualquer tarefa
- [ ] `tsc -b` limpo
- [ ] `vite build` limpo
- [ ] Nenhum dado inventado introduzido, nenhum seed automático em conta real
- [ ] Nenhum erro técnico mascarado como "dado ausente"
- [ ] Rotas antigas continuam funcionando
- [ ] Componentes de `aurora/`/`compartilhado/` reusados, não recriados
- [ ] Se a tarefa tocou fase marcada como bloqueada no SI: confirmar que houve liberação explícita
      antes de começar, não depois
- [ ] Se foi redesign visual: layout antigo foi SUBSTITUÍDO, não mesclado — uma tela por commit
- [ ] Reportar ao Guilherme em formato curto: o que mudou, o que foi de fato testado manualmente em
      produção (não localhost, não só build), o que ficou pendente, o que precisa ir pro Claude
      Gestão

---
*AGENTS.md v1.2 | Claude (Gestão) | 05/Ago/2026*
