import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import type { ToastMessage } from '../types';

interface ToastContextValue {
  toasts: ToastMessage[];
  showToast: (texto: string, tipo?: ToastMessage['tipo']) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((atuais) => atuais.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (texto: string, tipo: ToastMessage['tipo'] = 'info') => {
      const id = crypto.randomUUID();
      setToasts((atuais) => [...atuais, { id, texto, tipo }]);
      window.setTimeout(() => removeToast(id), 3000);
    },
    [removeToast]
  );

  const value = useMemo(() => ({ toasts, showToast, removeToast }), [removeToast, showToast, toasts]);
  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider');
  return context;
}
