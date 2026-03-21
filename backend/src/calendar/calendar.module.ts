import { Module } from '@nestjs/common';
import { CalendarController } from './calendar.controller';
import { MembersModule } from '../members/members.module';
import { RoutinesModule } from '../routines/routines.module';
import { MachinesModule } from '../machines/machines.module';

@Module({
  imports: [MembersModule, RoutinesModule, MachinesModule],
  controllers: [CalendarController],
})
export class CalendarModule {}
