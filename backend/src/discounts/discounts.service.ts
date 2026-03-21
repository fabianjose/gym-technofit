import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Discount } from './entities/discount.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DiscountsService {
  constructor(
    @InjectRepository(Discount)
    private readonly discountRepository: Repository<Discount>,
  ) {}

  async create(createDiscountDto: CreateDiscountDto) {
    const discount = this.discountRepository.create(createDiscountDto);
    return await this.discountRepository.save(discount);
  }

  async findAll() {
    return await this.discountRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findActive() {
    return await this.discountRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const discount = await this.discountRepository.findOne({ where: { id } });
    if (!discount) throw new NotFoundException('Discount not found');
    return discount;
  }

  async update(id: string, updateDiscountDto: UpdateDiscountDto) {
    const discount = await this.findOne(id);
    Object.assign(discount, updateDiscountDto);
    return await this.discountRepository.save(discount);
  }

  async remove(id: string) {
    const discount = await this.findOne(id);
    return await this.discountRepository.remove(discount);
  }
}
