import { interfaces } from 'inversify';
import { GraphQLModule } from '../graphql-module';
export { injectable as Injectable } from 'inversify';

const DESIGN_PARAM_TYPES = 'design:paramtypes';
declare var Reflect: any;
export function Inject(serviceIdentifier: interfaces.ServiceIdentifier<any>) {
  return (target: any, _targetKey: any, index: any) => {
    const types = Reflect.getMetadata(DESIGN_PARAM_TYPES, target) || [];
    types[index] = serviceIdentifier;
    Reflect.defineMetadata(DESIGN_PARAM_TYPES, types, target);
    return target;
  };
}

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
