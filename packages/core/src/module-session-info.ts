import { GraphQLModule } from './graphql-module';
import { ServiceIdentifier } from './di';
import { OnRequest } from './types';

export class ModuleSessionInfo<Config = any, Request = any, Context = any> {
  constructor(
    private _module: GraphQLModule<Config, Request, Context>,
    private _request: Request,
    private _context: Context,
  ) {
    this.injector.provide({
      provide: ModuleSessionInfo,
      useValue: this,
    });
  }
  get module() {
    return this._module;
  }
  get request() {
    return this._request;
  }
  get context() {
    return this._context;
  }
  get injector() {
    return this._module.injector.getSessionInjector(this.request);
  }
  public async callRequestHook<T extends OnRequest<Config, Request, Context>>(
    serviceIdentifier: ServiceIdentifier<T>,
    ): Promise<void> {

    const instance = this.injector.get<T>(serviceIdentifier);

    if (
      instance &&
      typeof instance !== 'string' &&
      typeof instance !== 'number' &&
      'onRequest' in instance
      ) {
      return instance.onRequest(this);
    }
  }
}
