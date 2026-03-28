import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { WorkPermit } from '@/types/permit';
import { calculateHoursRemaining, getExpirationStatus, formatDateTime } from '@/utils/timeCalculations';
import { loadNotoArabicFont } from './amiriFont';

// Helper to detect if text contains Arabic characters
const containsArabic = (text: string): boolean => {
  const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicPattern.test(text);
};

// Helper to check if any permit data contains Arabic
const dataContainsArabic = (permits: WorkPermit[]): boolean => {
  return permits.some(permit => 
    containsArabic(permit.description) ||
    containsArabic(permit.receivedByName) ||
    containsArabic(permit.issuedByName) ||
    containsArabic(permit.functionalLocationDesc || '') ||
    containsArabic(permit.mainWorkCenter) ||
    containsArabic(permit.workCenter)
  );
};

interface ExportOptions {
  permits: WorkPermit[];
  warningThreshold: number;
  filename?: string;
}

const getExportData = (permits: WorkPermit[], warningThreshold: number) => {
  return permits.map(permit => {
    const hours = calculateHoursRemaining(permit.validTo, permit.validToTime);
    const status = getExpirationStatus(hours, warningThreshold);
    
    return {
      'Application': permit.application,
      'Description': permit.description,
      'Type': permit.type,
      'WP Status': permit.wpStatus || '',
      'Work Center': permit.workCenter,
      'Main Work Center': permit.mainWorkCenter,
      'Functional Location': permit.functionalLocation,
      'Location Description': permit.functionalLocationDesc,
      'Received By': permit.receivedByName,
      'Received By ID': permit.receivedBy,
      'Issued By': permit.issuedByName,
      'Issued By ID': permit.issuedBy,
      'Issued On': permit.issuedOn,
      'Issued At': permit.issuedAt,
      'Valid From': formatDateTime(permit.validFrom, permit.validFromTime),
      'Valid To': formatDateTime(permit.validTo, permit.validToTime),
      'Hours Remaining': hours.toFixed(1),
      'Status': status.charAt(0).toUpperCase() + status.slice(1),
      'De-Energized': permit.deEnergized ? 'Yes' : 'No',
      'Personal Lock': permit.receiverPersonalLock || '',
    };
  });
};

export const exportToExcel = ({ permits, warningThreshold, filename = 'work-permits-report' }: ExportOptions) => {
  const data = getExportData(permits, warningThreshold);

  const worksheet = XLSX.utils.json_to_sheet(data);
  
  const colWidths = [
    { wch: 15 }, { wch: 40 }, { wch: 12 }, { wch: 12 }, { wch: 15 },
    { wch: 18 }, { wch: 25 }, { wch: 30 }, { wch: 20 }, { wch: 12 },
    { wch: 20 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 18 },
    { wch: 18 }, { wch: 15 }, { wch: 10 }, { wch: 12 }, { wch: 15 },
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Work Permits');

  const date = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `${filename}-${date}.xlsx`);
};

