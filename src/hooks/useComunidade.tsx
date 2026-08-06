import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { collection, deleteDoc, deleteField, doc, onSnapshot, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { useAuth } from './useAuth';
import { useToast } from './useToast';
import { db } from '../utils/firebase';
import type { Musica, MusicaComunidade, StatusMusica } from '../types';

interface ComunidadeContextValue {
  musicas: MusicaComunidade[];
  pendentes: MusicaComunidade[];
  solicitacoesExclusao: MusicaComunidade[];
  loading: boolean;
  error: string | null;
  obterMusicasComunidade: () => MusicaComunidade[];
  obterMusicasPendentes: () => MusicaComunidade[];
  obterSolicitacoesExclusao: () => MusicaComunidade[];
  enviarParaComunidade: (musica: Musica) => Promise<MusicaComunidade>;
  aprovarMusica: (id: string) => Promise<void>;
  rejeitarMusica: (id: string) => Promise<void>;
  aprovarExclusaoPermanente: (id: string) => Promise<void>;
  rejeitarExclusaoRestaurar: (id: string) => Promise<void>;
}

const ComunidadeContext = createContext<ComunidadeContextValue | null>(null);

export function ComunidadeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [musicas, setMusicas] = useState<MusicaComunidade[]>([]);
  const [pendentes, setPendentes] = useState<MusicaComunidade[]>([]);
  const [solicitacoesExclusao, setSolicitacoesExclusao] = useState<MusicaComunidade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.isAnonymous) {
      setMusicas([]);
      setPendentes([]);
      setSolicitacoesExclusao([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);

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

    const isAdmin = Boolean(user.uid && import.meta.env.VITE_ADM_UID && user.uid === import.meta.env.VITE_ADM_UID);
    let unsubPendentes: (() => void) | undefined;
    let unsubSolicitacoesExclusao: (() => void) | undefined;

    if (isAdmin) {
      unsubPendentes = onSnapshot(
        query(collection(db, 'comunidade'), where('status', '==', 'pendente')),
        (snapshot) => {
          setPendentes(snapshot.docs.map((doc) => doc.data() as MusicaComunidade).filter((musica) => !musica.solicitacaoExclusao));
        },
        (err) => {
          if (err.code === 'permission-denied') {
            setPendentes([]);
          } else {
            setError(err.message);
          }
        }
      );

      unsubSolicitacoesExclusao = onSnapshot(
        query(collection(db, 'comunidade'), where('solicitacaoExclusao', '==', true)),
        (snapshot) => {
          setSolicitacoesExclusao(snapshot.docs.map((doc) => doc.data() as MusicaComunidade));
        },
        (err) => {
          if (err.code === 'permission-denied') {
            setSolicitacoesExclusao([]);
          } else {
            setError(err.message);
          }
        }
      );
    }

    return () => {
      unsubAprovadas();
      unsubPendentes?.();
      unsubSolicitacoesExclusao?.();
    };
  }, [user]);

  const obterMusicasComunidade = useCallback(() => musicas, [musicas]);

  const obterMusicasPendentes = useCallback(() => pendentes, [pendentes]);

  const obterSolicitacoesExclusao = useCallback(() => solicitacoesExclusao, [solicitacoesExclusao]);

  const enviarParaComunidade = useCallback(
    async (musica: Musica) => {
      if (!user || user.isAnonymous) {
        throw new Error('Faça login para enviar para a comunidade.');
      }
      const musicaComunidade: MusicaComunidade = {
        id: crypto.randomUUID(),
        titulo: musica.titulo,
        artista: musica.artista,
        tom: musica.tom,
        letra: musica.letra,
        acordes: musica.acordes,
        tags: musica.tags,
        dificuldade: musica.dificuldade,
        status: 'pendente',
        enviadaPor: user.uid,
        enviadaEm: new Date().toISOString(),
      };
      await setDoc(doc(db, 'comunidade', musicaComunidade.id), { ...musicaComunidade, criadaEmServidor: serverTimestamp() });
      showToast('Cifra enviada para a comunidade! Aguarde aprovação.', 'sucesso');
      return musicaComunidade;
    },
    [user, showToast]
  );

  const aprovarMusica = useCallback(
    async (id: string) => {
      await updateDoc(doc(db, 'comunidade', id), { status: 'aprovada' as StatusMusica, aprovadaEm: new Date().toISOString() });
      showToast('Música aprovada na comunidade', 'sucesso');
    },
    [showToast]
  );

  const rejeitarMusica = useCallback(
    async (id: string) => {
      await updateDoc(doc(db, 'comunidade', id), { status: 'rejeitada' as StatusMusica, rejeitadaEm: new Date().toISOString() });
      showToast('Música rejeitada na comunidade', 'sucesso');
    },
    [showToast]
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

  const value = useMemo(() => ({
    musicas,
    pendentes,
    solicitacoesExclusao,
    loading,
    error,
    obterMusicasComunidade,
    obterMusicasPendentes,
    obterSolicitacoesExclusao,
    enviarParaComunidade,
    aprovarMusica,
    rejeitarMusica,
    aprovarExclusaoPermanente,
    rejeitarExclusaoRestaurar,
  }), [aprovarMusica, aprovarExclusaoPermanente, enviarParaComunidade, error, loading, musicas, obterMusicasComunidade, obterMusicasPendentes, obterSolicitacoesExclusao, pendentes, rejeitarExclusaoRestaurar, rejeitarMusica, solicitacoesExclusao]);

  return <ComunidadeContext.Provider value={value}>{children}</ComunidadeContext.Provider>;
}

export function useComunidade() {
  const context = useContext(ComunidadeContext);
  if (!context) throw new Error('useComunidade must be used inside ComunidadeProvider');
  return context;
}
