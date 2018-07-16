import { Container } from 'inversify';

import { Provider, Type, ValueProvider, ClassProvider } from './types';

export class Injector extends Container {
  public provide(provider: Provider): void {
    if (Array.isArray(provider)) {
      return provider.forEach(p => this.provide(p));
    }

    if (isType(provider)) {
      this.bind(provider).toSelf().inSingletonScope();
    } else if (isValue(provider)) {
      this.bind(provider.provide).toConstantValue(provider.useValue);
    } else if (isClass(provider)) {
      this.bind(provider.provide).to(provider.useClass).inSingletonScope();
    } else {
      throw new Error(`Couldn't provide ${provider}`);
    }
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
