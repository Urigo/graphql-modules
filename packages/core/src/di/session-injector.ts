import { Injector } from './injector';
import { ServiceIdentifier, OnRequest } from './types';
import { GraphQLModule } from '..';

export class SessionInjector {
  _sessionInstanceMap = new Map<ServiceIdentifier<any>, any>();
  constructor(public applicationInjector: Injector) {}
  public get<T>(serviceIdentifier: ServiceIdentifier<T>): T {
    if (this._sessionInstanceMap.has(serviceIdentifier)) {
      return this._sessionInstanceMap.get(serviceIdentifier);
    } else {
      const instance = this.applicationInjector.get(serviceIdentifier);
      if (this.applicationInjector._sessionScopeSet.has(serviceIdentifier)) {
        this._sessionInstanceMap.set(serviceIdentifier, instance);
      }
      return instance;
    }
  }
  public async callRequestHook<T extends OnRequest<Config, Request, Context>, Config, Request, Context>(
    serviceIdentifier: ServiceIdentifier<T>,
    request: Request,
    context: Context,
    module: GraphQLModule<Config, Request, Context>,
    ): Promise<void> {

    const instance = this.get(serviceIdentifier);

    if (
      instance &&
      typeof instance !== 'string' &&
      typeof instance !== 'number' &&
      'onRequest' in instance
      ) {
      return instance.onRequest(request, context, module);
    }
  }
}
