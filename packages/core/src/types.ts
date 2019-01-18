import { ModuleSessionInfo } from './module-session-info';
import { Injector } from '@graphql-modules/di';

export interface OnRequest<Config = any, Request = any, Context = any> {
  onRequest(moduleSessionInfo: ModuleSessionInfo<Config, Request, Context>): Promise<void> | void;
}

export type ModuleContext<Context = { [key: string]: any }> = Context & { injector: Injector };

export interface ISubscriptionHooks<ConnectionParams = object, WebSocket = any, ConnectionContext = any, SubscriptionContext = any> {
  onConnect?: (
    connectionParams: ConnectionParams,
    websocket: WebSocket,
    context: ConnectionContext,
  ) => SubscriptionContext | Promise<SubscriptionContext>;
  onOperationComplete?: (websocket: WebSocket, opId: string) => any;
  onOperation?: (message: any, params: any, webSocket: WebSocket) => any;
  onDisconnect?: (websocket: WebSocket, context: ConnectionContext) => any;
}
