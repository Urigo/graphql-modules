import {
  DocumentNode,
  ExecutionResult,
  GraphQLSchema,
  concatAST,
  print,
} from 'graphql';
import { Application } from './types';

export interface ApolloRequestContext {
  document: DocumentNode;
  operationName?: string | null;
  context?: any;
  schema: GraphQLSchema;
  request: {
    variables?: { [name: string]: any } | null;
  };
}

export interface ApolloGatewayLoadResult {
  executor: ApolloExecutor;
}

export type ApolloExecutor = (
  requestContext: ApolloRequestContext
) => Promise<ExecutionResult>;

export interface ApolloGatewayInterface {
  onSchemaLoadOrUpdate(
    callback: (schemaContext: {
      apiSchema: GraphQLSchema;
      coreSupergraphSdl: string;
    }) => void
  ): () => void;
  load(): Promise<ApolloGatewayLoadResult>;
  stop(): Promise<void>;
}

export function apolloGatewayCreator({
  schema,
  typeDefs,
  createExecution,
}: {
  schema: Application['schema'];
  typeDefs: Application['typeDefs'];
  createExecution: Application['createExecution'];
}): Application['createApolloGateway'] {
  return function createApolloGateway(options) {
    const executor = createExecution(options);
    return {
      onSchemaLoadOrUpdate(callback) {
        callback({
          apiSchema: schema,
          coreSupergraphSdl: print(concatAST(typeDefs)),
        });
        return () => {};
      },
      async load() {
        return {
          async executor(requestContext: ApolloRequestContext) {
            return executor({
              schema: requestContext.schema,
              document: requestContext.document,
              operationName: requestContext.operationName,
              variableValues: requestContext.request.variables,
              contextValue: requestContext.context,
            });
          },
        };
      },
      async stop() {},
    };
  };
}
