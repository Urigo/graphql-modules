import { injectable } from 'inversify';

@injectable()
export abstract class CommunicationBridge {
  abstract subscribe<T = any>(event: string, handler: (payload: T) => void): { unsubscribe: () => void };
  abstract publish<T = any>(event: string, payload: T): void;
}
