import { DocumentNode, GraphQLSchema } from 'graphql';
import { IResolvers, makeExecutableSchema } from 'graphql-tools';
import { DepGraph } from 'dependency-graph';
import { mergeGraphQLSchemas, mergeResolvers } from '@graphql-modules/epoxy';
import logger from '@graphql-modules/logger';
import { GraphQLModule, ModuleConfig } from './graphql-module';
import { CommunicationBridge } from './communication';
import { composeResolvers, IResolversComposerMapping } from './resolvers-composition';
import { Injector } from './di';
import { AppContext, Injector as SimpleInjector, Provider } from './di/types';
import { AppInfo } from './app-info';

/**
 * Object that defined a structure with GraphQL type definitions and resolvers object.
 * You can use this to pass a legacy GraphQL type definitions and resolver that are not written
 * as modules.
 */
export interface NonModules {
  /**
   * GraphQL type definitions
   */
  typeDefs?: string | string[] | DocumentNode | DocumentNode[];
  /**
   * GraphQL resolvers object
   */
  resolvers?: IResolvers;
}

/**
 * This interface defines the options you need to pass to `GraphQLApp`
 */
export interface GraphQLAppOptions {
  /** a list of `GraphQLModule` you wish to load to your app */
  modules: GraphQLModule[];
  /** Specify non-module schema and resolvers */
  nonModules?: NonModules;
  /** `CommunicationBridge` object that will handle the pub/sub messages between your modules */
  communicationBridge?: CommunicationBridge;
  /** Object map between `Type.field` to a function(s) that will wrap the resolver of the field  */
  resolversComposition?: IResolversComposerMapping;
  /** List of external providers to load into the injector */
  providers?: Provider[];
}

/**
 * Signature for `context` function as we need to pass it to GraphQL
 * servers such as Apollo-Server.
 */
export type ContextBuilder = (reqContext: any) => Promise<AppContext>;

/**
 * Default GraphQL server configuration object, should match most
 * of the popular servers
 */
export interface BaseServerConfiguration {
  schema: GraphQLSchema;
  typeDefs: any;
  resolvers: IResolvers;
  context: ContextBuilder;
}

/**
 * Manages and handles your application, in charge of managing modules, dependency injection,
 * building your GraphQL Context, control the flow of the app and connect
 * to your GraphQL external endpoint
 */
export class GraphQLApp {
  private readonly _modules: GraphQLModule[];
  private _schema: GraphQLSchema;
  private _resolvers: IResolvers;
  private _typeDefs: string;
  private _injector = new Injector({
    defaultScope: 'Singleton',
    autoBindInjectable: false,
  });
  private _appInfo = new AppInfo();

  /**
   * Creates your GraphQLApp instance
   * @param options - configuration object
   */
  constructor(private options: GraphQLAppOptions) {
    this._modules = options.modules;

    this.initModules();
    this.buildSchema();
    this.buildProviders();
  }

  /**
   * In charge of initialzing the modules - get their `typeDefs` and `resolvers` if it's a function
   */
  private initModules() {
    for (const module of this._modules) {
      try {
        if (typeof module.options.typeDefs === 'function') {
          module.typeDefs = module.options.typeDefs(module.config) as string;
        }

        if (typeof module.options.resolvers === 'function') {
          module.resolvers = module.options.resolvers(module.config);
        }
      } catch (e) {
        logger.error(
          `Unable to build module! Module "${module.name}" failed: `,
          e,
        );

        throw e;
      }
    }
  }

  /**
   * Build the GraphQLSchema from all modules together and from the non-modules types and resolvers.
   */
  private buildSchema() {
    const allTypes = this.options.modules
      .map<string>(m => m.typeDefs)
      .filter(t => t);
    const nonModules = this.options.nonModules || {};
    const mergedResolvers = mergeResolvers(
      this._modules
        .map(m => m.resolvers || {})
        .concat(nonModules.resolvers || {}),
    );
    this._resolvers = this.composeResolvers(
      mergedResolvers,
      this.options.resolversComposition,
    );
    this._typeDefs = mergeGraphQLSchemas([
      ...allTypes,
      ...(Array.isArray(nonModules.typeDefs)
        ? nonModules.typeDefs
        : nonModules.typeDefs
          ? [nonModules.typeDefs]
          : []),
    ]);
  }

  /**
   * Build a `GraphQLSchema` object from all `typeDefs` and `resolvers`
   */
  private buildSchemaObject() {
    this._schema = makeExecutableSchema({
      typeDefs: this._typeDefs,
      resolvers: this._resolvers,
    });
  }

