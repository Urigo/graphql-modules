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
export interface GraphQLModuleOptions<Config, Request, Context> {
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
  typeDefs?: string | string[] | DocumentNode | DocumentNode[] | ((config: Config) => string | string[] | DocumentNode | DocumentNode[]);
  /**
   * Resolvers object, or a function will get the module's config as argument, and should
   * return the resolvers object.
   */
  resolvers?: IResolvers | ((config: Config) => IResolvers);
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
  imports?: ((config: Config) => Array<ModuleDependency<any, Request, Context>> | string[]) | string[] | Array<ModuleDependency<any, Request, Context>>;
  /**
   * A list of `Providers` to load into the GraphQL module.
   * It could be either a `class` or a value/class instance.
   * All loaded class will be loaded as Singletons, and the instance will be
   * shared across all GraphQL executions.
   */
  providers?: Provider[] | ((config: Config) => Provider[]);
  /** Object map between `Type.field` to a function(s) that will wrap the resolver of the field  */
  resolversComposition?: IResolversComposerMapping;
  }

/**
 * Returns a dependency injection token for getting a module's configuration object by
 * the module's name.
 * You can use this later with `@Inject` in your `Provider`s.
 *
 * @param name - the name of the module
 * @constructor
 */
export const ModuleConfig = (module: string | GraphQLModule) =>
  Symbol.for(`ModuleConfig.${typeof module === 'string' ? module : module.name}`);

/**
 * Represents a GraphQL module that has it's own types, resolvers, context and business logic.
 * You can read more about it in the Documentation section. TODO: Add link
 *
 * You can also specific `Config` generic to tell TypeScript what's the structure of your
 * configuration object to use later with `withConfig`
 */
export class GraphQLModule<Config = any, Request = any, Context = any> {

  /**
   * Creates a new `GraphQLModule` instance, merged it's type definitions and resolvers.
   * @param options - module configuration
   */
  constructor(
    private _options: GraphQLModuleOptions<Config, Request, Context>,
    private _moduleConfig?: Config,
    ) {}

  /**
   * Creates another instance of the module using a configuration
   * @param config - the config object
   */
  withConfig(config: Config): GraphQLModule<Config, Request, Context> {
    return new GraphQLModule<Config, Request, Context>(this._options, config);
  }

  /**
   * Returns the current configuration object
   * of the module
   */
  get config(): Config {
    return this._moduleConfig || {} as Config;
  }

  /**
   * Sets the module configuration object
   * @param config - the config object
   */
  set config(config: Config) {
    this._moduleConfig = config;
  }

  /**
   * Returns the `buildContext` method of the module
   */
  get contextBuilder(): BuildContextFn<Request, Context> {
    return this._options.contextBuilder;
  }

  /**
   * Sets the context builder of the module
   * @param contextBuilder - the new context builder
   */
  set contextBuilder(contextBuilder) {
    this._options.contextBuilder = contextBuilder;
  }

  get resolversComposition(): IResolversComposerMapping {
    return this._options.resolversComposition || {};
  }

  set resolversComposition(resolversComposition) {
    this._options.resolversComposition = resolversComposition;
  }

  /**
   * Returns the module's name
   */
  get name(): string {
    return this._options.name;
  }

  set name(name) {
    this._options.name = name;
  }

  get subModules() {
    let subModules = new Array<ModuleDependency<any, Request, any>>();
    if (this._options.imports) {
      if (typeof this._options.imports === 'function') {
        subModules = this._options.imports(this.config);
      } else {
        subModules = this._options.imports;
      }
    }
    return subModules;
  }

  /**
   * Build a dependency graph and order it according to the init order.
   * It also handles circular dependencies.
   */
  get dependencyGraph(): DepGraph<GraphQLModule<any, Request, any>> {
    const graph = new DepGraph<GraphQLModule<any, Request, any>>({ circular: true });
    const visitedModulesToAddDependency = new Set<string>();

    function visitModuleToAddNode(module: GraphQLModule<any, Request, any>) {
      if (!graph.hasNode(module.name)) {
        graph.addNode(module.name, module);
        for (const subModule of module.subModules) {
          if (typeof subModule !== 'string') {
            visitModuleToAddNode(subModule);
          }
        }
      }
    }

    function visitModuleToAddDependency(module: GraphQLModule<any, Request, any>, top = false) {
      for (const subModule of module.subModules) {
        if (!top) {
          try {
            graph.addDependency(
                module.name,
                typeof subModule === 'string' ? subModule : subModule.name,
            );
          } catch (e) {
            throw new Error(`Module ${subModule} is not defined, which is trying to be imported by ${module.name}!`);
          }
        }
        // prevent infinite loop in case of circular dependency
        if (typeof subModule !== 'string' && !visitedModulesToAddDependency.has(subModule.name)) {
          visitModuleToAddDependency(subModule);
        }
      }
    }

    visitModuleToAddNode(this);
    visitModuleToAddDependency(this, true);
    return graph;
  }

