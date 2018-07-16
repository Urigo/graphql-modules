import { IResolvers } from 'graphql-tools';
import { mergeGraphQLSchemas } from '@graphql-modules/epoxy';
import { Provider, Injector } from './di/types';

export interface IGraphQLContext {
  [key: string]: any;
}

export type BuildContextFn = (
  networkContext: any,
  currentContext: Context,
) => IGraphQLContext;

export type Context = {
  injector: Injector;
  [key: string]: any;
};

export type ModuleDependency = GraphQLModule | string;

export interface GraphQLModuleOptions {
  name: string;
  typeDefs?:
    | string
    | string[]
    | ((initParams?: any, initResult?: any) => string | string[]);
  resolvers?: IResolvers | ((initParams?: any, initResult?: any) => IResolvers);
  contextBuilder?: BuildContextFn;
  dependencies?: (() => ModuleDependency[]) | string[];
  providers?: Provider[];
}

export const ModuleConfig = (name: string) => Symbol.for(`ModuleConfig.${name}`);

export class GraphQLModule<Config = any> {
  private readonly _name: string;
  private _resolvers: IResolvers = {};
  private _typeDefs: string;
  private _providers: Provider[] = null;
  private _contextBuilder: BuildContextFn = null;
  private _options: GraphQLModuleOptions;
  private _moduleConfig: Config = null;

  constructor(options: GraphQLModuleOptions) {
    this._options = options;
    this._name = options.name;
    this._typeDefs =
      options.typeDefs &&
      (typeof options.typeDefs === 'function'
        ? null
        : Array.isArray(options.typeDefs)
          ? mergeGraphQLSchemas(options.typeDefs)
          : options.typeDefs);
    this._resolvers =
      typeof options.resolvers === 'function' ? null : options.resolvers || {};
    this._providers = options.providers || null;
    this._contextBuilder = options.contextBuilder || null;
  }

  withConfig(config: Config): this {
    this._moduleConfig = config;

    return this;
  }

  get dependencies(): ModuleDependency[] {
    return (
      (typeof this.options.dependencies === 'function'
        ? this.options.dependencies()
        : this.options.dependencies) || []
    );
  }

  get config(): Config {
    return this._moduleConfig;
  }

  get options(): GraphQLModuleOptions {
    return this._options;
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

  get contextBuilder(): BuildContextFn {
    return this._contextBuilder;
  }

  get resolvers(): IResolvers {
    return this._resolvers;
  }

  set resolvers(value: IResolvers) {
    this._resolvers = value;
  }

  get providers() {
    return this._providers;
  }

  setContextBuilder(contextBuilder: BuildContextFn) {
    this._contextBuilder = contextBuilder;
  }
}
