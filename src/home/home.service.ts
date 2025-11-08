import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Home } from './entities/home.entity';
import { HomeMember, HomeRole } from './entities/home-member.entity';
import { CreateHomeDto } from './dto/create-home.dto';
import { UpdateHomeDto } from './dto/update-home.dto';
import { User } from '../user/entities/user.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { AiAgent } from '../ai/ai.agent'; // 🧠 Integrated AI layer

@Injectable()
export class HomeService {
  constructor(
    @InjectRepository(Home)
    private readonly homeRepo: Repository<Home>,

    @InjectRepository(HomeMember)
    private readonly memberRepo: Repository<HomeMember>,

    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly aiAgent: AiAgent, // 🧠 Added AI brain here
  ) {}

  /** 🏠 Manager creates a home and assigns a resident as OWNER */
  async create(managerId: string, dto: CreateHomeDto & { residentId: string }) {
    const manager = await this.userRepo.findOne({ where: { id: managerId } });
    if (!manager || manager.role !== 'MANAGER') {
      throw new ForbiddenException('Only managers can create homes');
    }

    const home = this.homeRepo.create({ name: dto.name, address: dto.address });
    const savedHome = await this.homeRepo.save(home);

    const resident = await this.userRepo.findOne({
      where: { id: dto.residentId },
    });
    if (!resident) throw new NotFoundException('Resident not found');

    const member = this.memberRepo.create({
      home: savedHome,
      user: resident,
      role: HomeRole.OWNER,
    });
    await this.memberRepo.save(member);

    // ensure wallet exists
    let wallet = await this.walletRepo.findOne({
      where: { user: { id: resident.id } },
    });
    if (!wallet) {
      wallet = this.walletRepo.create({
        user: resident,
        balance: 0,
        currency: 'NGN',
        isActive: true,
      });
      await this.walletRepo.save(wallet);
    }

    return { ...savedHome, owner: resident, wallet };
  }

  /** 🧩 Get all homes a user belongs to */
  async findAll(userId: string) {
    const memberships = await this.memberRepo.find({
      where: { user: { id: userId } },
      relations: ['home', 'home.members'],
    });
    return memberships.map((m) => m.home);
  }

  /** 🧠 Ensure user is a member of home */
  private async ensureMembership(userId: string, homeId: string) {
    const member = await this.memberRepo.findOne({
      where: { user: { id: userId }, home: { id: homeId } },
      relations: ['home'],
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this home');
    }
    return member;
  }

  /** 📍 Get a single home with rooms and members */
  async findOne(userId: string, id: string) {
    await this.ensureMembership(userId, id);

    const home = await this.homeRepo.findOne({
      where: { id },
      relations: ['members', 'rooms'],
    });
    if (!home) throw new NotFoundException('Home not found');
    return home;
  }

  /** ✏️ Update home info */
  async update(userId: string, id: string, dto: UpdateHomeDto) {
    const member = await this.ensureMembership(userId, id);
    if (![HomeRole.OWNER, HomeRole.ADMIN].includes(member.role)) {
      throw new ForbiddenException('Only admins can update this home');
    }

    Object.assign(member.home, dto);
    return this.homeRepo.save(member.home);
  }

  /** ❌ Delete home (OWNER only) */
  async remove(userId: string, id: string) {
    const member = await this.ensureMembership(userId, id);
    if (member.role !== HomeRole.OWNER) {
      throw new ForbiddenException('Only the OWNER can delete this home');
    }

    await this.homeRepo.delete(id);
    return { message: 'Home deleted successfully' };
  }

  // 🧠 ---------------- AI-Powered Features ---------------- //

  /**
   * 🔹 Optimize automation & energy systems in a single home
   */
  async optimizeHomeSystems(homeData: any) {
    const prompt = `Analyze this home's IoT device data and energy usage patterns.
    Suggest automation routines, energy optimizations, and possible fault detections:
    ${JSON.stringify(homeData, null, 2)}`;

    const aiResponse = await this.aiAgent.queryExternalAgent(prompt, homeData);
    return {
      homeData,
      optimization: aiResponse,
    };
  }

  /**
   * 🔹 Generate smart summaries for all homes under a user
   */
  async summarizeUserHomes(userId: string) {
    const homes = await this.findAll(userId);
    const prompt = `You are a smart home assistant. Summarize the user's homes,
    highlight automation patterns, potential issues, and lifestyle suggestions:
    ${JSON.stringify(homes, null, 2)}`;

    const aiSummary = await this.aiAgent.queryExternalAgent(prompt, homes);
    return {
      totalHomes: homes.length,
      aiSummary,
    };
  }
}
