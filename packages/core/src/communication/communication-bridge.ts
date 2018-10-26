import { Injectable } from '../di/types';

@Injectable()
export abstract class CommunicationBridge {
  abstract subscribe<T = any>(event: string, handler: (payload: T) => void): { unsubscribe: () => void };
  abstract publish<T = any>(event: string, payload: T): void;
}
