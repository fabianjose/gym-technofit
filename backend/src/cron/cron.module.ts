import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { MembersModule } from '../members/members.module';
import { GymConfigModule } from '../gym-config/gym-config.module';
import { WhatsappModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [MembersModule, GymConfigModule, WhatsappModule],
  providers: [CronService],
})
export class CronModule {}
