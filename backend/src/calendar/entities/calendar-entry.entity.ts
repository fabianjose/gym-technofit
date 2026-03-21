import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Member } from '../../members/entities/member.entity';
import { RoutineTemplate } from '../../routines/entities/routine-template.entity';
import { CalendarEntryExercise } from './calendar-entry-exercise.entity';

@Entity('calendar_entries')
export class CalendarEntry {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'member_id' })
  member: Member;

  @Column({ name: 'member_id' })
  memberId: number;

  @ManyToOne(() => RoutineTemplate)
  @JoinColumn({ name: 'template_id' })
  template: RoutineTemplate;

  @Column({ name: 'template_id' })
  templateId: number;

  @Column({ name: 'entry_date', type: 'date' })
  entryDate: string; // YYYY-MM-DD

  @Column({ name: 'day_index', type: 'int' })
  dayIndex: number;

  @Column({ name: 'is_override', type: 'boolean', default: false })
  isOverride: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToMany(() => CalendarEntryExercise, (exercise) => exercise.calendarEntry, { cascade: true })
  exercises: CalendarEntryExercise[];
}
