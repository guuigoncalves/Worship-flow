import { GripVertical, Trash2 } from 'lucide-react';
import type { BlocoMedley, Tom } from '../../types';

export function BlocoArrastavel({ bloco, onChange, onRemove }: { bloco: BlocoMedley; onChange: (bloco: BlocoMedley) => void; onRemove: () => void }) {
  const tons: Tom[] = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
  return (
    <div className="card flex flex-col gap-3 p-3">
      <div className="flex items-center gap-2">
        <GripVertical className="h-5 w-5 text-textoSecundario" aria-hidden="true" />
        <strong className="flex-1 capitalize">{bloco.tituloMusica ?? bloco.tipo}</strong>
        <button type="button" className="btn-ghost h-9 w-9 p-0 text-perigo" onClick={onRemove}>
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <input className="input" value={bloco.tituloMusica ?? ''} onChange={(event) => onChange({ ...bloco, tituloMusica: event.target.value })} />
        <select className="input" value={bloco.tom ?? 'G'} onChange={(event) => onChange({ ...bloco, tom: event.target.value as Tom })}>
          {tons.map((tom) => <option key={tom}>{tom}</option>)}
        </select>
        <input className="input" type="number" min={1} value={bloco.repeticoes} onChange={(event) => onChange({ ...bloco, repeticoes: Number(event.target.value) })} />
        <input className="input" value={bloco.notas ?? ''} onChange={(event) => onChange({ ...bloco, notas: event.target.value })} />
      </div>
    </div>
  );
}
