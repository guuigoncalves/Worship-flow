import { SkipForward } from 'lucide-react';

export function BarraFila({ atual, proxima, onNext }: { atual: string; proxima: string; onNext: () => void }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-borda bg-superficie px-3 py-3">
      <button type="button" onClick={onNext} className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 rounded-xl bg-elevada px-4 py-3 text-left shadow-lg">
        <span className="min-w-0 flex-1 truncate text-sm">{atual}</span>
        <span className="min-w-0 flex-1 truncate text-right text-sm text-textoSecundario">{proxima}</span>
        <SkipForward className="h-5 w-5 flex-none text-primaria" aria-hidden="true" />
      </button>
    </div>
  );
}
