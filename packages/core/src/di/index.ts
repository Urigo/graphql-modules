import { decorate, injectable, interfaces } from 'inversify';
import { Provider, Type, ValueProvider, ClassProvider, OnRequest } from './types';
import { GraphQLModule } from '../graphql-module';

export { decorate };

const PARAM_TYPES = 'inversify:paramtypes';

declare var Reflect: any;
/**
 * @hidden
 */
export class Injector {
  children: Injector[];
  types = new Array<any>();
  valueMap = new Map();
  classMap = new Map();
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
    } else {
      throw new Error(`Couldn't provide  ${provider}`);
    }
  }
  public get<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): T {
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
    } else {
      for (const child of this.children) {
        try {
          return child.get(serviceIdentifier);
        } catch (e) {}
      }
      throw new Error((serviceIdentifier['name'] || serviceIdentifier.toString()) + 'not found!');
    }
}

  public instantiate<T>(clazz: any): T {
    const dependencies = Reflect.getMetadata(PARAM_TYPES, clazz) || [];
    const dependencyInstances = dependencies.map((dependency: any) => this.get(dependency));
    const instance = new clazz(...dependencyInstances);
    return instance;
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

export function InjectFn<Fn, Dependency>(fn: Fn, ...dependencies: Dependency[]): Fn {
  fn['dependencies'] = dependencies;
  return fn;
}
