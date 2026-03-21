import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { RoutineDay } from './routine-day.entity';
import { Machine } from '../../machines/entities/machine.entity';

@Entity('routine_day_exercises')
export class RoutineDayExercise {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => RoutineDay, (day) => day.exercises, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'routine_day_id' })
  routineDay: RoutineDay;

  @Column({ name: 'routine_day_id' })
  routineDayId: number;

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
