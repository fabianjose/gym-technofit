import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { RoutineTemplate } from './routine-template.entity';
import { RoutineDayExercise } from './routine-day-exercise.entity';

@Entity('routine_days')
export class RoutineDay {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => RoutineTemplate, (template) => template.days, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'template_id' })
  template: RoutineTemplate;

  @Column({ name: 'template_id' })
  templateId: number;

  @Column({ name: 'day_index', type: 'int' })
  dayIndex: number;

  @Column({ name: 'day_label', type: 'varchar', length: 20, nullable: true })
  dayLabel: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToMany(() => RoutineDayExercise, (exercise) => exercise.routineDay, { cascade: true })
  exercises: RoutineDayExercise[];
}
