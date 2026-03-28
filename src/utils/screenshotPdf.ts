import { toast } from 'sonner';

/**
 * Capture a DOM element as a screenshot and save it as a PDF.
 * Heavy libraries (html2canvas, jsPDF) are dynamically imported to keep initial bundle small.
 */
export const captureScreenshotPDF = async (element: HTMLElement) => {
  toast.info('Capturing screenshot...');

  try {
    // Hide buttons and pagination bar before capture
    const buttonsRow = element.querySelector('[data-screenshot-hide-buttons]') as HTMLElement | null;
    const paginationBar = element.querySelector('[data-screenshot-hide-pagination]') as HTMLElement | null;
    if (buttonsRow) buttonsRow.style.display = 'none';
    if (paginationBar) paginationBar.style.display = 'none';

    // Temporarily expand overflow-hidden containers
    const scrollContainer = element.querySelector('main') as HTMLElement | null;
    const savedOverflow = scrollContainer?.style.overflow;
    const savedMaxHeight = scrollContainer?.style.maxHeight;
    const savedHeight = scrollContainer?.style.height;
    if (scrollContainer) {
      scrollContainer.style.overflow = 'visible';
      scrollContainer.style.maxHeight = 'none';
      scrollContainer.style.height = 'auto';
    }

    // Remove text-clipping styles so html2canvas renders full text
    const clippedEls = element.querySelectorAll('.truncate, .line-clamp-1, .line-clamp-2, [class*="line-clamp"]');
    const savedClipStyles: { el: HTMLElement; overflow: string; textOverflow: string; whiteSpace: string; display: string; webkitLineClamp: string }[] = [];
    clippedEls.forEach((node) => {
      const htmlEl = node as HTMLElement;
      savedClipStyles.push({
        el: htmlEl,
        overflow: htmlEl.style.overflow,
        textOverflow: htmlEl.style.textOverflow,
        whiteSpace: htmlEl.style.whiteSpace,
        display: htmlEl.style.display,
        webkitLineClamp: htmlEl.style.webkitLineClamp || (htmlEl.style as any)['-webkit-line-clamp'] || '',
      });
      htmlEl.style.overflow = 'visible';
      htmlEl.style.textOverflow = 'unset';
      htmlEl.style.whiteSpace = 'normal';
      htmlEl.style.webkitLineClamp = 'unset';
      htmlEl.style.display = 'block';
    });

    // Ensure card text has proper line-height
    const allCardText = element.querySelectorAll('.permit-card span, .permit-card p, .permit-card h3, .permit-card div');
    const savedLineHeights: { el: HTMLElement; lineHeight: string; overflow: string }[] = [];
    allCardText.forEach((node) => {
      const htmlEl = node as HTMLElement;
      savedLineHeights.push({
        el: htmlEl,
        lineHeight: htmlEl.style.lineHeight,
        overflow: htmlEl.style.overflow,
      });
      htmlEl.style.lineHeight = '1.4';
      htmlEl.style.overflow = 'visible';
    });

    const isDark = document.documentElement.classList.contains('dark');

    // Fix gradient text (background-clip:text) which html2canvas can't render
    const gradientEls = element.querySelectorAll('.text-gradient-navy, .text-gradient-primary, [class*="text-gradient"]');
    const savedGradientStyles: { el: HTMLElement; bg: string; bgClip: string; color: string; webkitBgClip: string; webkitTextFill: string }[] = [];
    gradientEls.forEach((node) => {
      const htmlEl = node as HTMLElement;
      savedGradientStyles.push({
        el: htmlEl,
        bg: htmlEl.style.background,
        bgClip: htmlEl.style.backgroundClip,
        color: htmlEl.style.color,
        webkitBgClip: (htmlEl.style as any).webkitBackgroundClip || '',
        webkitTextFill: (htmlEl.style as any).webkitTextFillColor || '',
      });
      htmlEl.style.background = 'none';
      htmlEl.style.backgroundClip = 'unset';
      (htmlEl.style as any).webkitBackgroundClip = 'unset';
      (htmlEl.style as any).webkitTextFillColor = 'unset';
      htmlEl.style.color = isDark ? '#e8dcc8' : '#1a2744';
    });

    // Dynamic import to reduce initial bundle
    const html2canvas = (await import('html2canvas')).default;

    const dpr = 2;
    const canvas = await html2canvas(element, {
      scale: dpr,
      useCORS: true,
      backgroundColor: isDark ? '#080e17' : '#ffffff',
      logging: false,
      imageTimeout: 0,
      removeContainer: true,
      scrollY: -window.scrollY,
      windowHeight: element.scrollHeight,
    });

    // Restore all styles
    savedGradientStyles.forEach(({ el: htmlEl, bg, bgClip, color, webkitBgClip, webkitTextFill }) => {
      htmlEl.style.background = bg;
      htmlEl.style.backgroundClip = bgClip;
      (htmlEl.style as any).webkitBackgroundClip = webkitBgClip;
      (htmlEl.style as any).webkitTextFillColor = webkitTextFill;
      htmlEl.style.color = color;
    });
    savedClipStyles.forEach(({ el: htmlEl, overflow, textOverflow, whiteSpace, display, webkitLineClamp }) => {
      htmlEl.style.overflow = overflow;
      htmlEl.style.textOverflow = textOverflow;
      htmlEl.style.whiteSpace = whiteSpace;
      htmlEl.style.display = display;
      htmlEl.style.webkitLineClamp = webkitLineClamp;
    });
    savedLineHeights.forEach(({ el: htmlEl, lineHeight, overflow }) => {
      htmlEl.style.lineHeight = lineHeight;
      htmlEl.style.overflow = overflow;
    });
    if (scrollContainer) {
      scrollContainer.style.overflow = savedOverflow || '';
      scrollContainer.style.maxHeight = savedMaxHeight || '';
      scrollContainer.style.height = savedHeight || '';
    }
    if (buttonsRow) buttonsRow.style.display = '';
    if (paginationBar) paginationBar.style.display = '';

    const { jsPDF } = await import('jspdf');
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdfWidth = (canvas.width / dpr) * 0.75;
    const pdfHeight = (canvas.height / dpr) * 0.75;
    const headerHeight = 28;
    const pdf = new jsPDF({
      orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
      unit: 'pt',
      format: [pdfWidth, pdfHeight + headerHeight],
    });

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB');
    const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    pdf.setFontSize(11);
    pdf.setTextColor(isDark ? 200 : 60);
    pdf.text(`Date: ${dateStr}`, 12, 18);
    pdf.text(`Time: ${timeStr}`, pdfWidth - 12, 18, { align: 'right' });
    pdf.setDrawColor(isDark ? 80 : 200);
    pdf.line(12, headerHeight - 2, pdfWidth - 12, headerHeight - 2);

    pdf.addImage(imgData, 'JPEG', 0, headerHeight, pdfWidth, pdfHeight, undefined, 'NONE');
    pdf.save('dashboard-screenshot.pdf');
    toast.success('Screenshot saved as PDF');
  } catch (err) {
    console.error(err);
    toast.error('Failed to capture screenshot');
  }
};
