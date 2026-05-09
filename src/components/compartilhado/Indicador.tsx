import { WifiOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useOffline } from '../../hooks/useOffline';

export function IndicadorOffline() {
  const offline = useOffline();
  const { t } = useTranslation();
  if (!offline) return null;
  return (
    <div className="fixed left-1/2 top-2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-borda bg-elevada px-3 py-1 text-xs text-primaria shadow-lg">
      <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />
      {t('common.offline')}
    </div>
  );
}
