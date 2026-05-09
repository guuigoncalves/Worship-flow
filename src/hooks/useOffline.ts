import { useEffect, useState } from 'react';

export function useOffline() {
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const atualizar = () => setOffline(!navigator.onLine);
    window.addEventListener('online', atualizar);
    window.addEventListener('offline', atualizar);
    return () => {
      window.removeEventListener('online', atualizar);
      window.removeEventListener('offline', atualizar);
    };
  }, []);

  return offline;
}
