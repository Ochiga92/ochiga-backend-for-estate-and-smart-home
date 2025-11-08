// src/iot/entities/device-log.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Device } from './device.entity';

@Entity()
export class DeviceLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Device, (device) => device.logs, { onDelete: 'CASCADE' })
  device!: Device;

  /**
   * Action performed — e.g. "on", "off", "dim", "lock", "unlock"
   */
  @Column()
  action!: string;

  /**
   * Flexible details field:
   * Stores JSON in Postgres (`jsonb`) or simple JSON text in SQLite.
   * Ideal for logs containing sensor data, device states, etc.
   */
  @Column({
    type:
      (process.env.DB_TYPE || '').toLowerCase().includes('postgres')
        ? 'jsonb'
        : 'simple-json',
    nullable: true,
  })
  details?: Record<string, any> | null;

  @CreateDateColumn()
  createdAt!: Date;
}
