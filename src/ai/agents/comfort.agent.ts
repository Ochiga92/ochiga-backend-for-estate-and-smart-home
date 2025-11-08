import { BaseAgent } from './base-agent.interface';

export class ComfortAgent implements BaseAgent {
  canHandle(input: string): boolean {
    const text = input.toLowerCase();
    return text.includes('temperature') || text.includes('ac') || text.includes('cool') || text.includes('warm');
  }

  async handle(input: string): Promise<string> {
    const text = input.toLowerCase();

    if (text.includes('increase') || text.includes('raise')) {
      return '🌡️ Increasing temperature by 2°C for comfort.';
    }
    if (text.includes('decrease') || text.includes('lower')) {
      return '❄️ Lowering temperature by 2°C for freshness.';
    }
    if (text.includes('status')) {
      return 'Current temperature is 25°C — air conditioning is stable.';
    }

    return 'Comfort agent active — specify temperature or AC adjustment.';
  }
}
