import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity({ name: 'refresh_token' })
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  // bcrypt hash of the raw token (legacy / existing)
  @Column({ name: 'token_hash', type: 'text' })
  tokenHash!: string;

  // New: store sha256(rawToken) for fast, indexed lookup (nullable for compatibility)
  @Index()
  @Column({ name: 'token_sha256', type: 'varchar', length: 128, nullable: true })
  tokenSha256?: string | null;

  @Column({ name: 'device_info', nullable: true })
  deviceInfo?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  // ✅ FIXED: Compatible with PostgreSQL and SQLite
  @Column({
    name: 'expires_at',
    type: process.env.DB_TYPE === 'postgres' ? 'timestamp' : 'datetime',
    nullable: true,
  })
  expiresAt?: Date | null;

  @Column({ default: false })
  revoked!: boolean;
}
