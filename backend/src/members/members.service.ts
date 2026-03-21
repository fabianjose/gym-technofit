import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from './entities/member.entity';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member)
    private readonly membersRepository: Repository<Member>,
  ) {}

  async findAll(): Promise<Member[]> {
    return this.membersRepository.find({ where: { active: true } });
  }

  async findOne(id: number): Promise<Member> {
    const member = await this.membersRepository.findOne({ where: { id } });
    if (!member) throw new NotFoundException('Member not found');
    return member;
  }

  async findByCedula(cedula: string): Promise<Member> {
    const member = await this.membersRepository.findOne({ where: { cedula, active: true } });
    if (!member) throw new NotFoundException('Member not found');
    return member;
  }

  async findByNotifyTime(hour: number, minute: number): Promise<Member[]> {
    return this.membersRepository.find({ where: { whatsappNotifyHour: hour, whatsappNotifyMinute: minute, active: true } });
  }

  async create(data: Partial<Member>): Promise<Member> {
    // Si no viene expirationDate, calcular automáticamente como registrationDate + 1 mes
    if (!data.expirationDate && data.registrationDate) {
      const reg = new Date(data.registrationDate);
      const exp = new Date(reg);
      exp.setMonth(exp.getMonth() + 1);
      data.expirationDate = exp;
    }
    const member = this.membersRepository.create(data);
    return this.membersRepository.save(member);
  }

  async update(id: number, data: Partial<Member>): Promise<Member> {
    const member = await this.findOne(id);
    this.membersRepository.merge(member, data);
    return this.membersRepository.save(member);
  }

  async remove(id: number): Promise<void> {
    const member = await this.findOne(id);
    
    // Eliminar relaciones manualmente para evitar errores de Foreign Key (si no tienen CASCADE activado en DB)
    await this.membersRepository.query(`DELETE FROM whatsapp_logs WHERE member_id = ?`, [id]);
    await this.membersRepository.query(`DELETE FROM calendar_entry_exercises WHERE calendar_entry_id IN (SELECT id FROM calendar_entries WHERE member_id = ?)`, [id]);
    await this.membersRepository.query(`DELETE FROM calendar_entries WHERE member_id = ?`, [id]);
    await this.membersRepository.query(`DELETE FROM routine_day_exercises WHERE routine_day_id IN (SELECT id FROM routine_days WHERE template_id IN (SELECT id FROM routine_templates WHERE member_id = ?))`, [id]);
    await this.membersRepository.query(`DELETE FROM routine_days WHERE template_id IN (SELECT id FROM routine_templates WHERE member_id = ?)`, [id]);
    await this.membersRepository.query(`DELETE FROM routine_templates WHERE member_id = ?`, [id]);

    // Eliminar al miembro físicamente de la base de datos
    await this.membersRepository.delete(id);
  }
}
