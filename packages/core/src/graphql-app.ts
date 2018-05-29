import { GraphQLSchema } from 'graphql';
import { makeExecutableSchema } from 'graphql-tools';
import { mergeResolvers, mergeGraphQLSchemas } from '@graphql-modules/epoxy';
import logger from '@graphql-modules/logger';
import { GraphQLModule } from './graphql-module';
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

  async buildContext(networkRequest: any): Promise<any> {
    const relevantModules: GraphQLModule[] = this._modules.filter(f => f.contextBuilder);
    const result = {};
    let module;

    try {
      for (module of relevantModules) {
        const appendToContext: any = await module.contextBuilder(networkRequest);

        if (appendToContext && typeof appendToContext === 'object') {
          Object.assign(result, appendToContext);
        }
      }
    } catch (e) {
      logger.error(`Unable to build context! Module ${module} failed: `, e);

      throw e;
    }

    return result;
  }
}
