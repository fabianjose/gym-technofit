import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentMethod } from './entities/payment-method.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PaymentMethodsService implements OnModuleInit {
  constructor(
    @InjectRepository(PaymentMethod)
    private readonly repository: Repository<PaymentMethod>,
  ) {}

  async onModuleInit() {
    const existing = await this.repository.count();
    if (existing === 0) {
      await this.repository.save([
        { name: 'Efectivo', isActive: true },
        { name: 'Nequi', isActive: true },
        { name: 'Daviplata', isActive: true },
        { name: 'Transferencia Bancaria', isActive: true },
        { name: 'Tarjeta de Crédito', isActive: true },
      ]);
    }
  }

  create(createPaymentMethodDto: CreatePaymentMethodDto) {
    const pm = this.repository.create(createPaymentMethodDto);
    return this.repository.save(pm);
  }

  findAll() {
    return this.repository.find();
  }

  async findOne(id: number) {
    const pm = await this.repository.findOne({ where: { id } });
    if (!pm) throw new NotFoundException('Payment method not found');
    return pm;
  }

  async update(id: number, updatePaymentMethodDto: UpdatePaymentMethodDto) {
    const pm = await this.findOne(id);
    Object.assign(pm, updatePaymentMethodDto);
    return this.repository.save(pm);
  }

  async remove(id: number) {
    const pm = await this.findOne(id);
    return this.repository.remove(pm);
  }
}
