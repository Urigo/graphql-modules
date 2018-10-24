import { IResolvers, makeExecutableSchema } from 'graphql-tools';
import { mergeGraphQLSchemas, mergeResolvers } from '@graphql-modules/epoxy';
import { Provider, AppContext, Injector as SimpleInjector } from './di/types';
import { DocumentNode, print } from 'graphql';
import { IResolversComposerMapping, composeResolvers } from './resolvers-composition';
import { Injector } from './di';
import { AppInfo } from './app-info';
import { DepGraph } from 'dependency-graph';
import logger from '@graphql-modules/logger';

/**
 * A context builder method signature for `contextBuilder`.
 */
export type BuildContextFn<Request, Context> = (
  networkRequest: Request,
  currentContext: AppContext<Context>,
  injector: SimpleInjector,
) => Context;

/**
 * Defines the structure of a dependency as it declared in each module's `dependencies` field.
 */
export type ModuleDependency<Config, Request, Context> = GraphQLModule<Config, Request, Context> | string;

/**
 * Defined the structure of GraphQL module options object.
 */
export interface GraphQLModuleOptions<Request, Context> {
  /**
   * The name of the module. Use it later to get your `ModuleConfig(name)` or to declare
   * a dependency to this module (in another module)
   */
  name?: string;
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
  contextBuilder?: BuildContextFn<Request, Context>;
  /**
   * The dependencies that this module need to run correctly, you can either provide the `GraphQLModule`,
   * or provide a string with the name of the other module.
   * Adding a dependency will effect the order of the type definition building, resolvers building and context
   * building.
   */
  dependencies?: (() => Array<ModuleDependency<any, Request, Context>> | string[]) | string[] | Array<ModuleDependency<any, Request, Context>>;
  /**
   * A list of `Providers` to load into the GraphQL module.
   * It could be either a `class` or a value/class instance.
   * All loaded class will be loaded as Singletons, and the instance will be
   * shared across all GraphQL executions.
   */
  providers?: Provider[];
  /** Object map between `Type.field` to a function(s) that will wrap the resolver of the field  */
  resolversComposition?: IResolversComposerMapping;
  /** a list of `GraphQLModule` you wish to load to your app */
  modules?: (() => Array<GraphQLModule<any, Request, Context>>) | Array<GraphQLModule<any, Request, Context>>;
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
export class GraphQLModule<Config = any, Request = any, Context = any> {
  private _moduleConfig: Config = null;
  private _appInfo = new AppInfo<Config, Request, Context>();
  private _injector: Injector;

  /**
   * Creates a new `GraphQLModule` instance, merged it's type definitions and resolvers.
   * @param options - module configuration
   */
  constructor(private _options: GraphQLModuleOptions<Request, Context>) {}

  get _typeDefs(): any {
    return this._options.typeDefs &&
    (typeof this._options.typeDefs === 'function'
      ? this._options.typeDefs(this._moduleConfig) as string
      : Array.isArray(this._options.typeDefs)
        ? mergeGraphQLSchemas(this._options.typeDefs)
        : typeof this._options.typeDefs === 'string' ? this._options.typeDefs : print(this._options.typeDefs));
  }

  get _resolvers(): IResolvers {
    return typeof this._options.resolvers === 'function' ? this._options.resolvers(this._moduleConfig) : this._options.resolvers || {};
  }

  get _providers(): Provider[] {
    return this._options.providers || [];
  }

  get _contextBuilder(): BuildContextFn<Request, Context> {
    return this._options.contextBuilder;
  }

  get _resolversComposition(): IResolversComposerMapping {
    return this._options.resolversComposition || {};
  }

  get _dependencies(): Array<ModuleDependency<any, Request, Context>> {
    return (typeof this._options.dependencies === 'function'
    ? this._options.dependencies()
    : this._options.dependencies) || [];
  }

