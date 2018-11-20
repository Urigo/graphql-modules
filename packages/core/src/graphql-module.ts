import { IResolvers, makeExecutableSchema, SchemaDirectiveVisitor, ILogger, mergeSchemas } from 'graphql-tools';
import { mergeGraphQLSchemas, mergeResolvers } from '@graphql-modules/epoxy';
import { Provider, ModuleContext, Injector } from './di';
import { DocumentNode, GraphQLSchema } from 'graphql';
import { IResolversComposerMapping, composeResolvers } from './resolvers-composition';
import { DepGraph } from 'dependency-graph';
import { DependencyModuleNotFoundError, SchemaNotValidError, DependencyModuleUndefinedError, TypeDefNotFoundError } from './errors';
import deepmerge = require('deepmerge');
import { addInjectorToResolversContext, addInjectorToResolversCompositionContext, asArray } from './utils';

/**
 * A context builder method signature for `contextBuilder`.
 */
export type BuildContextFn<Request, Context> = (
  networkRequest: Request,
  currentContext: ModuleContext<Context>,
  injector: Injector,
) => Promise<Context> | Context;

export interface ISchemaDirectives {
  [name: string]: typeof SchemaDirectiveVisitor;
}

export type ModulesMap<Request> = Map<string, GraphQLModule<any, Request, any>>;

/**
 * Defines the structure of a dependency as it declared in each module's `dependencies` field.
 */
export type ModuleDependency<Config, Request, Context> = GraphQLModule<Config, Request, Context> | string;

export type GraphQLModuleOption<Option, Config, Request, Context> = Option | ((module: GraphQLModule<Config, Request, Context>) => Option);

/**
 * Defined the structure of GraphQL module options object.
 */
export interface GraphQLModuleOptions<Config, Request, Context> {
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
  typeDefs?: GraphQLModuleOption<DocumentNode | DocumentNode[] | string | string[], Config, Request, Context>;
  /**
   * Resolvers object, or a function will get the module's config as argument, and should
   * return the resolvers object.
   */
  resolvers?: GraphQLModuleOption<IResolvers, Config, Request, Context>;
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
  imports?: GraphQLModuleOption<Array<ModuleDependency<any, Request, Context>>, Config, Request, Context>;
  /**
   * A list of `Providers` to load into the GraphQL module.
   * It could be either a `class` or a value/class instance.
   * All loaded class will be loaded as Singletons, and the instance will be
   * shared across all GraphQL executions.
   */
  providers?: GraphQLModuleOption<Provider[], Config, Request, Context>;
  /** Object map between `Type.field` to a function(s) that will wrap the resolver of the field  */
  resolversComposition?: GraphQLModuleOption<IResolversComposerMapping, Config, Request, Context>;
  schemaDirectives?: GraphQLModuleOption<ISchemaDirectives, Config, Request, Context>;
  logger?: GraphQLModuleOption<ILogger, Config, Request, Context>;
  extraSchemas?: GraphQLModuleOption<GraphQLSchema[], Config, Request, Context>;
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

export interface ModuleCache<Request, Context> {
  injector: Injector;
  schema: GraphQLSchema;
  typeDefs: DocumentNode;
  resolvers: IResolvers;
  schemaDirectives: ISchemaDirectives;
  contextBuilder: (req: Request) => Promise<Context>;
  modulesMap: ModulesMap<Request>;
  extraSchemas: GraphQLSchema[];
}

/**
 * Represents a GraphQL module that has it's own types, resolvers, context and business logic.
 * You can read more about it in the Documentation section. TODO: Add link
 *
 * You can also specific `Config` generic to tell TypeScript what's the structure of your
 * configuration object to use later with `forRoot`
 */
export class GraphQLModule<Config = any, Request = any, Context = any> {

  private _cache: ModuleCache<Request, Context> = {
    injector: undefined,
    schema: undefined,
    typeDefs: undefined,
    resolvers: undefined,
    schemaDirectives: undefined,
    contextBuilder: undefined,
    modulesMap: undefined,
    extraSchemas: undefined,
  };

  /**
   * Creates a new `GraphQLModule` instance, merged it's type definitions and resolvers.
   * @param options - module configuration
   */
  constructor(
    private _options: GraphQLModuleOptions<Config, Request, Context> = {},
    private _moduleConfig: Config = {} as Config,
  ) {
    _options.name = _options.name || Math.floor(Math.random() * Math.floor(Number.MAX_SAFE_INTEGER)).toString();
  }

