import { ModuleSessionInfo } from './module-session-info';
import { Injector } from '@graphql-modules/di';

export interface OnRequest<Config = any, Request = any, Context = any> {
  onRequest(moduleSessionInfo: ModuleSessionInfo<Config, Request, Context>): Promise<void> | void;
}

export interface OnConnect<ConnectionParams = object, WebSocket = any, ConnectionSession = any, Result = any> {
  onConnect: (
    connectionParams: ConnectionParams,
    websocket: WebSocket,
    connectionSession: ConnectionSession,
  ) => Result | Promise<Result>;
}

export interface OnDisconnect<WebSocket = any, ConnectionContext = any, OnDisconnectResult = any> {
  onDisconnect?: (websocket: WebSocket, connectionSession: ConnectionContext) => OnDisconnectResult;
}

export interface ISubscriptionHooks<
  ConnectionParams = object,
  WebSocket = any,
  ConnectionSession = any,
  OnConnectResult = any,
  OnDisconnectResult = any> {
  onConnect?: (
    connectionParams: ConnectionParams,
    websocket: WebSocket,
    connectionSession: ConnectionSession,
  ) => OnConnectResult | Promise<OnConnectResult>;
  onDisconnect?: (websocket: WebSocket, connectionSession: ConnectionSession) => OnDisconnectResult;
}

export type ModuleContext<Context = { [key: string]: any }> = Context & { injector: Injector };
