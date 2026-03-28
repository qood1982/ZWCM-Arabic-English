import { memo } from 'react';
import { WorkPermit } from '@/types/permit';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Zap, Snowflake, Layers, MapPin, Building2 } from 'lucide-react';
import { calculateHoursRemaining, getExpirationStatus, formatHoursRemaining, formatDateTime } from '@/utils/timeCalculations';
import { getLocationCode } from '@/utils/locationUtils';
import { usePermits } from '@/contexts/PermitContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface PermitCardProps {
  permit: WorkPermit;
  isCompact?: boolean;
}

const PermitCard = memo(({ permit, isCompact = false }: PermitCardProps) => {
  const { warningThreshold } = usePermits();
  const { t } = useLanguage();
  const hoursRemaining = calculateHoursRemaining(permit.validTo, permit.validToTime);
  const status = getExpirationStatus(hoursRemaining, warningThreshold);
  
  const getTypeIcon = (type: string, compact: boolean = false) => {
    const normalizedType = type.toLowerCase();
    const iconClass = compact ? "w-3.5 h-3.5" : "w-5 h-5";
    if (normalizedType.includes('hot')) return <Flame className={cn(iconClass, "text-permit-hot")} />;
    if (normalizedType.includes('electric')) return <Zap className={cn(iconClass, "text-permit-electric")} />;
    if (normalizedType.includes('cold')) return <Snowflake className={cn(iconClass, "text-permit-cold")} />;
    if (normalizedType.includes('composite')) return <Layers className={cn(iconClass, "text-permit-composite")} />;
    return <Layers className={cn(iconClass, "text-muted-foreground")} />;
  };
  
  const getStatusColor = () => {
    switch (status) {
      case 'expired': return 'bg-status-expired text-white';
      case 'warning': return 'bg-status-warning text-white';
      case 'active': return 'bg-status-active text-white';
      default: return 'bg-muted';
    }
  };

  const getCompactStatusBg = () => {
    switch (status) {
      case 'expired': return 'bg-status-expired/15 border-status-expired/30';
      case 'warning': return 'bg-status-warning/15 border-status-warning/30';
      case 'active': return 'bg-status-active/15 border-status-active/30';
      default: return 'bg-muted/50';
    }
  };

  if (isCompact) {
    return (
      <Card className={cn(
        "permit-card transition-all duration-200 hover:scale-[1.02]",
        getCompactStatusBg(),
        status === 'expired' && "shadow-[0_0_12px_-3px] shadow-status-expired/30 hover:shadow-[0_0_20px_-3px] hover:shadow-status-expired/50",
        status === 'warning' && "shadow-[0_0_12px_-3px] shadow-status-warning/30 hover:shadow-[0_0_20px_-3px] hover:shadow-status-warning/50",
        status === 'active' && "shadow-[0_0_12px_-3px] shadow-status-active/20 hover:shadow-[0_0_20px_-3px] hover:shadow-status-active/40"
      )}>
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-1.5">
            {getTypeIcon(permit.type, true)}
            <span className="text-sm font-semibold truncate">{permit.type}</span>
            <Badge variant="outline" className="text-xs px-1.5 py-0 h-5 ml-auto border-foreground/30 text-foreground">
              {permit.workCenter}
            </Badge>
          </div>
          <div className="text-xs font-mono font-semibold text-foreground mb-1">{permit.application}</div>
          <div className="text-xs text-muted-foreground line-clamp-1 mb-1">{permit.description}</div>
          {permit.receivedByName && (
            <div className="text-xs text-muted-foreground truncate mb-1">
              <span className="text-foreground font-medium">{t('receiver')}:</span> {permit.receivedByName}
            </div>
          )}
          <div className="flex items-center justify-between gap-2">
            {permit.functionalLocation && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3 text-orange flex-shrink-0" />
                <span className="truncate">{getLocationCode(permit.functionalLocation)}</span>
              </div>
            )}
            <span className={cn("text-xs font-medium ml-auto", {
              "text-status-expired": status === 'expired',
              "text-status-warning": status === 'warning',
              "text-status-active": status === 'active'
            })}>
              {formatHoursRemaining(hoursRemaining)}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "permit-card transition-all duration-200",
      status === 'expired' && "border-status-expired/50 shadow-[0_0_15px_-3px] shadow-status-expired/30 hover:shadow-[0_0_25px_-3px] hover:shadow-status-expired/50",
      status === 'warning' && "border-status-warning/50 shadow-[0_0_15px_-3px] shadow-status-warning/30 hover:shadow-[0_0_25px_-3px] hover:shadow-status-warning/50",
      status === 'active' && "border-status-active/50 shadow-[0_0_15px_-3px] shadow-status-active/20 hover:shadow-[0_0_25px_-3px] hover:shadow-status-active/40"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getTypeIcon(permit.type)}
            <CardTitle className="text-xl">{permit.type}</CardTitle>
          </div>
          <span className={cn("text-sm font-semibold", {
            "text-status-expired": status === 'expired',
            "text-status-warning": status === 'warning',
            "text-status-active": status === 'active'
          })}>
            {formatHoursRemaining(hoursRemaining)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-khaki mb-1">{t('applicationNumber')}</p>
            <p className="text-base font-mono font-semibold text-orange">{permit.application}</p>
          </div>
          {permit.workCenter && (
            <Badge variant="outline" className="text-sm font-semibold px-3 py-1 border border-khaki text-khaki">
              <Building2 className="w-4 h-4 mr-1.5" />
              {permit.workCenter}
            </Badge>
          )}
        </div>

        {permit.mainWorkCenter}
        
        <div>
          <p className="text-sm text-khaki mb-1">{t('description')}</p>
          <p className="text-base line-clamp-2">{permit.description}</p>
        </div>

        {permit.functionalLocation && (
          <div className="flex items-start gap-2">
            <MapPin className="w-5 h-5 text-orange mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-khaki mb-1">{t('functionLocation')}</p>
              <p className="text-base font-medium">
                {(() => {
                  const locationCode = getLocationCode(permit.functionalLocation);
                  return permit.functionalLocationDesc ? `${locationCode} : ${permit.functionalLocationDesc}` : locationCode;
                })()}
              </p>
            </div>
          </div>
        )}
        
        <div>
          <p className="text-sm text-khaki mb-1">{t('receiver')}</p>
          <p className="text-base font-medium">{permit.receivedByName}</p>
          <p className="text-sm text-muted-foreground">{permit.receivedBy}</p>
        </div>
        
        <div className="pt-2 border-t border-khaki/30">
          <p className="text-sm text-khaki mb-1">{t('validTo')}</p>
          <p className="text-base font-medium text-orange">{formatDateTime(permit.validTo, permit.validToTime)}</p>
        </div>
      </CardContent>
    </Card>
  );
});

PermitCard.displayName = 'PermitCard';

export default PermitCard;
