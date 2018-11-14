import { ModuleSessionInfo } from './module-session-info';
import { SessionInjector } from './di';

export interface OnRequest<Config = any, Request = any, Context = any> {
  onRequest(moduleSessionInfo: ModuleSessionInfo<Config, Request, Context>): Promise<void> | void;
}

export type ModuleContext<Context = { [key: string]: any }, Request = any> = Context & { injector: SessionInjector<Request> };
