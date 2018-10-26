import { Container, interfaces, decorate } from 'inversify';
import { Provider, Type, ValueProvider, ClassProvider } from './types';

export { decorate };

/**
 * @hidden
 */
export class Injector extends Container {
  public provide<T>(provider: Provider<T>): void {
    if (Array.isArray(provider)) {
      return provider.forEach(p => this.provide(p));
    }

    if (isType(provider)) {
      this.bind<T>(provider)
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

    return this.bind(token);
  }

  private ensure<T>(
    token: interfaces.ServiceIdentifier<T>,
  ): interfaces.BindingToSyntax<T> {
    if (this.isBound(token)) {
      return this.rebind(token);
    }

    return this.bind<T>(token);
  }

  public init<T>(provider: Provider<T>): void {
    if (Array.isArray(provider)) {
      return provider.forEach(p => this.init(p));
    }

    if (isType<T>(provider)) {
      this.get<T>(provider);
    } else if (isClass<T>(provider)) {
      this.get<T>(provider.provide);
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
