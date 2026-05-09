export function ChipsFiltro({ filtros, ativo, onChange }: { filtros: Array<{ id: string; label: string }>; ativo: string; onChange: (id: string) => void }) {
  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 py-2">
      {filtros.map((filtro) => (
        <button key={filtro.id} type="button" className={`chip ${ativo === filtro.id ? 'chip-active' : ''}`} onClick={() => onChange(filtro.id)}>
          {filtro.label}
        </button>
      ))}
    </div>
  );
}
