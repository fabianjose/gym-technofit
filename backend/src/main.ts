import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AdminsService } from './admins/admins.service';

import { urlencoded, json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  
  // Seed initial admin
  const adminsService = app.get(AdminsService);
  await adminsService.createInitialAdmin();

  await app.listen(3001);
}
bootstrap();
