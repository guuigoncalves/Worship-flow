import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from './useAuth';
import { useToast } from './useToast';
import { db } from '../utils/firebase';
import type { Playlist } from '../types';

interface PlaylistsContextValue {
  playlists: Playlist[];
  loading: boolean;
  error: string | null;
  criarPlaylist: (nome: string, descricao?: string) => Promise<Playlist>;
  excluirPlaylist: (id: string) => Promise<void>;
  adicionarFaixa: (playlistId: string, musicaId: string) => Promise<void>;
  removerFaixa: (playlistId: string, musicaId: string) => Promise<void>;
}

const PlaylistsContext = createContext<PlaylistsContextValue | null>(null);

export function PlaylistsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.isAnonymous) {
      setPlaylists([]);
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    const ref = collection(db, 'users', user.uid, 'playlists');
    const unsubscribe = onSnapshot(
      query(ref, orderBy('criadaEm', 'desc')),
      (snapshot) => {
        setPlaylists(snapshot.docs.map((doc) => doc.data() as Playlist));
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [user]);

  const criarPlaylist = useCallback(
    async (nome: string, descricao?: string) => {
      if (!user || user.isAnonymous) throw new Error('Faça login para criar playlists.');
      const playlist: Playlist = {
        id: crypto.randomUUID(),
        nome,
        descricao,
        faixas: [],
        criadaEm: new Date().toISOString(),
        atualizadaEm: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', user.uid, 'playlists', playlist.id), { ...playlist, criadaEmServidor: serverTimestamp() });
      showToast('Playlist criada', 'sucesso');
      return playlist;
    },
    [user, showToast]
  );

  const excluirPlaylist = useCallback(
    async (id: string) => {
      if (!user || user.isAnonymous) throw new Error('Faça login para excluir playlists.');
      await deleteDoc(doc(db, 'users', user.uid, 'playlists', id));
      showToast('Playlist excluída', 'sucesso');
    },
    [user, showToast]
  );

  const adicionarFaixa = useCallback(
    async (playlistId: string, musicaId: string) => {
      if (!user || user.isAnonymous) throw new Error('Faça login para editar playlists.');
      const playlist = playlists.find((p) => p.id === playlistId);
      if (!playlist) throw new Error('Playlist não encontrada.');
      if (playlist.faixas.includes(musicaId)) return;
      const faixas = [...playlist.faixas, musicaId];
      await updateDoc(doc(db, 'users', user.uid, 'playlists', playlistId), { faixas, atualizadaEm: new Date().toISOString() });
      showToast('Música adicionada à playlist', 'sucesso');
    },
    [user, showToast, playlists]
  );

  const removerFaixa = useCallback(
    async (playlistId: string, musicaId: string) => {
      if (!user || user.isAnonymous) throw new Error('Faça login para editar playlists.');
      const playlist = playlists.find((p) => p.id === playlistId);
      if (!playlist) throw new Error('Playlist não encontrada.');
      const faixas = playlist.faixas.filter((id) => id !== musicaId);
      await updateDoc(doc(db, 'users', user.uid, 'playlists', playlistId), { faixas, atualizadaEm: new Date().toISOString() });
      showToast('Música removida da playlist', 'sucesso');
    },
    [user, showToast, playlists]
  );

  const value = useMemo(() => ({ playlists, loading, error, criarPlaylist, excluirPlaylist, adicionarFaixa, removerFaixa }), [adicionarFaixa, playlists, loading, error, criarPlaylist, excluirPlaylist, removerFaixa]);

  return <PlaylistsContext.Provider value={value}>{children}</PlaylistsContext.Provider>;
}

export function usePlaylists() {
  const context = useContext(PlaylistsContext);
  if (!context) throw new Error('usePlaylists must be used inside PlaylistsProvider');
  return context;
}
