import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WhatsappService } from './whatsapp.service';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappLog } from './entities/whatsapp-log.entity';
import { MembersModule } from '../members/members.module';
import { RoutinesModule } from '../routines/routines.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([WhatsappLog]),
    forwardRef(() => MembersModule),
    forwardRef(() => RoutinesModule),
    ConfigModule
  ],
  controllers: [WhatsappController],
  providers: [WhatsappService],
  exports: [WhatsappService],
})
export class WhatsappModule {}
