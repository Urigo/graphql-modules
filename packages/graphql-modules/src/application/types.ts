import {
  execute,
  subscribe,
  DocumentNode,
  GraphQLSchema,
  ExecutionResult,
} from 'graphql';
import { Provider } from '../di';
import { Resolvers, Module } from '../module/types';
import { Single } from '../shared/types';
import { MiddlewareMap } from '../shared/middleware';

type Execution = typeof execute;
type Subscription = typeof subscribe;

interface ApolloExecutorContext {
  document: DocumentNode;
  context: any;
  request: {
    variables?: any;
  };
  operationName?: string;
}
type ApolloExecutor = (
  ctx: ApolloExecutorContext
) => ExecutionResult | Promise<ExecutionResult>;

/**
 * @api
 * A return type of `createApplication` function.
 */
export type Application = {
  /**
   * A list of type definitions defined by modules.
   */
  readonly typeDefs: DocumentNode[];
  /**
   * An object with resolve functions defined by modules.
   */
  readonly resolvers?: Single<Resolvers>;
  /**
   * Ready to use GraphQLSchema object combined from modules.
   */
  readonly schema: GraphQLSchema;
  /**
   * Creates a `subscribe` function that runs the subscription phase of GraphQL.
   * Important when using GraphQL Subscriptions.
   */
  createSubscription(options?: { subscribe?: typeof subscribe }): Subscription;
  /**
   * Creates a `execute` function that runs the execution phase of GraphQL.
   * Important when using GraphQL Queries and Mutations.
   */
  createExecution(options?: { execute?: typeof execute }): Execution;
  /**
   * Experimental
   */
  __createApolloExecutor(options?: {
    execute?: typeof execute;
  }): ApolloExecutor;
};

/**
 * @api
 * Application's configuration object. Represents the first argument of `createApplication` function.
 */
export interface ApplicationConfig {
  /**
   * A list of GraphQL Modules
   */
  modules: Module[];
  /**
   * A list of Providers - read the ["Providers and Tokens"](./di/providers) chapter.
   */
  providers?: Provider[] | (() => Provider[]);
  /**
   * A map of middlewares - read the ["Middlewares"](./advanced/middlewares) chapter.
   */
  middlewares?: MiddlewareMap;
}
