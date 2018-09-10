import { GraphQLSchema } from 'graphql';
import { IResolvers, makeExecutableSchema } from 'graphql-tools';
import { DepGraph } from 'dependency-graph';
import { mergeGraphQLSchemas, mergeResolvers } from '@graphql-modules/epoxy';
import logger from '@graphql-modules/logger';
import { Context, GraphQLModule, IGraphQLContext, ModuleConfig } from './graphql-module';
import { CommunicationBridge } from './communication';
import { composeResolvers, IResolversComposerMapping } from './resolvers-composition';
import { Injector } from './di';
import { Injector as SimpleInjector, Provider } from './di/types';

export class AppInfo {
  private request: any;
  private context: IGraphQLContext;
  private app: GraphQLApp;

  initialize({ request, context, app }: { request: any; context: IGraphQLContext, app: GraphQLApp }) {
    this.request = request;
    this.context = context;
    this.app = app;
  }

  public getRequest(): any {
    return this.request;
  }

  public getContext(): IGraphQLContext {
    return this.request;
  }

  public getApp(): GraphQLApp {
    return this.app;
  }
}

export interface NonModules {
  typeDefs?: any;
  resolvers?: any;
}

export interface GraphQLAppOptions {
  modules: GraphQLModule[];
  nonModules?: NonModules;
  communicationBridge?: CommunicationBridge;
  resolversComposition?: IResolversComposerMapping;
  providers?: Provider[];
}

export type ContextFn<Context> = (reqContext: any) => Promise<Context>;
export interface ServerConfiguration<Context = any> {
  schema?: GraphQLSchema;
  typeDefs?: any;
  resolvers?: IResolvers;
  context?: ContextFn<Context>;
}

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

  constructor(private options: GraphQLAppOptions) {
    this._modules = options.modules;

    this.initModules();
    this.buildSchema();
    this.buildProviders();
  }

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

  private buildSchemaObject() {
    this._schema = makeExecutableSchema({
      typeDefs: this._typeDefs,
      resolvers: this._resolvers,
    });
  }

  public getModulesDependencyGraph(modules: GraphQLModule[]) {
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

  private composeResolvers(
    resolvers: IResolvers,
    composition: IResolversComposerMapping,
  ) {
    if (composition) {
      return composeResolvers(resolvers, composition);
    }

    return resolvers;
  }

  get schema(): GraphQLSchema {
    if (!this._schema) {
      this.buildSchemaObject();
    }

    return this._schema;
  }

  get modules(): GraphQLModule[] {
    return this._modules;
  }

  get resolvers(): IResolvers {
    return this._resolvers;
  }

  get typeDefs(): string {
    return this._typeDefs;
  }

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

  get appInfo(): AppInfo {
    return this._appInfo;
  }

  public getModule(name) {
    return this._modules.find(module => module.name === name);
  }

  public get injector(): SimpleInjector {
    return this._injector;
  }

  async buildContext(networkRequest?: any): Promise<Context> {
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
  generateServerConfig<T extends ServerConfiguration = any>(extraConfig?: T): T {
    return Object.assign({
      schema: this.schema,
      typeDefs: this.typeDefs,
      resolvers: this.resolvers,
      context: reqContext => this.buildContext(reqContext.req),
    }, extraConfig);
  }
}
