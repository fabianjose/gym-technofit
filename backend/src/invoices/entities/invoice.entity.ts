import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Member } from '../../members/entities/member.entity';
import { Plan } from '../../plans/entities/plan.entity';
import { Discount } from '../../discounts/entities/discount.entity';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'invoice_number', type: 'int', default: 1000 })
  invoiceNumber: number;

  @ManyToOne(() => Member, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'member_id' })
  member: Member;

  @Column({ name: 'member_id', nullable: true })
  memberId: number | null;

  // Snapshot del nombre en el momento de la factura para preservar historial
  @Column({ name: 'member_name', nullable: true })
  memberName: string;

  @ManyToOne(() => Plan)
  @JoinColumn({ name: 'plan_id' })
  plan: Plan;

  @Column({ name: 'plan_id' })
  planId: string;

  @ManyToOne(() => Discount, { nullable: true })
  @JoinColumn({ name: 'discount_id' })
  discount: Discount;

  @Column({ name: 'discount_id', nullable: true })
  discountId: string | null;

  @Column('decimal', { precision: 10, scale: 2 })
  amountTotal: number;

  @Column({ type: 'date', name: 'issue_date' })
  issueDate: Date;

  @Column({ type: 'varchar', length: 20, default: 'PAID' })
  status: string;

  @Column({ name: 'payment_method', nullable: true, default: 'Efectivo' })
  paymentMethod: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
