import { PDFDocument, StandardFonts, rgb } from 'https://esm.sh/pdf-lib';

export const generatePdfBytes = async (scheduleId: string, textContent: string) => {
  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const fontSize = 12;

  page.drawText(`SafeShift Marine AI - Report`, {
    x: 50,
    y: height - 4 * fontSize,
    size: 20,
    font: timesRomanFont,
    color: rgb(0, 0.53, 0.71),
  });

  page.drawText(`Schedule ID: ${scheduleId}`, {
    x: 50,
    y: height - 7 * fontSize,
    size: fontSize,
    font: timesRomanFont,
    color: rgb(0, 0, 0),
  });

  page.drawText(textContent, {
    x: 50,
    y: height - 10 * fontSize,
    size: fontSize,
    font: timesRomanFont,
    color: rgb(0, 0, 0),
  });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};
