// src/health/health.service.ts
import { Injectable } from '@nestjs/common';
import { AiAgent } from '../ai/ai.agent';

@Injectable()
export class HealthService {
  constructor(private readonly aiAgent: AiAgent) {}

  /** 🔹 AI-powered health analysis */
  async analyzeHealthStats(healthData: any) {
    const prompt = `Analyze user health data and provide insights:
    ${JSON.stringify(healthData)}`;
    return await this.aiAgent.queryExternalAgent(prompt, healthData);
  }
}
