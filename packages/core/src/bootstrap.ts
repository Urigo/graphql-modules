import {GraphQLSchema} from 'graphql';
import {Constructor, GraphQLModuleOptions, METADATA_KEY} from './graphql-module-decorator';
import {mergeGraphQLSchemas} from '../../epoxy/src';

export class GraphQLApp {
  private readonly _modules: Constructor[];
  private readonly _schema: GraphQLSchema;

  constructor(modules: Constructor[]) {
    this._modules = modules;
    this._schema = mergeGraphQLSchemas(modules.map(module => (module[METADATA_KEY] as GraphQLModuleOptions).schema));
  }

  getSchema(): GraphQLSchema {
    return this._schema;
  }
}

export function bootstrapModules(modules: Constructor[]): GraphQLApp {
  return new GraphQLApp(modules);
}