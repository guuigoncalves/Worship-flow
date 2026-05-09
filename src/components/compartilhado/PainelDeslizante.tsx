import { X } from 'lucide-react';
import type { ReactNode } from 'react';

export function PainelDeslizante({ aberto, titulo, onClose, children }: { aberto: boolean; titulo: string; onClose: () => void; children: ReactNode }) {
  if (!aberto) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/45" onClick={onClose}>
      <section className="bottom-sheet max-h-[88vh] w-full overflow-y-auto rounded-t-[20px] border border-borda bg-superficie p-4 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="m-0 text-lg font-bold">{titulo}</h2>
          <button className="btn-ghost h-10 w-10 p-0" type="button" onClick={onClose} aria-label={titulo}>
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
