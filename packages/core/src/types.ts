import { ModuleSessionInfo } from './module-session-info';
import { Injector } from '@graphql-modules/di';

export interface OnRequest<Config = any, Request = any, Context = any> {
  onRequest(moduleSessionInfo: ModuleSessionInfo<Config, Request, Context>): Promise<void> | void;
}

export type ModuleContext<Context = { [key: string]: any }> = Context & { injector: Injector };
