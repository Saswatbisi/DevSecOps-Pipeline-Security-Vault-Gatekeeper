// Closure-based throttle function to limit execution rates to once per interval

export function throttle<T extends (...args: any[]) => void>(
  func: T,
  limitMs: number
): (...args: Parameters<T>) => void {
  let lastRan = 0;
  let timeoutId: any = null;

  return function(this: any, ...args: Parameters<T>): void {
    const context = this;
    const now = Date.now();

    const run = () => {
      lastRan = Date.now();
      func.apply(context, args);
    };

    if (now - lastRan >= limitMs) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      run();
    } else {
      // Setup backup timer to capture trailing triggers
      if (!timeoutId) {
        timeoutId = setTimeout(() => {
          timeoutId = null;
          run();
        }, limitMs - (now - lastRan));
      }
    }
  };
}
