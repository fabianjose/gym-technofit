import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoutinesService } from './routines.service';
import { RoutinesController } from './routines.controller';
import { RoutineTemplate } from './entities/routine-template.entity';
import { RoutineDay } from './entities/routine-day.entity';
import { RoutineDayExercise } from './entities/routine-day-exercise.entity';
import { CalendarEntry } from '../calendar/entities/calendar-entry.entity';
import { CalendarEntryExercise } from '../calendar/entities/calendar-entry-exercise.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RoutineTemplate,
      RoutineDay,
      RoutineDayExercise,
      CalendarEntry,
      CalendarEntryExercise,
    ]),
  ],
  controllers: [RoutinesController],
  providers: [RoutinesService],
  exports: [RoutinesService],
})
export class RoutinesModule {}
