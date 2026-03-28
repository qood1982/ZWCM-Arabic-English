import { FileSpreadsheet, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

export const EmptyDataState = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-4 rounded-full bg-muted">
              <FileSpreadsheet className="w-12 h-12 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{t('noDataLoaded')}</h3>
              <p className="text-sm text-muted-foreground mt-1">{t('uploadExcelFile')}</p>
            </div>
            <Button onClick={() => navigate('/admin')} className="mt-4">
              <Upload className="w-4 h-4 mr-2" />
              {t('goToAdminToUpload')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