  /**
   * Creates another instance of the module using a configuration
   * @param config - the config object
   */
  forRoot(config: Config): GraphQLModule<Config, Request, Context> {
    return new GraphQLModule<Config, Request, Context>(this._options, config);
  }

  forChild(): string {
    return this.name;
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
      this.buildSchemaAndInjector(this.modulesMap);
    }
    return this._cache.schema;
  }

  /**
   * Gets the application dependency-injection injector
   */
  get injector(): Injector {

    if (typeof this._cache.injector === 'undefined') {
      this.buildSchemaAndInjector(this.modulesMap);
    }

    return this._cache.injector;

  }

  /**
   * Gets the merged GraphQL type definitions as one string
   */
  get typeDefs(): DocumentNode {
    if (typeof this._cache.typeDefs === 'undefined') {
      this.buildTypeDefs(this.modulesMap);
    }
    return this._cache.typeDefs;
  }

  private buildTypeDefs(modulesMap: ModulesMap<Request>) {
    const typeDefsSet = new Set<DocumentNode>();
    const selfImports = this.selfImports;
    for (let module of selfImports) {
      const moduleName = typeof module === 'string' ? module : module.name;
      module = modulesMap.get(moduleName);
      module.buildTypeDefs(modulesMap);
      const moduleTypeDefs = module.typeDefs;
      if (moduleTypeDefs) {
        typeDefsSet.add(moduleTypeDefs);
      }
    }
    const selfTypeDefs = this.selfTypeDefs;
    if (selfTypeDefs) {
      typeDefsSet.add(selfTypeDefs);
    }
    this._cache.typeDefs = mergeGraphQLSchemas([...typeDefsSet]);
  }

  get resolvers(): IResolvers {
    if (typeof this._cache.resolvers === 'undefined') {
      this.buildSchemaAndInjector(this.modulesMap);
    }
    return this._cache.resolvers;
  }

  get schemaDirectives(): ISchemaDirectives {
    if (typeof this._cache.schemaDirectives === 'undefined') {
      this.buildSchemaAndInjector(this.modulesMap);
    }
    return this._cache.schemaDirectives;
  }

