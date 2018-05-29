import { GraphQLSchema } from 'graphql';
import { makeExecutableSchema } from 'graphql-tools';
import { mergeResolvers, mergeGraphQLSchemas } from '@graphql-modules/epoxy';
import logger from '@graphql-modules/logger';
import { GraphQLModule, IGraphQLContext } from './graphql-module';
import { CommunicationBridge } from './communication-bridge';

export interface GraphQLAppOptions {
  modules: GraphQLModule[];
  communicationBridge?: CommunicationBridge;
}

export class GraphQLApp {
  private readonly _modules: GraphQLModule[];
  private readonly _schema: GraphQLSchema;

  constructor(options: GraphQLAppOptions) {
    const allTypes = options.modules.map<string>(m => m.typeDefs).filter(t => t);

    this._modules = options.modules;
    this._schema = makeExecutableSchema({
      typeDefs: mergeGraphQLSchemas(allTypes),
      resolvers: mergeResolvers(options.modules.map(m => m.resolvers || {})),
    });
  }

  get schema(): GraphQLSchema {
    return this._schema;
  }

  async buildContext(networkRequest?: any): Promise<IGraphQLContext> {
    const relevantContextModules: GraphQLModule[] = this._modules.filter(f => f.contextBuilder);
    const relevantImplModules: GraphQLModule[] = this._modules.filter(f => f.implementation);
    const result = {};
    const builtResult = {};

    let module;
    for (module of relevantImplModules) {
      result[module.name] = module.implementation;
    }

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

    return result;
  }
}
