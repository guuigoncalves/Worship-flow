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
   se uma chamada falha por proxy fora do ar, rota removida, ou variável de ambiente ausente, a
   mensagem não pode se disfarçar de "nenhum dado encontrado" — já aconteceu 3 vezes neste
   projeto (variável de ambiente do proxy, caminho da API do Navidrome, rota de câmera removida).
2. **Não criar sistema visual paralelo ao Aurora.** Classes já existem em `src/index.css`. Reusar
   componentes prontos, não recriar.
3. **Uma tarefa por vez.** Não encadear múltiplas mudanças não relacionadas na mesma sessão.
4. **`export default NomeDaPagina`** em toda página nova.
5. **Nomes em português.**
6. **Build limpo antes de considerar qualquer tarefa concluída:** `tsc -b` e `vite build`, ambos
   sem erro. **Para telas críticas (Editor, Tocar, Login, Modo de Preparação, Camada Privada) isso
   não basta** — precisa de teste manual REAL no navegador: navegar, clicar, ver dado carregar.
   Subir `npm run dev` sem erro de console **não é teste manual**, é checagem estática equivalente
   ao build — não relatar como "testado manualmente" se foi só isso.
7. **Não tocar na camada privada** (Navidrome/câmeras/proxy autenticado) sem instrução explícita —
   é território separado e protegido, mesmo depois de decidido que vai ser construído.
8. **Comunidade:** todo conteúdo enviado nasce com `status: 'pendente'`, nunca `'aprovada'` direto.
9. **Não editar `.git` via agente autônomo.** Versionamento é manual, feito pelo Guilherme.
10. **`vercel.json` já existe na raiz** — não duplicar nem sobrescrever sem necessidade real.
11. **(NOVA) Uma fase marcada como bloqueada/"não começar" no SI do Dev só é liberada por
    instrução explícita sobre AQUELA fase específica.** Responder uma pergunta técnica pontual
    (ex: sobre uma URL, uma variável) NUNCA é autorização para destravar uma fase inteira. Se
    houver qualquer dúvida sobre se algo está liberado: parar e perguntar antes de escrever
    código, não assumir e reportar depois.
12. **(NOVA) Câmera (Frigate) nunca passa pelo proxy público** (`worshipflow-proxy`). Acesso é
    exclusivamente via Tailscale direto. Se encontrar código chamando `/frigate/*` no proxy
    público, está desatualizado — reportar ao Claude Gestão antes de decidir o que fazer, não
    corrigir por conta própria sem confirmação (ver ARQUITETURA.md Seção 6).

## Ambiente
CachyOS (Linux), Fish Shell (Konsole), editor Kate. Fish não aceita redirecionamento encadeado —
usar `touch caminho/arquivo.tsx; truncate -s 0 caminho/arquivo.tsx; kate caminho/arquivo.tsx`.

## Dependências com ressalva
- `chordsheetjs` foi **removida** do projeto (03/08/2026, pendência antiga fechada). Se aparecer
  de novo em algum diff, é regressão — reportar.
- Não existe `@dnd-kit` — reordenação de medley é por botões ↑/↓, não drag.

## Antes de fechar qualquer tarefa
- [ ] `tsc -b` limpo
- [ ] `vite build` limpo
- [ ] Nenhum dado inventado introduzido
- [ ] Nenhum erro técnico mascarado como "dado ausente"
- [ ] Rotas antigas continuam funcionando
- [ ] Componentes de `aurora/`/`compartilhado/` reusados, não recriados
- [ ] Se a tarefa tocou fase marcada como bloqueada no SI: confirmar que houve liberação explícita
      antes de começar, não depois
- [ ] Reportar ao Guilherme em formato curto: o que mudou, o que foi de fato testado manualmente
      (não só build), o que ficou pendente, o que precisa ir pro Claude Gestão

---
*AGENTS.md v1.1 | Claude (Gestão) | 03/Ago/2026*
