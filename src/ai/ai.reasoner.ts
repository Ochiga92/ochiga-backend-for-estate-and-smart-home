export class AiReasoner {
  reason(input: string, context: any): string | null {
    const text = input.toLowerCase();

    // Local reasoning rules
    if (text.includes('lights') && text.includes('on')) {
      return 'Turning on all connected lights.';
    }
    if (text.includes('lights') && text.includes('off')) {
      return 'Turning off all connected lights.';
    }
    if (text.includes('temperature') && text.includes('status')) {
      return 'The current home temperature is 25°C and stable.';
    }
    if (text.includes('security') && text.includes('status')) {
      return 'All cameras and sensors are online. Security system is armed.';
    }

    // Add more rule patterns here...

    return null; // Fallback to external AI
  }
}
