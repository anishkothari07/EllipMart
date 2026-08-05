import { EventEmitter } from "events";

export interface DomainEventPayload<T = any> {
  eventName: string;
  payload: T;
  organizationId?: string;
  websiteId?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export type DomainEventHandler<T = any> = (event: DomainEventPayload<T>) => Promise<void> | void;

class DomainEventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(100);
  }

  /**
   * Publish a strongly-typed domain event to all subscribers
   */
  publish<T = any>(
    eventName: string,
    payload: T,
    options?: { organizationId?: string; websiteId?: string; metadata?: Record<string, any> }
  ) {
    const eventData: DomainEventPayload<T> = {
      eventName,
      payload,
      organizationId: options?.organizationId,
      websiteId: options?.websiteId,
      timestamp: new Date().toISOString(),
      metadata: options?.metadata,
    };

    // Asynchronously dispatch event to avoid blocking calling business logic
    setTimeout(() => {
      try {
        this.emit(eventName, eventData);
        this.emit("*", eventData); // Wildcard subscriber for audit/analytics
      } catch (err) {
        console.error(`[DomainEventBus] Error dispatching event '${eventName}':`, err);
      }
    }, 0);

    return eventData;
  }

  /**
   * Subscribe to a specific domain event
   */
  subscribe<T = any>(eventName: string, handler: DomainEventHandler<T>) {
    this.on(eventName, handler);
  }

  /**
   * Subscribe to all domain events (Audit, Analytics, Webhooks)
   */
  subscribeAll(handler: DomainEventHandler) {
    this.on("*", handler);
  }
}

export const domainEventBus = new DomainEventBus();
