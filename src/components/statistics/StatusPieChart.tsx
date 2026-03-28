import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { PieDataEntry } from '@/hooks/useStatistics';
import { useLanguage } from '@/contexts/LanguageContext';

interface StatusPieChartProps {
  data: PieDataEntry[];
}

const COLORS = [
  'hsl(var(--status-expired))',
  'hsl(var(--orange))',
  'hsl(var(--khaki))',
  'hsl(var(--primary))',
  'hsl(var(--status-warning))',
  'hsl(220, 60%, 50%)',
  'hsl(280, 50%, 50%)',
  'hsl(180, 50%, 40%)',
];

export const StatusPieChart = ({ data }: StatusPieChartProps) => {
  const { t } = useLanguage();
  if (data.length === 0) return null;

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChartIcon className="w-5 h-5 text-orange" />
          <span className="text-gradient-navy">{t('expiredPermitsByWorkCenter')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={120} fill="#8884d8" dataKey="value">
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                formatter={(value: number) => [`${value} ${t('permits')}`, t('expired')]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
