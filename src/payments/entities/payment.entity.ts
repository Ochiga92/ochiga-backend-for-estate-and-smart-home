// src/payments/entities/payment.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Wallet } from '../../wallet/entities/wallet.entity';

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

@Entity()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('decimal', { precision: 12, scale: 2 })
  amount!: number;

  @Column()
  description!: string;

  @Column()
  provider!: string; // e.g. paystack, flutterwave

  @Column({ default: 'NGN' })
  currency!: string;

  @Column({ unique: true })
  reference!: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status!: PaymentStatus;

  @ManyToOne(() => User, (user) => user.payments, { onDelete: 'CASCADE' })
  user!: User;

  @ManyToOne(() => Wallet, (wallet) => wallet.payments, {
    onDelete: 'CASCADE',
  })
  wallet!: Wallet;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
