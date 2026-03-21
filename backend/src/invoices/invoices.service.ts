import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Invoice } from './entities/invoice.entity';
import { Repository } from 'typeorm';
import { MembersService } from '../members/members.service';
import { PlansService } from '../plans/plans.service';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    private readonly membersService: MembersService,
    private readonly plansService: PlansService,
  ) {}

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
      planId,
      discountId: discountId || null,
      amountTotal: Number(amountTotal),
      invoiceNumber: nextInvoiceNumber,
      issueDate: new Date(),
      status: 'PAID',
    });

    const savedInvoice = await this.invoiceRepository.save(invoice);

    // Update member expiration date
    let baseDate = new Date();
    if (member.expirationDate && new Date(member.expirationDate) > new Date()) {
      baseDate = new Date(member.expirationDate);
    }
    baseDate.setMonth(baseDate.getMonth() + 1);
    const formattedExpDate = baseDate.toISOString().split('T')[0];
    await this.membersService.update(member.id, { expirationDate: formattedExpDate });

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
      const d = new Date(invoice.member.expirationDate);
      d.setMonth(d.getMonth() - 1);
      const formattedExpDate = d.toISOString().split('T')[0];
      await this.membersService.update(invoice.member.id, { expirationDate: formattedExpDate });
    }

    invoice.status = 'ANNULLED';
    return await this.invoiceRepository.save(invoice);
  }

  async remove(id: string) {
    const invoice = await this.findOne(id);
    if (invoice.status === 'PAID') {
      if (invoice.member && invoice.member.expirationDate) {
        const d = new Date(invoice.member.expirationDate);
        d.setMonth(d.getMonth() - 1);
        const formattedExpDate = d.toISOString().split('T')[0];
        await this.membersService.update(invoice.member.id, { expirationDate: formattedExpDate });
      }
    }
    return await this.invoiceRepository.remove(invoice);
  }
}
