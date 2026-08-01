import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import type { Espaco, Musica, MusicaEspaco, PapelEspaco } from '../types';
import { db } from '../utils/firebase';
import { useAuth } from './useAuth';
import { useToast } from './useToast';

// Espelho de "de quais espaços eu faço parte" fica em users/{uid}/espacos —
// dentro da árvore que já é 100% do dono (firebase.rules já cobre isso),
// então listar "Meus Espaços" não depende de nenhuma regra nova.
// Os dados de verdade do espaço (nome, membros, músicas compartilhadas)
// vivem em /espacos/{id} — regras novas em firebase.rules.

interface EspacoResumo extends Espaco {
  papel: PapelEspaco;
}

interface EspacosContextValue {
  espacos: EspacoResumo[];
  loading: boolean;
  criarEspaco: (nome: string, tipo: Espaco['tipo']) => Promise<Espaco>;
  entrarComCodigo: (codigo: string) => Promise<Espaco>;
  sairDoEspaco: (espacoId: string) => Promise<void>;
}

const EspacosContext = createContext<EspacosContextValue | null>(null);

function gerarCodigo(): string {
  const alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sem O/0/I/1 pra evitar confusão
  return Array.from({ length: 6 }, () => alfabeto[Math.floor(Math.random() * alfabeto.length)]).join('');
}

