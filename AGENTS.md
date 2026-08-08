# AGENTS.md — WorshipFlow
> Lido automaticamente por agentes compatíveis (Kilo Code, OpenCode, Cline, Antigravity).
> Confirme a leitura deste arquivo e do `ARQUITETURA.md` antes de qualquer alteração.

## O que este projeto é
App de cifra/letra/player musical (React 19 + Vite + TypeScript + Firebase), com sistema visual
Aurora. Ver `ARQUITETURA.md` pro estado técnico real e `SYSTEM_INSTRUCTION_CHAT_DEV.md` (SI) pro
plano de fases em andamento.

## Mockups de referência
Ficam em `docs/mockups/`, nomeados `mockup-NN.png` onde `NN` é o número usado em todos os
documentos de governança (ex: "imagem #7" = `docs/mockups/mockup-07.png`). Sempre conferir essa
pasta antes de reconstruir uma tela — não pedir a imagem no chat se ela já estiver ali.

## Papéis
1. **Claude Gestão**: dá o PLANO. Não dá comando por comando. Só é consultado quando o agente
   executor travar em algo que é decisão dele por natureza (STOP obrigatório, ver regra #13/#17).
2. **Agente executor** (Antigravity, ou Kilo Code/AI Studio): recebe o plano completo, executa,
   testa, avança de fase sozinho sem devolver o ciclo ao Claude Gestão a cada etapa — dentro dos
   limites da regra #17 abaixo.
3. **Guilherme**: testa o resultado, autoriza, só traz de volta ao Claude Gestão quando o plano
   inteiro estiver concluído ou quando o agente reportar um STOP real.

## Regras invioláveis
1. **Nenhuma tela mostra dado inventado.** Todo número/status/lista vem de um hook real. Sem dado
   real → usar `EstadoVazio` (prop `texto`). Isso inclui erro de infraestrutura mascarado como
   "nenhum dado encontrado", e nunca gravar dado de exemplo na conta real de um usuário.
2. **Não criar sistema visual paralelo ao Aurora.** Reusar componentes de `src/index.css` e
   `components/aurora/`. Preferir corrigir causa raiz (variável CSS central) a caçar classe por
   classe.
3. **Uma tarefa por vez DENTRO de uma fase.** Entre fases diferentes do plano, avanço autônomo é
   permitido (regra #13), mas sempre respeitando a regra #17 de verificação antes de avançar.
4. **`export default NomeDaPagina`** em toda página nova.
5. **Nomes em português.**
6. **Build limpo (`tsc -b` e `vite build`) é necessário, nunca suficiente.** Para redesign visual,
   build limpo NÃO substitui a comparação visual real por screenshot (regra #17). **A coluna
   "testado manualmente" do `INVENTARIO_TELAS.md` só pode ser preenchida pelo Guilherme, nunca
   pelo agente**, mesmo com autoverificação por screenshot.
7. **Não tocar na camada privada** sem instrução explícita — inclui qualquer mudança de
   infraestrutura de rede (ex: Cloudflare Tunnel), decisão do Claude Gestão, nunca do agente.
8. **Comunidade:** todo conteúdo enviado nasce com `status: 'pendente'`, nunca `'aprovada'` direto.
9. **Não editar `.git` além de commit/branch de trabalho normal.** Merge em main é manual.
10. **`vercel.json` já existe na raiz** — não duplicar/sobrescrever sem necessidade real.
11. **Fase bloqueada no SI só é liberada por instrução explícita sobre AQUELA fase.** Responder
    pergunta técnica pontual nunca é autorização pra destravar fase inteira.
12. **Câmera (Frigate) nunca passa pelo proxy público.** Acesso é via Tailscale direto.
13. **Redesign visual = SUBSTITUIR, nunca mesclar. Uma tela por commit.** Estrutura antiga (JSX,
    classes) é apagada e reescrita do zero seguindo o mockup. Elemento ausente no mockup é
    removido, não deixado oculto.
14. **Variáveis `VITE_*` ausentes**: tela mostra aviso explícito de configuração ausente, nunca
    chamada silenciosa vazia.
15. **`firestore.rules` versionado no repo.** Mudança de regra de segurança sempre passa pelo
    Claude Gestão antes de aplicada — sem exceção de autonomia, mesmo que "resolva" um erro.
16. **Escolha de modelo (Antigravity):** Flash é padrão pra tarefa mecânica/bem especificada.
    Sonnet só pra ambiguidade real ou dependência entre múltiplos arquivos. Opus/Gemini Pro quase
    nunca — cota semanal curta no free tier.
17. **(NOVA 07/08 — CRÍTICA) O que "autonomia entre fases" significa, e o que NÃO significa:**
    - Autonomia significa: o agente NÃO precisa esperar o Guilherme aprovar cada tela
      individualmente antes de seguir pra próxima, **desde que tenha se autoverificado por
      screenshot comparado ao mockup correspondente e a comparação tenha batido**.
    - Autonomia **não** significa pular a verificação porque uma ferramenta falhou. Se a
      autoverificação visual não puder ser feita por qualquer motivo (falha de infraestrutura,
      ferramenta indisponível, etc.), isso é automaticamente um **STOP** — não uma escolha entre
      "seguir sem verificar" ou "esperar". O agente NUNCA decide sozinho seguir sem verificação
      visual real. Build limpo sozinho não conta como verificação de redesign visual.
    - **STOP significa parar de executar de verdade, não perguntar e continuar em paralelo.**
      Se o agente faz uma pergunta ao Guilherme, ele para de editar/avançar fases até receber
      resposta explícita. Fazer a pergunta e simultaneamente escolher uma opção sozinho enquanto
      "aguarda" é uma violação desta regra, mesmo que a pergunta tenha sido feita corretamente.
      Já aconteceu uma vez neste projeto (07/08/2026) — 6+ telas foram reescritas sem verificação
      visual enquanto o agente dizia estar "aguardando orientação". Não repetir.
    - Antes de qualquer commit ou "Accept" em lote de múltiplos arquivos: se o pacote de mudanças
      cobre mais de uma tela/fase, o agente apresenta e aguarda aceite **tela por tela**, nunca
      "Accept all" cobrindo fases diferentes de uma vez — mesmo que tecnicamente correto, aceitar
      em bloco impede rollback seletivo se uma tela específica tiver problema.

## Ambiente
CachyOS (Linux), Fish Shell (Konsole), editor Kate. Fish não aceita redirecionamento encadeado —
usar `touch caminho/arquivo.tsx; truncate -s 0 caminho/arquivo.tsx; kate caminho/arquivo.tsx`.

## Dependências com ressalva
- `chordsheetjs` removida (03/08/2026). Se reaparecer em diff, é regressão — reportar.
- Não existe `@dnd-kit` — reordenação é por botões ↑/↓.
- Playwright instalado localmente (07/08/2026) via `npx playwright install chromium` — confirmado
  funcional. Não reinstalar sem necessidade.

## Antes de fechar qualquer FASE do plano
- [ ] `tsc -b` limpo, `vite build` limpo
- [ ] Nenhum dado inventado, nenhum seed automático em conta real
- [ ] Nenhum erro técnico mascarado como "dado ausente"
- [ ] Se tocou fase bloqueada: liberação explícita confirmada antes de começar
- [ ] Redesign visual: layout SUBSTITUÍDO, screenshot comparado ao mockup de `docs/mockups/`
      ANTES de marcar concluído — sem exceção, mesmo se a ferramenta de screenshot falhar (nesse
      caso, é STOP, não pulo de etapa)
- [ ] Aceite/commit tela por tela, nunca em lote cobrindo fases diferentes
- [ ] Relatório final consolidado com hash de commit por fase e o que foi de fato autoverificado

---
*AGENTS.md v1.4 | Claude (Gestão) | 07/Ago/2026*
