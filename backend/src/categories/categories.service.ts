import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async create(data: Partial<Category>): Promise<Category> {
    const category = this.categoryRepo.create(data);
    return this.categoryRepo.save(category);
  }

  async findAll(): Promise<Category[]> {
    return this.categoryRepo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(id: number, data: Partial<Category>): Promise<Category> {
    const category = await this.findOne(id);
    this.categoryRepo.merge(category, data);
    return this.categoryRepo.save(category);
  }

  async remove(id: number): Promise<void> {
    await this.categoryRepo.delete(id);
  }
}
