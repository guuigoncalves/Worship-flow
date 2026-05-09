export function lerLocalStorage<T>(chave: string, fallback: T): T {
  try {
    const valor = localStorage.getItem(chave);
    return valor ? (JSON.parse(valor) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function salvarLocalStorage<T>(chave: string, valor: T): void {
  localStorage.setItem(chave, JSON.stringify(valor));
}
