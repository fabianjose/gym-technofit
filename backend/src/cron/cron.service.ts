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
    
    // Obtener la hora actual en Bogotá
    const nowBogotaStr = new Date().toLocaleString("en-US", {timeZone: "America/Bogota"});
    const now = new Date(nowBogotaStr);
    
    if (now.getHours() === h && now.getMinutes() === m) {
       this.logger.log(`[Cron] Ejecutando recordatorios a las ${reminderTime} (Hora Colombia)...`);
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

    const nowBogotaStr = new Date().toLocaleString("en-US", {timeZone: "America/Bogota"});
    const bogotaDate = new Date(nowBogotaStr);
    const today = new Date(bogotaDate.getFullYear(), bogotaDate.getMonth(), bogotaDate.getDate());

    for (const member of members) {
      try {
        if (!member.expirationDate) continue;
        if (!member.active) continue;

        let eDateStr = typeof member.expirationDate === 'string' ? member.expirationDate.split('T')[0] : (member.expirationDate as Date).toISOString().split('T')[0];
        const [eY, eM, eD] = eDateStr.split('-').map(Number);
        const expDate = new Date(eY, eM - 1, eD);
        
        const diffTime = expDate.getTime() - today.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 0 && diffDays <= 3) {
          if (member.whatsappNumber) {
            await this.whatsappService.send(
              member.whatsappNumber, 
              `Hola ${member.fullName}, recuerda que en ${diffDays} día${diffDays > 1 ? 's' : ''} se vence tu membresía. 💪`, 
              member.id
            );
          }
          for (const phone of owners) {
            if (phone) await this.whatsappService.send(phone, `INFO: A ${member.fullName} se le vence la membresía en ${diffDays} día${diffDays > 1 ? 's' : ''}.`, 0);
          }
        } 
        else if (diffDays === 0) {
          let msg = `Hola ${member.fullName}, hoy es el último día de tu membresía. ¡Te esperamos para renovar!`;
          if (member.whatsappNumber) await this.whatsappService.send(member.whatsappNumber, msg, member.id);
          
          for (const phone of owners) {
            if (phone) await this.whatsappService.send(phone, `INFO: Hoy vence la membresía de ${member.fullName}.`, 0);
          }
        } 
        else if (diffDays < 0 && diffDays >= -15) { // Tope preventivo de 15 días para evitar spam infinito
          let overdueDays = Math.abs(diffDays);
          let msg = `Hola ${member.fullName}, tu membresía tiene ${overdueDays} día${overdueDays > 1 ? 's' : ''} de vencid${overdueDays > 1 ? 'os' : 'o'}. ¡Pasa por el counter para ponerte al día y seguir entrenando!`;
          if (member.whatsappNumber) await this.whatsappService.send(member.whatsappNumber, msg, member.id);
          
          for (const phone of owners) {
            if (phone) await this.whatsappService.send(phone, `ALERTA: ${member.fullName} tiene ${overdueDays} día${overdueDays > 1 ? 's' : ''} de vencid${overdueDays > 1 ? 'os' : 'o'} su membresía. C.C: ${member.cedula || 'N/A'}.`, 0);
          }
        }
      } catch (err) {
        this.logger.error(`Error evaluando/enviando vencimientos para el miembro ${member.id}:`, err);
      }
    }
  }

  private async checkBirthdays(config: any) {
    this.logger.log('Evaluando cumpleaños para mañana...');
    const members = await this.membersService.findAll();
    const emails = config.ownerEmails || [];
    const phones = config.ownerPhones || [];

    const nowBogotaStr = new Date().toLocaleString("en-US", {timeZone: "America/Bogota"});
    const tomorrow = new Date(nowBogotaStr);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const tMonth = tomorrow.getMonth(); // 0-indexed
    const tDay = tomorrow.getDate();
    const tYear = tomorrow.getFullYear();

    let birthdayBoys: any[] = [];

    for (const member of members) {
      if (!member.birthDate) continue;
      if (!member.active) continue;
      
      let bYear, bMonth, bDay;
      try {
        const bDateStr = typeof member.birthDate === 'string' ? member.birthDate.split('T')[0] : (member.birthDate as Date).toISOString().split('T')[0];
        const parts = bDateStr.split('-');
        bYear = parseInt(parts[0], 10);
        bMonth = parseInt(parts[1], 10) - 1; // 0-indexed
        bDay = parseInt(parts[2], 10);
      } catch (e) {
        continue;
      }
      
      if (bMonth === tMonth && bDay === tDay) {
        const age = tYear - bYear;
        birthdayBoys.push({ ...member, age });
      }
    }

    if (birthdayBoys.length > 0) {
      const details = birthdayBoys.map((b: any) => `${b.fullName} (${b.age} años)`).join(', ');
      const msg = `🔔 RECORDATORIO: Mañana están de cumpleaños: ${details}. Prepárate para felicitarlos! 🎂`;
      
      this.logger.log(`Enviando notificación de Cumpleaños (mañana) a Dueños`);
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
                subject: '🎂 ¡Mañana hay Cumpleaños en el Gimnasio!',
                html: `<h3>Cumpleañeros de Mañana</h3><p>${details}</p><p>Mañana es un día especial. Puedes aprovechar para preparar una felicitación o promoción.</p>`
             });
             this.logger.log(`Correo de cumpleaños enviado exitosamente a ${emails.length} destinatarios.`);
          } catch(e) {
             this.logger.error('Error enviando correo SMTP de cumpleaños', e);
          }
        }
      }
    }
  }
}
