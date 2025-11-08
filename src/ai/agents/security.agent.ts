import { BaseAgent } from './base-agent.interface';

export class SecurityAgent implements BaseAgent {
  canHandle(input: string): boolean {
    const text = input.toLowerCase();
    return text.includes('security') || text.includes('camera') || text.includes('door') || text.includes('gate');
  }

  async handle(input: string): Promise<string> {
    const text = input.toLowerCase();

    if (text.includes('status')) {
      return '🛡️ Security systems online — all cameras, gates, and sensors operational.';
    }
    if (text.includes('lock') || text.includes('arm')) {
      return '🔒 Security system armed and all doors locked.';
    }
    if (text.includes('unlock') || text.includes('disarm')) {
      return '🔓 Security system disarmed — gates and doors accessible.';
    }

    return 'Security agent standing by — specify a lock, camera, or alert command.';
  }
}
