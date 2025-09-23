import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum AuditActionType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  READ = 'READ',
  CONTROL = 'CONTROL',
  AUTH = 'AUTH',
  SYSTEM = 'SYSTEM',
  OTHER = 'OTHER',
}

@Entity('audit_logs')
export class Audit {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'user_id', nullable: true })
  userId?: string; // null for system actions

  @Column({ name: 'user_email', nullable: true })
  userEmail?: string;

  @Column({ name: 'action', type: 'text' })
  action!: AuditActionType | string;

  @Column({ name: 'resource', type: 'text', nullable: true })
  resource?: string; // e.g. "device:1234", "estate:abcd"

  @Column({ type: 'text', nullable: true })
  details?: string; // JSON stringified details

  @Column({ default: 'INFO' })
  severity!: 'INFO' | 'WARN' | 'ERROR';

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
