import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Settings, CheckCircle2, AlertCircle, Columns, RefreshCw, Database, Upload, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';
import { usePermits } from '@/contexts/PermitContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { GradientHeader } from '@/components/GradientHeader';

const Admin = () => {
  const {
    permits, warningThreshold, setWarningThreshold,
    pollInterval, setPollInterval, columnMapping,
    lastSyncTime, isLoading, loadError, refreshNow,
    filePath, setFilePath, loadFromFile,
  } = usePermits();
  const { t } = useLanguage();

  const [thresholdInput, setThresholdInput] = useState(String(warningThreshold));
  const [pollInput, setPollInput] = useState(String(pollInterval));
  const [filePathInput, setFilePathInput] = useState(filePath);
  const [refreshing, setRefreshing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveThreshold = () => {
    const value = parseInt(thresholdInput);
    if (!isNaN(value) && value >= 1 && value <= 72) {
      setWarningThreshold(value);
      toast.success(t('warningThresholdUpdated', value));
    } else {
      toast.error(t('invalidThreshold'));
      setThresholdInput(String(warningThreshold));
    }
  };

  const handleSavePollInterval = () => {
    const value = parseInt(pollInput);
    if (!isNaN(value) && value >= 5 && value <= 3600) {
      setPollInterval(value);
      toast.success(t('pollingIntervalUpdated', value));
    } else {
      toast.error(t('invalidPollInterval'));
      setPollInput(String(pollInterval));
    }
  };

  const handleSaveFilePath = () => {
    const trimmed = filePathInput.trim();
    if (trimmed) {
      setFilePath(trimmed);
      toast.success(t('filePathUpdated', trimmed));
    } else {
      toast.error(t('invalidFilePath'));
      setFilePathInput(filePath);
    }
  };

  const handleBrowseFile = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error(t('selectExcelFile'));
      return;
    }
    await loadFromFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshNow();
      toast.success(t('dataRefreshed'));
    } catch {
      toast.error(t('refreshFailed'));
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <GradientHeader title={t('adminDashboard')} activeTab="admin" showToggle={false} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-orange" />
                <span className="text-gradient-navy">{t('dataSource')}</span>
              </CardTitle>
              <CardDescription className="text-khaki">{t('dataSourceDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg border border-border bg-card">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {loadError ? <AlertCircle className="w-4 h-4 text-status-expired" /> : <CheckCircle2 className="w-4 h-4 text-status-active" />}
                    <span className="text-sm font-medium">
                      {isLoading ? t('loading') : loadError ? t('error') : t('permitsLoaded', permits.length)}
                    </span>
                  </div>
                  <Button size="sm" variant="outline" onClick={handleRefresh} disabled={refreshing}>
                    {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    <span className="ml-1.5">{t('refreshNow')}</span>
                  </Button>
                </div>
                {loadError && <p className="text-xs text-status-expired">{loadError}</p>}
                {lastSyncTime && <p className="text-xs text-khaki">{t('last')}: {new Date(lastSyncTime).toLocaleString()}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="filePath" className="text-sm font-medium text-navy flex items-center gap-1.5">
                  <FolderOpen className="w-3.5 h-3.5" />
                  {t('serverFilePath')}
                </Label>
                <p className="text-xs text-khaki">{t('serverFilePathDesc')}</p>
                <div className="flex items-center gap-2">
                  <Input id="filePath" value={filePathInput} onChange={e => setFilePathInput(e.target.value)} placeholder="/export.xlsx" className="flex-1" />
                  <Button size="sm" onClick={handleSaveFilePath}>{t('apply')}</Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-navy flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  {t('browseLocalFile')}
                </Label>
                <p className="text-xs text-khaki">{t('browseLocalFileDesc')}</p>
                <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleFileChange} className="hidden" />
                <Button variant="outline" size="sm" onClick={handleBrowseFile} className="gap-2">
                  <Upload className="w-4 h-4" />
                  {t('browseFile')}
                </Button>
              </div>

              <div className="p-4 bg-khaki/10 rounded-lg border border-khaki/30">
                <h4 className="font-medium text-sm mb-2 text-navy">{t('sapIntegration')}</h4>
                <p className="text-xs text-khaki">{t('sapInstructions')}</p>
                <p className="text-xs text-khaki mt-2">
                  {t('autoPollingEvery', pollInterval)} <code className="bg-muted px-1 py-0.5 rounded">{filePath}</code>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-orange" />
                <span className="text-gradient-navy">{t('settings')}</span>
              </CardTitle>
              <CardDescription className="text-khaki">{t('configDashboard')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="warningThreshold" className="text-sm font-medium text-navy">{t('warningThreshold')}</Label>
                  <p className="text-xs text-khaki mb-2">{t('warningThresholdDesc')}</p>
                  <div className="flex items-center gap-2">
                    <Input id="warningThreshold" type="number" min={1} max={72} value={thresholdInput} onChange={e => setThresholdInput(e.target.value)} className="w-24" />
                    <span className="text-sm text-khaki">{t('hours1to72')}</span>
                    <Button size="sm" onClick={handleSaveThreshold}>{t('save')}</Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="pollInterval" className="text-sm font-medium text-navy">{t('pollingInterval')}</Label>
                  <p className="text-xs text-khaki mb-2">{t('pollingIntervalDesc')}</p>
                  <div className="flex items-center gap-2">
                    <Input id="pollInterval" type="number" min={5} max={3600} value={pollInput} onChange={e => setPollInput(e.target.value)} className="w-24" />
                    <span className="text-sm text-khaki">{t('seconds5to3600')}</span>
                    <Button size="sm" onClick={handleSavePollInterval}>{t('save')}</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {columnMapping && columnMapping.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Columns className="w-5 h-5 text-orange" />
                <span className="text-gradient-navy">{t('columnMappingPreview')}</span>
              </CardTitle>
              <CardDescription className="text-khaki">{t('columnMappingDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {columnMapping.map((mapping, index) => (
                  <div key={index} className={`flex items-center gap-2 p-2 rounded-lg border ${mapping.found ? 'bg-status-active/10 border-status-active/30' : 'bg-status-expired/10 border-status-expired/30'}`}>
                    {mapping.found ? <CheckCircle2 className="w-4 h-4 text-status-active flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-status-expired flex-shrink-0" />}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-navy truncate">{mapping.field}</p>
                      <p className="text-xs text-khaki truncate">→ {mapping.headerName}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Admin;
