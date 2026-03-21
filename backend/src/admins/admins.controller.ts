import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { MembersService } from '../members/members.service';
import { MachinesService } from '../machines/machines.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('api/admins')
export class AdminsController {
  constructor(
    private readonly adminsService: AdminsService,
    private readonly membersService: MembersService,
    private readonly machinesService: MachinesService,
    private readonly whatsappService: WhatsappService
  ) {}

  @Get('dashboard')
  async getDashboard() {
    const members = await this.membersService.findAll();
    const machines = await this.machinesService.findAll();
    return {
      activeMembers: members.length,
      machines: machines.length,
      notificationsToday: 0 // Mocked for now
    };
  }
}
