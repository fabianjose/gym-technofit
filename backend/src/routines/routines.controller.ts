import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { RoutinesService } from './routines.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('api/routines')
export class RoutinesController {
  constructor(private readonly routinesService: RoutinesService) {}

  @Get('member/:memberId')
  getActiveTemplate(@Param('memberId') memberId: string) {
    return this.routinesService.getActiveTemplate(+memberId);
  }

  @Post('member/:memberId')
  createTemplate(@Param('memberId') memberId: string, @Body() body: any) {
    return this.routinesService.createTemplate(+memberId, body);
  }

  @Put('template/:templateId')
  updateTemplate(@Param('templateId') templateId: string, @Body() body: any) {
    return this.routinesService.updateTemplate(+templateId, body);
  }

  @Get('calendar/:memberId')
  getCalendar(@Param('memberId') memberId: string) {
    return this.routinesService.getCalendar(+memberId);
  }

  @Put('calendar/entry/:entryId')
  updateCalendarEntry(@Param('entryId') entryId: string, @Body() body: any) {
    return this.routinesService.updateCalendarEntry(+entryId, body);
  }
}
