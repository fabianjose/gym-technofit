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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
