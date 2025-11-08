import { BaseAgent } from './base-agent.interface';

export class EnergyAgent implements BaseAgent {
  canHandle(input: string): boolean {
    const text = input.toLowerCase();
    return text.includes('light') || text.includes('power') || text.includes('energy');
  }

  async handle(input: string): Promise<string> {
    const text = input.toLowerCase();

    if (text.includes('turn on')) {
      return '✅ Powering on all relevant systems and lights.';
    }
    if (text.includes('turn off')) {
      return '⚡ Shutting down non-critical systems to save energy.';
    }
    if (text.includes('status')) {
      return '🔋 Energy usage is at 32% of capacity, all systems nominal.';
    }

    return 'Energy agent ready — please specify an energy command.';
  }
}
