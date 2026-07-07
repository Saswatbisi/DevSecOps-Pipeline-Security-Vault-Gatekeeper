// Mock event listener registers to demonstrate memory leak prevention

export class SafeConnection {
  private listenerActive = false;
  private listenersCount = 0;

  constructor(private eventSource: { addEventListener: Function; removeEventListener: Function }) {}

  // Simulates registry (unmanaged registry represents a memory leak)
  connect(handler: Function): void {
    this.eventSource.addEventListener('message', handler);
    this.listenerActive = true;
    this.listenersCount++;
  }

  // Proper cleanup method to release reference bounds
  disconnect(handler: Function): void {
    if (this.listenerActive) {
      this.eventSource.removeEventListener('message', handler);
      this.listenerActive = false;
      this.listenersCount--;
    }
  }

  getListenersCount(): number {
    return this.listenersCount;
  }
}
