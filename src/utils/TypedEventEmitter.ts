type AnyListener = (...args: any[]) => void;
type EventKey<TEvents> = Extract<keyof TEvents, string>;

export class TypedEventEmitter<TEvents extends { [K in keyof TEvents]: AnyListener }> {
  private readonly listeners = new Map<EventKey<TEvents>, Set<AnyListener>>();

  on<TKey extends EventKey<TEvents>>(event: TKey, listener: TEvents[TKey]): this {
    const set = this.listeners.get(event) ?? new Set();
    set.add(listener as (...args: any[]) => void);
    this.listeners.set(event, set);
    return this;
  }

  once<TKey extends EventKey<TEvents>>(event: TKey, listener: TEvents[TKey]): this {
    const wrapped = (...args: Parameters<TEvents[TKey]>) => {
      this.off(event, wrapped as unknown as TEvents[TKey]);
      listener(...args);
    };
    return this.on(event, wrapped as unknown as TEvents[TKey]);
  }

  off<TKey extends EventKey<TEvents>>(event: TKey, listener: TEvents[TKey]): this {
    const set = this.listeners.get(event);
    if (!set) return this;
    set.delete(listener as (...args: any[]) => void);
    if (set.size === 0) this.listeners.delete(event);
    return this;
  }

  emit<TKey extends EventKey<TEvents>>(event: TKey, ...args: Parameters<TEvents[TKey]>): boolean {
    const set = this.listeners.get(event);
    if (!set) return false;
    for (const listener of Array.from(set)) {
      listener(...args);
    }
    return true;
  }
}
