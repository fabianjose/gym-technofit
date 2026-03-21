import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { MembersService } from '../members/members.service';
import { GymConfigService } from '../gym-config/gym-config.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import * as nodemailer from 'nodemailer';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(
    private readonly membersService: MembersService,
    private readonly configService: GymConfigService,
    private readonly whatsappService: WhatsappService,
  ) {}

  @Cron('* * * * *')
  async tick() {
    const config = await this.configService.getGlobalConfig();
    const reminderTime = config.reminderTime || '08:00';
    const [h, m] = reminderTime.split(':').map(Number);
    const now = new Date();
    
    if (now.getHours() === h && now.getMinutes() === m) {
       this.logger.log(`[Cron] Ejecutando recordatorios a las ${reminderTime}...`);
       await this.checkExpirations(config);
       await this.checkBirthdays(config);
    }
  }

  private async getTransporter(config: any) {
    if (!config.smtpHost || !config.smtpPort || !config.smtpUser || !config.smtpPass) return null;
    
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: config.smtpHost,
        port: config.smtpPort,
        secure: config.smtpPort === 465, // true for 465, false for 587
        auth: {
          user: config.smtpUser,
          pass: config.smtpPass,
        },
      });
    }
    return this.transporter;
  }

  private async checkExpirations(config: any) {
    this.logger.log('Evaluando vencimientos...');
    const members = await this.membersService.findAll();
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
            `Hola ${member.fullName}, recuerda que tu mensualidad vence en ${diffDays} días. 💪`, 
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
      else if (diffDays < 0 && diffDays >= -7) { // Only alert up to 7 days after exp to prevent spam
        let msg = `Hola ${member.fullName}, tu mensualidad se encuentra vencida. ¡Pasa por el counter para ponerte al día y seguir entrenando!`;
        if (member.whatsappNumber) await this.whatsappService.send(member.whatsappNumber, msg, member.id);
        
        for (const phone of owners) {
          if (phone) await this.whatsappService.send(phone, `ALERTA: Mensualidad vencida de ${member.fullName} C.C: ${member.identificationDocument || 'N/A'}.`, 0);
        }
      }
    }
  }

  private async checkBirthdays(config: any) {
    this.logger.log('Evaluando cumpleaños...');
    const members = await this.membersService.findAll();
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
      const names = birthdayBoys.map((b: any) => b.fullName).join(', ');
      const msg = `🎉 Hoy están de cumpleaños: ${names}`;
      
      this.logger.log(`Enviando notificación de Cumpleaños a Dueños`);
      for (const phone of phones) {
        if (phone) await this.whatsappService.send(phone, msg, 0);
      }
      
      // NodeMailer email to owners
      if (emails.length > 0) {
        const mailer = await this.getTransporter(config);
        if (mailer) {
          try {
             await mailer.sendMail({
                from: config.smtpFrom || config.smtpUser || '"GymFlow Alerts" <no-reply@gym.com>',
                to: emails.join(', '),
                subject: '🎂 ¡Hoy hay Cumpleaños en el Gimnasio!',
                html: `<h3>Cumpleañeros del Día</h3><p>${names}</p><p>Puedes aprovechar para enviarles una felicitación especial o darles una promoción por su vuelta al Sol.</p>`
             });
             this.logger.log(`Correo de cumpleaños enviado exitosamente a ${emails.length} destinatarios.`);
          } catch(e) {
             this.logger.error('Error enviando correo SMTP de cumpleaños', e);
          }
        } else {
             this.logger.warn('No hay configuración SMTP disponible para enviar correos de cumpleaños.');
        }
      }
    }
  }
}
