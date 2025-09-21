import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity({ name: 'refresh_token' })
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @Column({ name: 'token_hash', type: 'text' })
  tokenHash!: string;

  @Column({ name: 'device_info', nullable: true })
  deviceInfo?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  // ✅ Works with SQLite and Postgres
  @Column({ name: 'expires_at', type: 'datetime', nullable: true })
  expiresAt!: Date;

  @Column({ default: false })
  revoked!: boolean;
}
