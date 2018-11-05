import { CommunicationBridge } from './communication-bridge';
import { EventEmitter } from 'events';
import { Injectable } from '../di';

@Injectable()
export class EventEmitterCommunicationBridge<EventMap = any> implements CommunicationBridge<EventMap> {
  private readonly _ee = new EventEmitter();

  subscribe<Event extends keyof EventMap, Payload = EventMap[Event]>(event: Event, handler: (payload: Payload) => void): { unsubscribe: () => void } {
    this._ee.on(event as string, handler);

    return {
      unsubscribe: () => this._ee.off(event as string, handler),
    };
  }

  publish<Event extends keyof EventMap, Payload = EventMap[Event]>(event: Event, payload: Payload): void {
    this._ee.emit(event as string, payload);
  }
}
