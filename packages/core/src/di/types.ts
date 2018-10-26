import { interfaces } from 'inversify';
export { injectable as Injectable, inject as Inject, optional as Optional } from 'inversify';

export interface Type<T> extends Function {
  new (...args: any[]): T;
}

export interface ValueProvider<T> extends BaseProvider {
  provide: interfaces.ServiceIdentifier<T>;
  useValue: T;
}

export interface ClassProvider<T> extends BaseProvider {
  provide: interfaces.ServiceIdentifier<T>;
  useClass: Type<T>;
}

export interface BaseProvider {
  overwrite?: boolean;
}

export interface TypeProvider<T> extends Type<T> {}

export type Provider<T = any> = TypeProvider<T> | ValueProvider<T> | ClassProvider<T>;

export interface Injector {
  get<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): T;
}

export type AppContext<Context = { [key: string]: any }> = Context & { injector: Injector };