  /**
   * Build a dependency graph and order it according to the init order.
   * It also handles circular dependencies.
   *
   * @param modules - list of GraphQLModule
   */
  private getModulesDependencyGraph(modules: GraphQLModule[]): string[] {
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
   * Applies resolvers composition over an object of resolvers.
   * @param resolvers - base resolvers
   * @param composition - map between `Type.field` and wrapping function(s)
   */
  private composeResolvers(resolvers: IResolvers, composition: IResolversComposerMapping): IResolvers {
    if (composition) {
      return composeResolvers(resolvers, composition);
    }

    return resolvers;
  }

  /**
   * Gets the application `GraphQLSchema` object.
   * If the schema object is not built yet, it compiles
   * the `typeDefs` and `resolvers` into `GraphQLSchema`
   */
  get schema(): GraphQLSchema {
    if (!this._schema) {
      this.buildSchemaObject();
    }

    return this._schema;
  }

  /**
   * Gets the array modules in the app
   */
  get modules(): GraphQLModule[] {
    return this._modules;
  }

  /**
   * Gets the merged resolvers object
   */
  get resolvers(): IResolvers {
    return this._resolvers;
  }

  /**
   * Gets the merged GraphQL type definitions as one string
   */
  get typeDefs(): string {
    return this._typeDefs;
  }

  /**
   * Builds the application built-in providers, and the module's providers.
   */
  private buildProviders() {
    // communication birdge
    if (this.options.communicationBridge) {
      this._injector.provide({
        provide: CommunicationBridge,
        useValue: this.options.communicationBridge,
      });
    }
    // app info
    this._injector.provide({
      provide: AppInfo,
      useValue: this._appInfo,
    });

    // module's providers
    for (const module of this._modules) {
      // module's config
      this._injector.provide({
        provide: ModuleConfig(module.name),
        useValue: module.config,
      });

      // module's providers
      if (module && module.providers) {
        module.providers.forEach(provider => {
          this._injector.provide(provider);
        });
      }
    }

    // global providers
    if (this.options.providers) {
      this.options.providers.forEach(provider => {
        this._injector.provide(provider);
      });
    }

    // initalize global providers
    if (this.options.providers) {
      this.options.providers.forEach(provider => {
        this._injector.init(provider);
      });
    }

    // initialize module's providers
    this._modules.forEach(module => {
      if (module.providers) {
        module.providers.forEach(provider => {
          this._injector.init(provider);
        });
      }
    });
  }

  /**
   * Get the current application info if it's during execution
   * of a GraphQL document.
   */
  get appInfo(): AppInfo {
    return this._appInfo;
  }

  /**
   * Gets a module by it's name
   * @param name - the name of the requested module
   */
  public getModule(name: string): GraphQLModule | null {
    return this._modules.find(module => module.name === name) || null;
  }

  /**
   * Gets the application dependency-injection injector
   */
  public get injector(): SimpleInjector {
    return this._injector;
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
  async buildContext(networkRequest?: any): Promise<AppContext> {
    const depGraph = this.getModulesDependencyGraph(this._modules);
    const injector = {
      get: this._injector.get.bind(this._injector),
    };
    const builtResult = {
      injector,
    };
    const result: any = {};

    let module: GraphQLModule;
    try {
      for (const depName of depGraph) {
        module = this.getModule(depName);

        if (module && module.contextBuilder) {
          const appendToContext: any = await module.contextBuilder(
            networkRequest,
            result,
            injector,
          );

          if (appendToContext && typeof appendToContext === 'object') {
            Object.assign(builtResult, appendToContext);
          }
        }
      }

      this._appInfo.initialize({
        request: networkRequest,
        context: builtResult,
        app: this,
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

  /**
   * Utility function that build `config` object to use with your GraphQL server manager,
   * such as Apollo-Server or GraphQL Yoga.
   * It will build an object with the following fields: `schema`, `typeDefs`, `resolvers` and `context`.
   *
   * You can also pass `extraConfig` in order to add more fields to the config
   * object (for example, fields from `Config` of `apollo-server`).
   *
   * @param extraConfig - extra configuration to add to the object.
   */
  generateServerConfig<
    ServerConfiguration extends Partial<BaseServerConfiguration> & IExtraConfig,
    IExtraConfig = Pick<ServerConfiguration, Exclude<keyof ServerConfiguration, keyof BaseServerConfiguration>>
  >(extraConfig?: IExtraConfig): ServerConfiguration {
    return Object.assign({} as ServerConfiguration, extraConfig, {
      schema: this.schema,
      typeDefs: this.typeDefs,
      resolvers: this.resolvers,
      context: (reqContext: any) => this.buildContext(reqContext.req),
    });
  }
}
