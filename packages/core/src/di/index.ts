import { Container, interfaces, decorate } from 'inversify';
import { Provider, Type, ValueProvider, ClassProvider, OnRequest } from './types';
import { GraphQLModule } from '../graphql-module';

export { decorate };

/**
 * @hidden
 */
export class Injector extends Container {

  constructor() {
    super({
      defaultScope: 'Singleton',
      autoBindInjectable: false,
    });
  }

  public provide<T>(provider: Provider<T>): void {
    if (Array.isArray(provider)) {
      return provider.forEach(p => this.provide(p));
    }

    if (isType(provider)) {
      super.bind<T>(provider)
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

    return super.bind(token);
  }

  private ensure<T>(
    token: interfaces.ServiceIdentifier<T>,
  ): interfaces.BindingToSyntax<T> {
    if (this.isBound(token)) {
      return super.rebind(token);
    }

    return super.bind<T>(token);
  }

  public init<T>(provider: Provider<T>): void {
    if (Array.isArray(provider)) {
      return provider.forEach(p => this.init(p));
    }

    if (isType<T>(provider)) {
      super.get<T>(provider);
    } else if (isClass<T>(provider)) {
      super.get<T>(provider.provide);
    }
  }

  public async callRequestHook<T extends OnRequest<Config, Request, Context>, Config, Request, Context>(
    provider: Provider<T>,
    request: Request,
    context: Context,
    appModule: GraphQLModule<Config, Request, Context>,
    ): Promise<void> {

    let instance;
    if (isType<T>(provider)) {
      instance = super.get<T>(provider);
    } else if (isClass<T>(provider)) {
      instance = super.get<T>(provider.provide);
    }

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
