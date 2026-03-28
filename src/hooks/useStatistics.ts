import { useMemo } from 'react';
import { WorkPermit } from '@/types/permit';
import { calculateHoursRemaining, getExpirationStatus } from '@/utils/timeCalculations';

export interface WorkCenterStats {
  workCenter: string;
  total: number;
  active: number;
  warning: number;
  expired: number;
}

export interface ReceiverStats {
  name: string;
  total: number;
  active: number;
  warning: number;
  expired: number;
}

export interface StatusStats {
  active: number;
  warning: number;
  expired: number;
}

export interface PieDataEntry {
  name: string;
  value: number;
}

export const useStatistics = (permits: WorkPermit[], warningThreshold: number) => {
  const statusStats = useMemo<StatusStats>(() => {
    const stats = { active: 0, warning: 0, expired: 0 };
    permits.forEach(permit => {
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
  }, [permits, warningThreshold]);

  const workCenterStats = useMemo<WorkCenterStats[]>(() => {
    const statsMap = new Map<string, WorkCenterStats>();
    permits.forEach(permit => {
      const wc = permit.workCenter || 'Unknown';
      const hours = calculateHoursRemaining(permit.validTo, permit.validToTime);
      const status = getExpirationStatus(hours, warningThreshold);
      if (!statsMap.has(wc)) {
        statsMap.set(wc, { workCenter: wc, total: 0, active: 0, warning: 0, expired: 0 });
      }
      const s = statsMap.get(wc)!;
      s.total++;
      if (status === 'expired') { s.expired++; } else { s.active++; if (status === 'warning') s.warning++; }
    });
    return Array.from(statsMap.values()).sort((a, b) => b.total - a.total);
  }, [permits, warningThreshold]);

  const mainWorkCenterExpiredData = useMemo<PieDataEntry[]>(() => {
    const expiredMap = new Map<string, number>();
    permits.forEach(permit => {
      const hours = calculateHoursRemaining(permit.validTo, permit.validToTime);
      const status = getExpirationStatus(hours, warningThreshold);
      if (status === 'expired') {
        const mwc = permit.mainWorkCenter || 'Unknown';
        expiredMap.set(mwc, (expiredMap.get(mwc) || 0) + 1);
      }
    });
    return Array.from(expiredMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [permits, warningThreshold]);

  const receiverStats = useMemo<ReceiverStats[]>(() => {
    const statsMap: Record<string, ReceiverStats> = {};
    permits.forEach(permit => {
      const name = permit.receivedByName || 'Unknown';
      const hours = calculateHoursRemaining(permit.validTo, permit.validToTime);
      const status = getExpirationStatus(hours, warningThreshold);
      if (!statsMap[name]) {
        statsMap[name] = { name, total: 0, active: 0, warning: 0, expired: 0 };
      }
      statsMap[name].total++;
      if (status === 'expired') { statsMap[name].expired++; } else { statsMap[name].active++; if (status === 'warning') statsMap[name].warning++; }
    });
    return Object.values(statsMap).sort((a, b) => b.total - a.total);
  }, [permits, warningThreshold]);

  return { statusStats, workCenterStats, mainWorkCenterExpiredData, receiverStats };
};
