import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Member } from '../../members/entities/member.entity';
import { RoutineDay } from './routine-day.entity';

@Entity('routine_templates')
export class RoutineTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'member_id' })
  member: Member;

  @Column({ name: 'member_id' })
  memberId: number;

  @Column({ name: 'start_date', type: 'date' })
  startDate: string; // YYYY-MM-DD

  @Column({ name: 'cycle_days', type: 'int', default: 7 })
  cycleDays: number;

  @Column({ name: 'duration_months', type: 'int', default: 2 })
  durationMonths: number;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @Column({ name: 'skip_saturday', type: 'boolean', default: false })
  skipSaturday: boolean;

  @Column({ name: 'skip_sunday', type: 'boolean', default: false })
  skipSunday: boolean;

  @OneToMany(() => RoutineDay, (day) => day.template, { cascade: true })
  days: RoutineDay[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
