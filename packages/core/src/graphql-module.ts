import { IResolvers, makeExecutableSchema } from 'graphql-tools';
import { mergeGraphQLSchemas, mergeResolvers } from '@graphql-modules/epoxy';
import { Provider, AppContext, Injector as SimpleInjector } from './di/types';
import { DocumentNode, print, GraphQLSchema } from 'graphql';
import { IResolversComposerMapping, composeResolvers } from './resolvers-composition';
import { Injector } from './di';
import { DepGraph } from 'dependency-graph';
import logger from '@graphql-modules/logger';

/**
 * A context builder method signature for `contextBuilder`.
 */
export type BuildContextFn<Request, Context> = (
  networkRequest: Request,
  currentContext: AppContext<Context>,
  injector: SimpleInjector,
) => Promise<Context>;

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
  resolversComposition?: IResolversComposerMapping | ((config: Config) => IResolversComposerMapping);
  /** Resolver Handlers */
  resolverHandlers?: any[] | ((config: Config) => any[]);
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
  Symbol.for(`ModuleConfig.${typeof module === 'string' ? module : module.options.name}`);

export interface AppCache {
  injector: Injector;
  modules: GraphQLModule[];
  schema: GraphQLSchema;
  providers: Provider[];
  typeDefs: string;
}

/**
 * Represents a GraphQL module that has it's own types, resolvers, context and business logic.
 * You can read more about it in the Documentation section. TODO: Add link
 *
 * You can also specific `Config` generic to tell TypeScript what's the structure of your
 * configuration object to use later with `forRoot`
 */
export class GraphQLModule<Config = any, Request = any, Context = any> {

  private _appCache: AppCache;
  private _options: GraphQLModuleOptions<Config, Request, Context>;

  /**
   * Creates a new `GraphQLModule` instance, merged it's type definitions and resolvers.
   * @param options - module configuration
   */
  constructor(
    options: GraphQLModuleOptions<Config, Request, Context>,
    private _moduleConfig: Config = {} as Config,
    ) {
      this.options = options;
    }

  /**
   * Creates another instance of the module using a configuration
   * @param config - the config object
   */
  forRoot(config: Config): GraphQLModule<Config, Request, Context> {
    return new GraphQLModule<Config, Request, Context>(this._options, config);
  }

  forChild(): string {
    return this._options.name;
  }

  get options() {
    return this._options;
  }

  set options(options: Partial<GraphQLModuleOptions<Config, Request, Context>>) {
    this._options = Object.assign({}, this._options, options);
    this._appCache = {
      injector: null,
      modules: null,
      schema: null,
      providers: null,
      typeDefs: null,
    };
  }

  /**
   * Returns the list of providers of the module
   */
  get providers(): Provider[] {
    if (!this._appCache.providers) {
      this.buildSchemaAndInjector();
    }
    return this._appCache.providers;
  }

  /**
   * Build a dependency graph and order it according to the init order.
   * It also handles circular dependencies.
   */
  get dependencyGraph(): DepGraph<GraphQLModule<any, Request, any>> {
    const graph = new DepGraph<GraphQLModule<any, Request, any>>({ circular: true });
    const visitedModulesToAddDependency = new Set<string>();

    const visitModuleToAddNode = (module: GraphQLModule<any, Request, any>) => {
      module._appCache = this._appCache;
      if (!graph.hasNode(module.options.name)) {
        graph.addNode(module.options.name, module);
        for (const subModule of module.imports) {
          if (typeof subModule !== 'string') {
            visitModuleToAddNode(subModule);
          }
        }
      }
    };

    const visitModuleToAddDependency = (module: GraphQLModule<any, Request, any>, top = false) =>  {
      for (const subModule of module.imports) {
        if (!top) {
          try {
            graph.addDependency(
                module.options.name,
                typeof subModule === 'string' ? subModule : subModule.options.name,
            );
          } catch (e) {
            throw new Error(`Module ${subModule} is not defined, which is trying to be imported by ${module.options.name}!`);
          }
        }
        // prevent infinite loop in case of circular dependency
        if (typeof subModule !== 'string' && !visitedModulesToAddDependency.has(subModule.options.name)) {
          visitedModulesToAddDependency.add(subModule.options.name);
          visitModuleToAddDependency(subModule);
        }
      }
    };

    visitModuleToAddNode(this);
    visitModuleToAddDependency(this, true);
    return graph;
  }

  get imports() {
    let imports = new Array<ModuleDependency<any, Request, any>>();
    if (this._options.imports) {
      if (typeof this._options.imports === 'function') {
        imports = this._options.imports(this._moduleConfig);
      } else {
        imports = this._options.imports;
      }
    }
    return imports;
  }

  /**
   * Gets the array modules in the app
   */
  get modules() {
    if (!this._appCache.modules) {
      const graph = this.dependencyGraph;
      const modules = graph.overallOrder().map(moduleName => graph.getNodeData(moduleName));
      const moduleNames = modules.map(module => module.options.name);
      for (const subModule of this.imports) {
        if (typeof subModule !== 'string' && !moduleNames.includes(subModule.options.name)) {
          modules.push(subModule);
        }
      }
      this._appCache.modules = modules;
    }
    return this._appCache.modules;
  }

  /**
   * Gets the application `GraphQLSchema` object.
   * If the schema object is not built yet, it compiles
   * the `typeDefs` and `resolvers` into `GraphQLSchema`
   */
  get schema() {
    if (!this._appCache.schema) {
      this.buildSchemaAndInjector();
    }
    return this._appCache.schema;
  }

