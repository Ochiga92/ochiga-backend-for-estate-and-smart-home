import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { Wallet } from '../../wallet/entities/wallet.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { Visitor } from '../../visitors/entities/visitors.entity';
import { HomeMember } from '../../home/entities/home-member.entity';
import { Resident } from './resident.entity';
import { UserRole } from '../../enums/user-role.enum';
import { Device } from '../../iot/entities/device.entity';
import { Notification } from '../../notifications/entities/notification.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  name!: string;

  @Column({ type: 'text', default: UserRole.RESIDENT })
  role!: UserRole;

  // ✅ New: track email verification
  @Column({ default: false })
  verified!: boolean;

  @OneToOne(() => Wallet, (wallet) => wallet.user, {
    cascade: true,
    eager: true,
  })
  wallet!: Wallet;

  @OneToMany(() => Payment, (payment) => payment.user)
  payments!: Payment[];

  @OneToMany(() => Visitor, (visitor) => visitor.invitedBy, {
    cascade: true,
  })
  invitedVisitors!: Visitor[];

  @OneToMany(() => HomeMember, (member) => member.user)
  homeMembers!: HomeMember[];

  @OneToMany(() => Resident, (r) => r.user)
  residentRecords!: Resident[];

  // 🔑 Devices owned by this user
  @OneToMany(() => Device, (device) => device.owner)
  devices!: Device[];

  // 🔔 Notifications for this user
  @OneToMany(() => Notification, (notification) => notification.user, {
    cascade: true,
  })
  notifications!: Notification[];
}
