import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AiMemory } from './ai.memory';
import { AiReasoner } from './ai.reasoner';
import { AiAgent } from './ai.agent';
import { EnergyAgent } from './agents/energy.agent';
import { SecurityAgent } from './agents/security.agent';
import { ComfortAgent } from './agents/comfort.agent';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly memory = new AiMemory();
  private readonly reasoner = new AiReasoner();
  private readonly agent: AiAgent;

  // 🧩 Registered domain agents
  private readonly domainAgents = [
    new EnergyAgent(),
    new SecurityAgent(),
    new ComfortAgent(),
  ];

  constructor(private readonly http: HttpService) {
    this.agent = new AiAgent(this.http);
  }

  async processUserIntent(input: string, context: any = {}): Promise<string> {
    this.logger.log(`🧠 Input: ${input}`);
    this.memory.remember('last_input', input);

    // 1️⃣ Local rule reasoning
    const localResponse = this.reasoner.reason(input, context);
    if (localResponse) {
      this.memory.remember('last_output', localResponse);
      return localResponse;
    }

    // 2️⃣ Domain agent routing
    for (const subAgent of this.domainAgents) {
      if (subAgent.canHandle(input)) {
        const reply = await subAgent.handle(input);
        this.memory.remember('last_output', reply);
        this.logger.log(`🤖 Handled by ${subAgent.constructor.name}`);
        return reply;
      }
    }

    // 3️⃣ External LLM fallback
    const aiResponse = await this.agent.queryExternalAgent(input, context);
    this.memory.remember('last_output', aiResponse);
    return aiResponse;
  }
}
