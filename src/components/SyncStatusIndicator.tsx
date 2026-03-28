import { RefreshCw, RefreshCwOff } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';

interface SyncStatusIndicatorProps {
  syncEnabled: boolean;
  lastSyncTime: string | null;
}

export const SyncStatusIndicator = ({ syncEnabled, lastSyncTime }: SyncStatusIndicatorProps) => {
  const { t } = useLanguage();

  return (
    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/15 rounded-lg border border-white/30 backdrop-blur-sm">
      {syncEnabled ? (
        <RefreshCw className="h-3.5 w-3.5 text-status-active animate-[spin_3s_linear_infinite]" />
      ) : (
        <RefreshCwOff className="h-3.5 w-3.5 text-white/50" />
      )}
      <div className="flex flex-col leading-none">
        <span className={`text-xs font-heading font-semibold ${syncEnabled ? 'text-status-active' : 'text-white/50'}`}>
          {syncEnabled ? t('syncActive') : t('syncOff')}
        </span>
        {lastSyncTime && (
          <span className="text-[10px] font-body text-white/70">
            {t('last')}: {format(new Date(lastSyncTime), 'HH:mm:ss')}
          </span>
        )}
      </div>
    </div>
  );
};
