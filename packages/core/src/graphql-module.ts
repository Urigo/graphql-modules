import {
  IResolvers,
  SchemaDirectiveVisitor,
  IDirectiveResolvers,
  IResolverValidationOptions,
} from 'graphql-tools';
import {
  mergeResolvers,
  IResolversComposerMapping,
  composeResolvers,
  mergeSchemas,
  getSchemaDirectiveFromDirectiveResolver,
  mergeTypeDefs,
} from 'graphql-toolkit';
import { Provider, Injector, ProviderScope } from '@graphql-modules/di';
import { DocumentNode, GraphQLSchema, parse, GraphQLScalarType } from 'graphql';
import {
  SchemaNotValidError,
  DependencyModuleUndefinedError,
  TypeDefNotFoundError,
  ModuleConfigRequiredError,
} from './errors';
import * as deepmerge from 'deepmerge';
import { ModuleSessionInfo } from './module-session-info';
import { ModuleContext, ISubscriptionHooks } from './types';
import { asArray, normalizeSession } from './helpers';

export type LogMethod = (message: string | Error) => void;

export interface ILogger {
  log?: LogMethod;
  error?: LogMethod;
  clientError?: LogMethod;
  warn?: LogMethod;
}

/**
 * A context builder method signature for `contextBuilder`.
 */
export type BuildContextFn<Config, Session extends object, Context, PreviousContext = any> = (
  session: Session,
  currentContext: ModuleContext<PreviousContext>,
  moduleSessionInfo: ModuleSessionInfo<Config, Session, Context>,
) => Promise<Context> | Context;

export interface ISchemaDirectives {
  [name: string]: typeof SchemaDirectiveVisitor;
}

export type GraphQLModuleOption<Option, Config, Session extends object, Context> =
  | Option
  | ((module: GraphQLModule<Config, Session, Context>, ...args: any[]) => Option);

export interface KeyValueCache {
  get(key: string): Promise<string | undefined>;
  set(key: string, value: string, options?: { ttl?: number }): Promise<void>;
  delete(key: string): Promise<boolean | void>;
}

/**
 * Defined the structure of GraphQL module options object.
 */
export interface GraphQLModuleOptions<Config, Session extends object, Context> {
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
  typeDefs?: GraphQLModuleOption<string | DocumentNode | Array<string | DocumentNode>, Config, Session, Context>;
  /**
   * Resolvers object, or a function will get the module's config as argument, and should
   * return the resolvers object.
   */
  resolvers?: GraphQLModuleOption<
    IResolvers<any, ModuleContext<Context>> | Array<IResolvers<any, ModuleContext<Context>>>,
    Config,
    Session,
    Context
  >;
  /**
   * Context builder method. Use this to add your own fields and data to the GraphQL `context`
   * of each execution of GraphQL.
   */
  context?: BuildContextFn<Config, Session, Context>;
  /**
   * The dependencies that this module need to run correctly, you can either provide the `GraphQLModule`,
   * or provide a string with the name of the other module.
   * Adding a dependency will effect the order of the type definition building, resolvers building and context
   * building.
   */
  imports?: GraphQLModuleOption<Array<GraphQLModule<any, Session, any>>, Config, Session, Context>;
  /**
   * A list of `Providers` to load into the GraphQL module.
   * It could be either a `class` or a value/class instance.
   * All loaded class will be loaded as Singletons, and the instance will be
   * shared across all GraphQL executions.
   */
  providers?: GraphQLModuleOption<Provider[], Config, Session, Context>;
  /** Object map between `Type.field` to a function(s) that will wrap the resolver of the field  */
  resolversComposition?: GraphQLModuleOption<IResolversComposerMapping, Config, Session, Context>;
  schemaDirectives?: GraphQLModuleOption<ISchemaDirectives, Config, Session, Context>;
  directiveResolvers?: GraphQLModuleOption<IDirectiveResolvers, Config, Session, Context>;
  logger?: GraphQLModuleOption<ILogger, Config, Session, Context>;
  extraSchemas?: GraphQLModuleOption<GraphQLSchema[], Config, Session, Context>;
  middleware?: (
    module: GraphQLModule<Config, Session, Context>,
    ...args: any[]
  ) => Partial<ModuleCache<Session, Context>> | void;
  cache?: KeyValueCache;
  configRequired?: boolean;
  resolverValidationOptions?: GraphQLModuleOption<IResolverValidationOptions, Config, Session, Context>;
  defaultProviderScope?: GraphQLModuleOption<ProviderScope, Config, Session, Context>;
}

