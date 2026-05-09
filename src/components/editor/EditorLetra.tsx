import { useCallback, useEffect, useRef } from 'react';

export function EditorLetra({ value, onChange, onInsertReady }: { value: string; onChange: (valor: string) => void; onInsertReady: (insert: (texto: string) => void) => void }) {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  const insert = useCallback((texto: string) => {
    const area = ref.current;
    if (!area) return;
    const inicio = area.selectionStart;
    const fim = area.selectionEnd;
    const proximo = `${value.slice(0, inicio)}${texto}${value.slice(fim)}`;
    onChange(proximo);
    requestAnimationFrame(() => {
      area.focus();
      area.selectionStart = inicio + texto.length;
      area.selectionEnd = inicio + texto.length;
    });
  }, [onChange, value]);

  useEffect(() => {
    onInsertReady(insert);
  }, [insert, onInsertReady]);

  return <textarea ref={ref} className="input min-h-[360px] resize-y font-mono text-sm leading-7" value={value} onChange={(event) => onChange(event.target.value)} />;
}
