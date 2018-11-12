import { Provider, ServiceIdentifier, Factory, OnRequest } from './types';
import { isType, DESIGN_PARAM_TYPES, isValueProvider, isClassProvider, isFactoryProvider, isTypeProvider } from './utils';
import { GraphQLModule } from '../graphql-module';
import { ServiceIdentifierNotFoundError, DependencyProviderNotFoundError, ProviderNotValidError } from '../errors';

declare var Reflect: any;

export class Injector {
  public children = new Set<Injector>();
  private _types = new Set<any>();
  private _valueMap = new Map();
  private _classMap = new Map();
  private _factoryMap = new Map();
  private _instanceMap = new Map();
  constructor(public moduleName: string) {}
  public provide<T>(provider: Provider<T>): void {
    if (isTypeProvider(provider)) {
      this._types.add(provider);
    } else if (isValueProvider(provider)) {
      if (this._valueMap.has(provider.provide) && !provider.overwrite) {
        throw new Error(`Provider #`);
      }
      this._valueMap.set(provider.provide, provider.useValue);
    } else if (isClassProvider(provider)) {
      this._classMap.set(provider.provide, provider.useClass);
    } else if (isFactoryProvider(provider)) {
      this._factoryMap.set(provider.provide, provider.useFactory);
    } else {
      throw new ProviderNotValidError(this.moduleName, provider['provide'] && JSON.stringify(provider));
    }
  }
  public get<T>(serviceIdentifier: ServiceIdentifier<T>): T {
      if (this._types.has(serviceIdentifier)) {
        if (!this._instanceMap.has(serviceIdentifier)) {
          this._instanceMap.set(serviceIdentifier, this.instantiate(serviceIdentifier));
        }
        return this._instanceMap.get(serviceIdentifier);
      } else if (this._valueMap.has(serviceIdentifier)) {
        return this._valueMap.get(serviceIdentifier);
      } else if (this._classMap.has(serviceIdentifier)) {
        const realClazz = this._classMap.get(serviceIdentifier);
        if (!this._instanceMap.has(realClazz)) {
          this._instanceMap.set(realClazz, this.instantiate(realClazz));
        }
        return this._instanceMap.get(realClazz);
      } else if (this._factoryMap.has(serviceIdentifier)) {
        if (!this._instanceMap.has(serviceIdentifier)) {
          const factory = this._factoryMap.get(serviceIdentifier);
          this._instanceMap.set(serviceIdentifier, this.callFactory(factory));
        }
        return this._instanceMap.get(serviceIdentifier);
      } else {
        for (const child of this.children) {
          try {
            return child.get(serviceIdentifier);
          } catch (e) {
            if (e instanceof ServiceIdentifierNotFoundError) {
              continue;
            } else {
              throw e;
            }
          }
        }
        throw new ServiceIdentifierNotFoundError(serviceIdentifier, this.moduleName);
      }
  }

  public instantiate<T>(clazz: any): T {
    try {
      const dependencies = Reflect.getMetadata(DESIGN_PARAM_TYPES, clazz);
      if (!dependencies) {
        throw new Error('You must decorate the provider class with @Injectable()');
      }
      const dependencyInstances = dependencies.map((dependency: any) => this.get(dependency));
      const instance = new clazz(...dependencyInstances);
      return instance;
    } catch (e) {
      if (e instanceof ServiceIdentifierNotFoundError) {
        throw new DependencyProviderNotFoundError(e.serviceIdentifier, clazz, this.moduleName);
      } else {
        throw e;
      }
    }
  }

  public callFactory<T>(factory: Factory<T>) {
    return factory(this);
  }

  public getByProvider<T>(provider: Provider<T>) {
    if (isType<T>(provider)) {
      return this.get<T>(provider);
    } else {
      return this.get<T>(provider.provide);
    }
  }

  public init<T>(provider: Provider<T>): void {
    this.getByProvider(provider);
  }

  public async callRequestHookByProvider<T extends OnRequest<Config, Request, Context>, Config, Request, Context>(
    provider: Provider<T>,
    request: Request,
    context: Context,
    appModule: GraphQLModule<Config, Request, Context>,
    ): Promise<void> {

    const instance = this.getByProvider(provider);

    if (
      instance &&
      typeof instance !== 'string' &&
      typeof instance !== 'number' &&
      'onRequest' in instance
      ) {
      return instance.onRequest(request, context, appModule);
    }
  }
}