/**
 * Returns a dependency injection token for getting a module's configuration object by
 * the module's name.
 * You can use this later with `@Inject` in your `Provider`s.
 *
 * @param module
 * @constructor
 */
export const ModuleConfig = (module: string | GraphQLModule) =>
  Symbol.for(`ModuleConfig.${typeof module === 'string' ? module : module.name}`);

export interface ModuleCache<Session, Context> {
  injector: Injector;
  schema: GraphQLSchema;
  typeDefs: DocumentNode;
  resolvers: IResolvers<any, ModuleContext<Context>>;
  schemaDirectives: ISchemaDirectives;
  contextBuilder: (session: Session, excludeSession?: boolean) => Promise<ModuleContext<Context>>;
  extraSchemas: GraphQLSchema[];
  directiveResolvers: IDirectiveResolvers;
  subscriptionHooks: ISubscriptionHooks;
  imports: GraphQLModule[];
  formatResponse: <Response>(response: Response, session: Session) => Promise<Response>;
}

/**
 * Represents a GraphQL module that has it's own types, resolvers, context and business logic.
 * You can read more about it in the Documentation section. {@link /docs/introduction/modules}
 *
 * You can also specific `Config` generic to tell TypeScript what's the structure of your
 * configuration object to use later with `forRoot`
 */
export class GraphQLModule<Config = any, Session extends object = any, Context = any> {
  private _cache: ModuleCache<Session, Context> = {
    injector: undefined,
    schema: undefined,
    typeDefs: undefined,
    resolvers: undefined,
    schemaDirectives: undefined,
    contextBuilder: undefined,
    extraSchemas: undefined,
    directiveResolvers: undefined,
    subscriptionHooks: undefined,
    imports: undefined,
    formatResponse: undefined,
  };

  /**
   * Creates a new `GraphQLModule` instance, merged it's type definitions and resolvers.
   * @param options - module configuration
   */
  constructor(private _options: GraphQLModuleOptions<Config, Session, Context> = {}, private _moduleConfig?: Config) {
    const getFilename = (id: string) => id.split('/').pop();
    const generateName = () => {
      const randomId = Math.floor(Math.random() * Math.floor(Number.MAX_SAFE_INTEGER)).toString();
      if (typeof module !== 'undefined' && module.parent && module.parent.parent) {
        return getFilename(module.parent.parent.id) + '_' + randomId;
      }
      return randomId;
    };
    _options.name = _options.name || generateName();
    if (!('logger' in _options)) {
      _options.logger = console;
    }
    if (!('cache' in _options)) {
      const storage = new Map<string, any>();
      _options.cache = {
        get: async key => storage.get(key),
        set: async (key, value) => {
          storage.set(key, value);
        },
        delete: async key => storage.delete(key),
      };
    }
  }

  /**
   * Creates another instance of the module using a configuration
   * @param config - the config object
   */
  forRoot(config: Config): GraphQLModule<Config, Session, Context> {
    this._moduleConfig = {
      ...this._moduleConfig,
      ...config,
    };
    // clean cache
    this._cache = {
      injector: undefined,
      schema: undefined,
      typeDefs: undefined,
      resolvers: undefined,
      schemaDirectives: undefined,
      contextBuilder: undefined,
      extraSchemas: undefined,
      directiveResolvers: undefined,
      subscriptionHooks: undefined,
      imports: undefined,
      formatResponse: undefined,
    };
    return this;
  }

  forChild(config: Config): GraphQLModule<Config, Session, Context> {
    if (config) {
      return new GraphQLModule<Config, Session, Context>(this._options, {
        ...this._moduleConfig,
        ...config,
      });
    } else {
      return this;
    }
  }

  private checkConfiguration() {
    if (this._options.configRequired && !this._moduleConfig) {
      throw new ModuleConfigRequiredError(this.name);
    }
  }

  get name() {
    return this._options.name;
  }

  get config() {
    return this._moduleConfig;
  }

