import { interfaces } from 'inversify';
export { injectable, inject, optional } from 'inversify';

export interface Type<T> extends Function {
  new (...args: any[]): T;
}

export interface ValueProvider<T = any> extends BaseProvider {
  provide: interfaces.ServiceIdentifier<T>;
  useValue: any;
}

export interface ClassProvider<T = any> extends BaseProvider {
  provide: interfaces.ServiceIdentifier<T>;
  useClass: Type<any>;
}

export interface BaseProvider {
  overwrite?: boolean;
}

export interface TypeProvider extends Type<any> {}

export type Provider = TypeProvider | ValueProvider | ClassProvider | any[];

export interface Injector {
  get<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): T;
}

export type AppContext<Context = { [key: string]: any }> = Context & { injector: Injector };
