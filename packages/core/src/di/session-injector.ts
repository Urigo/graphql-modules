import { Injector } from './injector';
import { ServiceIdentifier, OnRequest } from './types';
import { ModuleSessionInfo } from '../module-session-info';

export class SessionInjector<Config, Request, Context> {
  sessionScopeInstanceMap = new Map<ServiceIdentifier<any>, any>();
  constructor(
    public applicationInjector: Injector,
    private moduleSessionInfo: ModuleSessionInfo<Config, Request, Context>,
   ) {
    this.sessionScopeInstanceMap.set(ModuleSessionInfo, moduleSessionInfo);
  }
  public get<T>(serviceIdentifier: ServiceIdentifier<T>): T {
    return this.applicationInjector.get(serviceIdentifier, this.moduleSessionInfo.request);
  }
  public async callRequestHook<T extends OnRequest<Config, Request, Context>>(
    serviceIdentifier: ServiceIdentifier<T>,
    ): Promise<void> {

    const instance = this.get<T>(serviceIdentifier);

    if (
      instance &&
      typeof instance !== 'string' &&
      typeof instance !== 'number' &&
      'onRequest' in instance
      ) {
      return instance.onRequest(this.moduleSessionInfo);
    }
  }
}
