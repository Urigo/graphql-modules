import { GraphQLModule } from './graphql-module';
import { SessionInjector, ServiceIdentifier } from './di';
import { OnRequest } from './types';

export class ModuleSessionInfo<Config = any, Request = any, Context = any> {
  private _injector: SessionInjector<Request>;
  constructor(
    private _module: GraphQLModule<Config, Request, Context>,
    private _request: Request,
    private _context: Context,
  ) {
    this._injector = new SessionInjector(_module.injector, _request);
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
    return this._injector;
  }
  public async callRequestHook<T extends OnRequest<Config, Request, Context>>(
    serviceIdentifier: ServiceIdentifier<T>,
    ): Promise<void> {

    const instance = this._injector.get<T>(serviceIdentifier);

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
