export interface BaseAgent {
  canHandle(input: string): boolean;
  handle(input: string): Promise<string>;
}