  /**
   * Gets the application dependency-injection injector
   */
  get injector(): SimpleInjector {

    if (!this._appCache.injector) {
      this.buildSchemaAndInjector();
    }

    return this._appCache.injector;

  }

  /**
   * Gets the merged GraphQL type definitions as one string
   */
  get typeDefs(): string {
    if (!this._appCache.typeDefs) {
      this._appCache.typeDefs = mergeGraphQLSchemas(this.modules.map(module => module.selfTypeDefs));
    }
    return this._appCache.typeDefs;
  }

  /**
   * Returns the GraphQL type definitions of the module
   * @return a `string` with the merged type definitions
   */
  get selfTypeDefs(): string {
    let typeDefs: any = [];
    const typeDefsDefinitions = this._options.typeDefs;
    if (typeDefsDefinitions) {
      if (typeof typeDefsDefinitions === 'function') {
        typeDefs = typeDefsDefinitions(this._moduleConfig);
      } else if (Array.isArray(typeDefsDefinitions)) {
        typeDefs = mergeGraphQLSchemas(typeDefsDefinitions);
      } else if (typeof typeDefsDefinitions === 'string') {
        typeDefs = typeDefsDefinitions;
      } else {
        typeDefs = print(typeDefsDefinitions);
      }
    }
    return typeDefs;
  }

  private buildSchemaAndInjector() {
    const injector = new Injector();
    const modules = this.modules;
    const resolversArr = new Array<IResolvers>();
    let mergedResolversComposition: IResolversComposerMapping = {};
    const typeDefsArr = new Array<string>();
    const providersArr = new Array<Provider>();
    for (const module of modules) {
      let providers = new Array<Provider>();
      const providersDefinitions = module.options.providers;
      if (providersDefinitions) {
        if (typeof providersDefinitions === 'function') {
          providers = providersDefinitions(module._moduleConfig);
        } else {
          providers = providersDefinitions;
        }
      }
      providers.unshift(
        {
          provide: ModuleConfig(module),
          useValue: module._moduleConfig,
        },
      );
      for (const provider of providers) {
        injector.provide(provider);
        injector.init(provider);
      }
      providersArr.push(...providers);
      let resolvers: IResolvers = {};
      const resolversDefinitions = module.options.resolvers;
      if (resolversDefinitions) {
        if (typeof resolversDefinitions === 'function') {
          resolvers = resolversDefinitions(module._moduleConfig);
        } else {
          resolvers = resolversDefinitions;
        }
      }
      // tslint:disable-next-line:forin
      for ( const type in resolvers ) {
        const typeResolvers = resolvers[type];
        // tslint:disable-next-line:forin
        for (const prop in resolvers[type]) {
          const resolver = typeResolvers[prop];
          const dependencies = resolver['dependencies'];
          if (dependencies) {
            const injections = dependencies.map((dependency: any) => injector.get(dependency));
            typeResolvers[prop] = resolver.bind(resolver, ...injections);
          }
        }
      }
      resolversArr.push(resolvers);

      let resolversComposition: IResolversComposerMapping = {};
      const resolversCompositionDefinitions = module.options.resolversComposition;
      if (resolversCompositionDefinitions) {
        if (typeof resolversCompositionDefinitions === 'function') {
          resolversComposition = (resolversCompositionDefinitions as any)(module._moduleConfig);
        } else {
          resolversComposition = resolversCompositionDefinitions;
        }
      }
      mergedResolversComposition = {
        ...mergedResolversComposition,
        ...resolversComposition,
      };

      if (!this._appCache.typeDefs) {
        typeDefsArr.push(module.selfTypeDefs);
      }

      let resolversHandlers = [];
      const resolversHandlersDefinitions = module.options.resolverHandlers;

      if (resolversHandlersDefinitions) {
        if (typeof resolversHandlersDefinitions === 'function') {
          resolversHandlers = resolversHandlersDefinitions(module._moduleConfig);
        } else {
          resolversHandlers = resolversHandlersDefinitions;
        }
      }

      for ( const resolversHandler of resolversHandlers ) {
        injector.provide(resolversHandler);
        const resolversHandlerInstance = injector.get(resolversHandler);
        const resolvers = {};
        for ( const prop of Object.getOwnPropertyNames(Object.getPrototypeOf(resolversHandlerInstance))) {
          if (prop !== 'constructor') {
            resolvers[prop] = resolversHandlerInstance[prop].bind(resolversHandlerInstance);
          }
        }
        resolversArr.push({
          [resolversHandler['resolversType']]: resolvers,
        });
      }
    }

    const mergedComposedResolvers = composeResolvers(
      mergeResolvers(
        resolversArr,
      ),
      mergedResolversComposition,
    );

    const mergedTypeDefs = this._appCache.typeDefs || mergeGraphQLSchemas(
      typeDefsArr,
    );

    try {
      this._appCache.schema = makeExecutableSchema({
        typeDefs: mergedTypeDefs,
        resolvers: mergedComposedResolvers,
      });
    } catch (e) {
      this._appCache.schema = {} as GraphQLSchema;
    }

    this._appCache.injector = injector;
    this._appCache.providers = providersArr;
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
      const injector = this.injector as Injector;
      const builtResult: AppContext<any> = {
        injector,
      };

      for (const module of this.modules) {
        try {
          if (module && module.options.contextBuilder) {
            const appendToContext = await module.options.contextBuilder(
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
            `Unable to build context! Module "${module.options.name}" failed: `,
            e,
          );

          throw e;
        }
      }

      const requestHooks$ = this.providers.map(provider =>
      (injector as Injector).callRequestHook(
          provider,
          request,
          builtResult,
          this,
        ),
      );

      await Promise.all(requestHooks$);

      return builtResult;
    }
  }
