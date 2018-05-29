export interface CommunicationBridge {
  subscribe<T = any>(event: string, handler: (payload: T) => void): { unsubscribe: () => void };
  publish<T = any>(event: string, payload: T): void;
}
