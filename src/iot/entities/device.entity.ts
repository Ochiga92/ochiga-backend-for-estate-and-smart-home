// src/iot/entities/device.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { DeviceLog } from './device-log.entity';

@Entity()
export class Device {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index() // ✅ improves search/filter performance
  @Column()
  name!: string; // e.g. "Living Room Light" or "Main Gate"

  @Column()
  type!: string; // e.g. "light", "gate", "camera"

  @Column({ default: false })
  isOn!: boolean;

  // ✅ Store JSON metadata as string for flexibility
  @Column({ type: 'text', nullable: true })
  metadata!: string | null;

  @ManyToOne(() => User, (user: User) => user.devices, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  owner: User | null;

  @OneToMany(() => DeviceLog, (log) => log.device, { cascade: true })
  logs!: DeviceLog[];

  @Column({ default: false })
  isEstateLevel!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date; // ✅ auto-track changes
}