  /**
   * Gets a module by it's name
   * @param name - the name of the requested module
   */
  getModule(name: string) {
    return this.dependencyGraph.getNodeData(name);
  }

  /**
   * Gets the array modules in the app
   */
  get imports() {
    const graph = this.dependencyGraph;
    const modules = graph.overallOrder().map(moduleName => graph.getNodeData(moduleName));
    for (const subModule of this.subModules) {
      if (typeof subModule !== 'string' && !modules.includes(subModule)) {
        modules.push(subModule);
      }
    }
    return modules;
  }

  set imports(imports) {
    this._options.imports = imports;
  }

  /**
   * Returns the GraphQL type definitions of the module
   * @return a `string` with the merged type definitions
   */
  get typeDefs() {
    return mergeGraphQLSchemas(this.imports.map(module => {
      if (module._options.typeDefs) {
        if (typeof module._options.typeDefs === 'function') {
          return module._options.typeDefs(module._moduleConfig);
        } else if (Array.isArray(module._options.typeDefs)) {
          return mergeGraphQLSchemas(module._options.typeDefs);
        } else if (typeof module._options.typeDefs === 'string') {
          return module._options.typeDefs as any;
        } else {
          return print(module._options.typeDefs);
        }
      } else {
        return [];
      }
    }));
  }

  /**
   * Sets the type definitions of the module
   * @param value - the new type definitions
   */
  set typeDefs(typeDefs) {
    this._options.typeDefs = typeDefs;
  }

  /**
   * Returns the resolvers object of the module
   */
  get resolvers(): IResolvers {
    return mergeResolvers(this.imports.map(module => {
      let resolvers = {};
      if (module._options.resolvers) {
        if (typeof module._options.resolvers === 'function') {
          resolvers = module._options.resolvers(module._moduleConfig);
        } else {
          resolvers = module._options.resolvers;
        }
      }
      return composeResolvers(
        resolvers,
        module.resolversComposition || {},
      );
    }));
  }

  /**
   * Sets the resolvers object of the module
   * @param value
   */
  set resolvers(resolvers) {
    this._options.resolvers = resolvers;
  }

  /**
   * Returns the list of providers of the module
   */
  get providers(): Provider[] {
    const providers = new Array<Provider>();
    for (const module of this.imports) {
      providers.push(
        {
          provide: ModuleConfig(module.name),
          useValue: module.config,
        },
      );
      if (module._options.providers) {
        if (typeof module._options.providers === 'function') {
          providers.push(
            ...module._options.providers(this.config),
          );
        } else {
          providers.push(
            ...module._options.providers,
          );
        }
      }
    }
    return providers;
  }

  set providers(providers) {
    this._options.providers = providers;
  }

  /**
   * Gets the application `GraphQLSchema` object.
   * If the schema object is not built yet, it compiles
   * the `typeDefs` and `resolvers` into `GraphQLSchema`
   */
  get schema() {
    return makeExecutableSchema({
      typeDefs: this.typeDefs,
      resolvers: this.resolvers,
    });
  }

  /**
   * Gets the application dependency-injection injector
   */
  get injector(): SimpleInjector {
    const injector = new Injector({
      defaultScope: 'Singleton',
      autoBindInjectable: false,
    });

    // app info
    injector.provide({
      provide: AppInfo,
      useValue: new AppInfo<Config, Request, Context>(),
    });

    const providers = this.providers;

    for (const provider of providers) {
      injector.provide(provider);
    }

    for (const provider of providers) {
      injector.init(provider);
    }

    return injector;
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
   * @param request - the network request from `connect`, `express`, etc...
   */
  context = async (request: Request): Promise<AppContext<Context>> => {
      const injector = this.injector;
      const builtResult: AppContext<any> = {
        injector,
      };

      for (const module of this.imports) {
        try {
          if (module && module.contextBuilder) {
            const appendToContext = await module.contextBuilder(
              request,
              builtResult,
              injector,
            );

            if (appendToContext && typeof appendToContext === 'object') {
              Object.assign(builtResult, appendToContext);
            }
          }
        } catch (e) {
          logger.error(
            `Unable to build context! Module "${module.name}" failed: `,
            e,
          );

          throw e;
        }
      }

      injector.get(AppInfo).initialize({
        request,
        context: builtResult,
        appModule: this,
      });

      return builtResult;
    }
  }
