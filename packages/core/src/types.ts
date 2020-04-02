import { GraphQLScalarType } from 'graphql';
import { IResolverObject, IResolverOptions, IEnumResolver } from 'graphql-tools';
import { Injector } from '@graphql-modules/di';
import { ModuleSessionInfo } from './module-session-info';
import { GraphQLModule } from './graphql-module';

export type Resolvers<TSource = any, TContext = any> = Partial<{
  [key: string]:
    | (() => any)
    | Partial<IResolverObject<TSource, TContext>>
    | IResolverOptions<TSource, TContext>
    | GraphQLScalarType
    | IEnumResolver;
}>;

export interface OnInit<Config = any, Session extends object = any, Context = any> {
  onInit(module: GraphQLModule<Config, Session, Context>): void;
}

export interface OnRequest<Config = any, Session extends object = any, Context = any> {
  onRequest(moduleSessionInfo: ModuleSessionInfo<Config, Session, Context>): Promise<void> | void;
}

export interface OnResponse<Config = any, Session extends object = any, Context = any> {
  onResponse(moduleSessionInfo: ModuleSessionInfo<Config, Session, Context>): Promise<void> | void;
}

export type OnConnectFn<ConnectionParams = object, WebSocket = any, ConnectionContext = any, Result = any> = (
  connectionParams: ConnectionParams,
  websocket: WebSocket,
  connectionContext: ConnectionContext
) => Result | Promise<Result>;
export interface OnConnect<ConnectionParams = object, WebSocket = any, ConnectionContext = any, Result = any> {
  onConnect: OnConnectFn<ConnectionParams, WebSocket, ConnectionContext, Result>;
}

export type OnOperationFn<SubscriptionMessage = any, SubscriptionOptions = any, WebSocket = any, Result = any> = (
  message: SubscriptionMessage,
  params: SubscriptionOptions,
  WebSocket: WebSocket
) => Result;
export interface OnOperation<SubscriptionMessage = any, SubscriptionOptions = any, WebSocket = any, Result = any> {
  onOperation: OnOperationFn<SubscriptionMessage, SubscriptionOptions, WebSocket, Result>;
}

export type OnOperationCompleteFn<WebSocket = any, OpId = string, OnOperationCompleteResult = any> = (
  websocket: WebSocket,
  opId: OpId
) => OnOperationCompleteResult;
export interface OnOperationComplete<WebSocket = any, OpId = string, OnOperationCompleteResult = any> {
  onOperationComplete: OnOperationCompleteFn<WebSocket, OpId, OnOperationCompleteResult>;
}

export type OnDisconnectFn<WebSocket = any, ConnectionContext = any, Result = any> = (
  websocket: WebSocket,
  connectionContext: ConnectionContext
) => Result;
export interface OnDisconnect<WebSocket = any, ConnectionContext = any, Result = any> {
  onDisconnect: OnDisconnectFn<WebSocket, ConnectionContext, Result>;
}

export type OnErrorFn = (e: Error) => any;
export interface OnError {
  onError: OnErrorFn;
}

export interface SubscriptionHooks<
  ConnectionParams = object,
  WebSocket = any,
  ConnectionContext = any,
  SubscriptionMessage = any,
  SubscriptionOptions = any,
  OpId = string,
  OnConnectResult = any,
  OnOperationResult = any,
  OnOperationCompleteResult = any,
  OnDisconnectResult = any
> {
  onConnect: OnConnectFn<ConnectionParams, WebSocket, ConnectionContext, OnConnectResult>;
  onOperation: OnOperationFn<SubscriptionMessage, SubscriptionOptions, WebSocket, OnOperationResult>;
  onOperationComplete: OnOperationCompleteFn<WebSocket, OpId, OnOperationCompleteResult>;
  onDisconnect: OnDisconnectFn<WebSocket, ConnectionContext, OnDisconnectResult>;
}

export type ModuleContext<Context = { [key: string]: any }> = Context & { injector: Injector };
