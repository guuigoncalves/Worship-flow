import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore';
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
  if (locais.length && !locais.some((musica) => musica.id === 'bondade-de-deus')) return locais;
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
          setMusicas(musicasExemplo);
        } else {
          setMusicas(ordenar(snapshot.docs.map((item) => item.data() as Musica)));
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
          musicaIds: [musica.id],
          albumIds: [],
          atualizadoEm: serverTimestamp()
        }, { merge: true });
      }
    },
    [user]
  );

  const atualizarLista = useCallback(
    async (mutator: (atuais: Musica[]) => Musica[], mensagem?: string) => {
      setError(null);
      try {
        const proximas = mutator(musicas);
        persistirLocal(proximas);
        if (user && !user.isAnonymous) {
          await Promise.all(proximas.map((musica) => salvarDocumento(musica)));
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
        versoes: musicaExistente?.versoes ?? []
      };
      await atualizarLista((atuais) => [musica, ...atuais.filter((item) => item.id !== musica.id)], t('toast.saved'));
      if (user && !user.isAnonymous) await salvarDocumento(musica);
      return musica;
    },
    [atualizarLista, obterMusica, salvarDocumento, t, user]
  );

  const salvarVersao = useCallback(
    async (musicaId: string, versao: Omit<VersaoMusica, 'id'>) => {
      await atualizarLista(
        (atuais) =>
          atuais.map((musica) =>
            musica.id === musicaId
              ? { ...musica, versoes: [...musica.versoes, { ...versao, id: crypto.randomUUID() }] }
              : musica
          ),
        t('toast.saved')
      );
    },
    [atualizarLista, t]
  );

  const excluirMusica = useCallback(
    async (id: string) => {
      persistirLocal(musicas.filter((musica) => musica.id !== id));
      if (user && !user.isAnonymous) await deleteDoc(doc(db, 'users', user.uid, 'musicas', id));
      showToast(t('toast.deleted'), 'sucesso');
    },
    [musicas, persistirLocal, showToast, t, user]
  );

  const duplicarMusica = useCallback(
    async (id: string) => {
      const original = obterMusica(id);
      if (!original) return;
      const copia: Musica = { ...original, id: crypto.randomUUID(), titulo: `${original.titulo} - cópia`, criadaEm: new Date().toISOString(), ultimaTocada: null, vezesTocada: 0 };
      await atualizarLista((atuais) => [copia, ...atuais], t('toast.copied'));
      if (user && !user.isAnonymous) await salvarDocumento(copia);
    },
    [atualizarLista, obterMusica, salvarDocumento, t, user]
  );

  const alternarFavorita = useCallback(
    async (id: string) => {
      const alvo = musicas.find((musica) => musica.id === id);
      await atualizarLista((atuais) => atuais.map((musica) => (musica.id === id ? { ...musica, eFavorita: !musica.eFavorita } : musica)));
      if (user && !user.isAnonymous && alvo) {
        const ref = doc(db, 'users', user.uid, 'favoritos', id);
        if (!alvo.eFavorita) await setDoc(ref, { referenciaMusica: id, adicionadoEm: new Date().toISOString() }, { merge: true });
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
      await atualizarLista((atuais) => atuais.map((item) => (item.id === id ? { ...item, vezesTocada: item.vezesTocada + 1, ultimaTocada: tocadaEm } : item)));
      if (user && !user.isAnonymous) {
        const entradaId = crypto.randomUUID();
        await setDoc(doc(db, 'users', user.uid, 'historico', entradaId), { id: entradaId, musicaId: id, titulo: musica.titulo, tom: musica.tom, tocadaEm });
        await setDoc(
          doc(db, 'users', user.uid, 'estatisticas', 'geral'),
          {
            totalCultos: 1,
            ultimoAcesso: tocadaEm,
            musicasRecentes: [{ musicaId: id, titulo: musica.titulo, tocadaEm }],
            musicasMaisTocadas: [{ musicaId: id, titulo: musica.titulo, contagem: musica.vezesTocada + 1 }]
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
