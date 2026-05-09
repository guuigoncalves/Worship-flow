import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore';
import type { BlocoMedley, Medley } from '../types';
import { db } from '../utils/firebase';
import { lerLocalStorage, salvarLocalStorage } from '../utils/storage';
import { useAuth } from './useAuth';

interface MedleysContextValue {
  medleys: Medley[];
  loading: boolean;
  salvarMedley: (medley: Omit<Medley, 'id' | 'criadoEm' | 'ultimaEdicao'> & { id?: string }) => Promise<Medley>;
  excluirMedley: (id: string) => Promise<void>;
  obterMedley: (id: string) => Medley | undefined;
  criarBloco: (tipo: BlocoMedley['tipo']) => BlocoMedley;
}

const MedleysContext = createContext<MedleysContextValue | null>(null);
const localKey = 'worshipflow:medleys';

const seedMedleys: Medley[] = [
  {
    id: 'culto-domingo',
    titulo: 'Culto de Domingo',
    criadoEm: new Date().toISOString(),
    ultimaEdicao: new Date().toISOString(),
    blocos: [
      { id: crypto.randomUUID(), tipo: 'musica', musicaId: 'castelo-forte', tituloMusica: 'Castelo Forte', repeticoes: 1, tom: 'D' },
      { id: crypto.randomUUID(), tipo: 'refrao', tituloMusica: 'Refrão congregacional', repeticoes: 2, tom: 'G', notas: 'Manter banda suave.' },
      { id: crypto.randomUUID(), tipo: 'musica', musicaId: 'firme-nas-promessas', tituloMusica: 'Firme nas Promessas', repeticoes: 1, tom: 'C' }
    ]
  }
];

export function MedleysProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [medleys, setMedleys] = useState<Medley[]>(() => lerLocalStorage(localKey, seedMedleys));
  const [loading, setLoading] = useState(false);

  const persistirLocal = useCallback((proximos: Medley[]) => {
    setMedleys(proximos);
    salvarLocalStorage(localKey, proximos);
  }, []);

  useEffect(() => {
    if (!user || user.isAnonymous) {
      setMedleys(lerLocalStorage(localKey, seedMedleys));
      return undefined;
    }
    setLoading(true);
    const unsubscribe = onSnapshot(collection(db, 'users', user.uid, 'medleys'), async (snapshot) => {
      if (snapshot.empty) {
        await Promise.all(seedMedleys.map((medley) => setDoc(doc(db, 'users', user.uid, 'medleys', medley.id), medley, { merge: true })));
        setMedleys(seedMedleys);
      } else {
        setMedleys(snapshot.docs.map((item) => item.data() as Medley));
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const salvarMedley = useCallback(
    async (input: Omit<Medley, 'id' | 'criadoEm' | 'ultimaEdicao'> & { id?: string }) => {
      const existente = input.id ? medleys.find((item) => item.id === input.id) : undefined;
      const medley: Medley = {
        id: input.id ?? crypto.randomUUID(),
        titulo: input.titulo,
        blocos: input.blocos,
        criadoEm: existente?.criadoEm ?? new Date().toISOString(),
        ultimaEdicao: new Date().toISOString()
      };
      const proximos = [medley, ...medleys.filter((item) => item.id !== medley.id)];
      persistirLocal(proximos);
      if (user && !user.isAnonymous) await setDoc(doc(db, 'users', user.uid, 'medleys', medley.id), medley, { merge: true });
      return medley;
    },
    [medleys, persistirLocal, user]
  );

  const excluirMedley = useCallback(
    async (id: string) => {
      persistirLocal(medleys.filter((medley) => medley.id !== id));
      if (user && !user.isAnonymous) await deleteDoc(doc(db, 'users', user.uid, 'medleys', id));
    },
    [medleys, persistirLocal, user]
  );

  const obterMedley = useCallback((id: string) => medleys.find((medley) => medley.id === id), [medleys]);
  const criarBloco = useCallback((tipo: BlocoMedley['tipo']): BlocoMedley => ({ id: crypto.randomUUID(), tipo, repeticoes: 1 }), []);
  const value = useMemo(() => ({ medleys, loading, salvarMedley, excluirMedley, obterMedley, criarBloco }), [criarBloco, excluirMedley, loading, medleys, obterMedley, salvarMedley]);

  return <MedleysContext.Provider value={value}>{children}</MedleysContext.Provider>;
}

export function useMedleys() {
  const context = useContext(MedleysContext);
  if (!context) throw new Error('useMedleys must be used inside MedleysProvider');
  return context;
}
