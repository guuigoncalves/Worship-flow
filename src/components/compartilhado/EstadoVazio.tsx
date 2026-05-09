import { Music2 } from 'lucide-react';

export function EstadoVazio({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-2 px-5 py-10 text-center text-textoSecundario">
      <Music2 className="h-8 w-8 text-primaria" aria-hidden="true" />
      <strong className="text-texto">{titulo}</strong>
      <p className="m-0 max-w-sm text-sm">{texto}</p>
    </div>
  );
}
