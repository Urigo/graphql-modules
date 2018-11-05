import { Provider, Type, ValueProvider, ClassProvider, OnRequest, ServiceIdentifier, FactoryProvider, Factory } from './types';
import { GraphQLModule } from '../graphql-module';
export { __decorate as decorate } from 'tslib';

const DESIGN_PARAM_TYPES = 'design:paramtypes';
declare var Reflect: any;

function getServiceIdentifierName<T>(serviceIdentifier: ServiceIdentifier<T>) {
  return serviceIdentifier['name'] || serviceIdentifier.toString();
}
/**
 * @hidden
 */

export class ServiceIdentifierNotFoundError<T> extends Error {
  constructor(protected _serviceIdentifier: ServiceIdentifier<T>) {
    super(`${getServiceIdentifierName(_serviceIdentifier)} not provided in that scope!`);
    Object.setPrototypeOf(this, ServiceIdentifierNotFoundError.prototype);
  }

  get serviceIdentifier(): ServiceIdentifier<T> {
    return this._serviceIdentifier;
  }
}

export class DependencyNotFoundError<Dependency, Dependent> extends Error {
  constructor(private _dependency: ServiceIdentifier<Dependency>, private _dependent: ServiceIdentifier<Dependent>) {
    super(`
    ${getServiceIdentifierName(_dependency)} couldn't be injected into ${getServiceIdentifierName(_dependent)} because ${getServiceIdentifierName(_dependency)} is not provided in that scope!
  `);
    Object.setPrototypeOf(this, DependencyNotFoundError.prototype);
  }

  get dependency(): ServiceIdentifier<Dependency> {
    return this._dependency;
  }

  get dependent(): ServiceIdentifier<Dependent> {
    return this._dependent;
  }
}
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
        throw new DependencyNotFoundError(e.serviceIdentifier, clazz);
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

function isType<T>(v: Provider<T>): v is Type<T> {
  return typeof v === 'function';
}

function isValue<T>(v: Provider<T>): v is ValueProvider<T> {
  return 'useValue' in v;
}

function isClass<T>(v: Provider<T>): v is ClassProvider<T> {
  return 'useClass' in v;
}

function isFactory<T>(v: Provider<T>): v is FactoryProvider<T> {
  return 'useFactory' in v;
}

export function Inject<Dependency>(serviceIdentifier: ServiceIdentifier<Dependency>) {
  return (target: any, _targetKey: any, index: number) => {
    const dependencies = Reflect.getMetadata(DESIGN_PARAM_TYPES, target) || [];
    if (!dependencies) {
      throw new Error('You must decorate the provider class with @Injectable()');
    }
    dependencies[index] = serviceIdentifier;
    Reflect.defineMetadata(DESIGN_PARAM_TYPES, dependencies, target);
    return target;
  };
}

export function Injectable() {
  return (target: any) => {
    if (!Reflect.hasMetadata(DESIGN_PARAM_TYPES, target)) {
      Reflect.defineMetadata(DESIGN_PARAM_TYPES, [], target);
    }
    return target;
  };
}
