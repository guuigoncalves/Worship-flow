import { CheckCircle2, Info, XCircle } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

export function Toasts() {
  const { toasts, removeToast } = useToast();
  return (
    <div className="fixed bottom-24 left-3 right-3 z-50 mx-auto flex max-w-sm flex-col gap-2">
      {toasts.map((toast) => {
        const Icon = toast.tipo === 'sucesso' ? CheckCircle2 : toast.tipo === 'erro' ? XCircle : Info;
        const cor = toast.tipo === 'sucesso' ? 'text-sucesso' : toast.tipo === 'erro' ? 'text-perigo' : 'text-acento';
        return (
          <button key={toast.id} type="button" onClick={() => removeToast(toast.id)} className="card toast-enter flex items-center gap-3 px-4 py-3 text-left">
            <Icon className={`h-5 w-5 ${cor}`} aria-hidden="true" />
            <span className="text-sm">{toast.texto}</span>
          </button>
        );
      })}
    </div>
  );
}
