import { GraphQLModule } from '../graphql-module';
import { Injector } from './injector';
import { SessionInjector } from './session-injector';

export interface Newable<T> {
  new (...args: any[]): T;
}
export interface Abstract<T> {
  prototype: T;
}
export type ServiceIdentifier<T> = (string | symbol | Newable<T> | Abstract<T>);

export interface Type<T> extends Function {
  new (...args: any[]): T;
}

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

export type ModuleContext<Context = { [key: string]: any }> = Context & { injector: SessionInjector };

export interface OnRequest<Config = any, Request = any, Context = any> {
  onRequest(request: Request, context: Context, appModule: GraphQLModule<Config, Request, Context>): Promise<void> | void;
}

export interface ProviderOptions {
  overwrite?: boolean;
  scope?: ProviderScope;
}

export const enum ProviderScope {
  Application = 'APPLICATION',
  Request = 'REQUEST',
  Session = 'SESSION',
}
