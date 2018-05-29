import {IResolvers} from 'graphql-tools';
import { mergeGraphQLSchemas } from '@graphql-modules/epoxy';

export interface IGraphQLContext {
  [key: string]: any;
}

export type BuildContextFn = (networkContext?: any) => IGraphQLContext;

export type Context<Impl = any> = {
  [P in keyof Impl]: Impl[P];
};

export class GraphQLModule<Impl = any>{
  private readonly _name: string;
  private readonly _typeDefs: string;
  private readonly _resolvers: IResolvers = {};
  private _impl: Impl = null;
  private _contextBuilder: BuildContextFn = null;

  constructor(name: string, typeDefs: string | string[], resolvers?: IResolvers, implementation?: Impl, contextBuilder?: BuildContextFn) {
    this._name = name;
    this._typeDefs = Array.isArray(typeDefs) ? mergeGraphQLSchemas(typeDefs) : typeDefs;
    this._resolvers = resolvers || {};
    this._impl = implementation;
    this._contextBuilder = contextBuilder;
  }

  get typeDefs(): string {
    return this._typeDefs;
  }

  get implementation(): Impl | null {
    return this._impl;
  }

  get contextBuilder(): BuildContextFn {
    return this._contextBuilder;
  }

  get resolvers(): IResolvers {
    return this._resolvers;
  }

  setImplementation(implementation: Impl): void {
    this._impl = implementation;
  }

  setContextBuilder(contextBuilder: BuildContextFn) {
    this._contextBuilder = contextBuilder;
  }
}
