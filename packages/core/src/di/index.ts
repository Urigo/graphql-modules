import { Container, interfaces, decorate } from 'inversify';
import { Provider, Type, ValueProvider, ClassProvider } from './types';

export { decorate };

/**
 * @hidden
 */
export class Injector extends Container {
  public provide(provider: Provider): void {
    if (Array.isArray(provider)) {
      return provider.forEach(p => this.provide(p));
    }

    if (isType(provider)) {
      this.bind(provider)
        .toSelf()
        .inSingletonScope();
    } else if (isValue(provider)) {
      this._provide(provider.provide, provider.overwrite).toConstantValue(
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

    return this.bind(token);
  }

  public init(provider: Provider): void {
    if (Array.isArray(provider)) {
      return provider.forEach(p => this.init(p));
    }

    if (isType(provider)) {
      this.get(provider);
    } else if (isClass(provider)) {
      this.get(provider.provide);
    }
  }
}

function isType(v: any): v is Type<any> {
  return typeof v === 'function';
}

function isValue(v: any): v is ValueProvider {
  return typeof v.useValue !== 'undefined';
}

function isClass(v: any): v is ClassProvider {
  return typeof v.useClass !== 'undefined';
}
