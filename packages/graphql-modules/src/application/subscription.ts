import {
  DocumentNode,
  GraphQLFieldResolver,
  GraphQLSchema,
  subscribe,
  SubscriptionArgs,
} from 'graphql';
import { Maybe } from '../shared/types.js';
import {
  tapAsyncIterator,
  isAsyncIterable,
  isNotSchema,
} from '../shared/utils.js';
import { ExecutionContextBuilder } from './context.js';
import { Application } from './types.js';

export function subscriptionCreator({
  contextBuilder,
}: {
  contextBuilder: ExecutionContextBuilder;
}) {
  const createSubscription: Application['createSubscription'] = (options) => {
    // Custom or original subscribe function
    const subscribeFn = options?.subscribe || subscribe;

    return (
      argsOrSchema: SubscriptionArgs | GraphQLSchema,
      document?: DocumentNode,
      rootValue?: any,
      contextValue?: any,
      variableValues?: Maybe<{ [key: string]: any }>,
      operationName?: Maybe<string>,
      fieldResolver?: Maybe<GraphQLFieldResolver<any, any>>,
      subscribeFieldResolver?: Maybe<GraphQLFieldResolver<any, any>>
    ) => {
      // Create an subscription context
      const { context, ɵdestroy: destroy } =
        options?.controller ??
        contextBuilder(
          isNotSchema<SubscriptionArgs>(argsOrSchema)
            ? argsOrSchema.contextValue
            : contextValue
        );

      const subscriptionArgs: SubscriptionArgs = isNotSchema<SubscriptionArgs>(
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
            subscribeFieldResolver,
          };

      let isIterable = false;

      // It's important to wrap the subscribeFn within a promise
      // so we can easily control the end of subscription (with finally)
      return Promise.resolve()
        .then(() => subscribeFn(subscriptionArgs))
        .then((sub) => {
          if (isAsyncIterable(sub)) {
            isIterable = true;
            return tapAsyncIterator(sub, destroy);
          }
          return sub;
        })
        .finally(() => {
          if (!isIterable) {
            destroy();
          }
        });
    };
  };

  return createSubscription;
}