  /**
   * Gets the application `GraphQLSchema` object.
   * If the schema object is not built yet, it compiles
   * the `typeDefs` and `resolvers` into `GraphQLSchema`
   */
  get schema() {
    if (typeof this._cache.schema === 'undefined') {
      this.checkConfiguration();
      const importsSchemas = new Array<GraphQLSchema>();
      const selfImports = this.selfImports;
      for (const module of selfImports) {
        const moduleSchema = module.schema;
        if (moduleSchema) {
          importsSchemas.push(moduleSchema);
        }
      }
      try {
        const selfTypeDefs = this.selfTypeDefs;
        const selfEncapsulatedResolvers = this.addSessionInjectorToSelfResolversContext();
        const selfEncapsulatedResolversComposition = this.addSessionInjectorToSelfResolversCompositionContext();
        const selfLogger = this.selfLogger;
        const selfResolverValidationOptions = this.selfResolverValidationOptions;
        const selfExtraSchemas = this.selfExtraSchemas;
        if (importsSchemas.length || selfTypeDefs || selfExtraSchemas.length) {
          this._cache.schema = mergeSchemas({
            schemas: [
              ...importsSchemas,
              ...selfExtraSchemas,
            ],
            typeDefs: selfTypeDefs || undefined,
            resolvers: selfEncapsulatedResolvers,
            resolversComposition: selfEncapsulatedResolversComposition,
            resolverValidationOptions: selfResolverValidationOptions,
            logger: 'clientError' in selfLogger ? {
              log: message => selfLogger.clientError(message),
            } : undefined,
          });
        } else {
          this._cache.schema = null;
        }
      } catch (e) {
        if (e.message === 'Must provide typeDefs') {
          this._cache.schema = null;
        } else if (e.message.includes(`Type "`) && e.message.includes(`" not found in document.`)) {
          const typeDef = e.message.replace('Type "', '').replace('" not found in document.', '');
          throw new TypeDefNotFoundError(typeDef, this.name);
        } else {
          throw new SchemaNotValidError(this.name, e.message);
        }
      }
      if ('middleware' in this._options) {
        const middlewareResult = this.injector.call(this._options.middleware, this);
        Object.assign(this._cache, middlewareResult);
      }
    }
    return this._cache.schema;
  }

  /**
   * Gets the application dependency-injection injector
   */
  get injector(): Injector {
    if (typeof this._cache.injector === 'undefined') {
      this.checkConfiguration();
      this._cache.injector = new Injector(
        this.name,
        ProviderScope.Application,
        this.selfDefaultProviderScope,
        ['onInit', 'onRequest', 'initialize', 'onResponse', 'onConnect', 'onDisconnect'],
        this.selfProviders,
        this.selfImports.map(module => module.injector),
      );
      this._cache.injector.callHookWithArgs('onInit', this);
    }
    return this._cache.injector;
  }

  get cache(): KeyValueCache {
    return this._options.cache;
  }

  get extraSchemas(): GraphQLSchema[] {
    if (typeof this._cache.extraSchemas) {
      let extraSchemas = new Array<GraphQLSchema>();
      const selfImports = this.selfImports;
      for (const module of selfImports) {
        extraSchemas = extraSchemas.concat(module.extraSchemas);
      }
      const selfExtraSchemas = this.selfExtraSchemas;
      if (selfExtraSchemas.length) {
        extraSchemas = extraSchemas.concat(selfExtraSchemas);
      }
      this._cache.extraSchemas = extraSchemas;
    }
    return this._cache.extraSchemas;
  }

  /**
   * Gets the merged GraphQL type definitions as one string
   */
  get typeDefs(): DocumentNode {
    if (typeof this._cache.typeDefs === 'undefined') {
      let typeDefsArr = new Array<GraphQLSchema | DocumentNode>();
      const selfImports = this.selfImports;
      for (const module of selfImports) {
        const moduleTypeDefs = module.typeDefs;
        if (moduleTypeDefs) {
          typeDefsArr.push(moduleTypeDefs);
        }
      }
      const selfTypeDefs = this.selfTypeDefs;
      if (selfTypeDefs) {
        typeDefsArr.push(selfTypeDefs);
      }
      typeDefsArr = typeDefsArr.concat(this.extraSchemas);
      if (typeDefsArr.length) {
        this._cache.typeDefs = mergeTypeDefs(typeDefsArr, {
          useSchemaDefinition: false,
        });
      } else {
        this._cache.typeDefs = null;
      }
    }
    return this._cache.typeDefs;
  }

