import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('password_reset_tokens')
export class PasswordResetToken {
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
