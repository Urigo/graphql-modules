import { Provider, ServiceIdentifier, Factory, OnRequest } from './types';
import { isType, isValue, isClass, isFactory, DESIGN_PARAM_TYPES } from '../utils';
import { GraphQLModule } from '../graphql-module';
import { ServiceIdentifierNotFoundError, DependencyProviderNotFoundError } from '../errors';

declare var Reflect: any;

export class Injector {
  children = new Array<Injector>();
  types = new Array<any>();
  valueMap = new Map();
  classMap = new Map();
  factoryMap = new Map();
  instanceMap = new Map();
  public provide<T>(provider: Provider<T>): void {
    if (Array.isArray(provider)) {
      return provider.forEach(p => this.provide(p));
    }
    if (isType(provider)) {
      this.types.push(provider);
    } else if (isValue(provider)) {
      this.valueMap.set(provider.provide, provider.useValue);
    } else if (isClass(provider)) {
      this.classMap.set(provider.provide, provider.useClass);
    } else if (isFactory(provider)) {
      this.factoryMap.set(provider.provide, provider.useFactory);
    } else {
      throw new Error(`Couldn't provide  ${provider}`);
    }
  }
  public get<T>(serviceIdentifier: ServiceIdentifier<T>): T {
    if (this.types.includes(serviceIdentifier)) {
      if (!this.instanceMap.has(serviceIdentifier)) {
        this.instanceMap.set(serviceIdentifier, this.instantiate(serviceIdentifier));
      }
      return this.instanceMap.get(serviceIdentifier);
    } else if (this.valueMap.has(serviceIdentifier)) {
      return this.valueMap.get(serviceIdentifier);
    } else if (this.classMap.has(serviceIdentifier)) {
      const realClazz = this.classMap.get(serviceIdentifier);
      if (!this.instanceMap.has(realClazz)) {
        this.instanceMap.set(realClazz, this.instantiate(realClazz));
      }
      return this.instanceMap.get(realClazz);
    } else if (this.factoryMap.has(serviceIdentifier)) {
      if (!this.instanceMap.has(serviceIdentifier)) {
        const factory = this.factoryMap.get(serviceIdentifier);
        this.instanceMap.set(serviceIdentifier, this.callFactory(factory));
      }
      return this.instanceMap.get(serviceIdentifier);
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
      throw new ServiceIdentifierNotFoundError(serviceIdentifier);
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
        throw new DependencyProviderNotFoundError(e.serviceIdentifier, clazz);
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
    if (Array.isArray(provider)) {
      return provider.forEach(p => this.init(p));
    }
    this.getByProvider(provider);
  }

  public async callRequestHookByProvider<T extends OnRequest<Config, Request, Context>, Config, Request, Context>(
    provider: Provider<T>,
    request: Request,
    context: Context,
    appModule: GraphQLModule<Config, Request, Context>,
    ): Promise<void> {

    const instance = this.getByProvider(provider);

    if (instance && 'onRequest' in instance) {
      return instance.onRequest(request, context, appModule);
    }
  }
}
