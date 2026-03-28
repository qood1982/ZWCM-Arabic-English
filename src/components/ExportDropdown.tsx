import { Download, FileSpreadsheet, FileText, FileType } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { WorkPermit } from '@/types/permit';
import { toast } from 'sonner';
import { useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ExportDropdownProps {
  permits: WorkPermit[];
  warningThreshold: number;
  filename?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const ExportDropdown = ({ 
  permits, warningThreshold, filename = 'work-permits-report', variant = 'outline', size = 'sm'
}: ExportDropdownProps) => {
  const { t } = useLanguage();

  const handleExport = useCallback(async (
    format: 'Excel' | 'CSV' | 'PDF',
    exportFnName: 'exportToExcel' | 'exportToCSV' | 'exportToPDF'
  ) => {
    if (permits.length === 0) {
      toast.error(t('noPermitsToExport'));
      return;
    }
    const mod = await import('@/utils/exportReports');
    mod[exportFnName]({ permits, warningThreshold, filename });
    toast.success(t('exportedPermits', permits.length, format));
  }, [permits, warningThreshold, filename, t]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className="gap-2">
          <Download className="w-4 h-4" />
          {t('export')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('Excel', 'exportToExcel')} className="gap-2 cursor-pointer">
          <FileSpreadsheet className="w-4 h-4" />
          {t('exportAsExcel')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('CSV', 'exportToCSV')} className="gap-2 cursor-pointer">
          <FileText className="w-4 h-4" />
          {t('exportAsCSV')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('PDF', 'exportToPDF')} className="gap-2 cursor-pointer">
          <FileType className="w-4 h-4" />
          {t('exportAsPDF')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