  get selfExtraSchemas(): GraphQLSchema[] {
    let extraSchemas = new Array<GraphQLSchema>();
    const extraSchemasDefinitions = this._options.extraSchemas;
    if (extraSchemasDefinitions) {
      if (typeof extraSchemasDefinitions === 'function') {
        extraSchemas = extraSchemasDefinitions(this);
      } else {
        extraSchemas = extraSchemasDefinitions;
      }
    }
    return extraSchemas;
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
  context = (request: Request) => this.contextBuilder(request);

  /**
   * Returns the GraphQL type definitions of the module
   * @return a `string` with the merged type definitions
   */
  get selfTypeDefs(): DocumentNode {
    let typeDefs: any = [];
    const typeDefsDefinitions = this._options.typeDefs;
    if (typeDefsDefinitions) {
      if (typeof typeDefsDefinitions === 'function') {
        typeDefs = typeDefsDefinitions(this);
      } else {
        typeDefs = typeDefsDefinitions;
      }
    }
    return mergeGraphQLSchemas(asArray(typeDefs));
  }

  get selfResolvers(): IResolvers {
    let resolvers: IResolvers = {};
    const resolversDefinitions = this._options.resolvers;
    if (resolversDefinitions) {
      if (typeof resolversDefinitions === 'function') {
        resolvers = resolversDefinitions(this);
      } else {
        resolvers = resolversDefinitions;
      }
    }
    return resolvers;
  }

  get selfImports() {
    let imports = new Array<ModuleDependency<any, Request, any>>();
    if (this._options.imports) {
      if (typeof this._options.imports === 'function') {
        imports = this._options.imports(this);
      } else {
        imports = this._options.imports;
      }
    }
    return imports;
  }

  get selfProviders(): Provider[] {
    let providers = new Array<Provider>();
    const providersDefinitions = this._options.providers;
    if (providersDefinitions) {
      if (typeof providersDefinitions === 'function') {
        providers = providersDefinitions(this);
      } else {
        providers = providersDefinitions;
      }
    }
    providers.unshift(
      {
        provide: ModuleConfig(this),
        useValue: this.config,
      },
    );
    return providers;
  }

  get selfResolversComposition(): IResolversComposerMapping {
    let resolversComposition: IResolversComposerMapping = {};
    const resolversCompositionDefinitions = this._options.resolversComposition;
    if (resolversCompositionDefinitions) {
      if (typeof resolversCompositionDefinitions === 'function') {
        resolversComposition = (resolversCompositionDefinitions as any)(this);
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
        schemaDirectives = schemaDirectivesDefinitions(this);
      } else {
        schemaDirectives = schemaDirectivesDefinitions;
      }
    }
    return schemaDirectives;
  }

  get selfLogger(): ILogger {
    let logger: ILogger;
    const loggerDefinitions = this._options.logger;
    if (loggerDefinitions) {
      if (typeof logger === 'function') {
        logger = (loggerDefinitions as any)(this);
      } else {
        logger = loggerDefinitions as ILogger;
      }
    }
    return logger;
  }

  private buildSchemaAndInjector(modulesMap: ModulesMap<Request>) {
    const imports = this.selfImports;
    const importsTypeDefs = new Set<DocumentNode>();
    const importsResolvers = new Set<IResolvers>();
    const importsInjectors = new Set<Injector>();
    const importsContextBuilders = new Set<(req: Request) => Promise<Context>>();
    const importsSchemaDirectives = new Set<ISchemaDirectives>();
    const importsExtraSchemas = new Set<GraphQLSchema>();
    for (let module of imports) {
      const moduleName = typeof module === 'string' ? module : module.name;
      module = modulesMap.get(moduleName);

      if (modulesMap !== module._cache.modulesMap) {
        module._cache.modulesMap = modulesMap;
        module.buildSchemaAndInjector(modulesMap);
      }

      const injector = module._cache.injector;
      const resolvers = module._cache.resolvers;
      const typeDefs = module._cache.typeDefs;
      const contextBuilder = module._cache.contextBuilder;
      const schemaDirectives = module._cache.schemaDirectives;
      const extraSchemas = module._cache.extraSchemas;

      importsInjectors.add(injector);
      importsResolvers.add(resolvers);
      if (typeDefs) {
        importsTypeDefs.add(typeDefs);
      }
      importsContextBuilders.add(contextBuilder);
      importsSchemaDirectives.add(schemaDirectives);
      for (const extraSchema of extraSchemas) {
        importsExtraSchemas.add(extraSchema);
      }
    }

    const injector = new Injector(this.name);
    injector.children = importsInjectors;

    const providers = this.selfProviders;
    for (const provider of providers) {
      injector.provide(provider);
    }

    for (const provider of providers) {
      injector.init(provider);
    }

    this._cache.injector = injector;

    const resolvers = addInjectorToResolversContext(this.selfResolvers, injector);

    const resolversComposition = addInjectorToResolversCompositionContext(this.selfResolversComposition, injector);

    const resolversToBeComposed = new Set(importsResolvers);
    resolversToBeComposed.add(resolvers);

    const composedResolvers = composeResolvers(
      mergeResolvers([...resolversToBeComposed]),
      resolversComposition,
    );

    this._cache.resolvers = composedResolvers;

    const typeDefsToBeMerged = new Set(importsTypeDefs);

    const selfTypeDefs = this.selfTypeDefs;
    if (selfTypeDefs) {
      typeDefsToBeMerged.add(selfTypeDefs);
    }

    const schemaDirectivesToBeMerged = new Set(importsSchemaDirectives);
    schemaDirectivesToBeMerged.add(this.selfSchemaDirectives);

    const mergedSchemaDirectives = deepmerge.all([...schemaDirectivesToBeMerged]) as ISchemaDirectives;

    this._cache.schemaDirectives = mergedSchemaDirectives;

    const extraSchemas = this.selfExtraSchemas;
    const allExtraSchemas = new Set(importsExtraSchemas);

    for (const extraSchema of extraSchemas) {
      allExtraSchemas.add(extraSchema);
    }

    this._cache.extraSchemas = [...allExtraSchemas];

    try {
      if (typeDefsToBeMerged.size || allExtraSchemas.size) {
        const mergedTypeDefs = mergeGraphQLSchemas([...typeDefsToBeMerged]);
        this._cache.typeDefs = mergedTypeDefs;
        const localSchema = makeExecutableSchema({
          typeDefs: mergedTypeDefs,
          resolvers: composedResolvers,
          schemaDirectives: mergedSchemaDirectives,
          resolverValidationOptions: {
            requireResolversForArgs: false,
            requireResolversForNonScalar: false,
            requireResolversForAllFields: false,
            requireResolversForResolveType: false,
            allowResolversNotInSchema: true,
          },
          logger: this.selfLogger,
        });
        this._cache.schema = mergeSchemas({
          schemas: [localSchema, ...allExtraSchemas],
        });
      }
    } catch (e) {
      if (e.message !== 'Must provide typeDefs') {
        if (e.message.includes(`Type "`) && e.message.includes(`" not found in document.`)) {
          const typeDef = e.message.replace('Type "', '').replace('" not found in document.', '');
          throw new TypeDefNotFoundError(typeDef, this.name);
        } else {
          throw new SchemaNotValidError(this.name, e.message);
        }
      } else {
        this._cache.schema = null;
      }
    }

    this._cache.contextBuilder = async networkRequest => {
      const importsContextArr$ = [...importsContextBuilders].map(contextBuilder => contextBuilder(networkRequest));
      const importsContextArr = await Promise.all(importsContextArr$);
      const importsContext = importsContextArr.reduce((acc, curr) => ({ ...acc, ...curr as any }), {});
      const moduleContext = await (this._options.contextBuilder ? this._options.contextBuilder(networkRequest, importsContext, this._cache.injector) : async () => ({}));
      const builtResult = {
        ...importsContext,
        ...moduleContext as any,
      };
      const requestHooks$ = providers.map(provider =>
        this._cache.injector.callRequestHookByProvider(
          provider,
          networkRequest,
          builtResult,
          this,
        ),
      );
      await Promise.all(requestHooks$);
      return builtResult;
    };
  }

  get contextBuilder(): (req: Request) => Promise<Context> {
    if (!this._cache.contextBuilder) {
      this.buildSchemaAndInjector(this.modulesMap);
    }
    return this._cache.contextBuilder;
  }

  get modulesMap() {
    if (!this._cache.modulesMap) {
      let modulesMap = this.createInitialModulesMap();
      modulesMap = this.checkAndFixModulesMap(modulesMap);
      this._cache.modulesMap = modulesMap;
    }
    return this._cache.modulesMap;
  }

  private createInitialModulesMap() {
    const modulesMap = new Map<string, GraphQLModule<any, Request, any>>();
    const visitModule = (module: GraphQLModule<any, Request, any>) => {
      if (!modulesMap.has(module.name)) {
        modulesMap.set(module.name, module);
        for (const subModule of module.selfImports) {
          if (!subModule) {
            throw new DependencyModuleUndefinedError(module.name);
          }
          if (typeof subModule !== 'string') {
            visitModule(subModule);
          }
        }
      }
    };
    visitModule(this);
    return modulesMap;
  }

  private checkAndFixModulesMap(modulesMap: ModulesMap<Request>): Map<string, GraphQLModule<any, Request, any>> {
    const graph = new DepGraph<GraphQLModule<any, Request, any>>();

    modulesMap.forEach(module => {
      const moduleName = module.name;
      if (!graph.hasNode(moduleName)) {
        graph.addNode(moduleName);
      }
    });

    const visitedModulesToAddDependency = new Set<string>();

    const visitModuleToAddDependency = (module: GraphQLModule<any, Request, any>) => {
      for (let subModule of module.selfImports) {
        const subModuleOrigName = typeof subModule === 'string' ? subModule : subModule.name;
        subModule = modulesMap.get(subModuleOrigName);
        if (!subModule) {
          throw new DependencyModuleNotFoundError(subModuleOrigName, module.name);
        }
        try {
          graph.addDependency(
            module.name,
            subModule.name,
          );
        } catch (e) {
          throw new DependencyModuleNotFoundError(subModuleOrigName, module.name);
        }
        // prevent infinite loop in case of circular dependency
        if (!visitedModulesToAddDependency.has(subModule.name)) {
          visitedModulesToAddDependency.add(subModule.name);
          visitModuleToAddDependency(subModule);
        }
      }
    };

    visitModuleToAddDependency(modulesMap.get(this.name));

    try {
      graph.overallOrder();
      return modulesMap;
    } catch (e) {
      const { message } = e as Error;
      const currentPathStr = message.replace('Dependency Cycle Found: ', '');
      const currentPath = currentPathStr.split(' -> ');
      const moduleIndexMap = new Map<string, number>();
      let start = 0;
      let end = currentPath.length;
      currentPath.forEach((moduleName, index) => {
        if (moduleIndexMap.has(moduleName)) {
          start = moduleIndexMap.get(moduleName);
          end = index;
        } else {
          moduleIndexMap.set(moduleName, index);
        }
      });
      const realPath = currentPath.slice(start, end);
      const circularModules = Array.from(new Set(realPath)).map(moduleName => {
        // if it is merged module, get one module, it will be enough to get merged one.
        return modulesMap.get(moduleName);
      });
      const mergedModule = GraphQLModule.mergeModules<any, Request, any>(circularModules, modulesMap);
      for (const moduleName of realPath) {
        modulesMap.set(moduleName, mergedModule);
        for (const subModuleName of moduleName.split('+')) {
          if (modulesMap.has(subModuleName)) {
            modulesMap.set(subModuleName, mergedModule);
          }
        }
      }
      modulesMap.set(mergedModule.name, mergedModule);
      (mergedModule._options.imports as Array<ModuleDependency<any, Request, any>>)
        = (mergedModule._options.imports as Array<ModuleDependency<any, Request, any>>).filter(
          module => {
            const moduleName = typeof module === 'string' ? module : module.name;
            module = modulesMap.get(moduleName);
            return (module.name !== mergedModule.name);
          },
        );
      return this.checkAndFixModulesMap(modulesMap);
    }
  }

  static mergeModules<Config = any, Request = any, Context = any>(modules: Array<GraphQLModule<any, Request, any>>, modulesMap?: ModulesMap<Request>): GraphQLModule<Config, Request, Context> {
    const nameSet = new Set();
    const typeDefsSet = new Set();
    const resolversSet = new Set<IResolvers>();
    const contextBuilderSet = new Set<BuildContextFn<Request, Context>>();
    const importsSet = new Set<ModuleDependency<any, Request, any>>();
    const providersSet = new Set<Provider<any>>();
    const resolversCompositionSet = new Set<IResolversComposerMapping>();
    const schemaDirectivesSet = new Set<ISchemaDirectives>();
    const loggerSet = new Set<ILogger>();
    const extraSchemasSet = new Set<GraphQLSchema>();
    for (const module of modules) {
      const subMergedModuleNames = module.name.split('+');
      for (const subMergedModuleName of subMergedModuleNames) {
        nameSet.add(subMergedModuleName);
      }
      if (Array.isArray(module.selfTypeDefs)) {
        for (const typeDef of module.selfTypeDefs) {
          typeDefsSet.add(typeDef);
        }
      } else {
        typeDefsSet.add(module.selfTypeDefs);
      }
      resolversSet.add(module.selfResolvers);
      contextBuilderSet.add(module._options.contextBuilder);
      for (let importModule of module.selfImports) {
        if (modulesMap) {
          importModule = modulesMap.get(typeof importModule === 'string' ? importModule : importModule.name);
        }
        importsSet.add(importModule);
      }
      for (const provider of module.selfProviders) {
        providersSet.add(provider);
      }
      resolversCompositionSet.add(module.selfResolversComposition);
      schemaDirectivesSet.add(module.selfSchemaDirectives);
      for (const extraSchema of module.selfExtraSchemas) {
        extraSchemasSet.add(extraSchema);
      }
      loggerSet.add(module.selfLogger);
    }

    const name = [...nameSet].join('+');
    const typeDefs = mergeGraphQLSchemas([...typeDefsSet]);
    const resolvers = mergeResolvers([...resolversSet]);
    const contextBuilder = [...contextBuilderSet].reduce(
      (accContextBuilder, currentContextBuilder) => {
        return async (networkRequest, currentContext, injector) => {
          const accContext = await accContextBuilder(networkRequest, currentContext, injector);
          const moduleContext = currentContextBuilder ? await currentContextBuilder(networkRequest, currentContext, injector) : {};
          return Object.assign({}, accContext, moduleContext);
        };
      },
    );
    const imports = [...importsSet];
    const providers = [...providersSet];
    const resolversComposition = deepmerge.all([...resolversCompositionSet]);
    const schemaDirectives = deepmerge.all([...schemaDirectivesSet]) as ISchemaDirectives;
    const logger = {
      log(message: string) {
        for (const logger of loggerSet) {
          logger.log(message);
        }
      },
    };
    const extraSchemas = [...extraSchemasSet];
    return new GraphQLModule<Config, Request, Context>({
      name,
      typeDefs,
      resolvers,
      contextBuilder,
      imports,
      providers,
      resolversComposition,
      schemaDirectives,
      extraSchemas,
      logger,
    });
  }
}