  get _modules(): Array<GraphQLModule<any, Request, Context>> {
    return (typeof this._options.modules === 'function'
    ? this._options.modules()
    : this._options.modules) || [];
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
  get dependencies(): Array<ModuleDependency<any, Request, Context>> {
    return this._dependencies || [];
  }

  /**
   * Returns the current configuration object
   * of the module
   */
  get config(): Config {
    return this._moduleConfig || {} as Config;
  }

  /**
   * Returns the module's name
   */
  get name(): string {
    return this._options.name || 'name';
  }

  /**
   * Returns the GraphQL type definitions of the module
   * @return a `string` with the merged type definitions
   */
  get typeDefs(): any {
    return mergeGraphQLSchemas([
      ...this._modules.map(module => module.typeDefs),
      ...(this._typeDefs ? [this._typeDefs] : []),
    ]);
  }

  /**
   * Returns the `buildContext` method of the module
   */
  get contextBuilder(): BuildContextFn<Request, Context> {
    return this._contextBuilder;
  }

  /**
   * Returns the resolvers object of the module
   */
  get resolvers(): IResolvers {
    const mergedResolvers = mergeResolvers([
      ...this._modules.map(module => module.resolvers),
      ...(this._resolvers ? [this._resolvers] : []),
    ]);
    return composeResolvers(mergedResolvers, this._resolversComposition);
  }

  /**
   * Returns the list of providers of the module
   */
  get providers(): Provider[] {
    return [
      {
        provide: ModuleConfig(this.name),
        useValue: this.config,
      },
      ...this._modules.map(module => module.providers),
      ...this._providers,
    ];
  }

  get schema() {
    return makeExecutableSchema({
      typeDefs: this.typeDefs,
      resolvers: this.resolvers,
    });
  }

  private buildInjector(): void {
    this._injector = new Injector({
      defaultScope: 'Singleton',
      autoBindInjectable: false,
    });

    // app info
    this._injector.provide({
      provide: AppInfo,
      useValue: this._appInfo,
    });

    if (this.providers) {
      this.providers.forEach(provider => {
        this._injector.provide(provider);
      });

      this.providers.forEach(provider => {
        this._injector.init(provider);
      });
    }
  }

  get injector(): SimpleInjector {
    if (!this._injector) {
      this.buildInjector();
    }
    return this._injector;
  }

  /**
   * Gets a module by it's name
   * @param name - the name of the requested module
   */
  public getModule(name: string): GraphQLModule<any, Request, Context> | null {
    return this._modules.find(module => module.name === name) || null;
  }

  /**
   * Build a dependency graph and order it according to the init order.
   * It also handles circular dependencies.
   *
   * @param modules - list of GraphQLModule
   */
  private getModulesDependencyGraph(modules: Array<GraphQLModule<any, Request, Context>>): string[] {
    const graph = new DepGraph({ circular: true });

    for (const module of modules) {
      graph.addNode(module.name);
    }

    for (const module of modules) {
      (module.dependencies || []).forEach(dep => {
        graph.addDependency(
          module.name,
          typeof dep === 'string' ? dep : dep.name,
        );
      });
    }

    const order = graph.overallOrder() || [];

    if (order.length !== modules.length) {
      return [
        ...order,
        ...modules.filter(m => !order.includes(m.name)).map(m => m.name),
      ];
    }

    return order;
  }

  /**
   * Build a GraphQL `context` object based on a network request.
   * It iterates over all modules by their dependency-based order, and executes
   * `contextBuilder` method.
   * It also in charge of injecting a reference to the application `Injector` to
   * the `context`.
   * The network request is passed to each `contextBuilder` method, and the return
   * value of each `contextBuilder` is merged into a unified `context` object.
   *
   * This method should be in use with your GraphQL manager, such as Apollo-Server.
   *
   * @param networkRequest - the network request from `connect`, `express`, etc...
   */
  context = async (request: Request): Promise<AppContext<Context>> => {
      const injector = this.injector;
      const depGraph = this.getModulesDependencyGraph(this._modules);
      const builtResult: any = {
        injector,
      };
      const result: any = {};

      let module: GraphQLModule<any, Request, Context>;
      try {
        for (const depName of depGraph) {
          module = this.getModule(depName);

          if (module && module.contextBuilder) {
            const appendToContext: any = await module.contextBuilder(
              request,
              result,
              injector,
            );

            if (appendToContext && typeof appendToContext === 'object') {
              Object.assign(builtResult, appendToContext);
            }
          }
        }

        this._appInfo.initialize({
          request,
          context: builtResult,
          appModule: this,
        });
      } catch (e) {
        logger.error(
          `Unable to build context! Module "${module.name}" failed: `,
          e,
        );

        throw e;
      }

      const builtKeys = Object.keys(builtResult);

      // I guess we can remove it
      for (const key of builtKeys) {
        if (result.hasOwnProperty(key)) {
          logger.warn(
            `One of you context builders returned a key named ${key}, and it's conflicting with a root module name! Ignoring...`,
          );
        } else {
          result[key] = builtResult[key];
        }
      }

      return result;
    }
  }
