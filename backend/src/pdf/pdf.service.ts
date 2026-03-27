import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

@Injectable()
export class PdfService {
  async generateInvoicePdf(invoice: any, gymConfig: any): Promise<Buffer> {
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Factura ${invoice.invoiceNumber || invoice.id}</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 0; padding: 40px; }
        .invoice-container { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; border-radius: 8px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
        .logo { max-width: 150px; max-height: 100px; }
        .gym-details { text-align: right; }
        .gym-name { font-size: 24px; font-weight: bold; color: #222; margin: 0; }
        .title { color: #f43f5e; font-size: 32px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 5px; }
        .invoice-details { display: flex; justify-content: space-between; margin-bottom: 40px; }
        .client-info h3 { margin: 0 0 10px 0; color: #555; }
        .meta-info { text-align: right; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background-color: #f8f9fa; color: #555; text-align: left; padding: 12px; border-bottom: 2px solid #ddd; }
        td { padding: 12px; border-bottom: 1px solid #eee; }
        .total-row td { font-size: 18px; font-weight: bold; border-top: 2px solid #333; border-bottom: none; }
        .footer { margin-top: 50px; text-align: center; color: #888; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        
        <div class="header">
          <div>
            ${gymConfig?.logoBase64 ? `<img src="${gymConfig.logoBase64}" class="logo" alt="Gym Logo" />` : ''}
            <div class="title"></div>
          </div>
          <div class="gym-details">
            <h1 class="gym-name">${gymConfig?.gymName || 'GymFlow'}</h1>
            <p style="margin: 5px 0;">${gymConfig?.address || 'Sin Dirección'}</p>
            <p style="margin: 5px 0;">NIT: ${gymConfig?.nit || 'N/A'}</p>
            ${gymConfig?.ownerPhones && gymConfig.ownerPhones.length > 0 ? `<p style="margin: 5px 0;">Tel: ${gymConfig.ownerPhones[0]}</p>` : ''}
          </div>
        </div>

        <div class="invoice-details">
          <div class="client-info">
            <h3>Facturar a:</h3>
            <p style="margin: 5px 0; font-weight: bold; font-size: 18px;">${invoice.member?.fullName || 'Cliente'}</p>
            <p style="margin: 5px 0;">Doc: ${invoice.member?.cedula || 'N/A'}</p>
            <p style="margin: 5px 0;">Tel: ${invoice.member?.whatsappNumber || 'N/A'}</p>
          </div>
          <div class="meta-info">
            <h3 style="margin: 0 0 10px 0;">Detalles:</h3>
            <p style="margin: 5px 0;"><strong>Recibo N°:</strong> ${invoice.invoiceNumber}</p>
            <p style="margin: 5px 0;"><strong>Tipo:</strong> ${invoice.paymentMethod || 'Efectivo'}</p>
            <p style="margin: 5px 0;"><strong>Fecha:</strong> ${new Date(invoice.createdAt || Date.now()).toLocaleDateString('es-ES')}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Descripción</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div style="font-weight: bold; margin-bottom: 5px;">${invoice.plan?.name || 'Plan de Entrenamiento'}</div>
                <div style="font-size: 13px; color: #777;">Suscripción al gimnasio</div>
              </td>
              <td style="text-align: right;">$${Number(invoice.plan?.price || 0).toLocaleString('es-CO')}</td>
            </tr>
            ${invoice.discount ? `
            <tr>
              <td>
                <div style="font-weight: bold; margin-bottom: 5px;">Descuento: ${invoice.discount.name}</div>
                <div style="font-size: 13px; color: #f43f5e;">-${invoice.discount.percentage}% aplicado</div>
              </td>
              <td style="text-align: right; color: #f43f5e;">
                -$${(Number(invoice.plan?.price) * (Number(invoice.discount.percentage) / 100)).toLocaleString('es-CO')}
              </td>
            </tr>
            ` : ''}
            <tr class="total-row">
              <td style="text-align: right;">TOTAL PAGADO:</td>
              <td style="text-align: right; color: #10b981; font-size: 22px;">$${Number(invoice.amountTotal).toLocaleString('es-CO')}</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <p>Gracias por confiar en <strong>${gymConfig?.gymName || 'nosotros'}</strong>.</p>
          <p>Este documento es un comprobante electrónico de pago efectuado.</p>
        </div>
      </div>
    </body>
    </html>
    `;

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'load' });
      const pdfBuffer = await page.pdf({
        format: 'A4',
        landscape: true,
        printBackground: true,
        margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
      });
      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }
}
