import { ModuleSessionInfo } from './module-session-info';
import { Injector } from '@graphql-modules/di';
import { GraphQLModule } from './graphql-module';

export interface OnInit<Config = any, Session extends object = any, Context = any> {
  onInit(module: GraphQLModule<Config, Session, Context>): void;
}

export interface OnRequest<Config = any, Session extends object = any, Context = any> {
  onRequest(moduleSessionInfo: ModuleSessionInfo<Config, Session, Context>): Promise<void> | void;
}

export interface OnResponse<Config = any, Session extends object = any, Context = any> {
  onResponse(moduleSessionInfo: ModuleSessionInfo<Config, Session, Context>): Promise<void> | void;
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

export interface SubscriptionHooks<
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
