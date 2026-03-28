import { useState, useMemo, useEffect } from 'react';
import { WorkPermit } from '@/types/permit';
import { calculateHoursRemaining, getExpirationStatus } from '@/utils/timeCalculations';
import { DateRange } from 'react-day-picker';
import { isWithinInterval, startOfDay, endOfDay } from 'date-fns';

interface FilterOption {
  name: string;
  count?: number;
  expiredCount?: number;
}

export const usePermitFilters = (permits: WorkPermit[], warningThreshold: number) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMainWorkCenter, setFilterMainWorkCenter] = useState('all');
  const [filterWpStatus, setFilterWpStatus] = useState('all');
  const [filterReceiver, setFilterReceiver] = useState('all');
  const [filterArea, setFilterArea] = useState('all');
  const [selectedKpi, setSelectedKpi] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(48);

  // KPI stats based on current filters (except status)
  const kpiStats = useMemo(() => {
    let kpiPermits = permits;
    if (filterWpStatus !== 'all') kpiPermits = kpiPermits.filter(p => p.wpStatus === filterWpStatus);
    if (filterMainWorkCenter !== 'all') kpiPermits = kpiPermits.filter(p => (p.mainWorkCenter || 'Unknown') === filterMainWorkCenter);
    if (filterReceiver !== 'all') kpiPermits = kpiPermits.filter(p => p.receivedByName === filterReceiver);

    const stats = { total: kpiPermits.length, active: 0, warning: 0, expired: 0 };
    kpiPermits.forEach(permit => {
      const hours = calculateHoursRemaining(permit.validTo, permit.validToTime);
      const status = getExpirationStatus(hours, warningThreshold);
      if (status === 'expired') {
        stats.expired++;
      } else {
        stats.active++;
        if (status === 'warning') stats.warning++;
      }
    });
    return stats;
  }, [permits, filterWpStatus, filterMainWorkCenter, filterReceiver, warningThreshold]);

  // Filter options
  const mainWorkCenterOptions: FilterOption[] = useMemo(() => {
    const map: Record<string, { name: string; expiredCount: number }> = {};
    permits.forEach(permit => {
      const wc = permit.mainWorkCenter || 'Unknown';
      if (!map[wc]) map[wc] = { name: wc, expiredCount: 0 };
      const hours = calculateHoursRemaining(permit.validTo, permit.validToTime);
      if (getExpirationStatus(hours, warningThreshold) === 'expired') map[wc].expiredCount++;
    });
    return Object.values(map).sort((a, b) => b.expiredCount - a.expiredCount);
  }, [permits, warningThreshold]);

  const wpStatusOptions = useMemo(() => {
    const statuses = new Set<string>();
    permits.forEach(p => { if (p.wpStatus) statuses.add(p.wpStatus); });
    return Array.from(statuses).sort();
  }, [permits]);

  const receiverOptions: FilterOption[] = useMemo(() => {
    const counts: Record<string, number> = {};
    permits.forEach(p => {
      const name = p.receivedByName || 'Unknown';
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => (b.count || 0) - (a.count || 0));
  }, [permits]);

  const areaOptions: FilterOption[] = useMemo(() => {
    const counts: Record<string, number> = {};
    permits.forEach(p => {
      const parts = (p.functionalLocation || '').split('-');
      const area = parts.length >= 3 ? parts[2] : '';
      if (area) counts[area] = (counts[area] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => (b.count || 0) - (a.count || 0));
  }, [permits]);

  // Filtered and sorted permits
  const filteredPermits = useMemo(() => {
    let filtered = permits;

    if (filterType !== 'all') {
      filtered = filtered.filter(p => p.type.toLowerCase().includes(filterType.toLowerCase()));
    }

    const activeStatus = selectedKpi || (filterStatus !== 'all' ? filterStatus : null);
    if (activeStatus) {
      filtered = filtered.filter(p => {
        const hours = calculateHoursRemaining(p.validTo, p.validToTime);
        return getExpirationStatus(hours, warningThreshold) === activeStatus;
      });
    }

    if (filterMainWorkCenter !== 'all') {
      filtered = filtered.filter(p => (p.mainWorkCenter || 'Unknown') === filterMainWorkCenter);
    }
    if (filterWpStatus !== 'all') {
      filtered = filtered.filter(p => p.wpStatus === filterWpStatus);
    }
    if (filterReceiver !== 'all') {
      filtered = filtered.filter(p => p.receivedByName === filterReceiver);
    }
    if (filterArea !== 'all') {
      filtered = filtered.filter(p => {
        const parts = (p.functionalLocation || '').split('-');
        return (parts.length >= 3 ? parts[2] : '') === filterArea;
      });
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.application.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.receivedByName.toLowerCase().includes(term) ||
        p.issuedByName.toLowerCase().includes(term) ||
        p.workCenter.toLowerCase().includes(term)
      );
    }

    if (dateRange?.from || dateRange?.to) {
      filtered = filtered.filter(p => {
        try {
          const [month, day, year] = p.validTo.split('/');
          const fullYear = year.length === 2 ? `20${year}` : year;
          const permitDate = new Date(parseInt(fullYear), parseInt(month) - 1, parseInt(day));
          if (dateRange.from && dateRange.to) {
            return isWithinInterval(permitDate, { start: startOfDay(dateRange.from), end: endOfDay(dateRange.to) });
          } else if (dateRange.from) {
            return permitDate >= startOfDay(dateRange.from);
          } else if (dateRange.to) {
            return permitDate <= endOfDay(dateRange.to);
          }
          return true;
        } catch {
          return true;
        }
      });
    }

    return [...filtered].sort((a, b) => {
      const hoursA = calculateHoursRemaining(a.validTo, a.validToTime);
      const hoursB = calculateHoursRemaining(b.validTo, b.validToTime);
      return hoursA - hoursB;
    });
  }, [searchTerm, filterType, filterStatus, filterMainWorkCenter, filterWpStatus, filterReceiver, filterArea, permits, selectedKpi, warningThreshold, dateRange]);

  // Reset page on filter change
  useEffect(() => { setCurrentPage(1); }, [filteredPermits.length]);

  const handleKpiClick = (status: string) => {
    if (selectedKpi === status) {
      setSelectedKpi(null);
    } else {
      setSelectedKpi(status);
      setFilterStatus('all');
    }
  };

  const totalPages = Math.ceil(filteredPermits.length / pageSize);

  const handlePageChange = (page: number) => setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  const handlePageSizeChange = (size: number) => { setPageSize(size); setCurrentPage(1); };

  return {
    searchTerm, setSearchTerm,
    filterType, setFilterType,
    filterWpStatus, setFilterWpStatus,
    filterMainWorkCenter, setFilterMainWorkCenter,
    filterReceiver, setFilterReceiver,
    filterArea, setFilterArea,
    selectedKpi, handleKpiClick,
    dateRange, setDateRange,
    currentPage, totalPages, pageSize,
    handlePageChange, handlePageSizeChange,
    filteredPermits,
    kpiStats,
    mainWorkCenterOptions, wpStatusOptions, receiverOptions, areaOptions,
  };
};
