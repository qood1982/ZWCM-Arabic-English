import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileSpreadsheet, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface KpiStats {
  total: number;
  active: number;
  warning: number;
  expired: number;
}

interface KpiSummaryCardsProps {
  stats: KpiStats;
  selectedKpi: string | null;
  onKpiClick: (kpi: string) => void;
  warningThresholdLabel?: string;
}

export const KpiSummaryCards = ({ stats, selectedKpi, onKpiClick, warningThresholdLabel }: KpiSummaryCardsProps) => {
  const { t } = useLanguage();

  const kpiConfig = [
    { key: '', label: t('totalPermits'), colorClass: 'text-gradient-navy', icon: FileSpreadsheet, iconClass: 'text-orange', statKey: 'total' as const, ringClass: 'ring-primary', description: undefined as string | undefined },
    { key: 'active', label: t('active'), colorClass: 'text-status-active', icon: CheckCircle2, iconClass: 'text-status-active', statKey: 'active' as const, ringClass: 'ring-status-active', description: t('notExpired') as string | undefined },
    { key: 'warning', label: t('expiringSoon'), colorClass: 'text-status-warning', icon: Clock, iconClass: 'text-status-warning', statKey: 'warning' as const, ringClass: 'ring-status-warning', description: undefined as string | undefined },
    { key: 'expired', label: t('expired'), colorClass: 'text-status-expired', icon: AlertCircle, iconClass: 'text-status-expired', statKey: 'expired' as const, ringClass: 'ring-status-expired', description: undefined as string | undefined },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {kpiConfig.map(({ key, label, colorClass, icon: Icon, iconClass, statKey, ringClass, description }) => (
        <Card
          key={statKey}
          className={cn(
            "cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg",
            (key === '' ? selectedKpi === null : selectedKpi === key) && `ring-2 ${ringClass}`
          )}
          onClick={() => onKpiClick(key)}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-khaki">{label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className={cn("text-3xl font-bold", colorClass)}>{stats[statKey]}</div>
              <Icon className={cn("w-8 h-8", iconClass)} />
            </div>
            {description && <CardDescription className="mt-1 text-xs">{description}</CardDescription>}
            {statKey === 'warning' && warningThresholdLabel && (
              <CardDescription className="mt-1 text-xs">{warningThresholdLabel}</CardDescription>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
