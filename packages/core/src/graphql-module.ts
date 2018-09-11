import { IResolvers } from 'graphql-tools';
import { mergeGraphQLSchemas } from '@graphql-modules/epoxy';
import { Provider, Injector, AppContext } from './di/types';
import { DocumentNode } from 'graphql';

/**
 * Object defining the structure of GraphQL context object
 */
export interface IGraphQLContext {
  [key: string]: any;
}

/**
 * A context builder method signature for `contextBuilder`.
 */
export type BuildContextFn = (
  networkRequest: any,
  currentContext: AppContext,
  injector: Injector,
) => IGraphQLContext;

/**
 * Defines the structure of a dependency as it declared in each module's `dependencies` field.
 */
export type ModuleDependency = GraphQLModule | string;

/**
 * Defined the structure of GraphQL module options object.
 */
export interface GraphQLModuleOptions {
  /**
   * The name of the module. Use it later to get your `ModuleConfig(name)` or to declare
   * a dependency to this module (in another module)
   */
  name: string;
  /**
   * A definition of GraphQL type definitions, as string or `DocumentNode`.
   * Arrays are also accepted, and they will get merged.
   * You can also pass a function that will get the module's config as argument, and should return
   * the type definitions.
   */
  typeDefs?: string | string[] | DocumentNode | DocumentNode[] | ((config: any) => string | string[] | DocumentNode | DocumentNode[]);
  /**
   * Resolvers object, or a function will get the module's config as argument, and should
   * return the resolvers object.
   */
  resolvers?: IResolvers | ((config: any) => IResolvers);
  /**
   * Context builder method. Use this to add your own fields and data to the GraphQL `context`
   * of each execution of GraphQL.
   */
  contextBuilder?: BuildContextFn;
  /**
   * The dependencies that this module need to run correctly, you can either provide the `GraphQLModule`,
   * or provide a string with the name of the other module.
   * Adding a dependency will effect the order of the type definition building, resolvers building and context
   * building.
   */
  dependencies?: (() => ModuleDependency[] | string[]) | string[] | ModuleDependency[];
  /**
   * A list of `Providers` to load into the GraphQL module.
   * It could be either a `class` or a value/class instance.
   * All loaded class will be loaded as Singletons, and the instance will be
   * shared across all GraphQL executions.
   */
  providers?: Provider[];
}

/**
 * Returns a dependency injection token for getting a module's configuration object by
 * the module's name.
 * You can use this later with `@inject` in your `Provider`s.
 *
 * @param name - the name of the module
 * @constructor
 */
export const ModuleConfig = (name: string) =>
  Symbol.for(`ModuleConfig.${name}`);

/**
 * Represents a GraphQL module that has it's own types, resolvers, context and business logic.
 * You can read more about it in the Documentation section. TODO: Add link
 *
 * You can also specific `Config` generic to tell TypeScript what's the structure of your
 * configuration object to use later with `withConfig`
 */
export class GraphQLModule<Config = any> {
  private readonly _name: string;
  private _resolvers: IResolvers = {};
  private _typeDefs: string;
  private _providers: Provider[] = null;
  private _contextBuilder: BuildContextFn = null;
  private _options: GraphQLModuleOptions;
  private _moduleConfig: Config = null;

  /**
   * Creates a new `GraphQLModule` instance, merged it's type definitions and resolvers.
   * @param options - module configuration
   */
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

  /**
   * Sets the module configuration object
   * @param config - the config object
   */
  withConfig(config: Config): this {
    this._moduleConfig = config;

    return this;
  }

  /**
   * Returns a list of the module's dependencies.
   */
  get dependencies(): ModuleDependency[] {
    return (
      (typeof this.options.dependencies === 'function'
        ? this.options.dependencies()
        : this.options.dependencies) || []
    );
  }

  /**
   * Returns the current configuration object
   * of the module
   */
  get config(): Config {
    return this._moduleConfig;
  }

  /**
   * Return the options object that module was created with.
   */
  get options(): GraphQLModuleOptions {
    return this._options;
  }

  /**
   * Returns the module's name
   */
  get name(): string {
    return this._name;
  }

  /**
   * Returns the GraphQL type definitions of the module
   * @return a `string` with the merged type definitions
   */
  get typeDefs(): any {
    return this._typeDefs;
  }

  /**
   * Sets the type definitions of the module
   * @param value - the new type definitions
   */
  set typeDefs(value: any) {
    this._typeDefs = Array.isArray(value) ? mergeGraphQLSchemas(value) : value;
  }

  /**
   * Returns the `buildContext` method of the module
   */
  get contextBuilder(): BuildContextFn {
    return this._contextBuilder;
  }

  /**
   * Sets the context builder of the module
   * @param contextBuilder - the new context builder
   */
  set contextBuilder(contextBuilder: BuildContextFn) {
    this._contextBuilder = contextBuilder;
  }

  /**
   * Returns the resolvers object of the module
   */
  get resolvers(): IResolvers {
    return this._resolvers;
  }

  /**
   * Sets the resolvers object of the module
   * @param value
   */
  set resolvers(value: IResolvers) {
    this._resolvers = value;
  }

  /**
   * Returns the list of providers of the module
   */
  get providers(): Provider[] {
    return this._providers;
  }
}
