import {
  DocumentNode,
  execute,
  ExecutionArgs,
  GraphQLFieldResolver,
  GraphQLSchema,
  GraphQLTypeResolver,
} from 'graphql';
import { Application } from './types.js';
import { ExecutionContextBuilder } from './context.js';
import { Maybe } from '../shared/types.js';
import { isNotSchema } from '../shared/utils.js';

export function executionCreator({
  contextBuilder,
}: {
  contextBuilder: ExecutionContextBuilder;
}) {
  const createExecution: Application['createExecution'] = (options) => {
    // Custom or original execute function
    const executeFn = options?.execute || execute;

    return (
      argsOrSchema: ExecutionArgs | GraphQLSchema,
      document?: DocumentNode,
      rootValue?: any,
      contextValue?: any,
      variableValues?: Maybe<{ [key: string]: any }>,
      operationName?: Maybe<string>,
      fieldResolver?: Maybe<GraphQLFieldResolver<any, any>>,
      typeResolver?: Maybe<GraphQLTypeResolver<any, any>>
    ) => {
      // Create an execution context
      const { context, ɵdestroy: destroy } =
        options?.controller ??
        contextBuilder(
          isNotSchema<ExecutionArgs>(argsOrSchema)
            ? argsOrSchema.contextValue
            : contextValue
        );

      const executionArgs: ExecutionArgs = isNotSchema<ExecutionArgs>(
        argsOrSchema
      )
        ? {
            ...argsOrSchema,
            contextValue: context,
          }
        : {
            schema: argsOrSchema,
            document: document!,
            rootValue,
            contextValue: context,
            variableValues,
            operationName,
            fieldResolver,
            typeResolver,
          };

      // It's important to wrap the executeFn within a promise
      // so we can easily control the end of execution (with finally)
      return Promise.resolve()
        .then(() => executeFn(executionArgs))
        .finally(destroy);
    };
  };

  return createExecution;
}
