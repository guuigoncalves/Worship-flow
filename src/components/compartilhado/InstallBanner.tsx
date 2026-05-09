import { Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

export function InstallBanner() {
  const { t } = useTranslation();
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [closed, setClosed] = useState(() => localStorage.getItem('worshipflow:install-closed') === '1');

  useEffect(() => {
    const handler = (installEvent: Event) => {
      installEvent.preventDefault();
      setEvent(installEvent as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!event || closed) return null;

  return (
    <div className="fixed bottom-24 left-3 right-3 z-30 mx-auto flex max-w-md items-center justify-between gap-3 rounded-lg border border-borda bg-elevada p-3 shadow-xl">
      <span className="text-sm text-texto">{t('common.install')}</span>
      <div className="flex gap-2">
        <button className="btn-primary h-10 px-3" type="button" onClick={() => void event.prompt()}>
          <Download className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          className="btn-ghost h-10 px-3"
          type="button"
          onClick={() => {
            localStorage.setItem('worshipflow:install-closed', '1');
            setClosed(true);
          }}
        >
          {t('common.cancel')}
        </button>
      </div>
    </div>
  );
}
