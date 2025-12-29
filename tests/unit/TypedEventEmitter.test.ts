import { describe, it, expect, vi } from 'vitest';
import { TypedEventEmitter } from '../../src/utils/TypedEventEmitter.js';

interface TestEvents {
  message: (text: string) => void;
  count: (n: number) => void;
  empty: () => void;
}

describe('TypedEventEmitter', () => {
  it('should call listener when event is emitted', () => {
    const emitter = new TypedEventEmitter<TestEvents>();
    const listener = vi.fn();

    emitter.on('message', listener);
    emitter.emit('message', 'hello');

    expect(listener).toHaveBeenCalledWith('hello');
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('should call multiple listeners for same event', () => {
    const emitter = new TypedEventEmitter<TestEvents>();
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    emitter.on('message', listener1);
    emitter.on('message', listener2);
    emitter.emit('message', 'hello');

    expect(listener1).toHaveBeenCalledWith('hello');
    expect(listener2).toHaveBeenCalledWith('hello');
  });

  it('should return true when emit has listeners', () => {
    const emitter = new TypedEventEmitter<TestEvents>();
    emitter.on('message', vi.fn());

    expect(emitter.emit('message', 'hello')).toBe(true);
  });

  it('should return false when emit has no listeners', () => {
    const emitter = new TypedEventEmitter<TestEvents>();

    expect(emitter.emit('message', 'hello')).toBe(false);
  });

  it('should remove listener with off()', () => {
    const emitter = new TypedEventEmitter<TestEvents>();
    const listener = vi.fn();

    emitter.on('message', listener);
    emitter.off('message', listener);
    emitter.emit('message', 'hello');

    expect(listener).not.toHaveBeenCalled();
  });

  it('should only trigger once() listener one time', () => {
    const emitter = new TypedEventEmitter<TestEvents>();
    const listener = vi.fn();

    emitter.once('message', listener);
    emitter.emit('message', 'first');
    emitter.emit('message', 'second');

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith('first');
  });

  it('should handle events with no arguments', () => {
    const emitter = new TypedEventEmitter<TestEvents>();
    const listener = vi.fn();

    emitter.on('empty', listener);
    emitter.emit('empty');

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('should allow chaining on/once/off', () => {
    const emitter = new TypedEventEmitter<TestEvents>();
    const listener = vi.fn();

    const result = emitter.on('message', listener).once('count', vi.fn()).off('message', listener);

    expect(result).toBe(emitter);
  });

  it('should not throw when removing non-existent listener', () => {
    const emitter = new TypedEventEmitter<TestEvents>();
    const listener = vi.fn();

    expect(() => emitter.off('message', listener)).not.toThrow();
  });

  it('should isolate events from each other', () => {
    const emitter = new TypedEventEmitter<TestEvents>();
    const messageListener = vi.fn();
    const countListener = vi.fn();

    emitter.on('message', messageListener);
    emitter.on('count', countListener);
    emitter.emit('message', 'hello');

    expect(messageListener).toHaveBeenCalledWith('hello');
    expect(countListener).not.toHaveBeenCalled();
  });
});
