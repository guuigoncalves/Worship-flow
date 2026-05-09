import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import type { PerfilMusico, Tom } from '../types';
import { db } from '../utils/firebase';
import { lerLocalStorage, salvarLocalStorage } from '../utils/storage';
import { useAuth } from './useAuth';

const perfilPadrao: PerfilMusico = {
  instrumento: 'violao',
  nivel: 'intermediario',
  acordesProibidos: ['F', 'Bm', 'C#m'],
  tonsPreferidos: ['G', 'D', 'C'],
  preferirCapo: true,
  usarVersaoSimplificada: true,
  temaPadrao: 'escuro',
  idiomaApp: 'pt-BR'
};

interface PerfilContextValue {
  perfil: PerfilMusico;
  loading: boolean;
  error: string | null;
  updatePerfil: (patch: Partial<PerfilMusico>) => Promise<void>;
  toggleAcordeProibido: (acorde: string) => Promise<void>;
  toggleTomPreferido: (tom: Tom) => Promise<void>;
}

const PerfilContext = createContext<PerfilContextValue | null>(null);
const localKey = 'worshipflow:perfil';

export function PerfilProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const [perfil, setPerfil] = useState<PerfilMusico>(() => lerLocalStorage(localKey, perfilPadrao));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.isAnonymous) {
      setPerfil(lerLocalStorage(localKey, perfilPadrao));
      return undefined;
    }
    setLoading(true);
    const ref = doc(db, 'users', user.uid, 'configuracoes', 'perfil');
    const unsubscribe = onSnapshot(
      ref,
      async (snap) => {
        if (!snap.exists()) {
          await setDoc(ref, perfilPadrao, { merge: true });
          setPerfil(perfilPadrao);
        } else {
          setPerfil({ ...perfilPadrao, ...(snap.data() as Partial<PerfilMusico>) });
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

  useEffect(() => {
    salvarLocalStorage(localKey, perfil);
    localStorage.setItem('worshipflow:idioma', perfil.idiomaApp);
    void i18n.changeLanguage(perfil.idiomaApp);
  }, [i18n, perfil]);

  const updatePerfil = useCallback(
    async (patch: Partial<PerfilMusico>) => {
      const proximo = { ...perfil, ...patch };
      setPerfil(proximo);
      salvarLocalStorage(localKey, proximo);
      if (user && !user.isAnonymous) {
        await setDoc(doc(db, 'users', user.uid, 'configuracoes', 'perfil'), proximo, { merge: true });
      }
    },
    [perfil, user]
  );

  const toggleAcordeProibido = useCallback(
    (acorde: string) => {
      const existe = perfil.acordesProibidos.includes(acorde);
      return updatePerfil({ acordesProibidos: existe ? perfil.acordesProibidos.filter((item) => item !== acorde) : [...perfil.acordesProibidos, acorde] });
    },
    [perfil.acordesProibidos, updatePerfil]
  );

  const toggleTomPreferido = useCallback(
    (tom: Tom) => {
      const existe = perfil.tonsPreferidos.includes(tom);
      return updatePerfil({ tonsPreferidos: existe ? perfil.tonsPreferidos.filter((item) => item !== tom) : [...perfil.tonsPreferidos, tom] });
    },
    [perfil.tonsPreferidos, updatePerfil]
  );

  const value = useMemo(() => ({ perfil, loading, error, updatePerfil, toggleAcordeProibido, toggleTomPreferido }), [error, loading, perfil, toggleAcordeProibido, toggleTomPreferido, updatePerfil]);
  return <PerfilContext.Provider value={value}>{children}</PerfilContext.Provider>;
}

export function usePerfil() {
  const context = useContext(PerfilContext);
  if (!context) throw new Error('usePerfil must be used inside PerfilProvider');
  return context;
}
