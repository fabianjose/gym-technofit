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

  /**
   * Suma exactamente 1 mes a una fecha en formato YYYY-MM-DD.
   * Opera sobre strings para evitar cualquier desfase por zona horaria.
   */
  private addOneMonth(dateStr: string): string {
    const clean = dateStr.substring(0, 10);
    const [y, mo, d] = clean.split('-').map(Number);
    const newMo = mo === 12 ? 1 : mo + 1;
    const newY  = mo === 12 ? y + 1 : y;
    return `${newY}-${newMo.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
  }

  /** Normaliza cualquier valor de fecha a string YYYY-MM-DD */
  private toDateStr(value: any): string | null {
    if (!value) return null;
    const s = value.toString();
    // Si ya viene en formato YYYY-MM-DD, retornar directo
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.substring(0, 10);
    // Si es una fecha ISO con T, extraer la parte de fecha
    const match = s.match(/(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : null;
  }

  async findAll(): Promise<Member[]> {
    const members = await this.membersRepository.find({ where: { active: true } });

    // Corregir fechas faltantes o mal calculadas (bug UTC previo)
    const toFix = members.filter(m => {
      if (!m.registrationDate) return false;
      const regStr = this.toDateStr(m.registrationDate);
      if (!regStr) return false;
      const correctExpStr = this.addOneMonth(regStr);
      if (!m.expirationDate) return true;
      const storedStr = this.toDateStr(m.expirationDate);
      if (!storedStr) return true;
      // Re-corregir si la fecha está mal por 1 día (bug UTC anterior)
      return storedStr !== correctExpStr &&
             Math.abs(new Date(correctExpStr).getTime() - new Date(storedStr).getTime()) === 86400000;
    });

    for (const m of toFix) {
      const regStr = this.toDateStr(m.registrationDate) ?? '';
      const expStr = this.addOneMonth(regStr);
      // Guardar directamente como string para evitar conversión de zona horaria
      await this.membersRepository.query(
        'UPDATE members SET expiration_date = ? WHERE id = ?',
        [expStr, m.id]
      );
      (m as any).expirationDate = expStr;
    }

    return members;
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
    console.log('--- CREATE CALLED ---');
    console.log('Incoming create date:', data.registrationDate);
    if (data.registrationDate) {
      const regStr = this.toDateStr(data.registrationDate) ?? '';
      const expStr = this.addOneMonth(regStr);
      // Pasar strings directamente: el driver MySQL no aplica conversión de zona horaria a strings
      (data as any).registrationDate = regStr;
      (data as any).expirationDate   = expStr;
    }
    if (data.birthDate) {
      (data as any).birthDate = this.toDateStr(data.birthDate);
    }
    const member = this.membersRepository.create(data);
    const saved = await this.membersRepository.save(member);
    console.log('Saved create result:', saved.registrationDate, saved.expirationDate);
    return saved;
  }

  async update(id: number, data: Partial<Member>): Promise<Member> {
    const member = await this.findOne(id);
    console.log('--- UPDATE CALLED ---');
    console.log('Current in DB:', member.registrationDate);
    console.log('Incoming data:', data.registrationDate);

    if (data.registrationDate) {
      const regStr = this.toDateStr(data.registrationDate);
      const currentRegStr = this.toDateStr(member.registrationDate);
      console.log('regStr computed:', regStr, 'currentRegStr:', currentRegStr);
      (data as any).registrationDate = regStr;
      // Solo recalcular expirationDate si la inscripción realmente cambió
      if ((regStr ?? '') !== (currentRegStr ?? '')) {
        (data as any).expirationDate = this.addOneMonth(regStr ?? '');
      }
    }

    if (data.birthDate) {
      (data as any).birthDate = this.toDateStr(data.birthDate);
    }

    console.log('Data to merge:', data.registrationDate, data.expirationDate);
    this.membersRepository.merge(member, data);
    const saved = await this.membersRepository.save(member);
    console.log('Saved result:', saved.registrationDate, saved.expirationDate);
    return saved;
  }

  async remove(id: number): Promise<void> {
    const member = await this.findOne(id);

    await this.membersRepository.query(`DELETE FROM whatsapp_logs WHERE member_id = ?`, [id]);
    await this.membersRepository.query(`DELETE FROM calendar_entry_exercises WHERE calendar_entry_id IN (SELECT id FROM calendar_entries WHERE member_id = ?)`, [id]);
    await this.membersRepository.query(`DELETE FROM calendar_entries WHERE member_id = ?`, [id]);
    await this.membersRepository.query(`DELETE FROM routine_day_exercises WHERE routine_day_id IN (SELECT id FROM routine_days WHERE template_id IN (SELECT id FROM routine_templates WHERE member_id = ?))`, [id]);
    await this.membersRepository.query(`DELETE FROM routine_days WHERE template_id IN (SELECT id FROM routine_templates WHERE member_id = ?)`, [id]);
    await this.membersRepository.query(`DELETE FROM routine_templates WHERE member_id = ?`, [id]);

    await this.membersRepository.delete(id);
  }
}
