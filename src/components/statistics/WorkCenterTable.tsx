import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Building2 } from 'lucide-react';
import { WorkCenterStats } from '@/hooks/useStatistics';
import { useLanguage } from '@/contexts/LanguageContext';

interface WorkCenterTableProps {
  stats: WorkCenterStats[];
}

export const WorkCenterTable = ({ stats }: WorkCenterTableProps) => {
  const { t } = useLanguage();

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-orange" />
          <span className="text-gradient-navy">{t('statisticsByWorkCenter')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-khaki/30">
              <TableHead className="text-khaki">{t('mainWorkCenter')}</TableHead>
              <TableHead className="text-center text-khaki">{t('total')}</TableHead>
              <TableHead className="text-center text-khaki">{t('active')}</TableHead>
              <TableHead className="text-center text-khaki">{t('warning')}</TableHead>
              <TableHead className="text-center text-khaki">{t('expired')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.map(wc => (
              <TableRow key={wc.workCenter} className="border-khaki/20">
                <TableCell className="font-medium">{wc.workCenter}</TableCell>
                <TableCell className="text-center"><Badge variant="navy">{wc.total}</Badge></TableCell>
                <TableCell className="text-center"><Badge className="bg-status-active text-white">{wc.active}</Badge></TableCell>
                <TableCell className="text-center"><Badge className="bg-status-warning text-white">{wc.warning}</Badge></TableCell>
                <TableCell className="text-center"><Badge className="bg-status-expired text-white">{wc.expired}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
