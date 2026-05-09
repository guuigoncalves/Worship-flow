import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  type ConfirmationResult,
  GoogleAuthProvider,
  RecaptchaVerifier,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { auth, db, persistencePromise } from '../utils/firebase';
import type { Nivel, UsuarioPerfil } from '../types';
import { useToast } from './useToast';

interface AuthContextValue {
  user: AppUser | null;
  perfilUsuario: UsuarioPerfil | null;
  loading: boolean;
  error: string | null;
  signInGoogle: () => Promise<void>;
  signInEmail: (email: string, password: string) => Promise<void>;
  signUpEmail: (nome: string, email: string, password: string, instrumento: string) => Promise<void>;
  signInAnon: () => Promise<void>;
  startPhoneSignIn: (telefone: string) => Promise<void>;
  confirmPhoneCode: (codigo: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const localAnonKey = 'worshipflow:local-anon';

export interface AppUser {
  uid: string;
  isAnonymous: boolean;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

function criarUsuarioAnonimoLocal(): AppUser {
  const existente = localStorage.getItem(localAnonKey);
  const uid = existente || `local-anon-${crypto.randomUUID()}`;
  localStorage.setItem(localAnonKey, uid);
  return { uid, isAnonymous: true, displayName: 'Músico', email: null, photoURL: null };
}

function perfilPadrao(user: AppUser, instrumento = 'violao'): UsuarioPerfil {
  return {
    nome: user.displayName ?? user.email?.split('@')[0] ?? 'Músico',
    email: user.email ?? '',
    foto: user.photoURL ?? '',
    instrumento,
    nivel: 'intermediario',
    criadoEm: new Date().toISOString()
  };
}

async function garantirPerfil(user: AppUser, instrumento?: string): Promise<UsuarioPerfil> {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data() as UsuarioPerfil;
  const perfil = perfilPadrao(user, instrumento);
  await setDoc(ref, { ...perfil, criadoEmServidor: serverTimestamp() }, { merge: true });
  return perfil;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [user, setUser] = useState<AppUser | null>(null);
  const [perfilUsuario, setPerfilUsuario] = useState<UsuarioPerfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [phoneConfirmation, setPhoneConfirmation] = useState<ConfirmationResult | null>(null);

  const withError = useCallback(async (action: () => Promise<void>) => {
    setError(null);
    try {
      await action();
    } catch (err) {
      const message = err instanceof Error ? err.message : t('common.error');
      setError(message);
      throw err;
    }
  }, [t]);

  useEffect(() => {
    void persistencePromise;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        const localAnon = localStorage.getItem(localAnonKey);
        if (localAnon) {
          const anon = criarUsuarioAnonimoLocal();
          setUser(anon);
          setPerfilUsuario(perfilPadrao(anon));
        } else {
          setPerfilUsuario(null);
        }
        setLoading(false);
        return;
      }
      if (currentUser.isAnonymous) {
        setPerfilUsuario(perfilPadrao(currentUser));
        setLoading(false);
        return;
      }
      garantirPerfil(currentUser)
        .then(setPerfilUsuario)
        .catch((err: unknown) => setError(err instanceof Error ? err.message : t('common.error')))
        .finally(() => setLoading(false));
    });
    return unsubscribe;
  }, [t]);

  const signInGoogle = useCallback(
    () =>
      withError(async () => {
        const provider = new GoogleAuthProvider();
        const cred = await signInWithPopup(auth, provider);
        await garantirPerfil(cred.user);
        showToast(t('toast.synced'), 'sucesso');
      }),
    [showToast, t, withError]
  );

  const signInEmail = useCallback(
    (email: string, password: string) =>
      withError(async () => {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        await garantirPerfil(cred.user);
        showToast(t('toast.synced'), 'sucesso');
      }),
    [showToast, t, withError]
  );

  const signUpEmail = useCallback(
    (nome: string, email: string, password: string, instrumento: string) =>
      withError(async () => {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: nome });
        const perfil: UsuarioPerfil = {
          nome,
          email,
          foto: '',
          instrumento,
          nivel: 'iniciante' as Nivel,
          criadoEm: new Date().toISOString()
        };
        await setDoc(doc(db, 'users', cred.user.uid), { ...perfil, criadoEmServidor: serverTimestamp() }, { merge: true });
        showToast(t('toast.synced'), 'sucesso');
      }),
    [showToast, t, withError]
  );

  const signInAnon = useCallback(
    async () => {
      setError(null);
      if (!navigator.onLine || ['127.0.0.1', 'localhost'].includes(window.location.hostname)) {
        const anon = criarUsuarioAnonimoLocal();
        setUser(anon);
        setPerfilUsuario(perfilPadrao(anon));
        return;
      }
      try {
        await Promise.race([
          signInAnonymously(auth),
          new Promise<never>((_, reject) => {
            window.setTimeout(() => reject(new Error('anonymous-timeout')), 1800);
          })
        ]);
      } catch {
        const anon = criarUsuarioAnonimoLocal();
        setUser(anon);
        setPerfilUsuario(perfilPadrao(anon));
      }
    },
    []
  );

  const startPhoneSignIn = useCallback(
    (telefone: string) =>
      withError(async () => {
        const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
        setPhoneConfirmation(await signInWithPhoneNumber(auth, telefone, verifier));
      }),
    [withError]
  );

  const confirmPhoneCode = useCallback(
    (codigo: string) =>
      withError(async () => {
        if (!phoneConfirmation) throw new Error('Código não solicitado');
        const cred = await phoneConfirmation.confirm(codigo);
        await garantirPerfil(cred.user);
        showToast(t('toast.synced'), 'sucesso');
      }),
    [phoneConfirmation, showToast, t, withError]
  );

  const logout = useCallback(
    () =>
      withError(async () => {
        localStorage.removeItem(localAnonKey);
        await signOut(auth);
      }),
    [withError]
  );

  const value = useMemo<AuthContextValue>(
    () => ({ user, perfilUsuario, loading, error, signInGoogle, signInEmail, signUpEmail, signInAnon, startPhoneSignIn, confirmPhoneCode, logout }),
    [confirmPhoneCode, error, loading, logout, perfilUsuario, signInAnon, signInEmail, signInGoogle, signUpEmail, startPhoneSignIn, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
