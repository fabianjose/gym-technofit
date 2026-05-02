import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Invoice } from './entities/invoice.entity';
import { Repository } from 'typeorm';
import { MembersService } from '../members/members.service';
import { PlansService } from '../plans/plans.service';
import { PdfService } from '../pdf/pdf.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { GymConfigService } from '../gym-config/gym-config.service';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    private readonly membersService: MembersService,
    private readonly plansService: PlansService,
    private readonly pdfService: PdfService,
    private readonly whatsappService: WhatsappService,
    private readonly gymConfigService: GymConfigService,
  ) {}

  /**
   * Subtracts exactly 1 month from a YYYY-MM-DD string without using Date objects,
   * preventing timezone-related off-by-one day errors.
   */
  private subtractOneMonth(dateStr: string): string {
    const clean = dateStr.substring(0, 10);
    const [y, mo, d] = clean.split('-').map(Number);
    const newMo = mo === 1 ? 12 : mo - 1;
    const newY  = mo === 1 ? y - 1 : y;
    const maxDays = new Date(newY, newMo, 0).getDate();
    const newD = Math.min(d, maxDays);
    return `${newY}-${newMo.toString().padStart(2, '0')}-${newD.toString().padStart(2, '0')}`;
  }

  async create(createInvoiceDto: CreateInvoiceDto) {
    const { memberId, planId, discountId, amountTotal } = createInvoiceDto;

    const member = await this.membersService.findOne(memberId);
    if (!member) throw new NotFoundException('Member not found');

    const plan = await this.plansService.findOne(planId);
    if (!plan) throw new NotFoundException('Plan not found');

    // Calculate next invoice number (starts at 1000)
    const [lastInvoice] = await this.invoiceRepository.find({
      order: { invoiceNumber: 'DESC' },
      take: 1,
    });
    const nextInvoiceNumber =
      lastInvoice && lastInvoice.invoiceNumber
        ? lastInvoice.invoiceNumber + 1
        : 1000;

    const invoice = this.invoiceRepository.create({
      memberId,
      memberName: member.fullName, // snapshot for history
      planId,
      discountId: discountId || null,
      amountTotal: Number(amountTotal),
      invoiceNumber: nextInvoiceNumber,
      issueDate: new Date(),
      status: 'PAID',
      paymentMethod: createInvoiceDto.paymentMethod || 'Efectivo',
    });

    const savedInvoice = await this.invoiceRepository.save(invoice);

    // Billing cycle is always anchored to the member's registration date.
    // Paying late does NOT shift the cut date — the cycle keeps rolling from
    // the last expirationDate regardless of when the invoice is issued.
    //
    // members.service.create() sets expirationDate = registrationDate as a placeholder,
    // so we detect "first invoice ever" by checking expirationDate === registrationDate.
    //
    // Case 1 — First invoice (placeholder): base = registrationDate
    // Case 2 — All subsequent invoices:     base = expirationDate (past or future)
    const expStr = member.expirationDate
      ? member.expirationDate.toString().substring(0, 10)
      : null;
    const regStr = member.registrationDate
      ? member.registrationDate.toString().substring(0, 10)
      : null;
    const isFirstInvoice = !expStr || expStr === regStr;

    let baseDate: Date;
    if (isFirstInvoice && regStr) {
      // Case 1: first invoice ever — start the cycle from the registration date
      baseDate = new Date(regStr);
    } else if (expStr) {
      // Case 2: subsequent invoice — extend from the last expiration date,
      // preserving the day-of-month anchor regardless of late payment
      baseDate = new Date(expStr);
    } else {
      // Fallback: no dates available at all — use today
      baseDate = new Date();
    }
    baseDate.setMonth(baseDate.getMonth() + 1);
    const formattedExpDate = baseDate.toISOString().split('T')[0];
    await this.membersService.update(member.id, { 
      expirationDate: formattedExpDate,
      defaultPlanId: planId,
      defaultDiscountId: discountId || undefined
    });

    // Generate and send PDF Invoice
   if (member.whatsappNumber) {
  // Usamos un pequeño delay para que el servidor respire entre generar el PDF y enviarlo
  setTimeout(async () => {
  try {
    const config = await this.gymConfigService.getGlobalConfig();
    const fullInvoice = await this.findOne(savedInvoice.id);
    
    // Esto ahora será instantáneo y no consumirá CPU
    const pdfBuffer = await this.pdfService.generateInvoicePdf(fullInvoice, config);
    
    // Le damos 1 segundo al bot de WhatsApp para estar "tranquilo"
    await new Promise(r => setTimeout(r, 1000));

    await this.whatsappService.sendPdf(
      member.whatsappNumber, 
      pdfBuffer, 
      `Factura-${fullInvoice.invoiceNumber}.pdf`, 
      `Hola ${member.fullName}, adjuntamos tu recibo. 💪`
    );
  } catch (e) {
    console.error('Fallo el envío asíncrono:', e);
  }
}, 8000); // Esperamos 8 segundos para que WhatsApp Web esté idle antes de enviar el PDF
}

    return savedInvoice;
  }

  async findAll() {
    return this.invoiceRepository.find({
      relations: ['member', 'plan', 'discount'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: ['member', 'plan', 'discount'],
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async update(id: string, data: any) {
    const invoice = await this.findOne(id);
    if (data.planId) invoice.planId = data.planId;
    if (data.discountId !== undefined) invoice.discountId = data.discountId || null;
    if (data.amountTotal) invoice.amountTotal = Number(data.amountTotal);
    return await this.invoiceRepository.save(invoice);
  }

  async annul(id: string) {
    const invoice = await this.findOne(id);
    if (invoice.status === 'ANNULLED') {
      return invoice; // Ya está anulada
    }
    
    if (invoice.member && invoice.member.expirationDate) {
      const expStr = invoice.member.expirationDate.toString().substring(0, 10);
      const formattedExpDate = this.subtractOneMonth(expStr);
      await this.membersService.update(invoice.member.id, { expirationDate: formattedExpDate });
    }

    invoice.status = 'ANNULLED';
    return await this.invoiceRepository.save(invoice);
  }

  async remove(id: string) {
    const invoice = await this.findOne(id);
    if (invoice.status === 'PAID') {
      if (invoice.member && invoice.member.expirationDate) {
        const expStr = invoice.member.expirationDate.toString().substring(0, 10);
        const formattedExpDate = this.subtractOneMonth(expStr);
        await this.membersService.update(invoice.member.id, { expirationDate: formattedExpDate });
      }
    }
    return await this.invoiceRepository.remove(invoice);
  }

  async getStats(opts: { from?: string; to?: string } = {}) {
    const qb = this.invoiceRepository.createQueryBuilder('inv')
      .where("inv.status = 'PAID'");

    if (opts.from) qb.andWhere('inv.issue_date >= :from', { from: opts.from });
    if (opts.to)   qb.andWhere('inv.issue_date <= :to',   { to: opts.to });

    const invoices = await qb.getMany();

    const totalRevenue = invoices.reduce((sum, i) => sum + Number(i.amountTotal), 0);
    const totalInvoices = invoices.length;

    // Group by payment method
    const byMethod: Record<string, { count: number; total: number }> = {};
    for (const inv of invoices) {
      const key = inv.paymentMethod || 'Sin especificar';
      if (!byMethod[key]) byMethod[key] = { count: 0, total: 0 };
      byMethod[key].count++;
      byMethod[key].total += Number(inv.amountTotal);
    }

    // Group by member (using memberName snapshot or member relation)
    const byMember: Record<string, { count: number; total: number }> = {};
    for (const inv of invoices) {
      const key = inv.memberName || 'Cliente eliminado';
      if (!byMember[key]) byMember[key] = { count: 0, total: 0 };
      byMember[key].count++;
      byMember[key].total += Number(inv.amountTotal);
    }

    // Monthly revenue (last 6 months)
    const monthly: Record<string, number> = {};
    for (const inv of invoices) {
      const d = new Date(inv.issueDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthly[key] = (monthly[key] || 0) + Number(inv.amountTotal);
    }

    return {
      totalRevenue,
      totalInvoices,
      byMethod: Object.entries(byMethod).map(([name, data]) => ({ name, ...data })).sort((a, b) => b.total - a.total),
      byMember: Object.entries(byMember).map(([name, data]) => ({ name, ...data })).sort((a, b) => b.total - a.total).slice(0, 10),
      monthly: Object.entries(monthly).sort(([a], [b]) => a.localeCompare(b)).map(([month, total]) => ({ month, total })),
    };
  }
}
