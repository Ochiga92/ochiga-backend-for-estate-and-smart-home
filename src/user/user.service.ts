import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRole } from '../enums/user-role.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  // Create user
  async create(data: Partial<User>): Promise<User> {
    const newUser = this.userRepo.create({
      ...data,
      role: data.role ?? UserRole.RESIDENT,
    });
    return this.userRepo.save(newUser);
  }

  async createUser(data: Partial<User>): Promise<User> {
    return this.create(data);
  }

  // Get one user by ID
  async findOne(id: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['wallet', 'payments', 'invitedVisitors', 'homeMembers'],
    });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { id },
      relations: ['wallet', 'payments', 'invitedVisitors', 'homeMembers'],
    });
  }

  async getUserById(id: string): Promise<User> {
    return this.findOne(id);
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepo.find({
      relations: ['wallet', 'payments', 'invitedVisitors', 'homeMembers'],
    });
  }

  // ✅ Optimized Update (direct SQL update, no fetch)
  async updateUser(id: string, updateData: Partial<User>): Promise<void> {
    await this.userRepo.update(id, updateData);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { email },
      relations: ['wallet', 'payments'],
    });
  }
}
