import { Controller, Get, Body, Patch, UseGuards } from '@nestjs/common';
import { GymConfigService } from './gym-config.service';
import { UpdateGymConfigDto } from './dto/update-gym-config.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('api/gym-config')
export class GymConfigController {
  constructor(private readonly gymConfigService: GymConfigService) {}

  @Get()
  getConfig() {
    return this.gymConfigService.getGlobalConfig();
  }

  @Patch()
  updateConfig(@Body() updateGymConfigDto: UpdateGymConfigDto) {
    return this.gymConfigService.updateGlobalConfig(updateGymConfigDto);
  }
}
