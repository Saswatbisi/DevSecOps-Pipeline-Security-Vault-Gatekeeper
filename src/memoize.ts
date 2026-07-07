// Map-based custom memoization function for caching computations

export function memoize<T extends (...args: any[]) => any>(
  func: T
): T & { cache: Map<string, any>; clearCache(): void } {
  const cache = new Map<string, any>();

  const memoized = function(this: any, ...args: any[]): any {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = func.apply(this, args);
    cache.set(key, result);
    return result;
  };

  memoized.cache = cache;
  memoized.clearCache = () => cache.clear();

  return memoized as any;
}
