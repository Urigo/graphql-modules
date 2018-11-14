import { GraphQLModule } from './graphql-module';
import { SessionInjector } from './di';
import { MODULE_NAME_MODULE_SESSION_INFO_MAP } from './utils';

export class ModuleSessionInfo<Config = any, Request = any, Context = any> {
  private _injector: SessionInjector<Config, Request, Context>;
  constructor(
    private _module: GraphQLModule<Config, Request, Context>,
    private _request: Request,
    private _context: Context,
  ) {
    this.injector = new SessionInjector<Config, Request, Context>(_module.injector, this);
    _request[MODULE_NAME_MODULE_SESSION_INFO_MAP] = _request[MODULE_NAME_MODULE_SESSION_INFO_MAP] || new Map<string, ModuleSessionInfo<any, Request, any>>();
    _request[MODULE_NAME_MODULE_SESSION_INFO_MAP].set(_module.name, this);
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
  set injector(injector: SessionInjector<Config, Request, Context>) {
    this._injector = injector;
  }
}
