import { debounce } from '../src/debounce';
import { throttle } from '../src/throttle';
import { memoize } from '../src/memoize';
import { SafeConnection } from '../src/memoryLeak';

describe('Performance and Memory Optimization', () => {

  describe('Debounce Wrapper', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('should delay function execution until after delay window', () => {
      const mockFunc = jest.fn();
      const debounced = debounce(mockFunc, 100);

      debounced();
      debounced();
      debounced(); // Trigger multiple times rapidly

      expect(mockFunc).not.toHaveBeenCalled(); // Not called synchronously

      // Advance time by 50ms
      jest.advanceTimersByTime(50);
      expect(mockFunc).not.toHaveBeenCalled();

      // Advance by another 50ms (total 100ms)
      jest.advanceTimersByTime(50);
      expect(mockFunc).toHaveBeenCalledTimes(1); // Executed only once
    });
  });

  describe('Throttle Wrapper', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('should execute function at most once per limit interval', () => {
      const mockFunc = jest.fn();
      const throttled = throttle(mockFunc, 200);

      throttled(); // First call runs immediately
      expect(mockFunc).toHaveBeenCalledTimes(1);

      throttled();
      throttled(); // Rapid calls within interval
      expect(mockFunc).toHaveBeenCalledTimes(1); // Blocked

      // Advance by 200ms
      jest.advanceTimersByTime(200);
      expect(mockFunc).toHaveBeenCalledTimes(2); // Trailing call triggers
    });
  });

  describe('Memoization Cache', () => {
    test('should cache computation returns and bypass re-evaluation', () => {
      const complexCalculation = jest.fn((a: number, b: number) => a + b);
      const memoized = memoize(complexCalculation);

      // First evaluations (Cache Misses)
      expect(memoized(2, 3)).toBe(5);
      expect(memoized(10, 20)).toBe(30);
      expect(complexCalculation).toHaveBeenCalledTimes(2);

      // Second evaluations (Cache Hits)
      expect(memoized(2, 3)).toBe(5);
      expect(memoized(10, 20)).toBe(30);
      expect(complexCalculation).toHaveBeenCalledTimes(2); // Retains 2 call counts
      expect(memoized.cache.size).toBe(2);

      // Clear cache
      memoized.clearCache();
      expect(memoized.cache.size).toBe(0);
      expect(memoized(2, 3)).toBe(5);
      expect(complexCalculation).toHaveBeenCalledTimes(3); // Re-evaluates
    });
  });

  describe('Memory Leak Prevention', () => {
    test('should manage and release event listener references', () => {
      const addSpy = jest.fn();
      const removeSpy = jest.fn();
      const mockEventSource = { addEventListener: addSpy, removeEventListener: removeSpy };
      
      const conn = new SafeConnection(mockEventSource);
      const handler = () => {};

      conn.connect(handler);
      expect(conn.getListenersCount()).toBe(1);
      expect(addSpy).toHaveBeenCalledWith('message', handler);

      conn.disconnect(handler);
      expect(conn.getListenersCount()).toBe(0);
      expect(removeSpy).toHaveBeenCalledWith('message', handler);
    });
  });
});
