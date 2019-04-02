import {
  IResolvers,
  SchemaDirectiveVisitor,
  IDirectiveResolvers,
  IResolverValidationOptions,
} from 'graphql-tools';
import {
  mergeResolvers,
  ResolversComposerMapping,
  composeResolvers,
  mergeSchemas,
  mergeSchemasAsync,
  getSchemaDirectiveFromDirectiveResolver,
  mergeTypeDefs,
  ResolversComposition,
  printSchemaWithDirectives,
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
import { ModuleContext, SubscriptionHooks } from './types';
import { asArray, normalizeSession } from './helpers';
import { KeyValueCache, InMemoryLRUCache } from 'apollo-server-caching';

type MaybePromise<T> = Promise<T> | T;

export type LogMethod = (message: string | Error) => void;

export interface Logger {
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

export interface SchemaDirectives {
  [name: string]: typeof SchemaDirectiveVisitor;
}

export type GraphQLModuleOption<Option, Config, Session extends object, Context> =
  | Option
  | ((module: GraphQLModule<Config, Session, Context>, ...args: any[]) => Option);

export type GraphQLModuleOptionAsync<Option, Config, Session extends object, Context> =
  GraphQLModuleOption<Option, Config, Session, Context>
  | Promise<Option>
  | ((module: GraphQLModule<Config, Session, Context>, ...args: any[]) => Promise<Option>);

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
  typeDefs?: GraphQLModuleOption<MaybePromise<string | DocumentNode | GraphQLSchema | Array<string | DocumentNode | GraphQLSchema>>, Config, Session, Context>;
  /**
   * Resolvers object, or a function will get the module's config as argument, and should
   * return the resolvers object.
   */
  resolvers?: GraphQLModuleOption<
    MaybePromise<IResolvers<any, ModuleContext<Context>> | Array<IResolvers<any, ModuleContext<Context>>>>,
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
  resolversComposition?: GraphQLModuleOption<ResolversComposerMapping, Config, Session, Context>;
  schemaDirectives?: GraphQLModuleOption<SchemaDirectives, Config, Session, Context>;
  directiveResolvers?: GraphQLModuleOption<IDirectiveResolvers, Config, Session, Context>;
  logger?: GraphQLModuleOption<Logger, Config, Session, Context>;
  extraSchemas?: GraphQLModuleOption<GraphQLSchema[], Config, Session, Context>;
  middleware?: (
    module: GraphQLModule<Config, Session, Context>,
    ...args: any[]
  ) => Partial<ModuleCache<Session, Context>> | void;
  cache?: GraphQLModuleOption<KeyValueCache, Config, Session, Context>;
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
export const ModuleConfig = (module: string | GraphQLModule | ((module?: void) => (GraphQLModule | string))) => {
  if (module instanceof Function) {
    module = module();
  }
  if (module instanceof GraphQLModule) {
    module = module.name;
  }
  return Symbol.for(`ModuleConfig.${module}`);
};

export interface ModuleCache<Session, Context> {
  injector: Injector;
  schema: GraphQLSchema;
  typeDefs: DocumentNode;
  resolvers: IResolvers<any, ModuleContext<Context>>;
  schemaDirectives: SchemaDirectives;
  contextBuilder: (session: Session, excludeSession?: boolean) => Promise<ModuleContext<Context>>;
  extraSchemas: GraphQLSchema[];
  directiveResolvers: IDirectiveResolvers;
  subscriptionHooks: SubscriptionHooks;
  imports: GraphQLModule[];
  selfKeyValueCache: KeyValueCache;
  selfLogger: Logger;
}

export interface ModuleCacheAsync<Context> {
  schemaAsync: Promise<GraphQLSchema>;
  typeDefsAsync: Promise<DocumentNode>;
  resolversAsync: Promise<IResolvers<any, ModuleContext<Context>>>;
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
    selfKeyValueCache: undefined,
    selfLogger: undefined,
  };

  private _cacheAsync: ModuleCacheAsync<Context> = {
    schemaAsync: undefined,
    typeDefsAsync: undefined,
    resolversAsync: undefined,
  };

  /**
   * Creates a new `GraphQLModule` instance, merged it's type definitions and resolvers.
   * @param options - module configuration
   */
  constructor(private _options: GraphQLModuleOptions<Config, Session, Context> = {}, private _moduleConfig?: Config) { }

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
      selfKeyValueCache: undefined,
      selfLogger: undefined,
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
    if (!this._options.name) {
      const getFilename = (id: string) => id.split('/').pop();
      const generateName = () => {
        const randomId = Math.floor(Math.random() * Math.floor(Number.MAX_SAFE_INTEGER)).toString();
        if (typeof module !== 'undefined' && module.parent && module.parent.parent) {
          return getFilename(module.parent.parent.id) + '_' + randomId;
        }
        return randomId;
      };
      this._options.name = generateName();
    }
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
      const selfImports = this.selfImports;
      const importsSchemas = selfImports.map(module => module.schema).filter(schema => schema);
      try {
        const selfTypeDefs = this.selfTypeDefs;
        const selfEncapsulatedResolvers = this.addSessionInjectorToSelfResolversContext(this.selfResolvers);
        const selfEncapsulatedResolversComposition = this.addSessionInjectorToSelfResolversCompositionContext(this.selfResolversComposition);
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
            logger: 'clientError' in this.selfLogger ? {
              log: message => this.selfLogger.clientError(message),
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

  get schemaAsync(): Promise<GraphQLSchema> {
    if (typeof this._cache.schema === 'undefined') {
      if (typeof this._cacheAsync.schemaAsync === 'undefined') {
        this._cacheAsync.schemaAsync = new Promise(async (resolve, reject) => {
          try {
            if (!this._cache.schema) {
              this.checkConfiguration();
              const selfImports = this.selfImports;
              const importsSchemas$Arr = selfImports.map(module => module.schemaAsync);
              try {
                const selfTypeDefsAsync$ = this.selfTypeDefsAsync;
                const selfEncapsulatedResolversAsync$ = this.selfResolversAsync.then(selfResolvers => this.addSessionInjectorToSelfResolversContext(selfResolvers));
                const [
                  selfTypeDefs,
                  selfEncapsulatedResolvers,
                  selfExtraSchemas,
                  ...importsSchemas
                ] = await Promise.all([
                  selfTypeDefsAsync$,
                  selfEncapsulatedResolversAsync$,
                  Promise.resolve().then(() => this.selfExtraSchemas),
                  ...importsSchemas$Arr as any,
                ]);
                const selfEncapsulatedResolversComposition = this.addSessionInjectorToSelfResolversCompositionContext(this.selfResolversComposition);
                const selfLogger = this.selfLogger;
                const selfResolverValidationOptions = this.selfResolverValidationOptions;
                if (importsSchemas.length || selfTypeDefs || selfExtraSchemas.length) {
                  this._cache.schema = await mergeSchemasAsync({
                    schemas: [
                      ...importsSchemas,
                      ...selfExtraSchemas,
                    ].filter(s => s),
                    typeDefs: selfTypeDefs || undefined,
                    resolvers: selfEncapsulatedResolvers,
                    resolversComposition: selfEncapsulatedResolversComposition,
                    resolverValidationOptions: selfResolverValidationOptions,
                    logger: 'clientError' in selfLogger ? {
                      log: (message: string | Error) => selfLogger.clientError(message),
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
            resolve(this._cache.schema);
          } catch (e) {
            reject(e);
          }
        });
      }
      return this._cacheAsync.schemaAsync;
    }
    return Promise.resolve(this._cache.schema);
  }

  /**
   * Gets the application dependency-injection injector
   */
  get injector(): Injector {
    if (typeof this._cache.injector === 'undefined') {
      this.checkConfiguration();
      const injector = this._cache.injector = new Injector({
        name: this.name,
        injectorScope: ProviderScope.Application,
        defaultProviderScope: this.selfDefaultProviderScope,
        hooks: ['onInit', 'onRequest', 'onResponse', 'onConnect', 'onDisconnect'],
        initialProviders: this.selfProviders,
        children: this.selfImports.map(module => module.injector),
      });
      injector.onInstanceCreated = ({ instance }) => {
        if (
          typeof instance !== 'number' &&
          typeof instance !== 'boolean' &&
          typeof instance !== 'string' &&
          'initialize' in instance &&
          typeof instance['initialize'] === 'function') {
            instance['initialize']({ cache: this.selfCache });
          }
      };
      injector.callHookWithArgs({
        hook: 'onInit',
        args: [this],
        instantiate: true,
        async: false,
      });
    }
    return this._cache.injector;
  }

  get extraSchemas(): GraphQLSchema[] {
    if (typeof this._cache.extraSchemas) {
      const selfImports = this.selfImports;
      const importsExtraSchemas = selfImports.map(module => module.extraSchemas).reduce((extraSchemas, moduleExtraSchemas) => extraSchemas.concat(moduleExtraSchemas), []);
      const selfExtraSchemas = this.selfExtraSchemas;
      this._cache.extraSchemas = importsExtraSchemas.concat(selfExtraSchemas);
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

  get typeDefsAsync(): Promise<DocumentNode> {
    if (typeof this._cache.typeDefs === 'undefined') {
      if (typeof this._cacheAsync.typeDefsAsync) {
        this._cacheAsync.typeDefsAsync = new Promise(async (resolve, reject) => {
          try {
            const [
              extraSchemas,
              importsTypeDefs,
              selfTypeDefs,
            ] = await Promise.all([
              Promise.resolve().then(() => this.selfExtraSchemas),
              Promise.all(this.selfImports.map<any>(module => module.typeDefsAsync)),
              this.selfTypeDefsAsync,
            ]);
            const typeDefs = importsTypeDefs.concat(extraSchemas).concat(selfTypeDefs);
            if (typeDefs.length) {
              this._cache.typeDefs = mergeTypeDefs(typeDefs.filter(s => s), {
                useSchemaDefinition: false,
              });
            } else {
              this._cache.typeDefs = null;
            }
            resolve(this._cache.typeDefs);
          } catch (e) {
            reject(e);
          }
        });
      }
      return this._cacheAsync.typeDefsAsync;
    }
    return Promise.resolve(this._cache.typeDefs);
  }

  get resolvers(): IResolvers<any, ModuleContext<Context>> {
    if (typeof this._cache.resolvers === 'undefined') {
      const resolversToBeComposed = new Array<IResolvers>();
      const selfImports = this.selfImports;
      for (const module of selfImports) {
        const moduleResolvers = module.resolvers;
        resolversToBeComposed.push(moduleResolvers);
      }
      const resolvers = this.addSessionInjectorToSelfResolversContext(this.selfResolvers);
      const resolversComposition = this.addSessionInjectorToSelfResolversCompositionContext(this.selfResolversComposition);
      resolversToBeComposed.push(resolvers);
      const composedResolvers = composeResolvers(
        mergeResolvers(resolversToBeComposed),
        resolversComposition,
      );
      this._cache.resolvers = composedResolvers;
    }
    return this._cache.resolvers;
  }

  get resolversAsync(): Promise<IResolvers<any, ModuleContext<Context>>> {
    if (typeof this._cache.resolvers === 'undefined') {
      if (typeof this._cacheAsync.resolversAsync === 'undefined') {
        this._cacheAsync.resolversAsync = new Promise(async (resolve, reject) => {
          try {
            const resolversToBeComposed = await Promise.all([
              ...this.selfImports.map<any>(module => module.resolversAsync),
              this.selfResolversAsync.then(selfResolvers => this.addSessionInjectorToSelfResolversContext(selfResolvers)),
            ]);
            const resolversComposition = this.addSessionInjectorToSelfResolversCompositionContext(this.selfResolversComposition);
            const composedResolvers = composeResolvers(
              mergeResolvers(resolversToBeComposed),
              resolversComposition,
            );
            this._cache.resolvers = composedResolvers;
            resolve(this._cache.resolvers);
          } catch (e) {
            reject(e);
          }
        });
      }
      return this._cacheAsync.resolversAsync;
    }
    return Promise.resolve(this._cache.resolvers);
  }

  get schemaDirectives(): SchemaDirectives {
    if (typeof this._cache.schemaDirectives === 'undefined') {
      const schemaDirectivesSet = new Array<SchemaDirectives>();
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
      this._cache.schemaDirectives = deepmerge.all([...schemaDirectivesSet]) as SchemaDirectives;
    }
    return this._cache.schemaDirectives;
  }

  get subscriptions(): SubscriptionHooks {
    if (typeof this._cache.subscriptionHooks === 'undefined') {
      const subscriptionHooks = new Array<SubscriptionHooks>();
      const selfImports = this.selfImports;
      for (const module of selfImports) {
        const moduleSubscriptionHooks = module.subscriptions;
        if (moduleSubscriptionHooks) {
          subscriptionHooks.push(moduleSubscriptionHooks);
        }
      }
      this._cache.subscriptionHooks = {
        onConnect: (connectionParams, websocket, connectionSession) => {
          if (!this._sessionContext$Map.has(connectionSession)) {
            this._sessionContext$Map.set(connectionSession, new Promise(async (resolve, reject) => {
              try {
                const importsOnConnectHooks$ = subscriptionHooks.map(
                  async ({ onConnect }) => onConnect && onConnect(connectionParams, websocket, connectionSession),
                );
                const importsOnConnectHooks = await Promise.all(importsOnConnectHooks$);
                const importsResult = importsOnConnectHooks.reduce((acc, curr) => ({ ...acc, ...(curr || {}) }), {});
                const connectionContext = await this.context(connectionSession);
                const sessionInjector = connectionContext.injector;
                const hookResult = await sessionInjector.callHookWithArgs({
                  hook: 'onConnect',
                  args: [
                    connectionParams,
                    websocket,
                    connectionContext,
                  ],
                  instantiate: true,
                  async: true,
                });
                resolve({
                  ...importsResult,
                  ...connectionContext,
                  ...hookResult,
                });
              } catch (e) {
                reject(e);
              }
            }));
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
          await sessionInjector.callHookWithArgs({
            hook: 'onDisconnect',
            args: [
              websocket,
              connectionContext,
            ],
            instantiate: true,
            async: true,
          });
          this.destroySelfSession(connectionSession);
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
      } else if (typeDefsDefinitions instanceof GraphQLSchema) {
        typeDefs = parse(printSchemaWithDirectives(typeDefsDefinitions));
      } else if (typeDefsDefinitions instanceof Promise) {
        throw new Error(`
          typeDefs of ${this.name} is not sync. So, you need to wait for it.
          Please wait for 'typeDefsAsync' promise before starting your GraphQL Server.
        `);
      } else if (typeDefsDefinitions) {
        typeDefs = typeDefsDefinitions;
      }
    }
    return typeDefs;
  }

  get selfTypeDefsAsync(): Promise<DocumentNode> {
    return new Promise(async (resolve, reject) => {
      try {
        let typeDefs = null;
        let typeDefsDefinitions = await this._options.typeDefs;
        if (typeDefsDefinitions) {
          if (typeof typeDefsDefinitions === 'function') {
            this.checkConfiguration();
            typeDefsDefinitions = await typeDefsDefinitions(this);
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
          } else if (typeDefsDefinitions instanceof GraphQLSchema) {
            typeDefs = parse(printSchemaWithDirectives(typeDefsDefinitions));
          } else if (typeDefsDefinitions) {
            typeDefs = typeDefsDefinitions;
          }
        }
        resolve(typeDefs);
      } catch (e) {
        reject(e);
      }
    });
  }

  get selfResolvers(): IResolvers<any, ModuleContext<Context>> {
    let resolvers: IResolvers<any, ModuleContext<Context>> = {};
    let resolversDefinitions = this._options.resolvers;
    if (resolversDefinitions) {
      if (typeof resolversDefinitions === 'function') {
        this.checkConfiguration();
        resolversDefinitions = this.injector.call(resolversDefinitions, this);
      }
      if (resolversDefinitions instanceof Promise) {
        throw new Error(`
          Resolvers of ${this.name} is not sync. So, you need to wait for it.
          Please wait for 'resolversAsync' promise before starting your GraphQL Server.
        `);
      }
      if (Array.isArray(resolversDefinitions)) {
        resolversDefinitions = mergeResolvers(resolversDefinitions);
      }
      resolvers = resolversDefinitions;
    }
    return resolvers;
  }

  get selfResolversAsync(): Promise<IResolvers<any, ModuleContext<Context>>> {
    return new Promise(async (resolve, reject) => {
      try {
        let resolvers: IResolvers<any, ModuleContext<Context>> = {};
        let resolversDefinitions = await this._options.resolvers;
        if (resolversDefinitions) {
          if (typeof resolversDefinitions === 'function') {
            this.checkConfiguration();
            resolversDefinitions = await this.injector.call(resolversDefinitions, this);
          }
          if (Array.isArray(resolversDefinitions)) {
            resolversDefinitions = mergeResolvers(resolversDefinitions);
          }
          resolvers = resolversDefinitions;
        }
        resolve(resolvers);
      } catch (e) {
        reject(e);
      }
    });
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

  get selfResolversComposition(): ResolversComposerMapping {
    let resolversComposition: ResolversComposerMapping = {};
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

  get selfSchemaDirectives(): SchemaDirectives {
    let schemaDirectives: SchemaDirectives = {};
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

  private addSessionInjectorToSelfResolversContext(resolvers: IResolvers<any, ModuleContext<Context>>) {
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

  private addSessionInjectorToSelfResolversCompositionContext(resolversComposition: ResolversComposerMapping<IResolvers<any, any>>) {
    const visitResolversCompositionElem = (compositionArr: Array<ResolversComposition<any>>) => {
      return [
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
    };
    // tslint:disable-next-line:forin
    for (const path in resolversComposition) {
      if (resolversComposition[path] instanceof Function || resolversComposition[path] instanceof Array) {
        const compositionArr = asArray(resolversComposition[path] as any);
        resolversComposition[path] = visitResolversCompositionElem(compositionArr);
      } else {
        // tslint:disable-next-line: forin
        for (const subPath in resolversComposition[path]) {
          const compositionArr = asArray(resolversComposition[path][subPath]);
          resolversComposition[path][subPath] = visitResolversCompositionElem(compositionArr);
        }
      }
    }
    return resolversComposition;
  }

  static defaultLogger: Logger = console;

  get selfLogger(): Logger {
    let logger: Logger = GraphQLModule.defaultLogger;
    if (typeof this._cache.selfLogger === 'undefined') {
      const loggerDefinition = this._options.logger;
      if (loggerDefinition) {
        if (loggerDefinition instanceof Function) {
          this.checkConfiguration();
          this._cache.selfLogger = this.injector.call(loggerDefinition as () => Logger, this);
        } else {
          this._cache.selfLogger = loggerDefinition as Logger;
        }
        logger = this._cache.selfLogger;
      } else {
        this._cache.selfLogger = null;
      }
    }
    return logger;
  }

  static defaultCache: KeyValueCache = new InMemoryLRUCache();

  get selfCache(): KeyValueCache {
    let cache: KeyValueCache = GraphQLModule.defaultCache;
    if (typeof this._cache.selfKeyValueCache === 'undefined') {
      const cacheDefinition = this._options.cache;
      if (cacheDefinition) {
        if (cacheDefinition instanceof Function) {
          this.checkConfiguration();
          this._cache.selfKeyValueCache = this.injector.call(cacheDefinition as () => KeyValueCache, this);
        } else {
          this._cache.selfKeyValueCache = cacheDefinition as KeyValueCache;
        }
        cache = this._cache.selfKeyValueCache;
      } else {
        this._cache.selfKeyValueCache = null;
      }
    }
    return cache;
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
                const importsContext: ModuleContext<{}> = {
                  injector: undefined,
                };
                if (selfImports.length) {
                  const importsContexts = await Promise.all(selfImports.map(module => module.context(session, true, true)));
                  Object.assign(importsContext, ...importsContexts);
                }
                const moduleSessionInfo = new ModuleSessionInfo(this, session);
                const sessionInjector = moduleSessionInfo.injector;
                let moduleContext;
                const moduleContextDeclaration = this._options.context;
                if (moduleContextDeclaration) {
                  if (moduleContextDeclaration instanceof Function) {
                    importsContext.injector = sessionInjector;
                    moduleContext = await moduleContextDeclaration(
                      session,
                      importsContext,
                      moduleSessionInfo,
                    );
                  } else {
                    moduleContext = await moduleContextDeclaration;
                  }
                }
                moduleSessionInfo.context = Object.assign<any, Context>(importsContext, moduleContext);
                /// XXX: Dotan - We need to implement it in another way in the future.
                // if ('res' in session && 'once' in session['res']) {
                //     if (!('_onceFinishListeners' in session['res'])) {
                //       session['res']['_onceFinishListeners'] = [];
                //       session['res'].once('finish', (e: any) => {
                //           const onceFinishListeners = session['res']['_onceFinishListeners'];
                //           onceFinishListeners.map((onceFinishListener: any) => onceFinishListener(e));
                //           delete session['res']['_onceFinishListeners'];
                //       });
                //     }
                //     session['res']['_onceFinishListeners'].push(() => {
                //         sessionInjector.callHookWithArgsAsync({
                //             hook: 'onResponse',
                //             args: [moduleSessionInfo],
                //             instantiate: true,
                //         }).then(() => this.destroySelfSession(session));
                //     });
                // }
                sessionInjector.onInstanceCreated = ({ instance }) => {
                  if (
                    typeof instance !== 'number' &&
                    typeof instance !== 'boolean' &&
                    typeof instance !== 'string' &&
                    'initialize' in instance &&
                    typeof instance['initialize'] === 'function') {
                      instance['initialize']({ cache: this.selfCache, context: moduleSessionInfo.context });
                    }
                };
                await sessionInjector.callHookWithArgs({
                  hook: 'onRequest',
                  args: [moduleSessionInfo],
                  instantiate: true,
                  async: true,
                });
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

  private destroySelfSession(session: Session) {
    this.injector.destroySessionInjector(session);
    this._sessionContext$Map.delete(session);
  }
}
