import type { BlocoMedley } from '../../types';

export function PreviewMedley({ blocos }: { blocos: BlocoMedley[] }) {
  return (
    <div className="card max-h-[520px] overflow-auto p-4">
      {blocos.map((bloco) => (
        <section key={bloco.id} className="border-b border-borda py-4 last:border-b-0">
          <div className="flex items-center justify-between gap-3">
            <h3 className="m-0 text-base font-bold">{bloco.tituloMusica ?? bloco.tipo}</h3>
            <span className="rounded bg-elevada px-2 py-1 text-xs text-primaria">{bloco.tom ?? '-'}</span>
          </div>
          <p className="m-0 mt-2 text-sm text-textoSecundario">x{bloco.repeticoes} {bloco.notas ?? ''}</p>
        </section>
      ))}
    </div>
  );
}
