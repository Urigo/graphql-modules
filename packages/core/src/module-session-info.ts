import { GraphQLModule } from './graphql-module';
import { ServiceIdentifier } from '@graphql-modules/di';
import { OnRequest } from './types';

export class ModuleSessionInfo<Config = any, Session = any, Context = any> {
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
  get context() {
    return this.module.getModuleNameContextMap(this.session).get(this.module.name);
  }
  get injector() {
    return this.module.injector.getSessionInjector(this.session);
  }
  get config() {
    return this.module.config;
  }
  get name() {
    return this.module.name;
  }
  public async callSessionHook<T extends OnRequest<Config, Session, Context>>(
    serviceIdentifier: ServiceIdentifier<T>,
    ): Promise<void> {

    const instance = this.injector.get<T>(serviceIdentifier);

    if (
      instance &&
      typeof instance !== 'string' &&
      typeof instance !== 'number'
      ) {
      if ('onRequest' in instance) {
        return instance.onRequest(this);
      }
      if ('initialize' in instance) {
        return instance['initialize'](this);
      }
    }
  }
}
