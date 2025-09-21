import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('password_reset_tokens')
export class PasswordResetToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  tokenHash: string;

  @Column({ type: 'datetime' }) // ✅ works with SQLite
  expiresAt: Date;

  @Column({ default: false })
  used: boolean;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;
}
