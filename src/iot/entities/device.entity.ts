// src/iot/entities/device.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { DeviceLog } from './device-log.entity';

@Entity()
export class Device {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  type!: string;

  @Column({ default: false })
  isOn!: boolean;

  @Column({ default: false })
  isEstateLevel!: boolean;

  /**
   * ✅ Metadata column:
   * Uses `simple-json` for SQLite and `jsonb` for PostgreSQL automatically.
   * This ensures compatibility across local/dev/prod environments.
   */
  @Column({
    type:
      (process.env.DB_TYPE || '').toLowerCase().includes('postgres')
        ? 'jsonb'
        : 'simple-json',
    nullable: true,
    default: () => (process.env.DB_TYPE?.includes('postgres') ? `'{}'` : null),
  })
  metadata!: Record<string, any> | null;

  @ManyToOne(() => User, (user) => user.devices, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  owner!: User | null;

  @OneToMany(() => DeviceLog, (log) => log.device, { cascade: true })
  logs!: DeviceLog[];

  @CreateDateColumn()
  createdAt!: Date;
}