  get resolvers(): IResolvers<any, ModuleContext<Context>> {
    if (typeof this._cache.resolvers === 'undefined') {
      const resolversToBeComposed = new Array<IResolvers>();
      const selfImports = this.selfImports;
      for (const module of selfImports) {
        const moduleResolvers = module.resolvers;
        resolversToBeComposed.push(moduleResolvers);
      }
      const resolvers = this.addSessionInjectorToSelfResolversContext();
      const resolversComposition = this.addSessionInjectorToSelfResolversCompositionContext();
      resolversToBeComposed.push(resolvers);
      const composedResolvers = composeResolvers<any, ModuleContext<Context>>(
        mergeResolvers(resolversToBeComposed),
        resolversComposition,
      );
      this._cache.resolvers = composedResolvers;
    }
    return this._cache.resolvers;
  }

  get schemaDirectives(): ISchemaDirectives {
    if (typeof this._cache.schemaDirectives === 'undefined') {
      const schemaDirectivesSet = new Array<ISchemaDirectives>();
      const selfImports = this.selfImports;
      for (const module of selfImports) {
        const moduleSchemaDirectives = module.schemaDirectives;
        schemaDirectivesSet.push(moduleSchemaDirectives);
      }
      const selfSchemaDirectives = this.selfSchemaDirectives;
      const selfDirectiveResolvers = this.selfDirectiveResolvers;
      // tslint:disable-next-line:forin
      for (const directiveName in selfDirectiveResolvers) {
        selfSchemaDirectives[directiveName] = getSchemaDirectiveFromDirectiveResolver(
          selfDirectiveResolvers[directiveName],
        );
      }
      schemaDirectivesSet.push(selfSchemaDirectives);
      this._cache.schemaDirectives = deepmerge.all([...schemaDirectivesSet]) as ISchemaDirectives;
    }
    return this._cache.schemaDirectives;
  }

  get subscriptions(): ISubscriptionHooks {
    if (typeof this._cache.subscriptionHooks === 'undefined') {
      const subscriptionHooks = new Array<ISubscriptionHooks>();
      const selfImports = this.selfImports;
      for (const module of selfImports) {
        const moduleSubscriptionHooks = module.subscriptions;
        if (moduleSubscriptionHooks) {
          subscriptionHooks.push(moduleSubscriptionHooks);
        }
      }
      this._cache.subscriptionHooks = {
        onConnect: async (connectionParams, websocket, connectionSession) => {
          if (!this._sessionContext$Map.has(connectionSession)) {
            const importsOnConnectHooks$ = subscriptionHooks.map(
              async ({ onConnect }) => onConnect && onConnect(connectionParams, websocket, connectionSession),
            );
            const importsOnConnectHooks = await Promise.all(importsOnConnectHooks$);
            const importsResult = importsOnConnectHooks.reduce((acc, curr) => ({ ...acc, ...(curr || {}) }), {});
            const connectionContext = await this.context(connectionSession);
            const sessionInjector = connectionContext.injector;
            const hookResult = await sessionInjector.callHookWithArgs(
              'onConnect',
              connectionParams,
              websocket,
              connectionContext,
            );
            this._sessionContext$Map.set(
              connectionSession,
              Promise.resolve({
                ...importsResult,
                ...connectionContext,
                ...hookResult,
              }),
            );
          }
          return this._sessionContext$Map.get(connectionSession);
        },
        onDisconnect: async (websocket, connectionSession) => {
          const importsOnDisconnectHooks$ = subscriptionHooks.map(
            async ({ onDisconnect }) => onDisconnect && onDisconnect(websocket, connectionSession),
          );
          const importsOnDisconnectHooks = await Promise.all(importsOnDisconnectHooks$);
          importsOnDisconnectHooks.reduce((acc, curr) => ({ ...acc, ...(curr || {}) }), {});
          const connectionContext = await this.context(connectionSession);
          const sessionInjector = connectionContext.injector;
          await sessionInjector.callHookWithArgs('onDisconnect', websocket, connectionContext);
          this.destroySessionContext(connectionSession);
        },
      };
    }
    return this._cache.subscriptionHooks;
  }

  get selfDefaultProviderScope(): ProviderScope {
    let defaultProviderScope = ProviderScope.Application;
    const defaultProviderScopeDefinition = this._options.defaultProviderScope;
    if (defaultProviderScopeDefinition) {
      if (typeof defaultProviderScopeDefinition === 'function') {
        defaultProviderScope = defaultProviderScopeDefinition(this);
      } else {
        defaultProviderScope = defaultProviderScopeDefinition;
      }
    }
    return defaultProviderScope;
  }

