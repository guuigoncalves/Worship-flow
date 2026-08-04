# AUDITORIA DAS FASES 16, 17 E 18 — WORSHIPFLOW

## 1. LISTA COMPLETA DE ARQUIVOS CRIADOS OU MODIFICADOS

### FASE 16 (Exclusão Segura & Fila de Moderação)
- `src/types/index.ts`
- `src/hooks/useMusicas.tsx`
- `src/hooks/useComunidade.tsx`
- `src/pages/AdminPanel.tsx`

### FASE 17 (Modo de Preparação nos Espaços)
- `src/types/index.ts`
- `src/hooks/useEspacos.tsx`
- `src/pages/ModoPreparacao.tsx`
- `src/pages/Espaco.tsx`
- `src/App.tsx`

### FASE 18 (Pedir Música na Camada Privada via n8n)
- `server/proxy.js`
- `src/hooks/useCamadaPrivada.ts`
- `src/pages/CamadaPrivada.tsx`

---

## 2. SCHEMAS E TIPOS TYPESCRIPT REAIS (COPIADOS DIRETO DO CÓDIGO)

### FASE 16

**`src/types/index.ts` — interfaces `Musica` e `MusicaComunidade`:**

```typescript
export interface Musica {
  id: string;
  titulo: string;
  artista: string;
  tom: Tom;
  acordes: string[];
  letra: string;
  tags: TagMusica[];
  dificuldade: Nivel;
  eFavorita: boolean;
  vezesTocada: number;
  ultimaTocada: string | null;
  criadaEm: string;
  versoes: VersaoMusica[];
  possuiCifra?: boolean;
  solicitacaoExclusao?: boolean;
  dataSolicitacaoExclusao?: string;
}

export interface MusicaComunidade {
  id: string;
  titulo: string;
  artista: string;
  tom: Tom;
  letra: string;
  acordes: string[];
  tags: TagMusica[];
  dificuldade: Nivel;
  status: StatusMusica;
  enviadaPor: string;
  enviadaEm: string;
  aprovadaEm?: string;
  rejeitadaEm?: string;
  solicitacaoExclusao?: boolean;
  dataSolicitacaoExclusao?: string;
}
```

**`src/hooks/useMusicas.tsx` — filtros e função `excluirMusica`:**

```typescript
function lerMusicasLocais(): Musica[] {
  const locais = lerLocalStorage<Musica[]>(localKey, []);
  if (locais.length && !locais.some((musica) => musica.id === 'bondade-de-deus')) return locais.filter((musica) => !musica.solicitacaoExclusao);
  salvarLocalStorage(localKey, musicasExemplo);
  return musicasExemplo;
}

const excluirMusica = useCallback(
  async (id: string) => {
    const agora = new Date().toISOString();
    persistirLocal(musicas.filter((musica) => musica.id !== id));
    if (user && !user.isAnonymous) {
      await updateDoc(doc(db, 'users', user.uid, 'musicas', id), {
        solicitacaoExclusao: true,
        dataSolicitacaoExclusao: agora
      });
      await deleteDoc(doc(db, 'users', user.uid, 'favoritos', id)).catch(() => undefined);
    }
    showToast('Conteúdo removido com sucesso.', 'sucesso');
  },
  [musicas, persistirLocal, showToast, user]
);
```

**`src/hooks/useComunidade.tsx` — filtros e funções de moderação de exclusão:**

