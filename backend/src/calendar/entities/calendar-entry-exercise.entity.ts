import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CalendarEntry } from './calendar-entry.entity';
import { Machine } from '../../machines/entities/machine.entity';

@Entity('calendar_entry_exercises')
export class CalendarEntryExercise {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CalendarEntry, (entry) => entry.exercises, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'calendar_entry_id' })
  calendarEntry: CalendarEntry;

  @Column({ name: 'calendar_entry_id' })
  calendarEntryId: number;

  @ManyToOne(() => Machine)
  @JoinColumn({ name: 'machine_id' })
  machine: Machine;

  @Column({ name: 'machine_id' })
  machineId: number;

  @Column({ type: 'int', nullable: true })
  sets: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  reps: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  weight: string;

  @Column({ name: 'rest_seconds', type: 'int', nullable: true })
  restSeconds: number;

  @Column({ name: 'order_index', type: 'int', default: 0 })
  orderIndex: number;

  @Column({ type: 'text', nullable: true })
  notes: string;
}
