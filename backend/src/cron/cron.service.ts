import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MembersService } from '../members/members.service';
import { GymConfigService } from '../gym-config/gym-config.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private readonly membersService: MembersService,
    private readonly configService: GymConfigService,
    private readonly whatsappService: WhatsappService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async checkExpirations() {
    this.logger.log('Evaluando vencimientos...');
    const members = await this.membersService.findAll();
    const config = await this.configService.getGlobalConfig();
    const owners = config.ownerPhones || [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const member of members) {
      if (!member.expirationDate) continue;

      const expDate = new Date(member.expirationDate);
      expDate.setHours(0, 0, 0, 0);
      
      const diffTime = expDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 0 && diffDays <= 3) {
        if (member.whatsappNumber) {
          await this.whatsappService.send(
            member.whatsappNumber, 
            `Hola ${member.fullName}, recuerda que tu mensualidad vence en ${diffDays} días.`, 
            member.id
          );
        }
      } 
      else if (diffDays === 0) {
        let msg = `Hola ${member.fullName}, hoy es el último día de tu mensualidad. ¡Te esperamos para renovar!`;
        if (member.whatsappNumber) await this.whatsappService.send(member.whatsappNumber, msg, member.id);
        
        for (const phone of owners) {
          if (phone) await this.whatsappService.send(phone, `INFO: Hoy vence la mensualidad de ${member.fullName}.`, 0);
        }
      } 
      else if (diffDays < 0) {
        let msg = `Hola ${member.fullName}, tu mensualidad se encuentra vencida. ¡Pasa por el counter para ponerte al día y seguir entrenando!`;
        if (member.whatsappNumber) await this.whatsappService.send(member.whatsappNumber, msg, member.id);
        
        for (const phone of owners) {
          if (phone) await this.whatsappService.send(phone, `ALERTA: Mensualidad vencida de ${member.fullName} C.C: ${member.cedula}.`, 0);
        }
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async checkBirthdays() {
    this.logger.log('Evaluando cumpleaños...');
    const members = await this.membersService.findAll();
    const config = await this.configService.getGlobalConfig();
    const emails = config.ownerEmails || [];
    const phones = config.ownerPhones || [];

    const today = new Date();
    const tMonth = today.getUTCMonth();
    const tDay = today.getUTCDate();

    let birthdayBoys: any[] = [];

    for (const member of members) {
      if (!member.birthDate) continue;
      const bDate = new Date(member.birthDate);
      if (bDate.getUTCMonth() === tMonth && bDate.getUTCDate() === tDay) {
        birthdayBoys.push(member);
      }
    }

    if (birthdayBoys.length > 0) {
      const names = birthdayBoys.map(b => b.fullName).join(', ');
      const msg = `🎉 Hoy están de cumpleaños: ${names}`;
      
      this.logger.log(`Enviando notificación de Cumpleaños a Dueños`);
      for (const phone of phones) {
        if (phone) await this.whatsappService.send(phone, msg, 0);
      }
      
      // Simulación de envío por correo
      if (emails.length > 0) {
         this.logger.log(`>> Se enviaría el siguiente correo a [${emails.join(', ')}]: ${msg}`);
      }
    }
  }
}
