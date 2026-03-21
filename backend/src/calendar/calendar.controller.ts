import { Controller, Get, Query, NotFoundException } from '@nestjs/common';
import { MembersService } from '../members/members.service';
import { RoutinesService } from '../routines/routines.service';
import { MachinesService } from '../machines/machines.service';

@Controller('api/public')
export class CalendarController {
  constructor(
    private membersService: MembersService,
    private routinesService: RoutinesService,
    private machinesService: MachinesService
  ) {}

  @Get('routine')
  async getPublicRoutine(@Query('cedula') cedula: string) {
    const member = await this.membersService.findByCedula(cedula);
    if (!member) throw new NotFoundException('Miembro no encontrado');

    const calendar = await this.routinesService.getCalendar(member.id);
    return {
      member: { id: member.id, fullName: member.fullName },
      calendar
    };
  }

  @Get('machines')
  async getPublicMachines() {
    return this.machinesService.findAll();
  }
}
