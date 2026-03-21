import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Member } from '../../members/entities/member.entity';

@Entity('whatsapp_logs')
export class WhatsappLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'member_id' })
  member: Member;

  @Column({ name: 'member_id' })
  memberId: number;

  @Column({ name: 'sent_at', type: 'datetime' })
  sentAt: Date;

  @Column({ type: 'enum', enum: ['sent', 'failed'] })
  status: string;

  @Column({ name: 'message_body', type: 'text' })
  messageBody: string;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;
}
