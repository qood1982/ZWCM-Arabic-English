import { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback, useMemo } from 'react';
import { WorkPermit } from '@/types/permit';
import { readExcelFile, readExcelFromFile } from '@/utils/excelReader';
import { toast } from 'sonner';

export interface ColumnMapping {
  field: string;
  headerName: string;
  found: boolean;
}

interface PermitContextType {
  permits: WorkPermit[];
  allPermits: WorkPermit[];
  isDataLoaded: boolean;
  isLoading: boolean;
  loadError: string | null;
  warningThreshold: number;
  setWarningThreshold: (hours: number) => void;
  pollInterval: number;
  setPollInterval: (seconds: number) => void;
  lastSyncTime: string | null;
  columnMapping: ColumnMapping[] | null;
  refreshNow: () => Promise<void>;
  includePrepPwpInac: boolean;
  setIncludePrepPwpInac: (value: boolean) => void;
  hasPrepPwpInac: boolean;
  filePath: string;
  setFilePath: (path: string) => void;
  loadFromFile: (file: File) => Promise<void>;
}

const PermitContext = createContext<PermitContextType | undefined>(undefined);

const STORAGE_KEYS = {
  warningThreshold: 'warningThreshold',
  pollInterval: 'workpermit_poll_interval',
  filePath: 'workpermit_file_path',
};

const DEFAULT_POLL_INTERVAL = 30; // seconds
const DEFAULT_FILE_PATH = '/export.xlsx';

