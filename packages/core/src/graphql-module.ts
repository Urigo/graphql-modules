import { IResolvers } from 'graphql-tools';
import { mergeGraphQLSchemas } from '@graphql-modules/epoxy';
import { Provider } from './di';

export interface IGraphQLContext {
  [key: string]: any;
}

export type BuildContextFn = (
  networkContext: any,
  allImplementations: any,
  currentContext: Context,
) => IGraphQLContext;
export type InitFn = (initParams: any, moduleConfig: any) => any;

export type Context<Impl = any> = { [P in keyof Impl]: Impl[P] };

export type ModuleDependency = GraphQLModule | string;

export interface GraphQLModuleOptions<Impl> {
  name: string;
  typeDefs?:
    | string
    | string[]
    | ((initParams?: any, initResult?: any) => string | string[]);
  resolvers?: IResolvers | ((initParams?: any, initResult?: any) => IResolvers);
  implementation?: Impl;
  contextBuilder?: BuildContextFn;
  onInit?: InitFn;
  dependencies?: (() => ModuleDependency[]) | string[];
  providers?: Provider[];
}

export const ModuleConfig = (name: string) => Symbol.for(`ModuleConfig.${name}`);

export class GraphQLModule<Impl = any, Config = any> {
  private readonly _name: string;
  private readonly _onInit: InitFn = null;
  private _resolvers: IResolvers = {};
  private _typeDefs: string;
  private _impl: Impl = null;
  private _providers: Provider[] = null;
  private _contextBuilder: BuildContextFn = null;
  private _options: GraphQLModuleOptions<Impl>;
  private _moduleConfig: Config = null;

  constructor(options: GraphQLModuleOptions<Impl>) {
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
    this._impl = options.implementation || null;
    this._providers = options.providers || null;
    this._contextBuilder = options.contextBuilder || null;
    this._onInit = options.onInit || null;
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

  get providers() {
    return this._providers;
  }

  setImplementation(implementation: Impl): void {
    this._impl = implementation;
  }

  setContextBuilder(contextBuilder: BuildContextFn) {
    this._contextBuilder = contextBuilder;
  }
}
