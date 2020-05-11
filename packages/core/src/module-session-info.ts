import { GraphQLModule } from './graphql-module';
import { ModuleContext } from './types';

export class ModuleSessionInfo<Config = any, Session extends object = any, Context = any> {
  constructor(private _module: GraphQLModule<Config, Session, Context>, private _session: Session) {
    this.injector.provide({
      provide: ModuleSessionInfo,
      useValue: this,
      overwrite: true,
    });
  }
  get module() {
    return this._module;
  }
  get session() {
    return this._session;
  }
  get cache() {
    return this.module.selfCache;
  }
  context: ModuleContext<Context>;
  get injector() {
    return this.module.injector.getSessionInjector(this.session);
  }
  get injectorAsync() {
    return this.module.injectorAsync.then(injector => injector.getSessionInjector(this.session));
  }
  get config() {
    return this.module.config;
  }
  get name() {
    return this.module.name;
  }
}
