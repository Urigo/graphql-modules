import { IResolvers } from 'graphql-tools';
import { mergeGraphQLSchemas } from '@graphql-modules/epoxy';

export interface IGraphQLContext {
  [key: string]: any;
}

export type BuildContextFn = (networkContext?: any) => IGraphQLContext;
export type InitFn = (params: any) => any;

export type Context<Impl = any> = {
  [P in keyof Impl]: Impl[P];
};

export interface GraphQLModuleOptions<Impl> {
  name: string;
  typeDefs: string | string[];
  resolvers?: IResolvers;
  implementation?: Impl;
  contextBuilder?: BuildContextFn;
  onInit?: InitFn;
}

export class GraphQLModule<Impl = any> {
  private readonly _name: string;
  private readonly _typeDefs: string;
  private readonly _resolvers: IResolvers = {};
  private readonly _onInit: InitFn = null;
  private _impl: Impl = null;
  private _contextBuilder: BuildContextFn = null;

  constructor(options: GraphQLModuleOptions<Impl>) {
    this._name = options.name;
    this._typeDefs = Array.isArray(options.typeDefs) ? mergeGraphQLSchemas(options.typeDefs) : options.typeDefs;
    this._resolvers = options.resolvers || {};
    this._impl = options.implementation || null;
    this._contextBuilder = options.contextBuilder || null;
    this._onInit = options.onInit || null;
  }

  get onInit(): InitFn {
    return this._onInit;
  }

  get name(): string {
    return this._name;
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
