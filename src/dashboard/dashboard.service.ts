import { Injectable } from '@nestjs/common';
import { TokenUser } from '../auth/types/token-user.interface';
import { UserRole } from '../enums/user-role.enum';
import { AiAgent } from '../ai/ai.agent';

@Injectable()
export class DashboardService {
  constructor(private readonly aiAgent: AiAgent) {}

  /** 
   * 🔹 AI-assisted smart summary from system metrics 
   */
  async generateSmartSummary(systemMetrics: any) {
    const prompt = `You are an infrastructure performance analyst AI.
    Summarize the following system performance metrics and provide clear,
    actionable insights and any anomalies you detect:

    ${JSON.stringify(systemMetrics, null, 2)}`;

    const aiResponse = await this.aiAgent.queryExternalAgent(prompt, systemMetrics);
    return {
      summary: aiResponse,
      rawMetrics: systemMetrics,
    };
  }

  /** 🔹 Manager dashboard with AI enhancement */
  async getManagerDashboard(user: TokenUser) {
    const baseData = {
      message: 'Welcome Manager!',
      user,
      stats: {
        totalResidents: 120,
        activeLeases: 85,
        pendingRequests: 14,
      },
      quickLinks: [
        { name: 'Manage Properties', url: '/properties' },
        { name: 'Approve Requests', url: '/requests' },
        { name: 'Financial Reports', url: '/reports' },
      ],
    };

    // AI-generated insight layer
    const prompt = `Provide insights on how the following estate metrics can be improved:
    ${JSON.stringify(baseData.stats, null, 2)}`;

    const aiInsight = await this.aiAgent.queryExternalAgent(prompt, baseData.stats);

    return {
      ...baseData,
      aiInsight,
    };
  }

  /** 🔹 Resident dashboard with AI personalization */
  async getResidentDashboard(user: TokenUser) {
    const baseData = {
      message: 'Welcome Resident!',
      user,
      myLease: {
        property: 'Sunset Apartments, Block B',
        rentDue: '2025-10-01',
        balance: 250,
      },
      quickLinks: [
        { name: 'Pay Rent', url: '/payments' },
        { name: 'Request Maintenance', url: '/maintenance' },
        { name: 'Community Forum', url: '/community' },
      ],
    };

    const prompt = `Personalize the following resident data and 
    provide helpful tips or suggestions for engagement:
    ${JSON.stringify(baseData.myLease, null, 2)}`;

    const aiInsight = await this.aiAgent.queryExternalAgent(prompt, baseData.myLease);

    return {
      ...baseData,
      aiInsight,
    };
  }

  /** 🔹 Central dashboard router */
  async getDashboard(user: TokenUser) {
    if (user.role === UserRole.MANAGER) {
      return this.getManagerDashboard(user);
    } else if (user.role === UserRole.RESIDENT) {
      return this.getResidentDashboard(user);
    }

    // Default fallback for unknown roles
    const aiNote = await this.aiAgent.queryExternalAgent(
      `The user role "${user.role}" is not recognized. Suggest the best way to assign a proper dashboard category.`,
      user,
    );

    return { message: 'Unknown role', user, aiNote };
  }

  /** 🔹 Simple estate-wide summary (for AssistantService) */
  async getSummary() {
    // Simulated aggregated metrics
    const summaryData = {
      residents: 128,
      visitors: 42,
      totalBalance: 547000,
      openTickets: 9,
      systemHealth: 'Optimal',
    };

    // Optional AI-generated insight
    const prompt = `Summarize this estate dashboard data into a short, friendly sentence for a voice assistant:
    ${JSON.stringify(summaryData, null, 2)}`;

    const aiSummary = await this.aiAgent.queryExternalAgent(prompt, summaryData);

    return {
      ...summaryData,
      aiSummary,
    };
  }
}
