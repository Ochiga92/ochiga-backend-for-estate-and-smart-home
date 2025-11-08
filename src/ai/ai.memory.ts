export class AiMemory {
  private store: Record<string, any> = {};

  remember(key: string, value: any) {
    this.store[key] = value;
  }

  recall(key: string) {
    return this.store[key];
  }

  clear() {
    this.store = {};
  }

  dump() {
    return this.store;
  }
}