  get selfExtraSchemas(): GraphQLSchema[] {
    let extraSchemas = new Array<GraphQLSchema>();
    const extraSchemasDefinitions = this._options.extraSchemas;
    if (extraSchemasDefinitions) {
      if (typeof extraSchemasDefinitions === 'function') {
        this.checkConfiguration();
        extraSchemas = extraSchemasDefinitions(this);
      } else {
        extraSchemas = extraSchemasDefinitions;
      }
    }
    return extraSchemas;
  }

  /**
   * Returns the GraphQL type definitions of the module
   * @return a `string` with the merged type definitions
   */
  get selfTypeDefs(): DocumentNode {
    let typeDefs = null;
    let typeDefsDefinitions = this._options.typeDefs;
    if (typeDefsDefinitions) {
      if (typeof typeDefsDefinitions === 'function') {
        this.checkConfiguration();
        typeDefsDefinitions = typeDefsDefinitions(this);
      }
      if (typeof typeDefsDefinitions === 'string') {
        typeDefs = parse(typeDefsDefinitions);
      } else if (Array.isArray(typeDefsDefinitions)) {
        typeDefsDefinitions = typeDefsDefinitions.filter(typeDefsDefinition => typeDefsDefinition);
        if (typeDefsDefinitions.length) {
          typeDefs = mergeTypeDefs(typeDefsDefinitions, {
            useSchemaDefinition: false,
          });
        }
      } else if (typeDefsDefinitions) {
        typeDefs = typeDefsDefinitions;
      }
    }
    return typeDefs;
  }

  get selfResolvers(): IResolvers<any, ModuleContext<Context>> {
    let resolvers: IResolvers<any, ModuleContext<Context>> = {};
    let resolversDefinitions = this._options.resolvers;
    if (resolversDefinitions) {
      if (typeof resolversDefinitions === 'function') {
        this.checkConfiguration();
        resolversDefinitions = this.injector.call(resolversDefinitions, this);
      }
      if (Array.isArray(resolversDefinitions)) {
        resolversDefinitions = mergeResolvers(resolversDefinitions);
      }
      resolvers = resolversDefinitions;
    }
    return resolvers;
  }

  get selfImports() {
    let imports = new Array<GraphQLModule<any, Session, any>>();
    if (this._options.imports) {
      if (typeof this._options.imports === 'function') {
        this.checkConfiguration();
        imports = this._options.imports(this);
      } else {
        imports = this._options.imports;
      }
    }
    if (imports.find(module => typeof module === 'undefined')) {
      throw new DependencyModuleUndefinedError(this.name);
    }
    return imports;
  }

  get selfProviders(): Provider[] {
    let providers = new Array<Provider>();
    const providersDefinitions = this._options.providers;
    if (providersDefinitions) {
      if (typeof providersDefinitions === 'function') {
        this.checkConfiguration();
        providers = providersDefinitions(this);
      } else {
        providers = providersDefinitions;
      }
    }
    return [
      {
        provide: ModuleConfig(this),
        useValue: this.config,
      },
      ...providers,
    ];
  }

  get selfResolversComposition(): IResolversComposerMapping {
    let resolversComposition: IResolversComposerMapping = {};
    const resolversCompositionDefinitions = this._options.resolversComposition;
    if (resolversCompositionDefinitions) {
      if (resolversCompositionDefinitions instanceof Function) {
        this.checkConfiguration();
        resolversComposition = this.injector.call(resolversCompositionDefinitions, this);
      } else {
        resolversComposition = resolversCompositionDefinitions;
      }
    }
    return resolversComposition;
  }

  get selfSchemaDirectives(): ISchemaDirectives {
    let schemaDirectives: ISchemaDirectives = {};
    const schemaDirectivesDefinitions = this._options.schemaDirectives;
    if (schemaDirectivesDefinitions) {
      if (typeof schemaDirectivesDefinitions === 'function') {
        this.checkConfiguration();
        schemaDirectives = this.injector.call(schemaDirectivesDefinitions, this);
      } else {
        schemaDirectives = schemaDirectivesDefinitions;
      }
    }
    return schemaDirectives;
  }

