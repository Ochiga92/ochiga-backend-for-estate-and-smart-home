// src/home/entities/home-member.entity.ts
import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Home } from './home.entity';

export enum HomeRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

@Entity()
export class HomeMember {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.homeMembers, { onDelete: 'CASCADE' })
  user!: User;

  @ManyToOne(() => Home, (home) => home.members, { onDelete: 'CASCADE' })
  home!: Home;

  @Column({ type: 'text', default: HomeRole.MEMBER })
  role!: string;

  // ✅ FIXED for SQLite
  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  joinedAt!: Date;
}