// Closure-based debounce function to delay execution until inactivity is reached

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let timeoutId: any = null;

  return function(this: any, ...args: Parameters<T>): void {
    const context = this;

    // Reset timer on active triggers
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    // Schedule delayed callback execution
    timeoutId = setTimeout(() => {
      func.apply(context, args);
    }, delayMs);
  };
}
