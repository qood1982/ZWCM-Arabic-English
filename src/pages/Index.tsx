import { useState, useRef, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { FileSpreadsheet, CheckCircle2, Clock, AlertCircle, Printer, FileDown, ChevronDown, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePermits } from '@/contexts/PermitContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { EmptyDataState } from '@/components/EmptyDataState';
import { GradientHeader } from '@/components/GradientHeader';
import { FloatingControls } from '@/components/FloatingControls';
import { HeaderFilterBar } from '@/components/HeaderFilterBar';
import { CompactDateRangeFilter } from '@/components/CompactDateRangeFilter';
import { PaginationControls } from '@/components/PaginationControls';
import PermitCard from '@/components/PermitCard';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useAutoScroll } from '@/hooks/useAutoScroll';
import { usePermitFilters } from '@/hooks/usePermitFilters';
import { KpiSummaryCards } from '@/components/KpiSummaryCards';

const Index = () => {
  const { permits, isDataLoaded, warningThreshold, lastSyncTime, includePrepPwpInac, setIncludePrepPwpInac, hasPrepPwpInac } = usePermits();
  const { t } = useLanguage();

  const [headerVisible, setHeaderVisible] = useState(true);
  const [isCompact, setIsCompact] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const captureRef = useRef<HTMLDivElement>(null);

  const { isAutoScrolling, scrollDirection, scrollSpeed, toggleAutoScroll, handleSpeedChange } = useAutoScroll(containerRef);

  const {
    searchTerm, setSearchTerm, filterType, setFilterType,
    filterWpStatus, setFilterWpStatus, filterMainWorkCenter, setFilterMainWorkCenter,
    filterReceiver, setFilterReceiver, filterArea, setFilterArea,
    selectedKpi, handleKpiClick, dateRange, setDateRange,
    currentPage, totalPages, pageSize, handlePageChange, handlePageSizeChange,
    filteredPermits, kpiStats,
    mainWorkCenterOptions, wpStatusOptions, receiverOptions, areaOptions,
  } = usePermitFilters(permits, warningThreshold);

  const paginatedPermits = useMemo(() => {
    if (!isCompact) return filteredPermits;
    const start = (currentPage - 1) * pageSize;
    return filteredPermits.slice(start, start + pageSize);
  }, [filteredPermits, currentPage, pageSize, isCompact]);

  const handleScreenshotPDF = useCallback(async () => {
    const el = captureRef.current;
    if (!el) return;
    const { captureScreenshotPDF } = await import('@/utils/screenshotPdf');
    captureScreenshotPDF(el);
  }, []);

  const handleExportCompactPDF = useCallback(async (paperSize: 'a4' | 'a3', layout: 'dense' | 'readable') => {
    const { exportToCompactPDF } = await import('@/utils/exportReports');
    exportToCompactPDF({ permits: filteredPermits, warningThreshold, paperSize, layout });
  }, [filteredPermits, warningThreshold]);

  if (!isDataLoaded) {
    return (
      <div className="min-h-screen bg-background">
        <Helmet><title>{t('dashboard')} | Work Permit</title></Helmet>
        <GradientHeader title={t('workPermitDashboard')} activeTab="dashboard" showToggle={false} syncStatus={{ syncEnabled: true, lastSyncTime }} />
        <EmptyDataState />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>{t('dashboard')} | Work Permit</title>
        <meta name="description" content="Real-time work permit dashboard with expiration monitoring" />
      </Helmet>

      <FloatingControls
        visible={!headerVisible}
        activeTab="dashboard"
        isAutoScrolling={isAutoScrolling}
        scrollDirection={scrollDirection}
        onToggleAutoScroll={toggleAutoScroll}
      />

      <GradientHeader
        title={t('workPermitDashboard')}
        activeTab="dashboard"
        headerVisible={headerVisible}
        onToggleHeader={() => setHeaderVisible(!headerVisible)}
        isCompact={isCompact}
        onToggleCompact={() => setIsCompact(!isCompact)}
        syncStatus={{ syncEnabled: true, lastSyncTime }}
      >
        {headerVisible && (
          <HeaderFilterBar
            searchTerm={searchTerm} onSearchChange={setSearchTerm}
            filterType={filterType} onTypeChange={setFilterType}
            filterWpStatus={filterWpStatus} onWpStatusChange={setFilterWpStatus}
            wpStatusOptions={wpStatusOptions}
            filterMainWorkCenter={filterMainWorkCenter} onWorkCenterChange={setFilterMainWorkCenter}
            mainWorkCenterOptions={mainWorkCenterOptions}
            filterReceiver={filterReceiver} onReceiverChange={setFilterReceiver}
            receiverOptions={receiverOptions}
            filterArea={filterArea} onAreaChange={setFilterArea}
            areaOptions={areaOptions}
            filteredCount={filteredPermits.length} totalCount={permits.length}
            isAutoScrolling={isAutoScrolling} scrollDirection={scrollDirection}
            scrollSpeed={scrollSpeed} onToggleAutoScroll={toggleAutoScroll}
            onSpeedChange={handleSpeedChange}
            includePrepPwpInac={includePrepPwpInac}
            onIncludePrepPwpInacChange={setIncludePrepPwpInac}
            hasPrepPwpInac={hasPrepPwpInac}
          />
        )}
      </GradientHeader>

      <div ref={captureRef} className="w-full px-4 py-6 flex-1 flex flex-col">
        {isCompact ? (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <button
              onClick={() => handleKpiClick('')}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                "bg-card border hover:scale-105",
                selectedKpi === null ? "ring-2 ring-primary border-primary" : "border-border hover:border-primary/50"
              )}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-orange" />
              <span className="text-khaki">{t('total')}</span>
              <span className="font-bold text-gradient-navy">{kpiStats.total}</span>
            </button>

            <button onClick={() => handleKpiClick('active')} className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
              "bg-status-active/10 border border-status-active/30 hover:scale-105",
              selectedKpi === 'active' && "ring-2 ring-status-active"
            )}>
              <CheckCircle2 className="w-3.5 h-3.5 text-status-active" />
              <span className="text-status-active font-bold">{kpiStats.active}</span>
            </button>

            <button onClick={() => handleKpiClick('warning')} className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
              "bg-status-warning/10 border border-status-warning/30 hover:scale-105",
              selectedKpi === 'warning' && "ring-2 ring-status-warning"
            )}>
              <Clock className="w-3.5 h-3.5 text-status-warning" />
              <span className="text-status-warning font-bold">{kpiStats.warning}</span>
            </button>

            <button onClick={() => handleKpiClick('expired')} className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
              "bg-status-expired/10 border border-status-expired/30 hover:scale-105",
              selectedKpi === 'expired' && "ring-2 ring-status-expired"
            )}>
              <AlertCircle className="w-3.5 h-3.5 text-status-expired" />
              <span className="text-status-expired font-bold">{kpiStats.expired}</span>
            </button>

            <div data-screenshot-hide-buttons className="flex items-center gap-2 ml-auto">
              <CompactDateRangeFilter dateRange={dateRange} onDateRangeChange={setDateRange} />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5 print:hidden">
                    <FileDown className="w-3.5 h-3.5" />
                    {t('exportPDF')}
                    <ChevronDown className="w-3 h-3 ml-0.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">{t('readableLargerCards')}</div>
                  <DropdownMenuItem onClick={() => handleExportCompactPDF('a4', 'readable')}>
                    <FileDown className="w-4 h-4 mr-2" /> {t('a4Readable')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportCompactPDF('a3', 'readable')}>
                    <FileDown className="w-4 h-4 mr-2" /> {t('a3Readable')}
                  </DropdownMenuItem>
                  <div className="my-1 border-t border-border" />
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">{t('denseMoreCards')}</div>
                  <DropdownMenuItem onClick={() => handleExportCompactPDF('a4', 'dense')}>
                    <FileDown className="w-4 h-4 mr-2" /> {t('a4Dense')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportCompactPDF('a3', 'dense')}>
                    <FileDown className="w-4 h-4 mr-2" /> {t('a3Dense')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" size="sm" className="gap-1.5 print:hidden" onClick={handleScreenshotPDF}>
                <Camera className="w-3.5 h-3.5" /> {t('screenshot')}
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 print:hidden" onClick={() => window.print()}>
                <Printer className="w-3.5 h-3.5" /> {t('print')}
              </Button>
            </div>
          </div>
        ) : (
          <KpiSummaryCards
            stats={kpiStats}
            selectedKpi={selectedKpi}
            onKpiClick={handleKpiClick}
            warningThresholdLabel={`≤${warningThreshold}${t('hRemaining', warningThreshold).replace(String(warningThreshold), '')}`}
          />
        )}

        {isCompact && filteredPermits.length > 0 && (
          <div data-screenshot-hide-pagination>
            <PaginationControls
              currentPage={currentPage} totalPages={totalPages}
              pageSize={pageSize} totalItems={filteredPermits.length}
              onPageChange={handlePageChange} onPageSizeChange={handlePageSizeChange}
              className="mb-4 print:hidden"
            />
          </div>
        )}

        <main ref={containerRef} className="overflow-y-auto flex-1 min-h-0">
          {filteredPermits.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground">{t('noPermitsFound')}</p>
            </div>
          ) : (
            <div className={cn(
              "grid gap-4",
              isCompact
                ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8"
                : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            )}>
              {(isCompact ? paginatedPermits : filteredPermits).map((permit, index) => (
                <PermitCard key={`${permit.application}-${index}`} permit={permit} isCompact={isCompact} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;
