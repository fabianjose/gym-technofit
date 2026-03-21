import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { WhatsappLog } from './entities/whatsapp-log.entity';
import { MembersService } from '../members/members.service';
import { RoutinesService } from '../routines/routines.service';
import { Client, LocalAuth } from 'whatsapp-web.js';
import * as qrcode from 'qrcode';

@Injectable()
export class WhatsappService implements OnModuleInit {
  private readonly logger = new Logger(WhatsappService.name);
  private client: Client;
  private qrCodeDataUrl: string = '';
  private isConnected: boolean = false;

  constructor(
    @InjectRepository(WhatsappLog)
    private readonly logsRepository: Repository<WhatsappLog>,
    private readonly membersService: MembersService,
    private readonly routinesService: RoutinesService,
    private configService: ConfigService,
  ) {}

  onModuleInit() {
    this.initializeClient();
  }

  private initializeClient() {
    try {
      this.client = new Client({
        authStrategy: new LocalAuth({
          clientId: 'gymflow-admin',
          dataPath: './.wwebjs_auth'
        }),
        puppeteer: { args: ['--no-sandbox', '--disable-setuid-sandbox'] }
      });

      this.client.on('qr', async (qr) => {
        this.logger.log('WhatsApp: Generando código QR...');
        this.qrCodeDataUrl = await qrcode.toDataURL(qr);
        this.isConnected = false;
      });

      this.client.on('ready', () => {
        this.logger.log('WhatsApp Web Cliente Listo y Conectado!');
        this.isConnected = true;
        this.qrCodeDataUrl = '';
      });

      this.client.on('auth_failure', () => {
        this.logger.error('Fallo en autenticación de WhatsApp');
        this.isConnected = false;
      });

      this.client.on('disconnected', () => {
        this.logger.log('WhatsApp Web fue desconectado. Limpiando y esperando QR...');
        this.isConnected = false;
        this.qrCodeDataUrl = '';
        this.initializeClient(); // Re-instantiate
      });

      this.client.initialize();
    } catch (e) {
      this.logger.error('Error inicializando WhatsApp', e);
    }
  }

  getStatus() {
    return { connected: this.isConnected, qr: this.qrCodeDataUrl };
  }

  async logout() {
    this.logger.log('Desconectando WhatsApp manualmente...');
    try {
      if (this.isConnected) {
        await this.client.logout();
      }
      await this.client.destroy();
    } catch (e) {
      this.logger.error('Error durante el logout', e);
    }
    this.isConnected = false;
    this.qrCodeDataUrl = '';
    this.initializeClient();
    return { success: true };
  }

  @Cron('* * * * *')
  async sendDailyRoutines() {
    const currentHour = new Date().getHours();
    const currentMinute = new Date().getMinutes();
    this.logger.log(`Running WhatsApp cron job for ${currentHour}:${currentMinute.toString().padStart(2, '0')}`);
    if (!this.isConnected) {
      this.logger.warn('WhatsApp no conectado. No se enviarán notificaciones.');
      return;
    }
    
    const members = await this.membersService.findByNotifyTime(currentHour, currentMinute);
    
    for (const member of members) {
      if (!member.whatsappNumber) continue;
      
      const todayEntry = await this.routinesService.getTodayEntry(member.id);
      if (todayEntry) {
        const message = this.buildWhatsAppMessage(member, todayEntry);
        await this.send(member.whatsappNumber, message, member.id);
      }
    }
  }

  private buildWhatsAppMessage(member: any, entry: any): string {
    let msg = `🏋️ *Techno Fit — Rutina de hoy*\n👤 Hola, ${member.fullName}!\n\n`;
    
    const dateStr = new Date(entry.entryDate).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
    msg += `📅 *${dateStr}*\n\n`;

    if (entry.exercises && entry.exercises.length > 0) {
      msg += `Tus ejercicios de hoy:\n\n`;
      entry.exercises.sort((a: any, b: any) => a.orderIndex - b.orderIndex).forEach((ex: any, idx: number) => {
        msg += `${idx + 1}️⃣ *${ex.machine?.name || 'Ejercicio'}*\n`;
        msg += `   • Series: ${ex.sets} | Reps: ${ex.reps}\n`;
        msg += `   • Descanso: ${ex.restSeconds}s\n`;
        if (ex.notes) msg += `   📝 ${ex.notes}\n`;
        msg += '\n';
      });
    }

    if (entry.notes) {
      msg += `Notas del día:\n${entry.notes}\n\n`;
    }

    msg += `💪 ¡A darle duro!`;
    return msg;
  }

  async send(to: string, message: string, memberId: number) {
    this.logger.log(`Sending WhatsApp to ${to}`);
    if (!this.isConnected) {
      this.logger.warn('WhatsApp not connected');
      return;
    }
    
    try {
      const formattedTo = to.includes('@c.us') ? to : `${to.replace(/[^0-9]/g, '')}@c.us`;
      await this.client.sendMessage(formattedTo, message);
      
      const log = new WhatsappLog();
      log.memberId = memberId;
      log.messageBody = message;
      log.sentAt = new Date();
      log.status = 'SENT';
      await this.logsRepository.save(log);
    } catch (e) {
      this.logger.error('Error sending message', e);
      const log = new WhatsappLog();
      log.memberId = memberId;
      log.messageBody = message;
      log.sentAt = new Date();
      log.status = 'FAILED';
      log.errorMessage = e.message;
      await this.logsRepository.save(log);
    }
  }

  async sendPdf(to: string, pdfBuffer: Buffer, filename: string, caption: string) {
    if (!this.isConnected) {
      this.logger.warn('WhatsApp no conectado. No se enviará el PDF.');
      return false;
    }
    
    try {
      const { MessageMedia } = require('whatsapp-web.js');
      const formattedTo = to.includes('@c.us') ? to : `${to.replace(/[^0-9]/g, '')}@c.us`;
      const media = new MessageMedia('application/pdf', pdfBuffer.toString('base64'), filename);
      await this.client.sendMessage(formattedTo, media, { caption });
      this.logger.log(`PDF enviado exitosamente a ${formattedTo}`);
      return true;
    } catch (e) {
      this.logger.error(`Error enviando PDF a ${to}`, e);
      return false;
    }
  }

  async getLogs(): Promise<any[]> {
    return this.logsRepository.find({ relations: ['member'], order: { sentAt: 'DESC' }, take: 15 });
  }

  async testSend(memberId: number) {
    const member = await this.membersService.findOne(memberId);
    if (!member || !member.whatsappNumber) throw new Error('Member invalid or no WhatsApp');
    const todayEntry = await this.routinesService.getTodayEntry(memberId);
    if (!todayEntry) throw new Error('No routine for today');
    
    const message = this.buildWhatsAppMessage(member, todayEntry);
    await this.send(member.whatsappNumber, message, memberId);
    return { success: true };
  }
}
