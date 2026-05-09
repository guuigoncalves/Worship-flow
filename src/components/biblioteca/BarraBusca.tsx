import { Search } from 'lucide-react';

export function BarraBusca({ value, onChange, placeholder, autoFocus }: { value: string; onChange: (valor: string) => void; placeholder: string; autoFocus?: boolean }) {
  return (
    <label className="relative block">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-textoSecundario" aria-hidden="true" />
      <input className="input pl-10 text-base" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} autoFocus={autoFocus} />
    </label>
  );
}
