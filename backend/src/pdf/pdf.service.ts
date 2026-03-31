import { Injectable } from '@nestjs/common';
const PDFDocument = require('pdfkit'); // Usamos require para evitar el error de constructor

@Injectable()
export class PdfService {
  async generateInvoicePdf(invoice: any, gymConfig: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // Diseño simple y rápido
      doc.fontSize(20).text('RECIBO DE PAGO', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Gimnasio: ${gymConfig?.gymName || 'GymFlow'}`);
      doc.text(`NIT: ${gymConfig?.nit || 'N/A'}`);
      doc.moveDown();
      doc.text(`Cliente: ${invoice.member?.fullName}`);
      doc.text(`Factura N°: ${invoice.invoiceNumber}`);
      doc.text(`Fecha: ${new Date().toLocaleDateString()}`);
      doc.moveDown();
      doc.fontSize(14).text(`TOTAL PAGADO: $${Number(invoice.amountTotal).toLocaleString('es-CO')}`, { weight: 'bold' });
      
      doc.end();
    });
  }
}