export const exportToCSV = ({ permits, warningThreshold, filename = 'work-permits-report' }: ExportOptions) => {
  const headers = [
    'Application', 'Description', 'Type', 'WP Status', 'Work Center', 'Main Work Center',
    'Functional Location', 'Location Description', 'Received By', 'Received By ID',
    'Issued By', 'Issued By ID', 'Issued On', 'Issued At', 'Valid From', 'Valid To',
    'Hours Remaining', 'Status', 'De-Energized', 'Personal Lock'
  ];

  const rows = permits.map(permit => {
    const hours = calculateHoursRemaining(permit.validTo, permit.validToTime);
    const status = getExpirationStatus(hours, warningThreshold);
    
    return [
      permit.application,
      `"${permit.description.replace(/"/g, '""')}"`,
      permit.type,
      permit.wpStatus || '',
      permit.workCenter,
      permit.mainWorkCenter,
      permit.functionalLocation,
      `"${(permit.functionalLocationDesc || '').replace(/"/g, '""')}"`,
      permit.receivedByName,
      permit.receivedBy,
      permit.issuedByName,
      permit.issuedBy,
      permit.issuedOn,
      permit.issuedAt,
      formatDateTime(permit.validFrom, permit.validFromTime),
      formatDateTime(permit.validTo, permit.validToTime),
      hours.toFixed(1),
      status.charAt(0).toUpperCase() + status.slice(1),
      permit.deEnergized ? 'Yes' : 'No',
      permit.receiverPersonalLock || '',
    ].join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const date = new Date().toISOString().split('T')[0];
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}-${date}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};

interface CompactPDFOptions extends ExportOptions {
  paperSize?: 'a4' | 'a3';
  layout?: 'dense' | 'readable';
}

// Compact card PDF export - professional layout minimizing paper usage
export const exportToCompactPDF = async ({ permits, warningThreshold, filename = 'work-permits-compact', paperSize = 'a4', layout = 'readable' }: CompactPDFOptions) => {
  const doc = new jsPDF({ 
    orientation: 'landscape', 
    unit: 'mm', 
    format: paperSize 
  });
  
  // Check if Arabic font is needed and load it
  const needsArabicFont = dataContainsArabic(permits);
  let arabicFontLoaded = false;
  
  if (needsArabicFont) {
    try {
      const fontBase64 = await loadNotoArabicFont();
      doc.addFileToVFS('NotoNaskhArabic-Regular.ttf', fontBase64);
      doc.addFont('NotoNaskhArabic-Regular.ttf', 'NotoNaskhArabic', 'normal');
      arabicFontLoaded = true;
    } catch (error) {
      console.warn('Failed to load Arabic font, falling back to default:', error);
    }
  }
  
  const date = new Date();
  const formattedDate = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const formattedTime = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
  const documentRef = `WP-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  
  // Page dimensions
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = layout === 'dense' ? 5 : 6;
  const headerHeight = layout === 'dense' ? 12 : 14;
  const footerHeight = layout === 'dense' ? 5 : 6;
  
  // Card dimensions based on layout mode
  const cardDimensions = {
    dense: {
      a4: { width: 68, height: 26 },
      a3: { width: 72, height: 28 }
    },
    readable: {
      a4: { width: 91, height: 32 },
      a3: { width: 98, height: 35 }
    }
  };
  
  const cardWidth = cardDimensions[layout][paperSize].width;
  const cardHeight = cardDimensions[layout][paperSize].height;
  const cardGap = layout === 'dense' ? 2 : 2;
  
  // Calculate grid layout
  const contentWidth = pageWidth - (margin * 2);
  const contentHeight = pageHeight - headerHeight - footerHeight - margin;
  const cardsPerRow = Math.floor((contentWidth + cardGap) / (cardWidth + cardGap));
  const rowsPerPage = Math.floor((contentHeight + cardGap) / (cardHeight + cardGap));
  const cardsPerPage = cardsPerRow * rowsPerPage;
  
  // Calculate summary statistics
  const expiredCount = permits.filter(p => {
    const hours = calculateHoursRemaining(p.validTo, p.validToTime);
    return hours <= 0;
  }).length;
  const warningCount = permits.filter(p => {
    const hours = calculateHoursRemaining(p.validTo, p.validToTime);
    return hours > 0 && hours <= warningThreshold;
  }).length;
  const activeCount = permits.length - expiredCount - warningCount;
  
  // Sort permits: expired first, then warning, then active (most critical first)
  const sortedPermits = [...permits].sort((a, b) => {
    const hoursA = calculateHoursRemaining(a.validTo, a.validToTime);
    const hoursB = calculateHoursRemaining(b.validTo, b.validToTime);
    const statusA = getExpirationStatus(hoursA, warningThreshold);
    const statusB = getExpirationStatus(hoursB, warningThreshold);
    const order = { expired: 0, warning: 1, active: 2 };
    if (order[statusA] !== order[statusB]) return order[statusA] - order[statusB];
    return hoursA - hoursB; // Within same status, sort by hours remaining
  });
  
  const totalPages = Math.ceil(permits.length / cardsPerPage);
  
  // Font sizes based on layout
  const fontSize = {
    dense: { type: 7, app: 6, desc: 5, loc: 4.5, badge: 5, hours: 5.5 },
    readable: { type: 9, app: 8, desc: 7, loc: 6.5, badge: 6, hours: 8 }
  };
  const fs = fontSize[layout];
  
  // Vertical spacing based on layout
  const spacing = {
    dense: { row1: 4.5, row2: 9, row3: 13, row4: 17.5, row5: 21, badgeY: 19, hoursY: 23 },
    readable: { row1: 5.5, row2: 11, row3: 16, row4: 21.5, row5: 24, badgeY: 24, hoursY: 28.5 }
  };
  const sp = spacing[layout];

  // Draw function for a single card with layout-aware sizing
  const drawCard = (permit: WorkPermit, x: number, y: number) => {
    const hours = calculateHoursRemaining(permit.validTo, permit.validToTime);
    const status = getExpirationStatus(hours, warningThreshold);
    
    // Card background
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(layout === 'dense' ? 0.2 : 0.3);
    doc.roundedRect(x, y, cardWidth, cardHeight, layout === 'dense' ? 1.5 : 2, layout === 'dense' ? 1.5 : 2, 'FD');
    
    // Status indicator bar (left edge)
    const barWidth = layout === 'dense' ? 2.5 : 3;
    if (status === 'expired') {
      doc.setFillColor(220, 53, 69);
    } else if (status === 'warning') {
      doc.setFillColor(255, 152, 0);
    } else {
      doc.setFillColor(40, 167, 69);
    }
    doc.roundedRect(x, y, barWidth, cardHeight, layout === 'dense' ? 1.5 : 2, 0, 'F');
    doc.rect(x + barWidth - 1, y, 1, cardHeight, 'F');
    
    const contentX = x + (layout === 'dense' ? 4 : 5);
    const maxWidth = cardWidth - (layout === 'dense' ? 6 : 8);
    const truncLen = layout === 'dense' ? { type: 12, wc: 10, desc: 45, loc: 15, rcv: 14, mwc: 12 } : { type: 14, wc: 12, desc: 60, loc: 18, rcv: 16, mwc: 14 };
    
    // Row 1: Type & Work Center badge
    doc.setFontSize(fs.type);
    doc.setFont(arabicFontLoaded ? 'NotoNaskhArabic' : 'helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    const typeText = permit.type.length > truncLen.type ? permit.type.substring(0, truncLen.type - 1) + '…' : permit.type;
    doc.text(typeText, contentX, y + sp.row1);
    
    // Work center badge (right aligned)
    doc.setFontSize(fs.badge - 0.5);
    doc.setFont(arabicFontLoaded ? 'NotoNaskhArabic' : 'helvetica', 'normal');
    doc.setFillColor(235, 235, 240);
    const wcText = permit.workCenter.length > truncLen.wc ? permit.workCenter.substring(0, truncLen.wc - 1) + '…' : permit.workCenter;
    const wcWidth = doc.getTextWidth(wcText) + 3;
    doc.roundedRect(x + cardWidth - wcWidth - 2, y + 1.5, wcWidth, layout === 'dense' ? 4 : 5, 0.8, 0.8, 'F');
    doc.setTextColor(70, 70, 70);
    doc.text(wcText, x + cardWidth - 4, y + sp.row1, { align: 'right' });
    
    // Row 2: Application number (orange)
    doc.setFontSize(fs.app);
    doc.setFont(arabicFontLoaded ? 'NotoNaskhArabic' : 'helvetica', 'bold');
    doc.setTextColor(200, 100, 20);
    doc.text(permit.application, contentX, y + sp.row2);
    
    // Row 3: Description
    doc.setFontSize(fs.desc);
    doc.setFont(arabicFontLoaded ? 'NotoNaskhArabic' : 'helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    const desc = permit.description.length > truncLen.desc ? permit.description.substring(0, truncLen.desc - 2) + '…' : permit.description;
    doc.text(desc, contentX, y + sp.row3, { maxWidth: maxWidth });
    
    // Row 4: Location & Receiver
    doc.setFontSize(fs.loc);
    doc.setTextColor(90, 90, 90);
    
    if (permit.functionalLocation) {
      const locParts = permit.functionalLocation.split('-');
      const locCode = locParts[2] || permit.functionalLocation;
      const locText = locCode.length > truncLen.loc ? locCode.substring(0, truncLen.loc - 2) + '…' : locCode;
      doc.text(`📍 ${locText}`, contentX, y + sp.row4);
    }
    
    const receiver = permit.receivedByName.length > truncLen.rcv ? permit.receivedByName.substring(0, truncLen.rcv - 2) + '…' : permit.receivedByName;
    doc.text(receiver, x + cardWidth - 4, y + sp.row4, { align: 'right' });
    
    // Row 5: Main work center badge & Hours remaining
    doc.setFontSize(fs.badge);
    doc.setFillColor(245, 245, 248);
    doc.setDrawColor(200, 200, 205);
    const mwcText = permit.mainWorkCenter.length > truncLen.mwc ? permit.mainWorkCenter.substring(0, truncLen.mwc - 1) + '…' : permit.mainWorkCenter;
    const mwcWidth = doc.getTextWidth(mwcText) + 3;
    doc.roundedRect(contentX, y + sp.badgeY, mwcWidth, layout === 'dense' ? 4.5 : 5.5, 0.8, 0.8, 'FD');
    doc.setTextColor(50, 50, 50);
    doc.text(mwcText, contentX + 1.5, y + sp.hoursY);
    
    // Hours remaining (bottom right)
    doc.setFontSize(fs.hours);
    doc.setFont(arabicFontLoaded ? 'NotoNaskhArabic' : 'helvetica', 'bold');
    if (status === 'expired') {
      doc.setTextColor(220, 53, 69);
    } else if (status === 'warning') {
      doc.setTextColor(230, 120, 0);
    } else {
      doc.setTextColor(40, 140, 69);
    }
    const hoursText = `${Math.round(hours)}h`;
    doc.text(hoursText, x + cardWidth - 4, y + sp.hoursY, { align: 'right' });
  };
  
  // Draw compact header for each page
  const drawHeader = (pageNum: number) => {
    // Title line
    doc.setDrawColor(30, 64, 124);
    doc.setLineWidth(0.4);
    doc.line(margin, 4, pageWidth - margin, 4);
    
    // Title
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 64, 124);
    doc.text('WORK PERMITS STATUS', margin, 9);
    
    // Summary stats (inline, compact)
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    const summaryX = margin + 52;
    
    doc.setTextColor(70, 70, 70);
    doc.text('Total:', summaryX, 9);
    doc.setFont('helvetica', 'bold');
    doc.text(String(permits.length), summaryX + 8, 9);
    
    doc.setFont('helvetica', 'normal');
    doc.text('Active:', summaryX + 16, 9);
    doc.setTextColor(40, 140, 69);
    doc.setFont('helvetica', 'bold');
    doc.text(String(activeCount), summaryX + 26, 9);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(70, 70, 70);
    doc.text('Warning:', summaryX + 34, 9);
    doc.setTextColor(230, 120, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(String(warningCount), summaryX + 46, 9);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(70, 70, 70);
    doc.text('Expired:', summaryX + 54, 9);
    doc.setTextColor(220, 53, 69);
    doc.setFont('helvetica', 'bold');
    doc.text(String(expiredCount), summaryX + 66, 9);
    
    // Document info (right side)
    doc.setFontSize(5.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`${documentRef}  |  ${formattedDate} ${formattedTime}`, pageWidth - margin, 9, { align: 'right' });
    
    // Separator line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.15);
    doc.line(margin, headerHeight - 1, pageWidth - margin, headerHeight - 1);
  };
  
  // Draw compact footer for each page
  const drawFooter = (pageNum: number) => {
    const footerY = pageHeight - 3;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.15);
    doc.line(margin, footerY - 1.5, pageWidth - margin, footerY - 1.5);
    
    doc.setFontSize(5);
    doc.setTextColor(120, 120, 120);
    doc.setFont('helvetica', 'normal');
    doc.text('CONFIDENTIAL', margin, footerY);
    doc.text(`Page ${pageNum}/${totalPages}`, pageWidth / 2, footerY, { align: 'center' });
    doc.text(documentRef, pageWidth - margin, footerY, { align: 'right' });
  };
  
  // Generate pages with cards
  for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
    if (pageIndex > 0) {
      doc.addPage();
    }
    
    drawHeader(pageIndex + 1);
    
    const startCardIndex = pageIndex * cardsPerPage;
    const endCardIndex = Math.min(startCardIndex + cardsPerPage, sortedPermits.length);
    
    for (let i = startCardIndex; i < endCardIndex; i++) {
      const cardOnPage = i - startCardIndex;
      const row = Math.floor(cardOnPage / cardsPerRow);
      const col = cardOnPage % cardsPerRow;
      
      const x = margin + (col * (cardWidth + cardGap));
      const y = headerHeight + (row * (cardHeight + cardGap));
      
      drawCard(sortedPermits[i], x, y);
    }
    
    drawFooter(pageIndex + 1);
  }
  
  // End of document marker on last page
  const lastPageCards = sortedPermits.length % cardsPerPage || cardsPerPage;
  const lastRow = Math.floor((lastPageCards - 1) / cardsPerRow);
  const endMarkerY = headerHeight + ((lastRow + 1) * (cardHeight + cardGap)) + 3;
  
  if (endMarkerY < pageHeight - footerHeight - 10) {
    doc.setFontSize(6);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(150, 150, 150);
    doc.text('— End of Report —', pageWidth / 2, endMarkerY, { align: 'center' });
  }
  
  const outputDate = date.toISOString().split('T')[0];
  doc.save(`${filename}-${paperSize.toUpperCase()}-${outputDate}.pdf`);
};

export const exportToPDF = async ({ permits, warningThreshold, filename = 'work-permits-report' }: ExportOptions) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  
  // Check if Arabic font is needed and load it
  const needsArabicFont = dataContainsArabic(permits);
  let arabicFontLoaded = false;
  
  if (needsArabicFont) {
    try {
      const fontBase64 = await loadNotoArabicFont();
      doc.addFileToVFS('NotoNaskhArabic-Regular.ttf', fontBase64);
      doc.addFont('NotoNaskhArabic-Regular.ttf', 'NotoNaskhArabic', 'normal');
      arabicFontLoaded = true;
    } catch (error) {
      console.warn('Failed to load Arabic font, falling back to default:', error);
    }
  }
  
  const date = new Date();
  const formattedDate = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const formattedTime = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
  const documentRef = `WP-RPT-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}`;
  
  // Calculate summary statistics
  const expiredCount = permits.filter(p => {
    const hours = calculateHoursRemaining(p.validTo, p.validToTime);
    return hours <= 0;
  }).length;
  const warningCount = permits.filter(p => {
    const hours = calculateHoursRemaining(p.validTo, p.validToTime);
    return hours > 0 && hours <= warningThreshold;
  }).length;
  const activeCount = permits.length - expiredCount - warningCount;
  
  // Page dimensions
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  
  // Professional header with border
  doc.setDrawColor(30, 64, 124);
  doc.setLineWidth(0.8);
  doc.line(margin, 8, pageWidth - margin, 8);
  
  // Title section
  doc.setTextColor(30, 64, 124);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('WORK PERMITS STATUS REPORT', margin, 18);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text('Official Document for Internal Use', margin, 24);
  
  // Document metadata box (right side)
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.roundedRect(pageWidth - margin - 70, 10, 70, 22, 2, 2, 'S');
  
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text('Document Reference:', pageWidth - margin - 65, 16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 64, 124);
  doc.text(documentRef, pageWidth - margin - 65, 21);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(`Generated: ${formattedDate} at ${formattedTime}`, pageWidth - margin - 65, 28);
  
  // Divider line
  doc.setDrawColor(30, 64, 124);
  doc.setLineWidth(0.3);
  doc.line(margin, 35, pageWidth - margin, 35);
  
  // Executive Summary section
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 64, 124);
  doc.text('EXECUTIVE SUMMARY', margin, 43);
  
  // Summary table
  const summaryStartY = 47;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  
  // Summary data in formal table format
  const summaryData = [
    ['Total Work Permits:', String(permits.length)],
    ['Active Permits:', String(activeCount)],
    ['Permits Requiring Attention:', String(warningCount)],
    ['Expired Permits:', String(expiredCount)],
    ['Warning Threshold:', `${warningThreshold} hours`],
  ];
  
  let summaryY = summaryStartY;
  summaryData.forEach(([label, value], index) => {
    doc.setFont('helvetica', 'normal');
    doc.text(label, margin + 2, summaryY);
    doc.setFont('helvetica', 'bold');
    if (label.includes('Expired') && parseInt(value) > 0) {
      doc.setTextColor(180, 30, 30);
    } else if (label.includes('Attention') && parseInt(value) > 0) {
      doc.setTextColor(180, 120, 0);
    } else if (label.includes('Active')) {
      doc.setTextColor(30, 120, 60);
    }
    doc.text(value, margin + 55, summaryY);
    doc.setTextColor(60, 60, 60);
    summaryY += 5;
  });
  
  // Permit Details section header
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 64, 124);
  doc.text('PERMIT DETAILS', margin, 78);
  
  // Sort permits: expired first, then warning, then active
  const sortedPermits = [...permits].sort((a, b) => {
    const hoursA = calculateHoursRemaining(a.validTo, a.validToTime);
    const hoursB = calculateHoursRemaining(b.validTo, b.validToTime);
    const statusA = getExpirationStatus(hoursA, warningThreshold);
    const statusB = getExpirationStatus(hoursB, warningThreshold);
    const order = { expired: 0, warning: 1, active: 2 };
    return order[statusA] - order[statusB];
  });
  
  const tableData = sortedPermits.map((permit, index) => {
    const hours = calculateHoursRemaining(permit.validTo, permit.validToTime);
    const status = getExpirationStatus(hours, warningThreshold);
    const statusText = status === 'expired' ? 'EXPIRED' : status === 'warning' ? 'ATTENTION' : 'ACTIVE';
    
    return [
      String(index + 1),
      permit.application,
      permit.description.length > 40 ? permit.description.substring(0, 40) + '...' : permit.description,
      permit.type,
      permit.mainWorkCenter,
      permit.receivedByName,
      formatDateTime(permit.validTo, permit.validToTime),
      hours > 0 ? `${hours.toFixed(1)}h` : '0.0h',
      statusText,
    ];
  });

  autoTable(doc, {
    startY: 88,
    head: [['#', 'Permit No.', 'Description', 'Type', 'Work Center', 'Assigned To', 'Expiry Date/Time', 'Remaining', 'Status']],
    body: tableData,
    styles: { 
      fontSize: 7.5, 
      cellPadding: 2.5,
      textColor: [40, 40, 40],
      lineColor: [180, 180, 180],
      lineWidth: 0.1,
      font: arabicFontLoaded ? 'NotoNaskhArabic' : 'helvetica',
    },
    headStyles: { 
      fillColor: [30, 64, 124], 
      textColor: 255, 
      fontStyle: arabicFontLoaded ? 'normal' : 'bold',
      halign: 'center',
      fontSize: 8,
      font: arabicFontLoaded ? 'NotoNaskhArabic' : 'helvetica',
    },
    alternateRowStyles: { fillColor: [248, 249, 252] },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 22, halign: 'center' },
      2: { cellWidth: 55 },
      3: { cellWidth: 16, halign: 'center' },
      4: { cellWidth: 28 },
      5: { cellWidth: 32 },
      6: { cellWidth: 32, halign: 'center' },
      7: { cellWidth: 18, halign: 'center' },
      8: { cellWidth: 22, halign: 'center', fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      if (data.column.index === 8 && data.section === 'body') {
        const status = data.cell.raw as string;
        if (status === 'EXPIRED') {
          data.cell.styles.textColor = [180, 30, 30];
        } else if (status === 'ATTENTION') {
          data.cell.styles.textColor = [180, 120, 0];
        } else {
          data.cell.styles.textColor = [40, 120, 70];
        }
      }
    },
    margin: { left: margin, right: margin, top: 28 },
    didDrawPage: (data) => {
      const pageCount = doc.getNumberOfPages();
      
      // Professional footer
      doc.setDrawColor(30, 64, 124);
      doc.setLineWidth(0.3);
      doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
      
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'normal');
      doc.text('CONFIDENTIAL - For Internal Use Only', margin, pageHeight - 10);
      doc.text(`Document Ref: ${documentRef}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      doc.text(`Page ${data.pageNumber} of ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
      
      // Header on subsequent pages
      if (data.pageNumber > 1) {
        doc.setDrawColor(30, 64, 124);
        doc.setLineWidth(0.5);
        doc.line(margin, 8, pageWidth - margin, 8);
        
        doc.setTextColor(30, 64, 124);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('WORK PERMITS STATUS REPORT', margin, 16);
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);
        doc.text(`Document Ref: ${documentRef}`, pageWidth - margin, 16, { align: 'right' });
        
        doc.setDrawColor(30, 64, 124);
        doc.setLineWidth(0.2);
        doc.line(margin, 20, pageWidth - margin, 20);
      }
    },
  });

  // Add end-of-document marker on last page
  const finalY = (doc as any).lastAutoTable?.finalY || 200;
  if (finalY < pageHeight - 40) {
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.2);
    doc.line(margin, finalY + 10, pageWidth - margin, finalY + 10);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(120, 120, 120);
    doc.text('— End of Report —', pageWidth / 2, finalY + 16, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.text(`This report contains ${permits.length} permit record(s) as of ${formattedDate} ${formattedTime}.`, pageWidth / 2, finalY + 22, { align: 'center' });
  }

  const outputDate = date.toISOString().split('T')[0];
  doc.save(`${filename}-${outputDate}.pdf`);
};
