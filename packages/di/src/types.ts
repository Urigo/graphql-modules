import { Injector } from './injector';

export interface Abstract<T> {
  prototype: T;
}
export type ServiceIdentifier<T> = string | symbol | Type<T> | Abstract<T>;

export type Type<T> = new (...args: any[]) => T;

export interface ValueProvider<T> extends BaseProvider<T> {
  useValue: T;
}

export interface ClassProvider<T> extends BaseProvider<T> {
  useClass: Type<T>;
}

export type Factory<T> = (injector: Injector) => T;

export interface FactoryProvider<T> extends BaseProvider<T> {
  useFactory: Factory<T>;
}

export interface BaseProvider<T> extends ProviderOptions {
  provide: ServiceIdentifier<T>;
}

export interface TypeProvider<T> extends Type<T> {}

export type Provider<T = any> = TypeProvider<T> | ValueProvider<T> | ClassProvider<T> | FactoryProvider<T>;

export interface ProviderOptions {
  overwrite?: boolean;
  scope?: ProviderScope;
}

export enum ProviderScope {
  Application = 'APPLICATION',
  Request = 'REQUEST',
  Session = 'SESSION'
}

export type Instances<Dependencies extends Array<ServiceIdentifier<any>>> = {
  [Key in keyof Dependencies]: Dependencies[Key] extends Type<any> ? InstanceType<Dependencies[Key]> : any
};
export type ExtendedSession<Session> = Session & { nameSessionInjectorMap: Map<string, Injector> };
