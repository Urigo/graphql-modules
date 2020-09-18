import { readInjectableMetadata } from './metadata';

export const Type = Function;

/// @ts-ignore
export class InjectionToken<T> {
  constructor(private _desc: string) {}

  toString(): string {
    return `InjectionToken ${this._desc}`;
  }
}

export function isToken(v: any): v is InjectionToken<any> {
  return v && v instanceof InjectionToken;
}

export function isType(v: any): v is Type<any> {
  return typeof v === 'function' && v !== Object;
}

export interface AbstractType<T> extends Function {
  prototype: T;
}

export interface Type<T> extends Function {
  new (...args: any[]): T;
}

export interface ValueProvider<T> extends BaseProvider<T> {
  useValue: T;
}

export interface ClassProvider<T> extends BaseProvider<T> {
  useClass: Type<T>;
}

export type Factory<T> = (...args: any[]) => T;

export interface FactoryProvider<T> extends BaseProvider<T> {
  useFactory: Factory<T>;
  deps?: any[];
}

export interface BaseProvider<T> extends ProviderOptions {
  provide: Type<T> | InjectionToken<T>;
}

export interface TypeProvider<T> extends Type<T> {}

export type Provider<T = any> =
  | TypeProvider<T>
  | ValueProvider<T>
  | ClassProvider<T>
  | FactoryProvider<T>;

export interface ProviderOptions {
  scope?: Scope;
  executionContextIn?: Array<string | symbol>;
}

export enum Scope {
  Singleton,
  Operation,
}

export function onlySingletonProviders(providers: Provider[] = []): Provider[] {
  return providers.filter((provider) => {
    if (isType(provider)) {
      const { options } = readInjectableMetadata(provider, true);
      return options?.scope !== Scope.Operation;
    } else {
      return provider.scope !== Scope.Operation;
    }
  });
}

export function onlyOperationProviders(providers: Provider[] = []): Provider[] {
  return providers.filter((provider) => {
    if (isType(provider)) {
      const { options } = readInjectableMetadata(provider, true);
      return options?.scope === Scope.Operation;
    } else {
      return provider.scope === Scope.Operation;
    }
  });
}

export function isClassProvider(provider: any): provider is ClassProvider<any> {
  return typeof provider.useClass !== 'undefined';
}

export function isFactoryProvider(
  provider: any
): provider is FactoryProvider<any> {
  return typeof provider.useFactory !== 'undefined';
}
