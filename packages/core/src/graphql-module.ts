import { IResolvers } from 'graphql-tools';
import { mergeGraphQLSchemas } from '@graphql-modules/epoxy';

export interface IGraphQLContext {
  [key: string]: any;
}

export type BuildContextFn = (networkContext: any, allImplementations: any, currentContext: Context) => IGraphQLContext;
export type InitFn = (initParams: any, moduleConfig: any) => any;

export type Context<Impl = any> = {
  [P in keyof Impl]: Impl[P];
};

export interface GraphQLModuleOptions<Impl> {
  name: string;
  typeDefs?: string | string [] | ((initParams?: any, initResult?: any) => (string | string[]));
  resolvers?: IResolvers | ((initParams?: any, initResult?: any) => IResolvers);
  implementation?: Impl;
  contextBuilder?: BuildContextFn;
  onInit?: InitFn;
}

export class GraphQLModule<Impl = any, Config = any> {
  private readonly _name: string;
  private readonly _onInit: InitFn = null;
  private _resolvers: IResolvers = {};
  private _typeDefs: string;
  private _impl: Impl = null;
  private _contextBuilder: BuildContextFn = null;
  private _options: GraphQLModuleOptions<Impl>;
  private _moduleConfig: Config = null;

  constructor(options: GraphQLModuleOptions<Impl>) {
    this._options = options;
    this._name = options.name;
    this._typeDefs =
      options.typeDefs && (typeof options.typeDefs === 'function' ? null : Array.isArray(options.typeDefs) ? mergeGraphQLSchemas(options.typeDefs) : options.typeDefs);
    this._resolvers = typeof options.resolvers === 'function' ? null : (options.resolvers || {});
    this._impl = options.implementation || null;
    this._contextBuilder = options.contextBuilder || null;
    this._onInit = options.onInit || null;
  }

  withConfig(config: Config): this {
    this._moduleConfig = config;

    return this;
  }

  get config(): Config {
    return this._moduleConfig;
  }

  get options(): GraphQLModuleOptions<Impl> {
    return this._options;
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

  set typeDefs(value: string) {
    this._typeDefs = Array.isArray(value) ? mergeGraphQLSchemas(value) : value;
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

  set resolvers(value: IResolvers) {
    this._resolvers = value;
  }

  setImplementation(implementation: Impl): void {
    this._impl = implementation;
  }

  setContextBuilder(contextBuilder: BuildContextFn) {
    this._contextBuilder = contextBuilder;
  }
}
