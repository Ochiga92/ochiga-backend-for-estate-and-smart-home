// src/visitors/entities/visitors.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('visitors')
export class Visitor {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  purpose?: string;

  @Column({ nullable: true })
  time?: string;

  @Column({ type: 'text', default: 'Pending' })
  status!: string;

  @Column({ unique: true })
  code!: string; // auto-generated short code

  @ManyToOne(() => User, (user) => user.invitedVisitors, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'invitedById' })
  invitedBy!: User;

  @Column({ nullable: true })
  invitedById?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