export function EspacosProvider({ children }: { children: ReactNode }) {
  const { user, perfilUsuario } = useAuth();
  const { showToast } = useToast();
  const [espacos, setEspacos] = useState<EspacoResumo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || user.isAnonymous) {
      setEspacos([]);
      return undefined;
    }
    setLoading(true);
    const unsubscribe = onSnapshot(collection(db, 'users', user.uid, 'espacos'), (snapshot) => {
      setEspacos(snapshot.docs.map((item) => item.data() as EspacoResumo));
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const criarEspaco = useCallback(
    async (nome: string, tipo: Espaco['tipo']) => {
      if (!user || user.isAnonymous) throw new Error('Entre com uma conta pra criar um espaço.');
      const espacoId = crypto.randomUUID();
      const codigo = gerarCodigo();
      const espaco: Espaco = { id: espacoId, nome, tipo, donoUid: user.uid, codigo, criadoEm: new Date().toISOString() };
      await setDoc(doc(db, 'espacos', espacoId), { ...espaco, criadaEmServidor: serverTimestamp() });
      await setDoc(doc(db, 'codigos', codigo), { espacoId });
      await setDoc(doc(db, 'espacos', espacoId, 'membros', user.uid), {
        uid: user.uid,
        nome: perfilUsuario?.nome ?? 'Músico',
        papel: 'dono' satisfies PapelEspaco,
        entrouEm: new Date().toISOString()
      });
      await setDoc(doc(db, 'users', user.uid, 'espacos', espacoId), { ...espaco, papel: 'dono' satisfies PapelEspaco });
      showToast('Espaço criado', 'sucesso');
      return espaco;
    },
    [perfilUsuario, showToast, user]
  );

  const entrarComCodigo = useCallback(
    async (codigoDigitado: string) => {
      if (!user || user.isAnonymous) throw new Error('Entre com uma conta pra entrar em um espaço.');
      const codigo = codigoDigitado.trim().toUpperCase();
      const lookup = await getDoc(doc(db, 'codigos', codigo));
      if (!lookup.exists()) throw new Error('Código não encontrado. Confira e tente de novo.');
      const { espacoId } = lookup.data() as { espacoId: string };
      const espacoSnap = await getDoc(doc(db, 'espacos', espacoId));
      if (!espacoSnap.exists()) throw new Error('Esse espaço não existe mais.');
      const espaco = espacoSnap.data() as Espaco;
      const membroExistente = await getDoc(doc(db, 'espacos', espaco.id, 'membros', user.uid));
      if (!membroExistente.exists()) {
        await setDoc(doc(db, 'espacos', espaco.id, 'membros', user.uid), {
          uid: user.uid,
          nome: perfilUsuario?.nome ?? 'Músico',
          papel: 'leitor' satisfies PapelEspaco,
          entrouEm: new Date().toISOString()
        });
      }
      const papel = membroExistente.exists() ? ((membroExistente.data() as { papel: PapelEspaco }).papel) : 'leitor';
      await setDoc(doc(db, 'users', user.uid, 'espacos', espaco.id), { ...espaco, papel });
      showToast(`Você entrou em ${espaco.nome}`, 'sucesso');
      return espaco;
    },
    [perfilUsuario, showToast, user]
  );

  const sairDoEspaco = useCallback(
    async (espacoId: string) => {
      if (!user || user.isAnonymous) return;
      await deleteDoc(doc(db, 'espacos', espacoId, 'membros', user.uid));
      await deleteDoc(doc(db, 'users', user.uid, 'espacos', espacoId));
      showToast('Você saiu do espaço', 'sucesso');
    },
    [showToast, user]
  );

  const value = useMemo(() => ({ espacos, loading, criarEspaco, entrarComCodigo, sairDoEspaco }), [criarEspaco, entrarComCodigo, espacos, loading, sairDoEspaco]);
  return <EspacosContext.Provider value={value}>{children}</EspacosContext.Provider>;
}

export function useEspacos() {
  const context = useContext(EspacosContext);
  if (!context) throw new Error('useEspacos must be used inside EspacosProvider');
  return context;
}

// Hook à parte pra dados de UM espaço específico (membros + músicas
// compartilhadas) — só busca quando a tela do espaço está de fato aberta.
export function useEspacoDetalhe(espacoId: string | undefined) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [membros, setMembros] = useState<import('../types').MembroEspaco[]>([]);
  const [musicas, setMusicas] = useState<MusicaEspaco[]>([]);
  const [meuPapel, setMeuPapel] = useState<PapelEspaco | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!espacoId || !user) return undefined;
    setLoading(true);
    const unsubMembros = onSnapshot(collection(db, 'espacos', espacoId, 'membros'), (snapshot) => {
      const lista = snapshot.docs.map((item) => item.data() as import('../types').MembroEspaco);
      setMembros(lista);
      setMeuPapel(lista.find((membro) => membro.uid === user.uid)?.papel ?? null);
      setLoading(false);
    });
    const unsubMusicas = onSnapshot(collection(db, 'espacos', espacoId, 'musicas'), (snapshot) => {
      setMusicas(snapshot.docs.map((item) => item.data() as MusicaEspaco));
    });
    return () => {
      unsubMembros();
      unsubMusicas();
    };
  }, [espacoId, user]);

  const podeEditar = meuPapel === 'dono' || meuPapel === 'admin' || meuPapel === 'editor';
  const podeGerenciarMembros = meuPapel === 'dono' || meuPapel === 'admin';

  const compartilharMusica = useCallback(
    async (musica: Musica) => {
      if (!espacoId || !user || !podeEditar) return;
      const item: MusicaEspaco = {
        id: crypto.randomUUID(),
        titulo: musica.titulo,
        artista: musica.artista,
        tom: musica.tom,
        letra: musica.letra,
        compartilhadaPor: user.uid,
        compartilhadaEm: new Date().toISOString()
      };
      await setDoc(doc(db, 'espacos', espacoId, 'musicas', item.id), item);
      showToast('Música compartilhada no espaço', 'sucesso');
    },
    [espacoId, podeEditar, showToast, user]
  );

  const removerMusica = useCallback(
    async (musicaId: string) => {
      if (!espacoId || !podeEditar) return;
      await deleteDoc(doc(db, 'espacos', espacoId, 'musicas', musicaId));
    },
    [espacoId, podeEditar]
  );

  const alterarPapel = useCallback(
    async (uid: string, papel: PapelEspaco) => {
      if (!espacoId || !podeGerenciarMembros) return;
      const membro = membros.find((item) => item.uid === uid);
      if (!membro) return;
      await setDoc(doc(db, 'espacos', espacoId, 'membros', uid), { ...membro, papel });
    },
    [espacoId, membros, podeGerenciarMembros]
  );

  const removerMembro = useCallback(
    async (uid: string) => {
      if (!espacoId || !podeGerenciarMembros) return;
      await deleteDoc(doc(db, 'espacos', espacoId, 'membros', uid));
    },
    [espacoId, podeGerenciarMembros]
  );

  return { membros, musicas, meuPapel, podeEditar, podeGerenciarMembros, loading, compartilharMusica, removerMusica, alterarPapel, removerMembro };
}