export const PermitProvider = ({ children }: { children: ReactNode }) => {
  const [allPermits, setAllPermits] = useState<WorkPermit[]>([]);
  const [includePrepPwpInac, setIncludePrepPwpInac] = useState(false);
  const [filePath, setFilePathLocal] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.filePath);
      if (saved) return saved;
    } catch {}
    return DEFAULT_FILE_PATH;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [warningThreshold, setWarningThresholdLocal] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.warningThreshold);
      if (saved) { const v = parseInt(saved); if (!isNaN(v) && v >= 1 && v <= 72) return v; }
    } catch {}
    return 1;
  });
  const [pollInterval, setPollIntervalLocal] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.pollInterval);
      if (saved) { const v = parseInt(saved); if (!isNaN(v) && v >= 5 && v <= 3600) return v; }
    } catch {}
    return DEFAULT_POLL_INTERVAL;
  });
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping[] | null>(null);
  const lastModifiedRef = useRef<string | null>(null);
  const permitsRef = useRef<WorkPermit[]>([]);
  const filePathRef = useRef(filePath);

  const fetchServerData = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setIsLoading(true);

      const currentPath = filePathRef.current;

      // Check if file changed via HEAD request
      const headRes = await fetch(currentPath, { method: 'HEAD', cache: 'no-store' });
      if (!headRes.ok) {
        if (isInitial) setLoadError(`Server file not available at ${currentPath}`);
        return;
      }

      const lastModified = headRes.headers.get('Last-Modified') || headRes.headers.get('ETag') || '';

      // Skip re-parse if file hasn't changed (not on initial load)
      if (!isInitial && lastModifiedRef.current && lastModified === lastModifiedRef.current) {
        const now = new Date().toISOString();
        setLastSyncTime(now);
        return;
      }

      lastModifiedRef.current = lastModified;

      const { permits: newPermits, columnMapping: newMapping } = await readExcelFile(currentPath);
      
      // Notify on data changes (not on initial load)
      if (!isInitial && permitsRef.current.length > 0) {
        const diff = newPermits.length - permitsRef.current.length;
        if (diff > 0) {
          toast.success(`${diff} new permit${diff > 1 ? 's' : ''} detected`, { description: 'Dashboard updated with latest data' });
        } else if (diff < 0) {
          toast.info(`${Math.abs(diff)} permit${Math.abs(diff) > 1 ? 's' : ''} removed`, { description: 'Dashboard updated with latest data' });
        } else if (JSON.stringify(newPermits) !== JSON.stringify(permitsRef.current)) {
          toast.info('Permit data updated', { description: 'Dashboard refreshed with latest changes' });
        }
      }

      permitsRef.current = newPermits;
      setAllPermits(newPermits);
      setColumnMapping(newMapping);
      setLoadError(newPermits.length === 0 ? 'File loaded but contains no permit data.' : null);

      const now = new Date().toISOString();
      setLastSyncTime(now);
    } catch (err) {
      console.error('[PermitContext] Failed to fetch server data:', err);
      if (isInitial) setLoadError('Failed to load data from server.');
    } finally {
      if (isInitial) setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchServerData(true);
  }, [fetchServerData]);

  // Polling
  useEffect(() => {
    const intervalId = setInterval(() => fetchServerData(false), pollInterval * 1000);
    return () => clearInterval(intervalId);
  }, [pollInterval, fetchServerData]);

  const setWarningThreshold = useCallback((hours: number) => {
    const value = Math.max(1, Math.min(72, hours));
    setWarningThresholdLocal(value);
    try { localStorage.setItem(STORAGE_KEYS.warningThreshold, String(value)); } catch {}
  }, []);

  const setPollInterval = useCallback((seconds: number) => {
    const value = Math.max(5, Math.min(3600, seconds));
    setPollIntervalLocal(value);
    try { localStorage.setItem(STORAGE_KEYS.pollInterval, String(value)); } catch {}
  }, []);

  const refreshNow = useCallback(async () => {
    lastModifiedRef.current = null; // Force re-parse
    await fetchServerData(false);
  }, [fetchServerData]);

  const setFilePath = useCallback((path: string) => {
    const trimmed = path.trim() || DEFAULT_FILE_PATH;
    setFilePathLocal(trimmed);
    filePathRef.current = trimmed;
    try { localStorage.setItem(STORAGE_KEYS.filePath, trimmed); } catch {}
    // Reset and re-fetch with new path
    lastModifiedRef.current = null;
    fetchServerData(true);
  }, [fetchServerData]);

  const loadFromFile = useCallback(async (file: File) => {
    try {
      setIsLoading(true);
      const { permits: newPermits, columnMapping: newMapping } = await readExcelFromFile(file);
      permitsRef.current = newPermits;
      setAllPermits(newPermits);
      setColumnMapping(newMapping);
      setLoadError(newPermits.length === 0 ? 'File loaded but contains no permit data.' : null);
      setLastSyncTime(new Date().toISOString());
      toast.success(`Loaded ${newPermits.length} permits from ${file.name}`);
    } catch (err) {
      console.error('[PermitContext] Failed to read uploaded file:', err);
      setLoadError('Failed to read the uploaded file.');
      toast.error('Failed to read the uploaded file');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const hasPrepPwpInac = useMemo(() => allPermits.some(p => p.wpStatus === 'PREP PWP INAC'), [allPermits]);

  const permits = useMemo(() => {
    if (includePrepPwpInac) return allPermits;
    return allPermits.filter(p => p.wpStatus !== 'PREP PWP INAC');
  }, [allPermits, includePrepPwpInac]);

  const isDataLoaded = allPermits.length > 0;

  return (
    <PermitContext.Provider value={{
      permits,
      allPermits,
      isDataLoaded,
      isLoading,
      loadError,
      warningThreshold, setWarningThreshold,
      pollInterval, setPollInterval,
      lastSyncTime,
      columnMapping,
      refreshNow,
      includePrepPwpInac, setIncludePrepPwpInac,
      hasPrepPwpInac,
      filePath, setFilePath,
      loadFromFile,
    }}>
      {children}
    </PermitContext.Provider>
  );
};

export const usePermits = () => {
  const context = useContext(PermitContext);
  if (context === undefined) {
    throw new Error('usePermits must be used within a PermitProvider');
  }
  return context;
};
