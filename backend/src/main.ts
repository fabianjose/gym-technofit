import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AdminsService } from './admins/admins.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  
  // Seed initial admin
  const adminsService = app.get(AdminsService);
  await adminsService.createInitialAdmin();

  await app.listen(3001);
}
bootstrap();
