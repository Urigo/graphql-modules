import { wrapSchema } from '@graphql-tools/wrap';
import { DocumentNode, execute, GraphQLSchema } from 'graphql';
import { uniqueId } from '../shared/utils';
import { InternalAppContext } from './application';
import { ExecutionContextBuilder } from './context';
import { ApolloExecutor, Application } from './types';

const CONTEXT_ID = Symbol.for('context-id');

export interface ApolloRequestContext {
  document: DocumentNode;
  operationName?: string | null;
  context?: any;
  request: {
    variables?: { [name: string]: any } | null;
  };
}

export function apolloExecutorCreator({
  createExecution,
  contextBuilder,
  schema,
}: {
  createExecution: Application['createExecution'];
  contextBuilder: ExecutionContextBuilder;
  schema: GraphQLSchema;
}): () => ApolloExecutor {
  return function createApolloExecutor() {
    const executor = createExecution();
    return function executorAdapter(requestContext: ApolloRequestContext) {
      return executor({
        schema,
        document: requestContext.document,
        operationName: requestContext.operationName,
        variableValues: requestContext.request.variables,
        contextValue: contextBuilder(requestContext.context),
      });
    };
  };
}

export function apolloSchemaCreator({
  createSubscription,
  contextBuilder,
  schema,
}: {
  createSubscription: Application['createSubscription'];
  contextBuilder: ExecutionContextBuilder;
  schema: GraphQLSchema;
}) {
  const createApolloSchema = () => {
    const sessions: Record<
      string,
      {
        count: number;
        session: {
          onDestroy(): void;
          context: InternalAppContext;
        };
      }
    > = {};
    const subscription = createSubscription();

    function getSession(ctx: any) {
      if (!ctx[CONTEXT_ID]) {
        ctx[CONTEXT_ID] = uniqueId((id) => !sessions[id]);
        const { context, onDestroy } = contextBuilder(ctx);

        sessions[ctx[CONTEXT_ID]] = {
          count: 0,
          session: {
            context,
            onDestroy() {
              if (--sessions[ctx[CONTEXT_ID]].count === 0) {
                onDestroy();
                delete sessions[ctx[CONTEXT_ID]];
              }
            },
          },
        };
      }

      sessions[ctx[CONTEXT_ID]].count++;

      return sessions[ctx[CONTEXT_ID]].session;
    }

    return wrapSchema({
      schema,
      executor(input) {
        // Create an execution context
        const { context, onDestroy } = getSession(input.context!);

        // It's important to wrap the executeFn within a promise
        // so we can easily control the end of execution (with finally)
        return Promise.resolve()
          .then(
            () =>
              execute({
                schema,
                document: input.document,
                contextValue: context,
                variableValues: input.variables,
                rootValue: input.info?.rootValue,
              }) as any
          )
          .finally(onDestroy);
      },
      subscriber(input) {
        return subscription({
          schema,
          document: input.document,
          variableValues: input.variables,
          contextValue: input.context,
          rootValue: input.info?.rootValue,
        }) as any;
      },
    });
  };

  return createApolloSchema;
}
