import { Container, interfaces, decorate, injectable } from 'inversify';
import { Provider, Type, ValueProvider, ClassProvider, OnRequest } from './types';
import { GraphQLModule } from '../graphql-module';

export { decorate };

/**
 * @hidden
 */
export class Injector {

  children: Injector[];

  constructor(public container = new Container({
    defaultScope: 'Singleton',
    autoBindInjectable: false,
  })) {}

  public provide<T>(provider: Provider<T>): void {
    if (Array.isArray(provider)) {
      return provider.forEach(p => this.provide(p));
    }

    if (isType(provider)) {
      this.container.bind<T>(provider)
        .toSelf()
        .inSingletonScope();
    } else if (isValue(provider)) {
      this._provide<T>(provider.provide, provider.overwrite).toConstantValue(
        provider.useValue,
      );
    } else if (isClass(provider)) {
      this._provide(provider.provide, provider.overwrite)
        .to(provider.useClass)
        .inSingletonScope();
    } else {
      throw new Error(`Couldn't provide  ${provider}`);
    }
  }

  private _provide<T>(
    token: interfaces.ServiceIdentifier<T>,
    overwrite = false,
  ) {
    if (overwrite === true) {
      return this.ensure(token);
    }

    return this.container.bind(token);
  }

  private ensure<T>(
    token: interfaces.ServiceIdentifier<T>,
  ): interfaces.BindingToSyntax<T> {
    if (this.container.isBound(token)) {
      return this.container.rebind(token);
    }

    return this.container.bind<T>(token);
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

  public isBound<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): boolean {
    if (this.container.isBound(serviceIdentifier)) {
      return true;
    } else {
      for (const child of this.children) {
        if (child.isBound(serviceIdentifier)) {
          return true;
        }
      }
    }
    return false;
  }

  public get<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): T {
    if (this.container.isBound(serviceIdentifier)) {
      return this.container.get(serviceIdentifier);
    } else {
      for (const child of this.children) {
        if (child.isBound(serviceIdentifier)) {
          return child.get(serviceIdentifier);
        }
      }
    }
    throw new Error(`No matching bindings found for serviceIdentifier: ${String(serviceIdentifier)}`);
  }

  public getByProvider<T>(provider: Provider<T>) {
    if (isType<T>(provider)) {
      return this.get<T>(provider);
    } else {
      return this.get<T>(provider.provide);
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

export function ResolversHandler(resolversType: string) {
  return (target: any): any => {
    target['resolversType'] = resolversType;
    return injectable()(target);
  };
}