  get selfDirectiveResolvers(): IDirectiveResolvers {
    let directiveResolvers: IDirectiveResolvers = {};
    const directiveResolversDefinitions = this._options.directiveResolvers;
    if (directiveResolversDefinitions) {
      if (typeof directiveResolversDefinitions === 'function') {
        this.checkConfiguration();
        directiveResolvers = this.injector.call(directiveResolversDefinitions, this);
      } else {
        directiveResolvers = directiveResolversDefinitions;
      }
    }
    return directiveResolvers;
  }

  private addSessionInjectorToSelfResolversContext() {
    const resolvers = this.selfResolvers;
    // tslint:disable-next-line:forin
    for (const type in resolvers) {
      const typeResolvers = resolvers[type];
      if (!(typeResolvers instanceof GraphQLScalarType)) {
        // tslint:disable-next-line:forin
        for (const prop in resolvers[type]) {
          const resolver = typeResolvers[prop];
          if (typeof resolver === 'function') {
            if (prop !== '__resolveType') {
              typeResolvers[prop] = async (root: any, args: any, appContext: any, info: any) => {
                if (appContext instanceof Promise) {
                  appContext = await appContext;
                } else if (typeof appContext === 'undefined') {
                  appContext = info;
                }
                info.session = info.session || appContext.session || appContext;
                let moduleContext;
                try {
                  moduleContext = await this.context(info.session, true);
                } catch (e) {
                  const logger = this.selfLogger;
                  if ('clientError' in logger) {
                    logger.clientError(e);
                  }
                  throw e;
                }
                info.schema = this.schema;
                return resolver.call(typeResolvers[prop], root, args, moduleContext, info);
              };
            } else {
              typeResolvers[prop] = async (root: any, appContext: any, info: any) => {
                if (appContext instanceof Promise) {
                  appContext = await appContext;
                } else if (typeof appContext === 'undefined') {
                  appContext = info;
                }
                info.session = info.session || appContext.session || appContext;
                let moduleContext;
                try {
                  moduleContext = await this.context(info.session, true);
                } catch (e) {
                  const logger = this.selfLogger;
                  if ('clientError' in logger) {
                    logger.clientError(e);
                  }
                  throw e;
                }
                info.schema = this.schema;
                return resolver.call(typeResolvers, root, moduleContext, info);
              };
            }
          } else if (resolver && typeof resolver === 'object' && 'subscribe' in resolver) {
            const subscriber = resolver['subscribe'];
            typeResolvers[prop]['subscribe'] = async (root: any, args: any, appContext: any, info: any) => {
              if (appContext instanceof Promise) {
                appContext = await appContext;
              } else if (typeof appContext === 'undefined') {
                appContext = info;
              }
              info.session = info.session || appContext.session || appContext;
              let moduleContext;
              try {
                moduleContext = await this.context(info.session, true);
              } catch (e) {
                const logger = this.selfLogger;
                if ('clientError' in logger) {
                  logger.clientError(e);
                }
                throw e;
              }
              info.schema = this.schema;
              return subscriber.call(typeResolvers[prop], root, args, moduleContext, info);
            };
          }
        }
      }
    }
    return resolvers;
  }

  private addSessionInjectorToSelfResolversCompositionContext() {
    const resolversComposition = this.selfResolversComposition;
    // tslint:disable-next-line:forin
    for (const path in resolversComposition) {
      const compositionArr = asArray(resolversComposition[path]);
      resolversComposition[path] = [
        (next: any) => async (root: any, args: any, appContext: any, info: any) => {
          if (appContext instanceof Promise) {
            appContext = await appContext;
          } else if (typeof appContext === 'undefined') {
            appContext = info;
          }
          info.session = info.session || appContext.session || appContext;
          let moduleContext;
          try {
            moduleContext = await this.context(info.session, true);
          } catch (e) {
            const logger = this.selfLogger;
            if ('clientError' in logger) {
              logger.clientError(e);
            }
            throw e;
          }
          info.schema = this.schema;
          return next(root, args, moduleContext, info);
        },
        ...compositionArr,
      ];
    }
    return resolversComposition;
  }
  get selfLogger(): ILogger {
    let logger: ILogger;
    const loggerDefinitions = this._options.logger;
    if (loggerDefinitions) {
      if (logger instanceof Function) {
        this.checkConfiguration();
        logger = this.injector.call(loggerDefinitions as () => ILogger, this);
      } else {
        logger = loggerDefinitions as ILogger;
      }
    }
    return logger;
  }

