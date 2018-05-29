export interface CommunicationBridge<Payload = any> {
  subscribe(event: string, handler: (payload: Payload) => void): { unsubscribe: () => void };
  publish(event: string, payload: Payload): void;
}
