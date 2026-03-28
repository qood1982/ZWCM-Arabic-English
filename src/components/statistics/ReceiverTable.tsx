import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { ReceiverStats } from '@/hooks/useStatistics';
import { useLanguage } from '@/contexts/LanguageContext';

interface ReceiverTableProps {
  stats: ReceiverStats[];
}

export const ReceiverTable = ({ stats }: ReceiverTableProps) => {
  const { t } = useLanguage();

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-orange" />
          <span className="text-gradient-navy">{t('statisticsByReceiver')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-khaki/30">
                <TableHead className="text-khaki">{t('receiver')}</TableHead>
                <TableHead className="text-center text-khaki">{t('total')}</TableHead>
                <TableHead className="text-center text-khaki">{t('active')}</TableHead>
                <TableHead className="text-center text-khaki">{t('warning')}</TableHead>
                <TableHead className="text-center text-khaki">{t('expired')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.map((receiver, index) => (
                <TableRow key={`receiver-${index}`} className="border-khaki/20">
                  <TableCell className="font-medium">{receiver.name}</TableCell>
                  <TableCell className="text-center"><Badge variant="navy">{receiver.total}</Badge></TableCell>
                  <TableCell className="text-center"><Badge className="bg-status-active text-white">{receiver.active}</Badge></TableCell>
                  <TableCell className="text-center"><Badge className="bg-status-warning text-white">{receiver.warning}</Badge></TableCell>
                  <TableCell className="text-center"><Badge className="bg-status-expired text-white">{receiver.expired}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
