import { Injectable } from '../di/types';

@Injectable()
export abstract class CommunicationBridge<EventMap = any> {
  abstract subscribe<Event extends keyof EventMap, Payload = EventMap[Event]>(event: Event, handler: (payload: Payload) => void): { unsubscribe: () => void };
  abstract publish<Event extends keyof EventMap, Payload = EventMap[Event]>(event: Event, payload: Payload): void;
}
