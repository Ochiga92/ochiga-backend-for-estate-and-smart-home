import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IotService } from '../iot/iot.service';
import { WalletService } from '../wallet/wallet.service';
import { VisitorsService } from '../visitors/visitors.service';
import { UtilitiesService } from '../utilities/utilities.service';
import { CommunityService } from '../community/community.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EstateService } from '../estate/estate.service';
import { DashboardService } from '../dashboard/dashboard.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Command } from './command.entity';

@Injectable()
export class AssistantService {
  private readonly logger = new Logger(AssistantService.name);

  constructor(
    private readonly iotService: IotService,
    private readonly walletService: WalletService,
    private readonly visitorsService: VisitorsService,
    private readonly utilitiesService: UtilitiesService,
    private readonly communityService: CommunityService,
    private readonly notificationsService: NotificationsService,
    private readonly estateService: EstateService,
    private readonly dashboardService: DashboardService,
    @InjectRepository(Command)
    private readonly commandRepo: Repository<Command>,
  ) {}

  async processCommand(command: string, userId: string = 'system-user'): Promise<{ reply: string }> {
    const text = command.toLowerCase().trim();
    this.logger.log(`🎤 Processing command: "${text}"`);
    await this.commandRepo.save({ text, createdAt: new Date() });

    try {
      // --- Greetings ---
      if (/(hello|hi|hey|good (morning|afternoon|evening))/i.test(text)) {
        return { reply: '👋 Hello! I’m Ochiga AI — how can I help with your estate today?' };
      }

      // --- IoT ---
      if (/(light|fan|ac|door|device|toggle|switch)/i.test(text)) {
        const deviceName = this.extractDeviceName(text);
        if (deviceName) {
          const result = await this.iotService.toggleDeviceByName(deviceName);
          return { reply: `✅ ${result?.message || 'Device toggled successfully.'}` };
        }
        return { reply: '⚙️ Please specify the device or room name.' };
      }

      // --- Wallet ---
      if (text.includes('wallet')) {
        if (text.includes('balance')) {
          const balance = await this.walletService.getBalance(userId);
          return { reply: `💰 Your wallet balance is ₦${balance.balance}.` };
        }
        if (text.includes('fund') || text.includes('add money') || text.includes('top up')) {
          const amount = this.extractAmount(text);
          if (!amount) return { reply: '💵 Please specify how much to fund your wallet with.' };
          await this.walletService.fundWallet(userId, amount);
          return { reply: `💳 Wallet successfully funded with ₦${amount}.` };
        }
      }

      // --- Visitors ---
      if (/(visitor|guest)/i.test(text)) {
        let visitorsCount = 0;
        try {
          const visitors = await (this.visitorsService as any).find?.();
          visitorsCount = Array.isArray(visitors) ? visitors.length : 0;
        } catch {
          visitorsCount = 0;
        }
        return { reply: `🚪 You currently have ${visitorsCount} visitor(s).` };
      }

      // --- Utilities ---
      if (/(bill|utility|power|water|waste|electricity)/i.test(text)) {
        let utilitiesCount = 0;
        try {
          const utilities = await (this.utilitiesService as any).find?.();
          utilitiesCount = Array.isArray(utilities) ? utilities.length : 0;
        } catch {
          utilitiesCount = 0;
        }
        return { reply: `⚡ You have ${utilitiesCount} pending utility bill(s).` };
      }

      // --- Notifications ---
      if (/(notification|alert|message)/i.test(text)) {
        let notifications = [];
        try {
          notifications = (await (this.notificationsService as any).find?.()) || [];
        } catch {
          notifications = [];
        }
        if (!notifications.length) return { reply: '🔔 You have no new notifications.' };
        const latest = notifications[0];
        return {
          reply: `🔔 You have ${notifications.length} notifications. Latest: "${
            latest.title || 'Untitled'
          }".`,
        };
      }

      // --- Community Events ---
      if (/(event|meeting|community|party)/i.test(text)) {
        let events = [];
        try {
          events = (await (this.communityService as any).find?.()) || [];
        } catch {
          events = [];
        }
        if (!events.length) return { reply: '🏡 No upcoming community events right now.' };
        return { reply: `📅 ${events.length} community event(s) coming up. Next: "${events[0].title}".` };
      }

      // --- Estate Info ---
      if (text.includes('estate')) {
        let estate: any = { name: 'Your Estate', units: 'N/A', residents: 'N/A' };
        try {
          estate = await (this.estateService as any).findOne?.('1');
        } catch {
          // fallback to default
        }

        return {
          reply: `🏠 Estate: ${estate.name}\nUnits: ${estate.units}\nResidents: ${estate.residents}\nYou're all set!`,
        };
      }

      // --- Dashboard Overview ---
      if (text.includes('overview') || text.includes('status')) {
        let data = null;
        try {
          data = await (this.dashboardService as any).getSummary?.();
        } catch {
          data = null;
        }
        if (!data) return { reply: '📊 No dashboard data available.' };
        return { reply: `📊 Overview: ${JSON.stringify(data)}` };
      }

      // --- Default Fallback ---
      return {
        reply: `🤖 Sorry, I’m not sure how to handle that command yet. Try saying something like “check my wallet balance” or “turn off the living room lights.”`,
      };
    } catch (error: any) {
      this.logger.error(`❌ Error processing command: ${error.message}`);
      return { reply: '⚠️ An error occurred while processing your command.' };
    }
  }

  async getCommandById(id: string): Promise<Command> {
    const command = await this.commandRepo.findOne({ where: { id } });
    if (!command) throw new NotFoundException('Command not found');
    return command;
  }

  private extractAmount(text: string): number | null {
    const match = text.match(/₦?(\d+(?:,\d{3})*(?:\.\d+)?)/);
    return match ? parseFloat(match[1].replace(/,/g, '')) : null;
  }

  private extractDeviceName(text: string): string | null {
    const match = text.match(/(?:turn on|turn off|toggle|activate|switch off|switch on)\s(.+)/i);
    return match ? match[1].trim() : null;
  }
}
