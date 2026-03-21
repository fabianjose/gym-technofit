import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Machine } from './entities/machine.entity';

@Injectable()
export class MachinesService {
  constructor(
    @InjectRepository(Machine)
    private readonly machinesRepository: Repository<Machine>,
  ) {}

  async findAll(): Promise<Machine[]> {
    return this.machinesRepository.find({ where: { active: true } });
  }

  async findOne(id: number): Promise<Machine> {
    const machine = await this.machinesRepository.findOne({ where: { id } });
    if (!machine) throw new NotFoundException('Machine not found');
    return machine;
  }

  async create(data: Partial<Machine>): Promise<Machine> {
    const machine = this.machinesRepository.create(data);
    return this.machinesRepository.save(machine);
  }

  async update(id: number, data: Partial<Machine>): Promise<Machine> {
    const machine = await this.findOne(id);
    this.machinesRepository.merge(machine, data);
    return this.machinesRepository.save(machine);
  }

  async remove(id: number): Promise<void> {
    const machine = await this.findOne(id);
    machine.active = false;
    await this.machinesRepository.save(machine);
  }

  async updatePhoto(id: number, photoUrl: string): Promise<Machine> {
    const machine = await this.findOne(id);
    machine.photoUrl = photoUrl;
    return this.machinesRepository.save(machine);
  }

  async updateVideo(id: number, videoUrl: string): Promise<Machine> {
    const machine = await this.findOne(id);
    machine.videoUrl = videoUrl;
    return this.machinesRepository.save(machine);
  }
}
