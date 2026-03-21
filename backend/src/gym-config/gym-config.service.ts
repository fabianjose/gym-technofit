import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GymConfig } from './entities/gym-config.entity';
import { UpdateGymConfigDto } from './dto/update-gym-config.dto';

@Injectable()
export class GymConfigService {
  constructor(
    @InjectRepository(GymConfig)
    private configRepository: Repository<GymConfig>
  ) {}

  async getGlobalConfig() {
    let config = await this.configRepository.findOne({ where: { id: 1 } });
    if (!config) {
      config = this.configRepository.create({ id: 1, ownerPhones: [], ownerEmails: [] });
      await this.configRepository.save(config);
    }
    return config;
  }

  async updateGlobalConfig(dto: UpdateGymConfigDto) {
    const config = await this.getGlobalConfig();
    Object.assign(config, dto);
    return this.configRepository.save(config);
  }
}
