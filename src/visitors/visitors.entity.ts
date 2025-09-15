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

  @Column()
  purpose!: string;

  @Column()
  time!: string;

  @Column({ default: 'Pending' })
  status!: string;

  @Column({ unique: true })
  code!: string;

  // Relation back to User
  @ManyToOne(() => User, (user) => user.invitedVisitors, { eager: true })
  @JoinColumn({ name: 'invitedById' })
  invitedBy!: User;

  @Column()
  invitedById!: string;  // explicit foreign key column ✅

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
