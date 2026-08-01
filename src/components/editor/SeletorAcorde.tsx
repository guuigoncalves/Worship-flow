const raizes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const sufixos = ['', 'm', '7', 'maj7', 'sus4', 'add9', 'dim', 'aug'];

export function SeletorAcorde({ onInsert }: { onInsert: (acorde: string) => void }) {
  return (
    <div className="card -mx-1 flex gap-2 overflow-x-auto p-2 pb-2">
      {raizes.map((raiz) => (
        <button key={raiz} type="button" className="chip" onClick={() => onInsert(`[${raiz}]`)}>
          {raiz}
        </button>
      ))}
      {sufixos.slice(1).map((sufixo) => (
        <button key={sufixo} type="button" className="chip" onClick={() => onInsert(sufixo)}>
          {sufixo}
        </button>
      ))}
    </div>
  );
}
