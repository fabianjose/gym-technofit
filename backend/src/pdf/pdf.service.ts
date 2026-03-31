import { Injectable } from '@nestjs/common';
const PDFDocument = require('pdfkit');

@Injectable()
export class PdfService {
  async generateInvoicePdf(invoice: any, gymConfig: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      // Configuramos el documento (A4, márgenes de 50)
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // --- 1. ENCABEZADO Y LOGO ---
      if (gymConfig?.logoBase64) {
        try {
          // Si el logo viene con el prefijo 'data:image/...;base64,' lo limpiamos
          const base64Data = gymConfig.logoBase64.replace(/^data:image\/\w+;base64,/, '');
          const logoBuffer = Buffer.from(base64Data, 'base64');
          doc.image(logoBuffer, 50, 45, { width: 100 });
        } catch (e) {
          console.error('Error cargando logo en PDF:', e);
        }
      }

      // Título "FACTURA"
      doc.fillColor('#f43f5e').fontSize(28).text('RECIBO DE PAGO', 200, 50, { align: 'right' });
      
      // Datos del Gimnasio (Derecha)
      doc.fillColor('#222').fontSize(14).text(gymConfig?.gymName || 'GymFlow', 200, 85, { align: 'right' });
      doc.fontSize(10).fillColor('#666');
      doc.text(`NIT: ${gymConfig?.nit || 'N/A'}`, { align: 'right' });
      doc.text(gymConfig?.address || 'Sin Dirección', { align: 'right' });
      if (gymConfig?.ownerPhones?.length > 0) {
        doc.text(`Tel: ${gymConfig.ownerPhones[0]}`, { align: 'right' });
      }

      // Línea divisoria decorativa
      doc.moveTo(50, 160).lineTo(545, 160).strokeColor('#eee').lineWidth(2).stroke();

      // --- 2. DETALLES DE FACTURACIÓN ---
      doc.moveDown(4);
      const startY = 180;

      // Columna Izquierda: Cliente
      doc.fillColor('#555').fontSize(10).text('FACTURAR A:', 50, startY);
      doc.fillColor('#000').fontSize(12).text(invoice.member?.fullName || 'Cliente', 50, startY + 15);
      doc.fontSize(10).fillColor('#666').text(`Doc: ${invoice.member?.cedula || 'N/A'}`);
      doc.text(`Tel: ${invoice.member?.whatsappNumber || 'N/A'}`);

      // Columna Derecha: Meta datos
      doc.fillColor('#555').fontSize(10).text('DETALLES:', 350, startY);
      doc.fillColor('#000').fontSize(11).text(`Recibo N°:`, 350, startY + 15);
      doc.fillColor('#f43f5e').text(invoice.invoiceNumber, 430, startY + 15, { bold: true });
      
      doc.fillColor('#666').text(`Tipo Pago: ${invoice.paymentMethod || 'Efectivo'}`, 350, startY + 30);
      doc.text(`Fecha: ${new Date(invoice.createdAt || Date.now()).toLocaleDateString('es-ES')}`, 350, startY + 45);

      // --- 3. TABLA DE PRODUCTOS ---
      const tableTop = 280;
      // Cabecera de tabla
      doc.rect(50, tableTop, 495, 25).fill('#f8f9fa');
      doc.fillColor('#555').fontSize(10).text('DESCRIPCIÓN', 60, tableTop + 8);
      doc.text('TOTAL', 450, tableTop + 8, { align: 'right' });

      // Fila 1: Plan
      const row1Y = tableTop + 35;
      doc.fillColor('#000').fontSize(11).text(invoice.plan?.name || 'Plan de Entrenamiento', 60, row1Y);
      doc.fontSize(9).fillColor('#888').text('Suscripción mensual al gimnasio', 60, row1Y + 15);
      doc.fillColor('#000').fontSize(11).text(`$${Number(invoice.plan?.price || 0).toLocaleString('es-CO')}`, 450, row1Y, { align: 'right' });

      // Fila 2: Descuento (Si existe)
      let currentY = row1Y + 40;
      if (invoice.discount) {
        doc.fillColor('#f43f5e').fontSize(11).text(`Descuento: ${invoice.discount.name}`, 60, currentY);
        doc.fontSize(9).text(`-${invoice.discount.percentage}% aplicado`, 60, currentY + 15);
        
        const discountAmount = (Number(invoice.plan?.price) * (Number(invoice.discount.percentage) / 100));
        doc.fontSize(11).text(`-$${discountAmount.toLocaleString('es-CO')}`, 450, currentY, { align: 'right' });
        currentY += 40;
      }

      // --- 4. TOTAL FINAL ---
      doc.moveTo(350, currentY).lineTo(545, currentY).strokeColor('#333').lineWidth(1).stroke();
      
      doc.moveDown(1);
      doc.fillColor('#10b981').fontSize(14).text('TOTAL PAGADO:', 300, currentY + 15);
      doc.fontSize(20).text(`$${Number(invoice.amountTotal).toLocaleString('es-CO')}`, 400, currentY + 12, { align: 'right' });

      // --- 5. FOOTER ---
      const footerY = 730;
      doc.moveTo(50, footerY).lineTo(545, footerY).strokeColor('#eee').stroke();
      doc.fillColor('#888').fontSize(10).text(`Gracias por confiar en ${gymConfig?.gymName || 'nosotros'}.`, 50, footerY + 15, { align: 'center' });
      doc.fontSize(8).text('Este documento es un comprobante electrónico de pago efectuado.', { align: 'center' });

      doc.end();
    });
  }
}