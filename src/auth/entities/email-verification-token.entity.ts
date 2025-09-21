import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('email_verification_tokens')
export class EmailVerificationToken {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @Column({ type: 'text' })
  tokenHash!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ nullable: true })
  expiresAt!: Date;

  @Column({ default: false })
  used!: boolean;
}
