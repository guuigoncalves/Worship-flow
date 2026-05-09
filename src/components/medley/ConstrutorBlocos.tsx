import type { BlocoMedley } from '../../types';
import { BlocoArrastavel } from './BlocoArrastavel';

const tipos: BlocoMedley['tipo'][] = ['musica', 'verso', 'refrao', 'ponte', 'instrumental', 'pausa', 'transicao', 'espontaneo', 'subida-tom'];

export function ConstrutorBlocos({ blocos, onChange, novoLabel }: { blocos: BlocoMedley[]; onChange: (blocos: BlocoMedley[]) => void; novoLabel: string }) {
  function mover(index: number, direcao: -1 | 1) {
    const alvo = index + direcao;
    if (alvo < 0 || alvo >= blocos.length) return;
    const copia = [...blocos];
    const [item] = copia.splice(index, 1);
    if (!item) return;
    copia.splice(alvo, 0, item);
    onChange(copia);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {tipos.map((tipo) => (
          <button key={tipo} type="button" className="chip" onClick={() => onChange([...blocos, { id: crypto.randomUUID(), tipo, repeticoes: 1 }])}>
            {novoLabel}: {tipo}
          </button>
        ))}
      </div>
      {blocos.map((bloco, index) => (
        <div key={bloco.id} className="space-y-2">
          <BlocoArrastavel bloco={bloco} onChange={(proximo) => onChange(blocos.map((item) => (item.id === bloco.id ? proximo : item)))} onRemove={() => onChange(blocos.filter((item) => item.id !== bloco.id))} />
          <div className="flex gap-2">
            <button type="button" className="btn-ghost h-9 px-3 text-xs" onClick={() => mover(index, -1)}>↑</button>
            <button type="button" className="btn-ghost h-9 px-3 text-xs" onClick={() => mover(index, 1)}>↓</button>
          </div>
        </div>
      ))}
    </div>
  );
}
