'use client';

/**
 * Lightweight, browser-compatible Error Emitter for terminal-wide telemetry.
 * Replaces Node.js 'events' dependency to ensure stability in SSR/Next.js environments.
 */
type Listener = (...args: any[]) => void;

class ErrorEmitter {
  private listeners: { [key: string]: Listener[] } = {};

  /**
   * Registers a callback for a specific telemetry event.
   */
  on(event: string, listener: Listener) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }

  /**
   * Dispatches an event to all registered operational listeners.
   */
  emit(event: string, ...args: any[]) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((listener) => {
        try {
          listener(...args);
        } catch (err) {
          console.debug('Telemetry Dispatch Failure:', err);
        }
      });
    }
  }

  /**
   * Removes a listener from the event registry.
   */
  removeListener(event: string, listener: Listener) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter((l) => l !== listener);
  }
}

export const errorEmitter = new ErrorEmitter();