```typescript
const unsubAprovadas = onSnapshot(
  query(collection(db, 'comunidade'), where('status', '==', 'aprovada')),
  (snapshot) => {
    setMusicas(snapshot.docs.map((doc) => doc.data() as MusicaComunidade).filter((musica) => !musica.solicitacaoExclusao));
    setLoading(false);
  },
  (err) => {
    setError(err.message);
    setLoading(false);
  }
);

unsubPendentes = onSnapshot(
  query(collection(db, 'comunidade'), where('status', '==', 'pendente')),
  (snapshot) => {
    setPendentes(snapshot.docs.map((doc) => doc.data() as MusicaComunidade).filter((musica) => !musica.solicitacaoExclusao));
  },
  (err) => {
    setError(err.message);
  }
);

unsubSolicitacoesExclusao = onSnapshot(
  query(collection(db, 'comunidade'), where('solicitacaoExclusao', '==', true)),
  (snapshot) => {
    setSolicitacoesExclusao(snapshot.docs.map((doc) => doc.data() as MusicaComunidade));
  },
  (err) => {
    setError(err.message);
  }
);

const aprovarExclusaoPermanente = useCallback(
  async (id: string) => {
    await deleteDoc(doc(db, 'comunidade', id));
    showToast('Exclusão aprovada e conteúdo removido permanentemente.', 'sucesso');
  },
  [showToast]
);

const rejeitarExclusaoRestaurar = useCallback(
  async (id: string) => {
    await updateDoc(doc(db, 'comunidade', id), { solicitacaoExclusao: false, dataSolicitacaoExclusao: deleteField() });
    showToast('Conteúdo restaurado.', 'sucesso');
  },
  [showToast]
);
```

### FASE 17

**`src/types/index.ts` — interface `Espaco`:**

```typescript
export interface Espaco {
  id: string;
  nome: string;
  tipo: 'ministerio' | 'banda' | 'estudo' | 'outro';
  donoUid: string;
  codigo: string;
  criadoEm: string;
  observacoesEnsaio?: Record<string, string>;
}
```

**`src/hooks/useEspacos.tsx` — leitura e escrita de `observacoesEnsaio`:**

```typescript
const [observacoesEnsaio, setObservacoesEnsaio] = useState<Record<string, string>>({});

const unsubEspaco = onSnapshot(doc(db, 'espacos', espacoId), (snapshot) => {
  if (snapshot.exists()) {
    const data = snapshot.data() as import('../types').Espaco & { observacoesEnsaio?: Record<string, string> };
    setObservacoesEnsaio(data.observacoesEnsaio ?? {});
  }
});

const salvarObservacaoEnsaio = useCallback(
  async (musicaId: string, texto: string) => {
    if (!espacoId || !podeEditar) return;
    const proximas = { ...observacoesEnsaio, [musicaId]: texto };
    await setDoc(doc(db, 'espacos', espacoId), { observacoesEnsaio: proximas }, { merge: true });
    setObservacoesEnsaio(proximas);
  },
  [espacoId, observacoesEnsaio, podeEditar]
);
```

### FASE 18

**`src/hooks/useCamadaPrivada.ts` — tipos e função `solicitarMusica`:**

```typescript
export interface CamadaPrivadaState {
  autorizado: boolean;
  loading: boolean;
  albuns: NavidromeAlbum[];
  cameras: FrigateCamera[];
  faixasPorAlbum: Record<string, NavidromeTrack[]>;
  buscarFaixas: (albumId: string) => Promise<NavidromeTrack[]>;
  recarregar: () => void;
  solicitarMusica: (dados: { nomeMusica: string; artista: string; usuario: string }) => Promise<{ sucesso: boolean; mensagem: string }>;
}

async function solicitarMusica(dados: { nomeMusica: string; artista: string; usuario: string }): Promise<{ sucesso: boolean; mensagem: string }> {
  if (!proxyUrl) {
    return { sucesso: false, mensagem: 'Proxy não configurado' };
  }
  const token = await buscarToken();
  const response = await fetch(`${proxyUrl}/n8n/pedido-musica`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dados),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { sucesso: false, mensagem: data?.mensagem || 'Erro ao enviar pedido' };
  }
  return { sucesso: true, mensagem: data?.mensagem || 'Pedido enviado' };
}
```

---

## 3. FASE 18 SPECIFIC: CHAMADA AO PROXY / WEBHOOK E AUTENTICAÇÃO

### Chamada no Frontend (`src/hooks/useCamadaPrivada.ts`):

```typescript
const response = await fetch(`${proxyUrl}/n8n/pedido-musica`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(dados),
});
```

O payload enviado é:
```json
{
  "nomeMusica": "...",
  "artista": "...",
  "usuario": "..."
}
```

### Validação de Autenticação no Proxy (`server/proxy.js`):

