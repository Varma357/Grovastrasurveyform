import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function exportElementToPDF(elementId: string, filename: string): Promise<Blob | null> {
  if (typeof window === 'undefined') return null;

  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return null;
  }

  const originalStyle = element.style.cssText;
  element.style.maxHeight = 'none';
  element.style.overflow = 'visible';

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#0f172a',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    element.style.cssText = originalStyle;

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${filename}.pdf`);
    return pdf.output('blob');
  } catch (error) {
    element.style.cssText = originalStyle;
    console.error('PDF Generation Error:', error);
    return null;
  }
}

export async function sharePDFReport(elementId: string, filename: string, summaryText: string) {
  if (typeof window === 'undefined') return;

  const element = document.getElementById(elementId);
  if (!element) return;

  const originalStyle = element.style.cssText;
  element.style.maxHeight = 'none';
  element.style.overflow = 'visible';

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#0f172a',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    element.style.cssText = originalStyle;

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const pdfBlob = pdf.output('blob');
    const pdfFile = new File([pdfBlob], `${filename}.pdf`, { type: 'application/pdf' });

    // Download PDF document automatically
    pdf.save(`${filename}.pdf`);

    // Web Share API if supported (e.g. mobile Chrome/Safari/Edge)
    if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
      try {
        await navigator.share({
          title: 'Grovastra Executive PDF Report',
          text: summaryText,
          files: [pdfFile],
        });
        return;
      } catch (err) {
        console.log('Native file share fallback:', err);
      }
    }

    // Fallback: Open WhatsApp Web / App with link message pointing out PDF is downloaded
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      summaryText + '\n\n📄 [Official PDF Report document generated and saved to downloads]'
    )}`;
    window.open(waUrl, '_blank');
  } catch (err) {
    element.style.cssText = originalStyle;
    console.error('Error sharing PDF:', err);
  }
}
