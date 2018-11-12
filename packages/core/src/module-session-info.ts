import { GraphQLModule } from './graphql-module';
import { SessionInjector } from './di';

export class ModuleSessionInfo<Config = any, Request = any, Context = any> {
  private _injector: SessionInjector<Config, Request, Context>;
  constructor(
    private _module: GraphQLModule<Config, Request, Context>,
    private _request: Request,
    private _context: Context,
  ) {}
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
  set injector(injector: SessionInjector<Config, Request, Context>) {
    this._injector = injector;
  }
}
