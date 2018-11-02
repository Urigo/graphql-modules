import { interfaces } from 'inversify';
import { GraphQLModule } from '../graphql-module';
export { Inject } from './index';

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

export type ModuleContext<Context = { [key: string]: any }> = Context & { injector: Injector };

export interface OnRequest<Config = any, Request = any, Context = any> {
  onRequest(request: Request, context: Context, appModule: GraphQLModule<Config, Request, Context>): Promise<void> | void;
}
