import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './entities/admin.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminsService {
  constructor(
    @InjectRepository(Admin)
    private adminsRepository: Repository<Admin>,
  ) {}

  async findByUsername(username: string): Promise<Admin | null> {
    return this.adminsRepository.findOne({ where: { username } });
  }

  async createInitialAdmin(): Promise<Admin> {
    const exists = await this.adminsRepository.findOne({ where: { username: 'admin' } });
    if (exists) return exists;

    const admin = new Admin();
    admin.username = 'admin';
    admin.passwordHash = await bcrypt.hash('f-tXcJF8ksp)+S/z', 10);
    return this.adminsRepository.save(admin);
  }
}
