import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const MARGIN_MM = 10; // 10mm margins all sides
const CONTENT_WIDTH_MM = A4_WIDTH_MM - MARGIN_MM * 2;
const CONTENT_HEIGHT_MM = A4_HEIGHT_MM - MARGIN_MM * 2;

/**
 * Captures an element as a high-quality canvas then slices it into A4 pages.
 * Uses margin-aware positioning so content is never cut at the edge.
 */
export async function exportElementToPDF(elementId: string, filename: string): Promise<Blob | null> {
  if (typeof window === 'undefined') return null;

  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found`);
    return null;
  }

  // Temporarily expand the element to full A4 width for capture
  const savedStyle = element.getAttribute('style') || '';
  element.style.cssText += '; width: 770px !important; max-width: 770px !important; border-radius: 0 !important; overflow: visible !important;';

  try {
    await new Promise((r) => setTimeout(r, 120)); // Allow layout to settle

    const canvas = await html2canvas(element, {
      scale: 2,           // Retina quality
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#0f172a',
      windowWidth: 770,
      scrollY: -window.scrollY,
    });

    element.setAttribute('style', savedStyle);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const imgData = canvas.toDataURL('image/png', 1.0);

    // Scale canvas pixels → mm (content area)
    const pxPerMm = canvas.width / CONTENT_WIDTH_MM;
    const contentHeightPx = CONTENT_HEIGHT_MM * pxPerMm;
    const totalHeightPx = canvas.height;

    let sliceTop = 0; // px from top of original canvas
    let pageNum = 0;

    while (sliceTop < totalHeightPx) {
      if (pageNum > 0) pdf.addPage();

      const sliceHeight = Math.min(contentHeightPx, totalHeightPx - sliceTop);

      // Create a temporary canvas for this page slice
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = Math.ceil(contentHeightPx);
      const ctx = pageCanvas.getContext('2d')!;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      ctx.drawImage(canvas, 0, sliceTop, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);

      const pageImgData = pageCanvas.toDataURL('image/png', 1.0);
      const renderHeight = (sliceHeight / pxPerMm);

      pdf.addImage(pageImgData, 'PNG', MARGIN_MM, MARGIN_MM, CONTENT_WIDTH_MM, renderHeight);

      sliceTop += contentHeightPx;
      pageNum++;

      // Safety: stop if too many pages
      if (pageNum > 20) break;
    }

    pdf.save(`${filename}.pdf`);
    return pdf.output('blob');
  } catch (error) {
    element.setAttribute('style', savedStyle);
    console.error('PDF Generation Error:', error);
    alert('PDF generation failed. Try Print → Save as PDF instead.');
    return null;
  }
}

export async function sharePDFReport(elementId: string, filename: string, summaryText: string) {
  if (typeof window === 'undefined') return;

  const pdfBlob = await exportElementToPDF(elementId, filename);

  if (pdfBlob) {
    const pdfFile = new File([pdfBlob], `${filename}.pdf`, { type: 'application/pdf' });

    // Try native share with file
    if (
      typeof navigator !== 'undefined' &&
      navigator.share &&
      navigator.canShare &&
      navigator.canShare({ files: [pdfFile] })
    ) {
      try {
        await navigator.share({
          title: 'Grovastra Shop Discovery Report',
          text: summaryText,
          files: [pdfFile],
        });
        return;
      } catch (err) {
        console.log('Native share fallback to WhatsApp:', err);
      }
    }
  }

  // Fallback: WhatsApp link share
  const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    summaryText + '\n\n📄 PDF Report has been saved to your downloads.'
  )}`;
  window.open(waUrl, '_blank');
}