  get selfResolverValidationOptions(): IResolverValidationOptions {
    let resolverValidationOptions: IResolverValidationOptions = {};
    const resolverValidationOptionsDefinitions = this._options.resolverValidationOptions;
    if (resolverValidationOptionsDefinitions) {
      if (resolverValidationOptionsDefinitions instanceof Function) {
        this.checkConfiguration();
        resolverValidationOptions = this.injector.call(
          resolverValidationOptionsDefinitions as () => IResolverValidationOptions,
          this,
        );
      } else {
        resolverValidationOptions = resolverValidationOptionsDefinitions as IResolverValidationOptions;
      }
    }
    return resolverValidationOptions;
  }

  private _sessionContext$Map = new WeakMap<Session, Promise<ModuleContext<Context>>>();

  /**
   * Build a GraphQL `context` object based on a network session.
   * It iterates over all modules by their dependency-based order, and executes
   * `contextBuilder` method.
   * It also in charge of injecting a reference to the application `Injector` to
   * the `context`.
   * The network session is passed to each `contextBuilder` method, and the return
   * value of each `contextBuilder` is merged into a unified `context` object.
   *
   * This method should be in use with your GraphQL manager, such as Apollo-Server.
   *
   * @param session - the network session from `connect`, `express`, etc...
   */
  get context(): (
    session: Session,
    excludeSession?: boolean,
    excludeInjector?: boolean,
  ) => Promise<ModuleContext<Context>> {
    if (!this._cache.contextBuilder) {
      const selfImports = this.selfImports;
      this._cache.contextBuilder = (session, excludeSession = false, excludeInjector = false) => {
        session = normalizeSession(session);
        if (!this._sessionContext$Map.has(session)) {
          this._sessionContext$Map.set(
            session,
            new Promise(async (resolve, reject) => {
              try {
                const importsContext = {};
                if (selfImports.length) {
                  const importsContexts = await Promise.all(selfImports.map(module => module.context(session, true)));
                  Object.assign(importsContext, ...importsContexts);
                }
                const applicationInjector = this.injector;
                const sessionInjector = applicationInjector.getSessionInjector(session);
                const moduleSessionInfo = new ModuleSessionInfo(this, session);
                let moduleContext;
                const moduleContextDeclaration = this._options.context;
                if (moduleContextDeclaration) {
                  if (moduleContextDeclaration instanceof Function) {
                    moduleContext = await moduleContextDeclaration(
                      session,
                      { ...importsContext, injector: sessionInjector },
                      moduleSessionInfo,
                    );
                  } else {
                    moduleContext = await moduleContextDeclaration;
                  }
                }
                moduleSessionInfo.context = Object.assign<any, Context>(importsContext, moduleContext);
                await Promise.all([
                  sessionInjector.callHookWithArgs('onRequest', moduleSessionInfo),
                  sessionInjector.callHookWithArgs('initialize', moduleSessionInfo),
                ]);
                resolve(moduleSessionInfo.context);
              } catch (e) {
                reject(e);
              }
            }),
          );
        }
        if (excludeInjector && excludeSession) {
          return this._sessionContext$Map.get(session);
        }
        return this._sessionContext$Map.get(session).then(moduleContext => {
          const finalContext = Object.assign({}, moduleContext);
          if (!excludeInjector) {
            finalContext.injector = this.injector.getSessionInjector(session);
          }
          if (!excludeSession) {
            finalContext['session'] = session;
          }
          return finalContext;
        });
      };
    }
    return this._cache.contextBuilder;
  }

  private destroySessionContext(session: Session) {
    this.injector.destroySessionInjector(session);
    this._sessionContext$Map.delete(session);
  }

  get formatResponse() {
    if (!this._cache.formatResponse) {
      const responseFormatters = new Array<(response: any, session: Session) => Promise<any>>();
      const selfImports = this.selfImports;
      for (const module of selfImports) {
        const moduleFormatResponse = module.formatResponse;
        responseFormatters.push(moduleFormatResponse);
      }
      this._cache.formatResponse = async <Response>(response: Response, session: Session) => {
        session = normalizeSession(session);
        for (const moduleFormatResponse of responseFormatters) {
          await moduleFormatResponse(response, session);
        }
        const applicationInjector = this.injector;
        const sessionInjector = applicationInjector.getSessionInjector(session);
        await sessionInjector.callHookWithArgs('onResponse', sessionInjector.get(ModuleSessionInfo));
        this.destroySessionContext(session);
        return response;
      };
    }
    return this._cache.formatResponse;
  }
}
