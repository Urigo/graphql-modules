import { GraphQLFieldResolver, GraphQLTypeResolver } from 'graphql';
import { Injector } from '../di/index.js';

export type ID = string;
export type Nil = undefined | null;
export type Maybe<T> = T | Nil;
export type Plural<T> = T | T[];
export type Single<T> = T extends Array<infer R> ? R : T;
export type ValueOrPromise<T> = T | Promise<T>;
export type ResolveFn<TContext = GraphQLModules.Context> = GraphQLFieldResolver<
  any,
  TContext,
  Record<string, any>
>;
export type ResolveTypeFn<TContext = GraphQLModules.Context> =
  GraphQLTypeResolver<any, TContext>;

declare global {
  namespace GraphQLModules {
    export type ModuleContext = {
      injector: Injector;
      moduleId: ID;
    } & GlobalContext;

    export type AppContext = Omit<ModuleContext, 'moduleId'>;

    export type Context = ModuleContext;

    export interface GlobalContext {}
  }
}