```javascript
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://100.102.180.104:5678/webhook/pedido-musica';

app.post('/n8n/pedido-musica', verifyToken, checkAllowlist, async (req, res) => {
  try {
    const targetUrl = new URL(N8N_WEBHOOK_URL);
    const response = await fetch(targetUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body || {}),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return res.status(response.status).json({ sucesso: false, mensagem: data?.mensagem || 'Erro no webhook', detalhe: data });
    }
    return res.json({ sucesso: true, mensagem: 'Pedido enviado', detalhe: data });
  } catch (err) {
    return res.status(502).json({ sucesso: false, mensagem: 'Erro no proxy', detalhe: err.message });
  }
});
```

**A rota `/n8n/pedido-musica` ESTÁ protegida pelos middlewares `verifyToken` e `checkAllowlist`.** O token Firebase é verificado e o UID do usuário é checado contra a `ALLOWLIST` antes de repassar a requisição para o webhook n8n.

---

## 4. FASE 16 SPECIFIC: SCHEMAS DE COMUNIDADE E EXCLUSÃO SEGURA

- **Coleção/Subcoleção de Curtidas e Comentários:** Nenhuma coleção ou subcoleção para curtidas/comentários foi criada nas fases 16, 17 ou 18. O schema permanece focado em `MusicaComunidade` com campos de moderação (`status`, `aprovadaEm`, `rejeitadaEm`, `solicitacaoExclusao`, `dataSolicitacaoExclusao`). Não há schemas de curtidas ou comentários implementados no código auditado.

- **Código que trata `solicitacaoExclusao`:**

  `src/hooks/useMusicas.tsx`:
  ```typescript
  const excluirMusica = useCallback(
    async (id: string) => {
      const agora = new Date().toISOString();
      persistirLocal(musicas.filter((musica) => musica.id !== id));
      if (user && !user.isAnonymous) {
        await updateDoc(doc(db, 'users', user.uid, 'musicas', id), {
          solicitacaoExclusao: true,
          dataSolicitacaoExclusao: agora
        });
        await deleteDoc(doc(db, 'users', user.uid, 'favoritos', id)).catch(() => undefined);
      }
      showToast('Conteúdo removido com sucesso.', 'sucesso');
    },
    [musicas, persistirLocal, showToast, user]
  );
  ```

  `src/hooks/useComunidade.tsx`:
  ```typescript
  const aprovarExclusaoPermanente = useCallback(
    async (id: string) => {
      await deleteDoc(doc(db, 'comunidade', id));
      showToast('Exclusão aprovada e conteúdo removido permanentemente.', 'sucesso');
    },
    [showToast]
  );

  const rejeitarExclusaoRestaurar = useCallback(
    async (id: string) => {
      await updateDoc(doc(db, 'comunidade', id), { solicitacaoExclusao: false, dataSolicitacaoExclusao: deleteField() });
      showToast('Conteúdo restaurado.', 'sucesso');
    },
    [showToast]
  );
  ```

---

## 5. FASE 17 SPECIFIC: REPERTÓRIO E ANOTAÇÕES DO MODO DE PREPARAÇÃO

- **Coleção e Campos Firestore:**
  - Caminho: `espacos/{espacoId}`
  - Campo: `observacoesEnsaio` do tipo `Record<string, string>` (mapa de `musicaId -> textoDeObservacao`).
  - A persistência é feita via `setDoc(doc(db, 'espacos', espacoId), { observacoesEnsaio: proximas }, { merge: true })`, ou seja, é um campo mergeado no documento do espaço.
  - O repertório de músicas do espaço fica em `espacos/{espacoId}/musicas/{musicaId}` (subcoleção), com documentos do tipo `MusicaEspaco`.

- **Trecho de Código de Salvamento (`src/hooks/useEspacos.tsx`):**

```typescript
const [observacoesEnsaio, setObservacoesEnsaio] = useState<Record<string, string>>({});

const unsubEspaco = onSnapshot(doc(db, 'espacos', espacoId), (snapshot) => {
  if (snapshot.exists()) {
    const data = snapshot.data() as import('../types').Espaco & { observacoesEnsaio?: Record<string, string> };
    setObservacoesEnsaio(data.observacoesEnsaio ?? {});
  }
});

const salvarObservacaoEnsaio = useCallback(
  async (musicaId: string, texto: string) => {
    if (!espacoId || !podeEditar) return;
    const proximas = { ...observacoesEnsaio, [musicaId]: texto };
    await setDoc(doc(db, 'espacos', espacoId), { observacoesEnsaio: proximas }, { merge: true });
    setObservacoesEnsaio(proximas);
  },
  [espacoId, observacoesEnsaio, podeEditar]
);
```

