export class TimeService {
  private timers = new Map<string, NodeJS.Timeout>();

  setResetTimer(id: string, action: () => void, ms: number = 60000) {
    if (this.timers.has(id)) clearTimeout(this.timers.get(id)!);
    const timer = setTimeout(action, ms);
    this.timers.set(id, timer);
  }
}
