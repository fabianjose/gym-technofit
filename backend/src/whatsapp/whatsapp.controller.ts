import { Controller, Get, UseGuards, Post, Param, Body } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('api/whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Get('status')
  getStatus() {
    return this.whatsappService.getStatus();
  }

  @Post('logout')
  async logout() {
    return this.whatsappService.logout();
  }

  @Get('logs')
  async getLogs() {
    return this.whatsappService.getLogs();
  }

  @Post('test/:memberId')
  async testSend(@Param('memberId') memberId: string) {
    return this.whatsappService.testSend(+memberId);
  }

  @Post('send')
  async sendMessage(@Body() body: { phone: string; message: string; memberId?: number }) {
    await this.whatsappService.send(body.phone, body.message, body.memberId || 0);
    return { success: true };
  }
}
