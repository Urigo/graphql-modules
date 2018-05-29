import { CommunicationBridge } from './communication-bridge';
import { EventEmitter } from 'events';

export class EventEmitterCommunicationBridge implements CommunicationBridge {
  private readonly _ee: EventEmitter;

  constructor() {
    this._ee = new EventEmitter();
  }

  subscribe<T = any>(event: string, handler: (payload: T) => void): { unsubscribe: () => void } {
    this._ee.on(event, handler);

    return {
      unsubscribe: () => this._ee.off(event, handler),
    };
  }

  publish<T = any>(event: string, payload: T): void {
    this._ee.emit(event, payload);
  }
}
