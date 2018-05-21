import {GraphQLSchema} from 'graphql';

export const METADATA_KEY = '$$GRAPHQL_MODULES';

export interface GraphQLModuleOptions {
  name: string;
  schema: GraphQLSchema;
}

export interface IGraphQLContext {
  [key: string]: any;
}

export type Constructor<T = any> = { new(...args: any[]): T };

export type RequestGenericObject =
  | {
  headers: { [name: string]: string | string[] | undefined | null };
  [key: string]: any;
}
  | undefined
  | null;

export type BuildContextFn = (currentContext: IGraphQLContext, request?: RequestGenericObject) => IGraphQLContext;

export function GraphQLModule<T extends Constructor>(options: GraphQLModuleOptions) {
  return function (target: T) {
    target.prototype[METADATA_KEY] = options;

    return target;
  };
}

export interface GraphQLModuleContextBuilderHttp {
  buildContext: BuildContextFn;
}

export function createGraphQLModule(options: GraphQLModuleOptions, buildContext?: BuildContextFn): Function {
  if (buildContext) {
    let result = class implements GraphQLModuleContextBuilderHttp {
      buildContext(currentContext: IGraphQLContext, request?: RequestGenericObject): IGraphQLContext {
        return buildContext(currentContext, request);
      }
    };

    return GraphQLModule(options)(result);
  }

  let result = class {
  };

  return GraphQLModule(options)(result);
}
