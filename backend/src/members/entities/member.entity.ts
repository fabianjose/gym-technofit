import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('members')
export class Member {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20, unique: true })
  cedula: string;

  @Column({ name: 'full_name', type: 'varchar', length: 150 })
  fullName: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  email: string;

  @Column({ name: 'whatsapp_number', type: 'varchar', length: 20, nullable: true })
  whatsappNumber: string;

  @Column({ name: 'whatsapp_notify_hour', type: 'int', default: 7 })
  whatsappNotifyHour: number;

  @Column({ name: 'whatsapp_notify_minute', type: 'int', default: 0 })
  whatsappNotifyMinute: number;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @Column({ name: 'birth_date', type: 'date', nullable: true })
  birthDate: string;

  @Column({ name: 'registration_date', type: 'date', nullable: true })
  registrationDate: string;

  @Column({ name: 'expiration_date', type: 'date', nullable: true })
  expirationDate: string;

  @Column({ type: 'json', nullable: true })
  measurements: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'default_plan_id', type: 'varchar', length: 36, nullable: true })
  defaultPlanId?: string;

  @Column({ name: 'default_discount_id', type: 'varchar', length: 36, nullable: true })
  defaultDiscountId?: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
