import { GraphQLModule } from './graphql-module';
import { ModuleContext } from './types';
import { ExecutionResult, ExecutionResultDataDefault } from 'graphql/execution/execute';

export class ModuleSessionInfo<Config = any, Session extends object = any, Context = any, ResponseData = ExecutionResultDataDefault> {
  constructor(
    private _module: GraphQLModule<Config, Session, Context>,
    private _session: Session,
  ) {
    this.injector.provide({
      provide: ModuleSessionInfo,
      useValue: this,
    });
  }
  get module() {
    return this._module;
  }
  get session() {
    return this._session;
  }
  get cache() {
    return this.module.cache;
  }
  context: ModuleContext<Context>;
  response: ExecutionResult<ResponseData>;
  get injector() {
    return this.module.injector.getSessionInjector(this.session);
  }
  get config() {
    return this.module.config;
  }
  get name() {
    return this.module.name;
  }
}
