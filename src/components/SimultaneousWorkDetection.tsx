import { useMemo } from 'react';
import { WorkPermit } from '@/types/permit';
import { calculateHoursRemaining, getExpirationStatus, formatDateTime } from '@/utils/timeCalculations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, MapPin, Users, Shield } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface SimultaneousWorkGroup {
  locationCode: string;
  locationDesc: string;
  fullLocation: string;
  permits: WorkPermit[];
  riskLevel: 'high' | 'medium' | 'low';
  hasMultipleTypes: boolean;
  hasDeEnergized: boolean;
  workCenters: string[];
}

interface SimultaneousWorkDetectionProps {
  permits: WorkPermit[];
  warningThreshold: number;
}

const getLocationCode = (functionalLocation: string) => {
  const parts = functionalLocation?.split('-') || [];
  return parts.slice(0, 3).join('-') || functionalLocation || '';
};

export const SimultaneousWorkDetection = ({ permits, warningThreshold }: SimultaneousWorkDetectionProps) => {
  const { t } = useLanguage();

  const simultaneousGroups = useMemo(() => {
    const locationMap = new Map<string, WorkPermit[]>();
    permits.forEach(permit => {
      if (!permit.functionalLocation) return;
      const code = getLocationCode(permit.functionalLocation);
      if (!code) return;
      if (!locationMap.has(code)) locationMap.set(code, []);
      locationMap.get(code)!.push(permit);
    });

    const groups: SimultaneousWorkGroup[] = [];
    locationMap.forEach((groupPermits, code) => {
      if (groupPermits.length < 2) return;
      const types = new Set(groupPermits.map(p => p.type));
      const hasDeEnergized = groupPermits.some(p => p.deEnergized);
      const workCenters = [...new Set(groupPermits.map(p => p.mainWorkCenter || p.workCenter).filter(Boolean))];
      const hasMultipleTypes = types.size > 1;

      let riskLevel: 'high' | 'medium' | 'low' = 'low';
      if (hasDeEnergized && groupPermits.length >= 3) riskLevel = 'high';
      else if (hasDeEnergized || groupPermits.length >= 3 || (hasMultipleTypes && workCenters.length > 1)) riskLevel = 'medium';

      groups.push({ locationCode: code, locationDesc: groupPermits[0].functionalLocationDesc || '', fullLocation: groupPermits[0].functionalLocation, permits: groupPermits, riskLevel, hasMultipleTypes, hasDeEnergized, workCenters });
    });

    const riskOrder = { high: 0, medium: 1, low: 2 };
    return groups.sort((a, b) => riskOrder[a.riskLevel] - riskOrder[b.riskLevel] || b.permits.length - a.permits.length);
  }, [permits]);

  if (simultaneousGroups.length === 0) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-status-active" />
            <span className="text-gradient-navy">{t('simultaneousWorkDetection')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-status-active/10 border border-status-active/30">
            <Shield className="w-5 h-5 text-status-active" />
            <p className="text-sm font-medium text-status-active">{t('noSimultaneousWork')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const riskStyles = {
    high: { border: 'border-status-expired/50', bg: 'bg-status-expired/5', badge: 'bg-status-expired text-white', icon: 'text-status-expired' },
    medium: { border: 'border-status-warning/50', bg: 'bg-status-warning/5', badge: 'bg-status-warning text-white', icon: 'text-status-warning' },
    low: { border: 'border-orange/30', bg: 'bg-orange/5', badge: 'bg-orange text-white', icon: 'text-orange' },
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-status-warning" />
          <span className="text-gradient-navy">{t('simultaneousWorkDetection')}</span>
          <Badge variant="orange" className="ml-2">{simultaneousGroups.length} {t('location')}{simultaneousGroups.length > 1 ? 's' : ''}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-khaki mb-4">{t('reviewSafetyConflicts')}</p>

        {simultaneousGroups.map((group) => {
          const style = riskStyles[group.riskLevel];
          return (
            <div key={group.locationCode} className={`rounded-lg border ${style.border} ${style.bg} p-4`}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-2 min-w-0">
                  <MapPin className={`w-4 h-4 mt-0.5 flex-shrink-0 ${style.icon}`} />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">{group.locationCode}</p>
                    {group.locationDesc && <p className="text-xs text-khaki truncate">{group.locationDesc}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge className={style.badge}>
                    {group.riskLevel === 'high' ? t('highRisk') : group.riskLevel === 'medium' ? t('mediumRisk') : t('lowRisk')}
                  </Badge>
                  <Badge variant="navy" className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {group.permits.length} {t('permits')}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {group.hasDeEnergized && <Badge variant="destructive" className="text-xs">{t('deEnergizedWork')}</Badge>}
                {group.hasMultipleTypes && <Badge variant="outline" className="text-xs border-status-warning text-status-warning">{t('multiplePermitTypes')}</Badge>}
                {group.workCenters.length > 1 && (
                  <Badge variant="outline" className="text-xs border-orange text-orange">
                    {group.workCenters.length} {t('workCenters')}
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {group.permits.map((permit, idx) => {
                  const hours = calculateHoursRemaining(permit.validTo, permit.validToTime);
                  const status = getExpirationStatus(hours, warningThreshold);
                  return (
                    <div key={`${permit.application}-${idx}`} className="flex items-center gap-2 p-2 rounded bg-background/60 border border-border/50">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-orange">{permit.application}</span>
                          <Badge variant="khaki" className="text-[10px] px-1.5 py-0">{permit.type}</Badge>
                        </div>
                        <p className="text-xs text-khaki truncate mt-0.5">{permit.description}</p>
                        <p className="text-[10px] text-khaki/70">{permit.receivedByName} • {permit.mainWorkCenter}</p>
                      </div>
                      <Badge className={`text-[10px] flex-shrink-0 ${
                        status === 'expired' ? 'bg-status-expired text-white' :
                        status === 'warning' ? 'bg-status-warning text-white' :
                        'bg-status-active text-white'
                      }`}>
                        {status === 'expired' ? t('expired') : status === 'warning' ? `${hours.toFixed(0)}h` : t('active')}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
