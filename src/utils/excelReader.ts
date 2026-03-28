import * as XLSX from 'xlsx';
import { WorkPermit } from '@/types/permit';
import { ColumnMapping } from '@/contexts/PermitContext';

// Convert Excel serial number to formatted date string (MM/DD/YYYY)
const excelSerialToDate = (serial: any): string => {
  if (!serial || isNaN(Number(serial))) return String(serial || '');
  
  const serialNum = Number(serial);
  const wholeDays = Math.floor(serialNum);
  // Calculate date components directly to avoid timezone issues
  const baseDate = new Date(1899, 11, 30); // Dec 30, 1899 in local time
  baseDate.setDate(baseDate.getDate() + wholeDays);
  const day = String(baseDate.getDate()).padStart(2, '0');
  const month = String(baseDate.getMonth() + 1).padStart(2, '0');
  const fullYear = baseDate.getFullYear();
  return `${month}/${day}/${fullYear}`;
};

// Convert Excel time serial to time string
const excelSerialToTime = (serial: any): string => {
  if (!serial || isNaN(Number(serial))) return String(serial || '');
  
  const serialNum = Number(serial);
  // Extract fractional part for time (handles both pure time values and datetime values)
  const timeFraction = serialNum % 1;
  const totalSeconds = Math.round(timeFraction * 86400);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

interface ParseResult {
  permits: WorkPermit[];
  columnMapping: ColumnMapping[];
}

const parseWorkbookToPermits = (workbook: XLSX.WorkBook): ParseResult => {
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
  
  const headerRow = (jsonData[0] || []) as any[];
  const dataRows = jsonData.slice(1) as any[];
  
  // Build column index map from headers (case-insensitive, trimmed)
  const colMap: Record<string, number> = {};
  headerRow.forEach((header, index) => {
    if (header) {
      colMap[String(header).toLowerCase().trim()] = index;
    }
  });
  
  // Helper to get column index by header name (supports multiple possible names)
  const getCol = (...names: string[]): number => {
    for (const name of names) {
      const idx = colMap[name.toLowerCase().trim()];
      if (idx !== undefined) return idx;
    }
    return -1;
  };
  
  // Map header names to column indices
  const cols = {
    application: getCol('application', 'app', 'permit no', 'permit number'),
    description: getCol('work permit description', 'description', 'desc', 'permit description'),
    type: getCol('type', 'permit type', 'wp type'),
    wpStatus: getCol('status', 'wp status', 'permit status'),
    workCenter: getCol('main work center', 'main workcenter', 'main work ctr', 'work center', 'workcenter', 'work ctr'),
    mainWorkCenter: getCol('main work center', 'main workcenter', 'main work ctr'),
    functionalLocation: getCol('functional location', 'func location', 'func loc', 'functional loc'),
    functionalLocationDesc: getCol('f.loc description', 'functional location desc', 'func location desc', 'functional loc desc', 'func loc desc'),
    receivedBy: getCol('received by', 'receiver', 'receiver id'),
    receivedByName: getCol('received by name', 'receiver name'),
    issuedBy: getCol('issued by', 'issuer', 'issuer id'),
    issuedByName: getCol('issued by name', 'issuer name'),
    issuedOn: getCol('issued on', 'issue date', 'issued date'),
    issuedAt: getCol('issued at', 'issue time', 'issued time'),
    validFrom: getCol('valid from', 'start date', 'valid from date'),
    validFromTime: getCol('valid from time', 'start time'),
    validTo: getCol('valid to', 'end date', 'valid to date', 'expiry date'),
    validToTime: getCol('valid to time', 'end time', 'expiry time'),
    deEnergized: getCol('de-energized', 'deenergized', 'de energized'),
    receiverPersonalLock: getCol('receiver personal lock', 'personal lock', 'lock')
  };

  // Generate column mapping for preview
  const fieldLabels: Record<string, string> = {
    application: 'Application',
    description: 'Description',
    type: 'Type',
    wpStatus: 'WP Status',
    workCenter: 'Work Center',
    mainWorkCenter: 'Main Work Center',
    functionalLocation: 'Functional Location',
    functionalLocationDesc: 'Functional Loc Desc',
    receivedBy: 'Received By',
    receivedByName: 'Received By Name',
    issuedBy: 'Issued By',
    issuedByName: 'Issued By Name',
    issuedOn: 'Issued On',
    issuedAt: 'Issued At',
    validFrom: 'Valid From',
    validFromTime: 'Valid From Time',
    validTo: 'Valid To',
    validToTime: 'Valid To Time',
    deEnergized: 'De-Energized',
    receiverPersonalLock: 'Receiver Personal Lock'
  };

  const columnMapping: ColumnMapping[] = Object.entries(cols).map(([field, index]) => ({
    field: fieldLabels[field] || field,
    headerName: index !== -1 ? String(headerRow[index]) : 'Not Found',
    found: index !== -1
  }));
  
  const permits: WorkPermit[] = dataRows.map((row) => ({
    application: String(row[cols.application] ?? row[0] ?? ''),
    description: String(row[cols.description] ?? row[1] ?? ''),
    type: String(row[cols.type] ?? row[2] ?? ''),
    wpStatus: String(row[cols.wpStatus] ?? row[3] ?? ''),
    workCenter: String(row[cols.workCenter] ?? ''),
    mainWorkCenter: String(row[cols.mainWorkCenter] ?? ''),
    functionalLocation: String(row[cols.functionalLocation] ?? ''),
    functionalLocationDesc: String(row[cols.functionalLocationDesc] ?? ''),
    receivedBy: String(row[cols.receivedBy] ?? ''),
    receivedByName: String(row[cols.receivedByName] ?? ''),
    issuedBy: String(row[cols.issuedBy] ?? ''),
    issuedByName: String(row[cols.issuedByName] ?? ''),
    issuedOn: excelSerialToDate(row[cols.issuedOn]),
    issuedAt: excelSerialToTime(row[cols.issuedAt]),
    validFrom: excelSerialToDate(row[cols.validFrom]),
    validFromTime: excelSerialToTime(row[cols.validFromTime]),
    validTo: excelSerialToDate(row[cols.validTo]),
    validToTime: excelSerialToTime(row[cols.validToTime]),
    deEnergized: String(row[cols.deEnergized] ?? '').toLowerCase() === 'true',
    receiverPersonalLock: String(row[cols.receiverPersonalLock] ?? '')
  })).filter(permit => permit.application && permit.type && (permit.wpStatus === 'PREP PWP' || permit.wpStatus === 'PREP PWP INAC'));
  
  return { permits, columnMapping };
};

export const readExcelFile = async (filePath: string): Promise<ParseResult> => {
  try {
    const response = await fetch(filePath, { cache: 'no-store' });
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    return parseWorkbookToPermits(workbook);
  } catch (error) {
    console.error('Error reading Excel file:', error);
    return { permits: [], columnMapping: [] };
  }
};

export const readExcelFromFile = async (file: File): Promise<ParseResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        resolve(parseWorkbookToPermits(workbook));
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
};
