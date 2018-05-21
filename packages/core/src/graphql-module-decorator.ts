import {IResolvers} from 'graphql-tools';

export const METADATA_KEY = '$$GRAPHQL_MODULES';

export interface GraphQLModuleOptions {
  name: string;
  types?: string;
  resolvers?: IResolvers;
}

export interface IGraphQLContext {
  [key: string]: any;
}

export type Constructor<T = any> = { new(...args: any[]): T };

export type BuildContextFn = (httpRequest?: any) => IGraphQLContext;

export function GraphQLModule<T extends Constructor>(options: GraphQLModuleOptions) {
  return (target: T) => {
    target.prototype[METADATA_KEY] = options;

    return target;
  };
}

export interface GraphQLModuleContextBuilder {
  buildContext: BuildContextFn;
}

export function createGraphQLModule(options: GraphQLModuleOptions, buildContext?: BuildContextFn): Constructor {
  if (buildContext) {
    return GraphQLModule(options)(class implements GraphQLModuleContextBuilder {
      buildContext(currentContext: IGraphQLContext, httpRequest?: any): IGraphQLContext {
        return buildContext(httpRequest);
      }
    });
  }

  return GraphQLModule(options)(class {});
}
