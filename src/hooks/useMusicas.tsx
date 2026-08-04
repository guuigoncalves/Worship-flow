import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { arrayUnion, collection, deleteDoc, doc, increment, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import type { Musica, ResultadoBusca, TagMusica, Tom, VersaoMusica } from '../types';
import { musicasExemplo } from '../data/musicas-exemplo';
import { db } from '../utils/firebase';
import { buscarMusicas } from '../utils/busca';
import { extrairAcordes, importarTextoLivre } from '../utils/acordes';
import { lerLocalStorage, salvarLocalStorage } from '../utils/storage';
import { useAuth } from './useAuth';
import { useToast } from './useToast';

interface NovaMusicaInput {
  titulo: string;
  artista: string;
  tom: Tom;
  letra: string;
  tags: TagMusica[];
  dificuldade: Musica['dificuldade'];
  possuiCifra?: boolean;
}

interface MusicasContextValue {
  musicas: Musica[];
  loading: boolean;
  error: string | null;
  buscar: (consulta: string, filtros?: string[]) => ResultadoBusca[];
  obterMusica: (id: string) => Musica | undefined;
  salvarMusica: (input: NovaMusicaInput, id?: string) => Promise<Musica>;
  salvarVersao: (musicaId: string, versao: Omit<VersaoMusica, 'id'>) => Promise<void>;
  excluirMusica: (id: string) => Promise<void>;
  duplicarMusica: (id: string) => Promise<void>;
  alternarFavorita: (id: string) => Promise<void>;
  marcarTocada: (id: string) => Promise<void>;
  importarMusica: (texto: string) => Promise<Musica>;
}

const MusicasContext = createContext<MusicasContextValue | null>(null);
const localKey = 'worshipflow:musicas';

function lerMusicasLocais(): Musica[] {
  const locais = lerLocalStorage<Musica[]>(localKey, []);
  if (locais.length && !locais.some((musica) => musica.id === 'bondade-de-deus')) return locais.filter((musica) => !musica.solicitacaoExclusao);
  salvarLocalStorage(localKey, musicasExemplo);
  return musicasExemplo;
}

function ordenar(musicas: Musica[]): Musica[] {
  return [...musicas].sort((a, b) => (b.ultimaTocada ?? b.criadaEm).localeCompare(a.ultimaTocada ?? a.criadaEm));
}

export function MusicasProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [musicas, setMusicas] = useState<Musica[]>(() => lerMusicasLocais());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const persistirLocal = useCallback((proximas: Musica[]) => {
    setMusicas(ordenar(proximas));
    salvarLocalStorage(localKey, proximas);
  }, []);

  useEffect(() => {
    if (!user || user.isAnonymous) {
      setMusicas(lerMusicasLocais());
      return undefined;
    }
    setLoading(true);
    const ref = collection(db, 'users', user.uid, 'musicas');
    const unsubscribe = onSnapshot(
      query(ref, orderBy('criadaEm', 'desc')),
      async (snapshot) => {
        if (snapshot.empty) {
          await Promise.all(musicasExemplo.map((musica) => setDoc(doc(db, 'users', user.uid, 'musicas', musica.id), { ...musica, criadaEmServidor: serverTimestamp() }, { merge: true })));
          setMusicas(ordenar(musicasExemplo));
        } else {
          setMusicas(ordenar(snapshot.docs.map((item) => item.data() as Musica).filter((musica) => !musica.solicitacaoExclusao)));
        }
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [user]);

  const salvarDocumento = useCallback(
    async (musica: Musica) => {
      if (user && !user.isAnonymous) {
        await setDoc(doc(db, 'users', user.uid, 'musicas', musica.id), { ...musica, criadaEmServidor: serverTimestamp() }, { merge: true });
        const artistaId = musica.artista.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\W+/g, '-').replace(/^-|-$/g, '') || 'sem-artista';
        await setDoc(doc(db, 'users', user.uid, 'artistas', artistaId), {
          nome: musica.artista,
          musicaIds: arrayUnion(musica.id),
          atualizadoEm: serverTimestamp()
        }, { merge: true });
      }
    },
    [user]
  );

  // Atualiza a lista local e sincroniza no Firestore SÓ as músicas que de fato mudaram
  // (afetadas), em vez de regravar a coleção inteira a cada alteração. Regravar tudo:
  // (a) é O(n) writes pra uma mudança de 1 item, (b) reescreve `criadaEmServidor` de
  // músicas não relacionadas a cada chamada, corrompendo ordenação/metadados delas.
  const atualizarLista = useCallback(
    async (mutator: (atuais: Musica[]) => Musica[], afetadas: Musica[], mensagem?: string) => {
      setError(null);
      try {
        const proximas = mutator(musicas);
        persistirLocal(proximas);
        if (user && !user.isAnonymous && afetadas.length) {
          await Promise.all(afetadas.map((musica) => salvarDocumento(musica)));
        }
        if (mensagem) showToast(mensagem, 'sucesso');
      } catch (err) {
        const message = err instanceof Error ? err.message : t('common.error');
        setError(message);
        showToast(message, 'erro');
        throw err;
      }
    },
    [musicas, persistirLocal, salvarDocumento, showToast, t, user]
  );

  const buscar = useCallback((consulta: string, filtros: string[] = []) => buscarMusicas(musicas, consulta, filtros), [musicas]);
  const obterMusica = useCallback((id: string) => musicas.find((musica) => musica.id === id), [musicas]);

  const salvarMusica = useCallback(
    async (input: NovaMusicaInput, id?: string) => {
      const musicaExistente = id ? obterMusica(id) : undefined;
      const musica: Musica = {
        id: id ?? crypto.randomUUID(),
        titulo: input.titulo,
        artista: input.artista,
        tom: input.tom,
        acordes: extrairAcordes(input.letra),
        letra: input.letra,
        tags: input.tags,
        dificuldade: input.dificuldade,
        eFavorita: musicaExistente?.eFavorita ?? false,
        vezesTocada: musicaExistente?.vezesTocada ?? 0,
        ultimaTocada: musicaExistente?.ultimaTocada ?? null,
        criadaEm: musicaExistente?.criadaEm ?? new Date().toISOString(),
        versoes: musicaExistente?.versoes ?? [],
        possuiCifra: input.possuiCifra ?? musicaExistente?.possuiCifra ?? true
      };
      await atualizarLista((atuais) => [musica, ...atuais.filter((item) => item.id !== musica.id)], [musica], t('toast.saved'));
      return musica;
    },
    [atualizarLista, obterMusica, t]
  );

  const salvarVersao = useCallback(
    async (musicaId: string, versao: Omit<VersaoMusica, 'id'>) => {
      const original = obterMusica(musicaId);
      if (!original) return;
      const alterada: Musica = { ...original, versoes: [...original.versoes, { ...versao, id: crypto.randomUUID() }] };
      await atualizarLista(
        (atuais) => atuais.map((musica) => (musica.id === musicaId ? alterada : musica)),
        [alterada],
        t('toast.saved')
      );
    },
    [atualizarLista, obterMusica, t]
  );

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

  const duplicarMusica = useCallback(
    async (id: string) => {
      const original = obterMusica(id);
      if (!original) return;
      const copia: Musica = { ...original, id: crypto.randomUUID(), titulo: `${original.titulo} - cópia`, criadaEm: new Date().toISOString(), ultimaTocada: null, vezesTocada: 0 };
      await atualizarLista((atuais) => [copia, ...atuais], [copia], t('toast.copied'));
    },
    [atualizarLista, obterMusica, t]
  );

  const alternarFavorita = useCallback(
    async (id: string) => {
      const alvo = musicas.find((musica) => musica.id === id);
      if (!alvo) return;
      const atualizada: Musica = { ...alvo, eFavorita: !alvo.eFavorita };
      await atualizarLista((atuais) => atuais.map((musica) => (musica.id === id ? atualizada : musica)), [atualizada]);
      if (user && !user.isAnonymous) {
        const ref = doc(db, 'users', user.uid, 'favoritos', id);
        if (atualizada.eFavorita) await setDoc(ref, { referenciaMusica: id, adicionadoEm: new Date().toISOString() }, { merge: true });
        else await deleteDoc(ref);
      }
    },
    [atualizarLista, musicas, user]
  );

  const marcarTocada = useCallback(
    async (id: string) => {
      const tocadaEm = new Date().toISOString();
      const musica = obterMusica(id);
      if (!musica) return;
      const atualizada: Musica = { ...musica, vezesTocada: musica.vezesTocada + 1, ultimaTocada: tocadaEm };
      await atualizarLista((atuais) => atuais.map((item) => (item.id === id ? atualizada : item)), [atualizada]);
      if (user && !user.isAnonymous) {
        const entradaId = crypto.randomUUID();
        await setDoc(doc(db, 'users', user.uid, 'historico', entradaId), { id: entradaId, musicaId: id, titulo: musica.titulo, tom: musica.tom, tocadaEm });
        await setDoc(
          doc(db, 'users', user.uid, 'estatisticas', 'geral'),
          {
            totalCultos: increment(1),
            ultimoAcesso: tocadaEm,
            musicasRecentes: arrayUnion({ musicaId: id, titulo: musica.titulo, tocadaEm })
          },
          { merge: true }
        );
      }
    },
    [atualizarLista, obterMusica, user]
  );

  const importarMusica = useCallback(
    async (texto: string) => {
      const letra = importarTextoLivre(texto);
      const primeiraLinha = texto.split(/\r?\n/).find((linha) => linha.trim()) ?? 'Nova música';
      return salvarMusica({ titulo: primeiraLinha.replace(/\[[^\]]+]/g, '').slice(0, 60), artista: 'Importado', tom: 'G', letra, tags: ['louvor'], dificuldade: 'intermediario' });
    },
    [salvarMusica]
  );

  const value = useMemo(
    () => ({ musicas, loading, error, buscar, obterMusica, salvarMusica, salvarVersao, excluirMusica, duplicarMusica, alternarFavorita, marcarTocada, importarMusica }),
    [alternarFavorita, buscar, duplicarMusica, error, excluirMusica, importarMusica, loading, marcarTocada, musicas, obterMusica, salvarMusica, salvarVersao]
  );

  return <MusicasContext.Provider value={value}>{children}</MusicasContext.Provider>;
}

export function useMusicas() {
  const context = useContext(MusicasContext);
  if (!context) throw new Error('useMusicas must be used inside MusicasProvider');
  return context;
}
