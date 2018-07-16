import { interfaces } from 'inversify';

export { injectable, inject, optional, LazyServiceIdentifer as Lazy } from 'inversify';
export interface Type<T> extends Function {
  new (...args: any[]): T;
}
export interface ValueProvider {
  provide: any;
  useValue: any;
}
export interface ClassProvider {
  provide: any;
  useClass: Type<any>;
}
export interface TypeProvider extends Type<any> {}
export type Provider = TypeProvider | ValueProvider | ClassProvider | any[];

export interface Injector {
    get<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): T;
}
