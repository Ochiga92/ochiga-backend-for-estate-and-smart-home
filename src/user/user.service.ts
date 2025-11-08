import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRole } from '../enums/user-role.enum';
import { AiAgent } from '../ai/ai.agent';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly aiAgent: AiAgent, // 🧠 Inject AI Agent
  ) {}

  /** ✅ Create new user */
  async create(data: Partial<User>): Promise<User> {
    const newUser = this.userRepo.create({
      ...data,
      role: data.role ?? UserRole.RESIDENT, // default role
    });
    return this.userRepo.save(newUser);
  }

  /** 🔄 Alias for controller compatibility */
  async createUser(data: Partial<User>): Promise<User> {
    return this.create(data);
  }

  /** ✅ Get user by ID */
  async findById(id: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: [
        'wallet',
        'payments',
        'invitedVisitors',
        'homeMembers',
        'residentRecords',
        'devices',
        'notifications',
      ],
    });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

  /** 🔄 Alias for controller compatibility */
  async getUserById(id: string): Promise<User> {
    return this.findById(id);
  }

  /** ✅ Get user by email (for login/register) */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { email },
      relations: ['wallet', 'payments'],
    });
  }

  /** ✅ Get all users */
  async findAll(): Promise<User[]> {
    return this.userRepo.find({
      relations: [
        'wallet',
        'payments',
        'invitedVisitors',
        'homeMembers',
        'residentRecords',
        'devices',
        'notifications',
      ],
    });
  }

  /** 🔄 Alias for controller compatibility */
  async getAllUsers(): Promise<User[]> {
    return this.findAll();
  }

  /** ✅ Update user */
  async update(id: string, updateData: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    Object.assign(user, updateData);
    return this.userRepo.save(user);
  }

  /** 🔄 Alias for controller compatibility */
  async updateUser(id: string, updateData: Partial<User>): Promise<User> {
    return this.update(id, updateData);
  }

  /** ✅ Delete user */
  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    await this.userRepo.remove(user);
  }

  /** 🔄 Alias for controller compatibility */
  async deleteUser(id: string): Promise<void> {
    return this.remove(id);
  }

  // 🧠 ---------------- AI-Powered Enhancements ---------------- //

  /**
   * 🔹 Personalize experience for a user
   * Uses OpenAI reasoning via AiAgent to generate smart suggestions
   */
  async personalizeExperience(userProfile: any) {
    const prompt = `You are a smart assistant helping personalize user experiences in a residential automation system.
    Based on this user's profile, recommend possible actions, preferences, or automations:
    ${JSON.stringify(userProfile, null, 2)}`;

    const aiResponse = await this.aiAgent.queryExternalAgent(prompt, userProfile);
    return {
      userProfile,
      aiRecommendation: aiResponse,
    };
  }

  /**
   * 🔹 AI summary for all residents
   * Useful for admin dashboards to detect user trends or anomalies
   */
  async analyzeResidentPatterns() {
    const users = await this.findAll();
    const prompt = `Analyze the following residents' data and summarize key behavioral trends,
    engagement rates, or potential issues:
    ${JSON.stringify(users, null, 2)}`;

    const aiSummary = await this.aiAgent.queryExternalAgent(prompt, users);
    return {
      totalUsers: users.length,
      aiSummary,
    };
  }
}
