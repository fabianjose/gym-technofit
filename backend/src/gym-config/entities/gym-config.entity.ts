import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('gym_config')
export class GymConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('simple-array', { nullable: true })
  ownerPhones: string[];

  @Column('simple-array', { nullable: true })
  ownerEmails: string[];

  @Column({ nullable: true })
  gymName: string;

  @Column({ nullable: true })
  nit: string;

  @Column({ nullable: true })
  address: string;

  @Column({ type: 'longtext', nullable: true })
  logoBase64: string;

  @Column({ nullable: true, default: '08:00' })
  reminderTime: string;

  @Column({ nullable: true })
  smtpHost: string;

  @Column({ nullable: true })
  smtpPort: number;

  @Column({ nullable: true })
  smtpUser: string;

  @Column({ nullable: true })
  smtpPass: string;

  @Column({ nullable: true })
  smtpFrom: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
