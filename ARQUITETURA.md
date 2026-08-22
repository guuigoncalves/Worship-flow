# ARQUITETURA.md — WorshipFlow
> v1.12 atualiza v1.11. Escrita a partir de varredura direta do código-fonte, sessão de 18/08/2026
> (correção via vídeo real do app rodando) — `git log`, `git diff`, arquivos reais.

---

## 1. Stack — sem mudança
React 19 + Vite + TypeScript + Firebase (Auth, Firestore). Design system Aurora.

## 2. SESSÃO 18/08 — reversões precisas a partir de 2º vídeo real
O Guilherme confirmou que a sessão de 16/08 errou em 3 dos 4 pontos "corrigidos". Claude Gestão
assistiu o novo vídeo frame a frame antes de agir (mesma disciplina de 16/08) e corrigiu:

### 2.1 MiniPlayer — finalmente o design correto
Sessões anteriores (15/08 e 16/08) tentaram, cada uma à sua forma, "recriar" o MiniPlayer que o
Guilherme tinha construído — sempre de memória/interpretação, nunca fiel. Nesta sessão, Claude
Gestão foi ao histórico do git (`git show <commit>^:src/pages/Inicio.tsx`, no commit que precede
a remoção de 15/08) e extraiu o código-fonte EXATO do `MiniPlayerBlock` original. Esse código foi
usado **verbatim** como base do `MiniPlayer.tsx` global, com apenas 3 correções pontuais (as
mesmas identificadas desde 15/08): fallback de dado inventado removido (retorna `null` se não há
faixa), tempos estáticos substituídos por `progresso`/`duracao` reais, clique adicionado pra abrir
`/player`. Nenhuma linha de estilo/estrutura visual foi alterada.

### 2.2 Navegação — revertida para dock único
A mudança de 16/08 (mover `Navegacao` pro `Shell`, aparecendo em todas as páginas, com
`NavegacaoInferior` desligada) **não era o que o Guilherme pediu** — ele só queria testar a barra
nova, sem torná-la a navegação oficial nem esconder o dock. Revertido: `Navegacao` não é mais
importada/renderizada em `App.tsx`. `NavegacaoInferior` voltou a ser a única navegação global.
`components/layout/Navegacao.tsx` continua existindo como arquivo, só não está montado em lugar
nenhum — decisão sobre seu futuro fica pro Guilherme, sem pressa.

### 2.3 Header — revertido ao padrão original
A tentativa de "aproximar o nome da logo" em 16/08 usou uma técnica de recorte CSS que, mesmo
matematicamente correta (confirmada via inspeção do canal alpha do PNG), fez a logo parecer
"gigante" comparada ao tamanho de sempre. Revertido: logo de volta a `height: 44px` simples (sem
recorte), saudação "Olá, {nome} 🎵" restaurada (tinha sumido). Mantido, porque não era o problema:
suporte às props `titulo`/`voltar`, usadas por Perfil/Configurações/Busca Rápida/Camada Privada
desde 16/08 — reverter isso quebraria aquelas 4 páginas sem necessidade, já que a queixa era só
sobre logo/saudação, não sobre essas páginas.

### 2.4 Metrônomo — desenho de volta, tamanho mantido
O redesign compacto de 15/08 removeu a ilustração de pêndulo por completo. Reintroduzida como um
SVG pequeno (pêndulo com animação de balanço quando ativo), posicionado ao lado do número de BPM,
sem aumentar a altura do card.

### 2.5 Comunidade / Cifras em Destaque / Artistas em Alta — removidas de novo
Em 16/08, Claude Gestão interpretou o desaparecimento dessas 3 seções (entre os commits `a873f0c`
e `22380c1`) como perda acidental e as restaurou. **Estava errado** — o Guilherme tinha removido
essas seções de propósito numa sessão anterior com o dev. Removidas de novo nesta sessão.
**Lição registrada**: não presumir "perda acidental" a partir de diff histórico sem confirmar a
intenção — histórico de código não mostra intenção, só mudança.

## 3-10. Sem mudança estrutural de v1.11 (Firestore, rotas, fases bloqueadas, PWA/SW).

---
*ARQUITETURA.md v1.12 | Claude (Gestão) | 18/Ago/2026 — a partir de vídeo real do app rodando +*
*varredura direta do código-fonte, incluindo recuperação de código via `git show` no histórico.*