---

## 6. SAÍDA COMPLETA DE BUILD (`tsc -b` e `vite build`)

```
$ npx tsc -b
npm notice run worshipflow@1.0.0 npx
npm notice run 'tsc' -b

$ npx vite build
vite v6.4.3 building for production...
transforming...
✓ 1737 modules transformed.
rendering chunks...
computing gzip size...
dist/manifest.webmanifest                            0.64 kB │ gzip:   0.55 kB
dist/index.html                                      1.09 kB │ gzip:   0.55 kB
dist/assets/pdf.worker.min-CHFwMXne.mjs          1,262.40 kB │ gzip: 143.61 kB
dist/assets/index-BmT3noGo.css                      37.76 kB │ gzip:   7.99 kB
dist/assets/cores-tom-CGJM2xpu.js                    0.18 kB │ gzip:   0.15 kB
dist/assets/RolagemAutomatica-CFgjvJn0.js            0.30 kB │ gzip:   0.24 kB
dist/assets/chevron-right-DmsBq9DA.js                0.30 kB │ gzip:   0.25 kB
dist/assets/loader-circle-BfFM5HMr.js                0.31 kB │ gzip:   0.26 kB
dist/assets/plus-_T-rqjRx.js                         0.32 kB │ gzip:   0.26 kB
dist/assets/arrow-left-BieMNVZS.js                   0.33 kB │ gzip:   0.27 kB
dist/assets/search-BLxIBmiS.js                       0.34 kB │ gzip:   0.25 kB
dist/assets/disc-DRJ8fxiv.js                         0.35 kB │ gzip:   0.25 kB
dist/assets/circle-check-big-drsUdXbv.js             0.36 kB │ gzip:   0.28 kB
dist/assets/music-Bzwrdh1U.js                        0.29 kB │ gzip:   0.29 kB
dist/assets/useTransposicao-Dp8vyvDY.js              0.39 kB │ gzip:   0.27 kB
dist/assets/copy-DiHUVCqm.js                         0.40 kB │ gzip:   0.30 kB
dist/assets/upload-DAqYouVf.js                       0.40 kB │ gzip:   0.30 kB
dist/assets/zap-DU_LtVPS.js                          0.41 kB │ gzip:   0.31 kB
dist/assets/EstadoVazio-a5LuHEWS.js                  0.45 kB │ gzip:   0.30 kB
dist/assets/save-DDOa8MmB.js                         0.50 kB │ gzip:   0.33 kB
dist/assets/file-text-KmCrEcZ1.js                    0.50 kB │ gzip:   0.32 kB
dist/assets/trash-2-DFE4-tbL.js                      0.53 kB │ gzip:   0.35 kB
dist/assets/CapaMusica-DsliN6Kf.js                   0.57 kB │ gzip:   0.42 kB
dist/assets/layers-CSqodI2P.js                       0.59 kB │ gzip:   0.34 kB
dist/assets/SectionHeader-BKSbbJZZ.js                0.61 kB │ gzip:   0.36 kB
dist/assets/star-YYBgu3tW.js                         0.64 kB │ gzip:   0.40 kB
dist/assets/LinhaLista-Di0p3Jwc.js                   0.83 kB │ gzip:   0.42 kB
dist/assets/EntrarEspaco-CcfI8OVY.js                 1.77 kB │ gzip:   0.83 kB
dist/assets/Artistas-ClHk9Qkc.js                     2.30 kB │ gzip:   1.09 kB
dist/assets/Albuns-WOOTbSDa.js                       2.44 kB │ gzip:   1.21 kB
dist/assets/Medleys-54tjortL.js                      2.58 kB │ gzip:   1.13 kB
dist/assets/BuscaRapida-DmKENENu.js                  2.59 kB │ gzip:   1.27 kB
dist/assets/Album-BfJS3RTY.js                        2.96 kB │ gzip:   1.30 kB
dist/assets/Artista-ChaMw6DO.js                      2.98 kB │ gzip:   1.25 kB
dist/assets/metronomo-Dm0uaPue.js                    3.05 kB │ gzip:   1.32 kB
dist/assets/Playlists-XON6-aIk.js                    3.30 kB │ gzip:   1.42 kB
dist/assets/EditorMedley-D3VjM6c3.js                 3.30 kB │ gzip:   1.32 kB
dist/assets/Biblioteca-CHRE2OBX.js                   3.33 kB │ gzip:   1.55 kB
dist/assets/ExibicaoCifra-B8cOKB6J.js                3.54 kB │ gzip:   1.58 kB
dist/assets/Comunidade-Cfi2rk4V.js                   3.76 kB │ gzip:   1.72 kB
dist/assets/Espacos-DZKdJ7__.js                      4.51 kB │ gzip:   1.85 kB
dist/assets/DetalhePlaylist-DYdUdfnH.js              4.67 kB │ gzip:   1.82 kB
dist/assets/Perfil-BPmgXHXB.js                       4.87 kB │ gzip:   1.71 kB
dist/assets/Cifra-BXlfH5gK.js                        5.02 kB │ gzip:   1.64 kB
dist/assets/DetalheMusica-Q5pu4IwH.js                5.17 kB │ gzip:   1.92 kB
dist/assets/Configuracoes-B95ywmFT.js                5.68 kB │ gzip:   2.09 kB
dist/assets/workbox-window.prod.es5-BBnX5xw4.js      5.75 kB │ gzip:   2.36 kB
dist/assets/Espaco-zfsqPxlV.js                       5.96 kB │ gzip:   2.16 kB
dist/assets/AdminPanel-TROEGyq8.js                   5.98 kB │ gzip:   1.90 kB
dist/assets/Musica-Bpy1aPpA.js                       6.04 kB │ gzip:   2.13 kB
dist/assets/ModoPreparacao-Cqt95l7F.js               6.27 kB │ gzip:   2.35 kB
dist/assets/Player-DwOHkjZ2.js                       6.36 kB │ gzip:   2.29 kB
dist/assets/Login-mePcjqIi.js                        6.52 kB │ gzip:   2.13 kB
dist/assets/Editor-Bh7_-ckl.js                        7.01 kB │ gzip:   2.54 kB
dist/assets/CamadaPrivada-ClrOhD2L.js                9.53 kB │ gzip:   3.29 kB
dist/assets/Inicio-CWJ2D3YD.js                      10.64 kB │ gzip:   3.32 kB
dist/assets/Tocar-2-aSgliZ.js                       10.64 kB │ gzip:   3.82 kB
dist/assets/Importar-Bk_SAU9M.js                    14.44 kB │ gzip:   4.77 kB
dist/assets/vendor-ocr-D6n_tao3.js                  15.52 kB │ gzip:   6.74 kB
dist/assets/index-kKQPD7SJ.js                      153.38 kB │ gzip:  46.69 kB
dist/assets/vendor-react-UD8g9gq6.js               217.45 kB │ gzip:  69.81 kB
dist/assets/vendor-exportar-BUW7exb-.js            332.97 kB │ gzip: 114.68 kB
dist/assets/vendor-pdf-DigARlWQ.js                 478.16 kB │ gzip: 143.61 kB
dist/assets/vendor-firebase-BX5FyawR.js            609.12 kB │ gzip: 145.80 kB
✓ built in 13.19s

(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration/options/output/manualChunks
- Adjust chunk size warning limit for this build via build.chunkSizeWarningLimit.

PWA v0.21.2
mode      generateSW
precache  66 entries (1971.91 KiB)
files generated
  dist/sw.js
  dist/workbox-dcde9eb3.js
```

---

## 7. DECLARAÇÃO DE ORIGEM DOS SCHEMAS

**Estas três fases foram implementadas com base em schema aprovado pelo Claude Gestão, ou o Kilo Code definiu o schema por conta própria por não encontrar um definido?**

O Kilo Code definiu os schemas por conta própria com base nas descrições das fases fornecidas pelo usuário, pois não encontrou nenhum documento de schema aprovado pelo Claude Gestão para estas fases específicas. Os tipos, coleções e estruturas de dados foram criados durante a implementação para atender aos requisitos funcionais descritos em cada tarefa.
