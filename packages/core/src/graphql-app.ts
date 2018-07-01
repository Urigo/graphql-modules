import { GraphQLSchema } from 'graphql';
import { makeExecutableSchema, IResolvers } from 'graphql-tools';
import { mergeResolvers, mergeGraphQLSchemas } from '@graphql-modules/epoxy';
import logger from '@graphql-modules/logger';
import { GraphQLModule, IGraphQLContext } from './graphql-module';
import { CommunicationBridge } from './communication';
import { composeResolvers, IResolversComposerMapping } from './resolvers-composition';

export interface NonModules {
  typeDefs?: any;
  resolvers?: any;
}

export interface InitParams {
  [key: string]: any;
}

export interface GraphQLAppOptions {
  modules: GraphQLModule[];
  nonModules?: NonModules;
  communicationBridge?: CommunicationBridge;
  resolversComposition?: IResolversComposerMapping;
}

export class GraphQLApp {
  private readonly _modules: GraphQLModule[];
  private _schema: GraphQLSchema;
  private _resolvers: IResolvers;
  private _initModulesValue: { [key: string]: any; } = {};
  private _resolvedInitParams: { [key: string]: any; } = {};
  private _currentContext = null;
  private _allImplementations;

  constructor(private options: GraphQLAppOptions) {
    this._modules = options.modules;
  }

  private buildSchema() {
    const allTypes = this.options.modules.map<string>(m => m.typeDefs).filter(t => t);
    const nonModules = this.options.nonModules || {};
    const mergedResolvers = mergeResolvers(this._modules.map(m => m.resolvers || {}).concat(nonModules.resolvers || {}));
    this._resolvers = this.composeResolvers(mergedResolvers, this.options.resolversComposition);

    this._schema = makeExecutableSchema({
      typeDefs: mergeGraphQLSchemas([
        ...allTypes,
        ...(Array.isArray(nonModules.typeDefs) ? nonModules.typeDefs : nonModules.typeDefs ? [nonModules.typeDefs] : []),
      ]),
      resolvers: this._resolvers,
    });
  }

  private composeResolvers(resolvers: IResolvers, composition: IResolversComposerMapping) {
    if (composition) {
      return composeResolvers(resolvers, composition);
    }

    return resolvers;
  }

  async init(initParams?: InitParams | (() => InitParams) | (() => Promise<InitParams>)): Promise<void> {
    let params: InitParams = null;
    const builtResult = {};

    if (initParams) {
      if (typeof initParams === 'object') {
        params = initParams;
      } else if (typeof initParams === 'function') {
        params = initParams();
      }
    }

    this._resolvedInitParams = params;

    const relevantModules: GraphQLModule[] = this._modules.filter(f => f.onInit);
    let module;

    try {
      for (module of relevantModules) {
        const appendToContext: any = await module.onInit(params);

        if (typeof module.options.typeDefs === 'function') {
          module.typeDefs = module.options.typeDefs(params, appendToContext);
        }

        if (typeof module.options.resolvers === 'function') {
          module.resolvers = module.options.resolvers(params, appendToContext);
        }

        if (appendToContext && typeof appendToContext === 'object') {
          Object.assign(builtResult, { [module.name]: appendToContext });
        }
      }
    } catch (e) {
      logger.error(`Unable to initialized module! Module "${module.name}" failed: `, e);

      throw e;
    }

    this._initModulesValue = builtResult;
    this.buildSchema();
    this._allImplementations = await this.buildImplementationsObject();
  }

  get schema(): GraphQLSchema {
    if (!this._schema) {
      throw new Error(`GraphQL App schema is not built yet. Make sure you have called graphqlApp.init()!`);
    }

    return this._schema;
  }

  get resolvers(): IResolvers {
    return this._resolvers;
  }

  private async buildImplementationsObject() {
    const relevantImplModules: GraphQLModule[] = this._modules.filter(f => f.implementation);
    const result = {};

    for (const module of relevantImplModules) {
      result[module.name] =
        typeof module.implementation === 'function' ?
          await module.implementation(result, { getCurrentContext: () => this.getCurrentContext() }) :
          module.implementation;
    }

    return result;
  }

  private getCurrentContext() {
    return this._currentContext;
  }

  async buildContext(networkRequest?: any): Promise<IGraphQLContext> {
    const relevantContextModules: GraphQLModule[] = this._modules.filter(f => f.contextBuilder);
    const builtResult = { ...this._initModulesValue, initParams: this._resolvedInitParams || {} };
    const result = { ...this._allImplementations };

    let module;
    try {
      for (module of relevantContextModules) {
        const appendToContext: any = await module.contextBuilder(networkRequest);

        if (appendToContext && typeof appendToContext === 'object') {
          Object.assign(builtResult, appendToContext);
        }
      }
    } catch (e) {
      logger.error(`Unable to build context! Module "${module.name}" failed: `, e);

      throw e;
    }

    const builtKeys = Object.keys(builtResult);

    for (const key of builtKeys) {
      if (result.hasOwnProperty(key)) {
        logger.warn(`One of you context builders returned a key named ${key}, and it's conflicting with a root module name! Ignoring...`);
      } else {
        result[key] = builtResult[key];
      }
    }

    this._currentContext = result;

    return result;
  }
}
