import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MapPin, X } from 'lucide-react';
import { SimultaneousWorkDetection } from '@/components/SimultaneousWorkDetection';
import { usePermits } from '@/contexts/PermitContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { ExportDropdown } from '@/components/ExportDropdown';
import { EmptyDataState } from '@/components/EmptyDataState';
import { GradientHeader } from '@/components/GradientHeader';
import { useStatistics } from '@/hooks/useStatistics';
import { StatusPieChart } from '@/components/statistics/StatusPieChart';
import { ReceiverTable } from '@/components/statistics/ReceiverTable';
import { WorkCenterTable } from '@/components/statistics/WorkCenterTable';
import { getLocationCode } from '@/utils/locationUtils';
import { calculateHoursRemaining, getExpirationStatus, formatDateTime } from '@/utils/timeCalculations';

const Statistics = () => {
  const { permits, isDataLoaded, warningThreshold } = usePermits();
  const { t } = useLanguage();
  const [filterLocation, setFilterLocation] = useState<string | null>(null);

  const { statusStats, workCenterStats, mainWorkCenterExpiredData, receiverStats } = useStatistics(permits, warningThreshold);

  const filteredPermits = useMemo(() => {
    if (!filterLocation) return permits;
    return permits.filter(p => getLocationCode(p.functionalLocation) === filterLocation);
  }, [permits, filterLocation]);

  if (!isDataLoaded) {
    return (
      <div className="min-h-screen bg-background">
        <Helmet><title>{t('statistics')} | Work Permit</title></Helmet>
        <GradientHeader title={t('statistics')} activeTab="statistics" showToggle={false} />
        <EmptyDataState />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{t('statistics')} | Work Permit</title>
        <meta name="description" content="Work permit statistics and analytics overview" />
      </Helmet>
      <GradientHeader title={t('statistics')} activeTab="statistics" showToggle={false} />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-in slide-in-from-top duration-200">
          {[
            { label: t('totalPermits'), value: permits.length, colorClass: 'text-gradient-navy' },
            { label: t('active'), value: statusStats.active, colorClass: 'text-status-active' },
            { label: t('expiringSoon'), value: statusStats.warning, colorClass: 'text-status-warning' },
            { label: t('expired'), value: statusStats.expired, colorClass: 'text-status-expired' },
          ].map(({ label, value, colorClass }) => (
            <Card key={label}>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-khaki">{label}</CardTitle></CardHeader>
              <CardContent><div className={`text-3xl font-bold ${colorClass}`}>{value}</div></CardContent>
            </Card>
          ))}
        </div>

        <SimultaneousWorkDetection permits={permits} warningThreshold={warningThreshold} />
        <StatusPieChart data={mainWorkCenterExpiredData} />
        <ReceiverTable stats={receiverStats} />
        <WorkCenterTable stats={workCenterStats} />

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <CardTitle className="text-gradient-navy">{t('allWorkPermits')}</CardTitle>
              <div className="flex items-center gap-2">
                {filterLocation && (
                  <Badge variant="orange" className="flex items-center gap-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground" onClick={() => setFilterLocation(null)}>
                    <MapPin className="w-3 h-3" />
                    {filterLocation}
                    <X className="w-3 h-3" />
                  </Badge>
                )}
                <ExportDropdown permits={filteredPermits} warningThreshold={warningThreshold} filename="statistics-report" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-khaki/30">
                    <TableHead className="text-khaki">{t('application')}</TableHead>
                    <TableHead className="text-khaki">{t('type')}</TableHead>
                    <TableHead className="text-khaki">{t('mainWorkCenter')}</TableHead>
                    <TableHead className="text-khaki">{t('location')}</TableHead>
                    <TableHead className="text-khaki">{t('receiver')}</TableHead>
                    <TableHead className="text-khaki">{t('validTo')}</TableHead>
                    <TableHead className="text-khaki">{t('status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...filteredPermits]
                    .sort((a, b) => calculateHoursRemaining(a.validTo, a.validToTime) - calculateHoursRemaining(b.validTo, b.validToTime))
                    .map((permit, index) => {
                      const hours = calculateHoursRemaining(permit.validTo, permit.validToTime);
                      const status = getExpirationStatus(hours, warningThreshold);
                      const locationCode = getLocationCode(permit.functionalLocation);
                      return (
                        <TableRow key={`${permit.application}-${index}`} className="border-khaki/20">
                          <TableCell className="font-mono text-sm text-orange">{permit.application}</TableCell>
                          <TableCell>{permit.type}</TableCell>
                          <TableCell><Badge variant="navy">{permit.mainWorkCenter}</Badge></TableCell>
                          <TableCell>
                            {locationCode && (
                              <Badge variant="khaki" className="cursor-pointer hover:bg-orange hover:text-white" onClick={() => setFilterLocation(locationCode)}>
                                {locationCode}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{permit.receivedByName}</TableCell>
                          <TableCell className="text-sm text-orange">{formatDateTime(permit.validTo, permit.validToTime)}</TableCell>
                          <TableCell>
                            <Badge className={status === 'expired' ? 'bg-status-expired text-white' : status === 'warning' ? 'bg-status-warning text-white' : 'bg-status-active text-white'}>
                              {status === 'expired' ? t('expiredAgo', Math.abs(hours).toFixed(1)) : status === 'warning' ? t('hoursLeft', hours.toFixed(1)) : t('active')}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Statistics;
