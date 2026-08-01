# AGENTS.md — WorshipFlow
> Lido automaticamente por agentes compatíveis (Kilo Code, OpenCode, Cline). Confirme a leitura deste arquivo e do `ARQUITETURA.md` antes de qualquer alteração.

## O que este projeto é
App de cifra/letra/player musical (React 19 + Vite + TypeScript + Firebase), com sistema visual Aurora. Ver `ARQUITETURA.md` pro estado técnico real e `SYSTEM_INSTRUCTION_CHAT_DEV.md` pro plano de fases em andamento.

## Regras invioláveis
1. **Nenhuma tela mostra dado inventado.** Todo número/status/lista vem de um hook real. Sem dado real → usar `EstadoVazio` (prop `texto`, não `descricao`).
2. **Não criar sistema visual paralelo ao Aurora.** Classes já existem em `src/index.css`: `.card`, `.btn-primary`, `.btn-ghost`, `.btn-text`, `.chip`, `.input`, `.aurora-bg`, `.nav-dock`, `.text-gradient`. Componentes prontos em `src/components/aurora/` e `src/components/compartilhado/` — reusar, não recriar.
3. **Uma tarefa por vez.** Não encadear múltiplas mudanças não relacionadas na mesma sessão.
4. **`export default NomeDaPagina`** em toda página nova (exigência do `React.lazy()` nas rotas).
5. **Nomes em português** — variáveis, tipos, rotas, componentes.
6. **Build limpo antes de considerar qualquer tarefa concluída:** `tsc -b` e `vite build`, ambos sem erro. Para telas críticas (Editor, Tocar, Login) isso não basta — precisa de teste manual no navegador também.
7. **Não tocar na camada privada** (Navidrome/câmeras/proxy autenticado) sem instrução explícita — é território separado e protegido, mesmo depois de decidido que vai ser construído.
8. **Comunidade:** todo conteúdo enviado nasce com `status: 'pendente'`, nunca `'aprovada'` direto — mesmo se quem enviar for o dono do projeto.
9. **Não editar `.git` via agente autônomo.** Versionamento é manual, feito pelo Guilherme fora da sessão do agente.
10. **`vercel.json` já existe na raiz** (SPA rewrite) — não duplicar nem sobrescrever sem necessidade real.

## Ambiente
CachyOS (Linux), Fish Shell (Konsole), editor Kate. Fish não aceita redirecionamento encadeado tipo `> arquivo.tsx` em sequência — usar `touch caminho/arquivo.tsx; truncate -s 0 caminho/arquivo.tsx; kate caminho/arquivo.tsx` pra criar/limpar arquivo antes de editar.

## Dependências com ressalva
- `chordsheetjs` está instalada mas **não é usada** em nenhum lugar do código — o parser real é `src/utils/acordes.ts` (regex próprio). Não trocar um pelo outro sem decisão explícita do Claude Gestão.
- Não existe `@dnd-kit` — a reordenação de blocos de medley é feita por botões ↑/↓ (`ConstrutorBlocos.tsx`), não por arraste, apesar do ícone de grip sugerir isso.

## Antes de fechar qualquer tarefa
- [ ] `tsc -b` limpo
- [ ] `vite build` limpo
- [ ] Nenhum dado inventado introduzido
- [ ] Rotas antigas continuam funcionando
- [ ] Componentes de `aurora/`/`compartilhado/` reusados, não recriados
- [ ] Reportar ao Guilherme em formato curto: o que mudou, o que ficou pendente, o que precisa ir pro Claude Gestão

---
*AGENTS.md v1.0 | Claude (Gestão) | 31/Jul/2026*
