import { Module } from '@nestjs/common';
import { GymConfigService } from './gym-config.service';
import { GymConfigController } from './gym-config.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GymConfig } from './entities/gym-config.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GymConfig])],
  controllers: [GymConfigController],
  providers: [GymConfigService],
  exports: [GymConfigService],
})
export class GymConfigModule {}
