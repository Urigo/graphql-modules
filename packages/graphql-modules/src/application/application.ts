import {
  execute,
  subscribe,
  DocumentNode,
  GraphQLSchema,
  ExecutionArgs,
  SubscriptionArgs,
  GraphQLFieldResolver,
  GraphQLTypeResolver,
} from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { mergeResolvers } from '@graphql-tools/merge';
import { wrapSchema } from '@graphql-tools/wrap';
import {
  ReflectiveInjector,
  onlySingletonProviders,
  onlyOperationProviders,
} from '../di';
import { ResolvedModule } from '../module/factory';
import { ID, Maybe } from '../shared/types';
import { ModuleDuplicatedError } from '../shared/errors';
import tapAsyncIterator, {
  flatten,
  isAsyncIterable,
  once,
  uniqueId,
} from '../shared/utils';
import { CONTEXT } from './tokens';
import { ApplicationConfig, Application } from './types';

type ExecutionContextBuilder<
  TContext extends {
    [key: string]: any;
  } = {}
> = (
  context: TContext
) => {
  context: InternalAppContext;
  onDestroy: () => void;
};

export type ModulesMap = Map<ID, ResolvedModule>;

/**
 * @internal
 */
export interface InternalAppContext {
  ɵgetModuleContext(
    moduleId: ID,
    context: GraphQLModules.GlobalContext
  ): GraphQLModules.ModuleContext;
}

const CONTEXT_ID = Symbol.for('context-id');

/**
 * @api
 * Creates Application out of Modules. Accepts `ApplicationConfig`.
 *
 * @example
 *
 * ```typescript
 * import { createApplication } from 'graphql-modules';
 * import { usersModule } from './users';
 * import { postsModule } from './posts';
 * import { commentsModule } from './comments';
 *
 * const app = createApplication({
 *   modules: [
 *     usersModule,
 *     postsModule,
 *     commentsModule
 *   ]
 * })
 * ```
 */
export function createApplication(config: ApplicationConfig): Application {
  const providers =
    config.providers && typeof config.providers === 'function'
      ? config.providers()
      : config.providers;
  // Creates an Injector with singleton classes at application level
  const appInjector = ReflectiveInjector.create(
    'App (Singleton Scope)',
    onlySingletonProviders(providers)
  );
  // Filter Operation-scoped providers, and keep it here
  // so we don't do it over and over again
  const appOperationProviders = onlyOperationProviders(providers);
  const middlewareMap = config.middlewares || {};

  // Instantiate all providers
  // Happens only once, on app creation
  appInjector.instantiateAll();

  // Create all modules
  const modules = config.modules.map((mod) =>
    mod.factory({
      injector: appInjector,
      middlewares: middlewareMap,
    })
  );
  const moduleMap = createModuleMap(modules);

  // Creating a schema, flattening the typedefs and resolvers
  // is not expensive since it happens only once
  const typeDefs = flatten(modules.map((mod) => mod.typeDefs));
  const resolvers = mergeResolvers(
    modules.map((mod) => mod.resolvers).filter(Boolean)
  );
  const schema = makeExecutableSchema({ typeDefs, resolvers });

  // This is very critical. It creates an execution context.
  // It has to run on every operation.
  const contextBuilder: ExecutionContextBuilder<GraphQLModules.GlobalContext> = (
    context
  ) => {
    // Cache for context per module
    let contextCache: Record<ID, GraphQLModules.ModuleContext> = {};
    // A list of providers with OnDestroy hooks
    // It's a tuple because we want to know which Injector controls the provider
    // and we want to know if the provider was even instantiated.
    let providersToDestroy: Array<[ReflectiveInjector, number]> = [];

    function registerProvidersToDestroy(injector: ReflectiveInjector) {
      injector._providers.forEach((provider) => {
        if (provider.factory.hasOnDestroyHook) {
          // keep provider key's id (it doesn't change over time)
          // and related injector
          providersToDestroy.push([injector, provider.key.id]);
        }
      });
    }

    // It's very important to recreate a Singleton Injector
    // and add an execution context getter function
    // We do this so Singleton provider can access the ExecutionContext via Proxy
    const singletonAppProxyInjector = ReflectiveInjector.createWithExecutionContext(
      appInjector,
      () => context
    );

    // As the name of the Injector says, it's an Operation scoped Injector
    // Application level
    // Operation scoped - means it's created and destroyed on every GraphQL Operation
    const operationAppInjector = ReflectiveInjector.create(
      'App (Operation Scope)',
      appOperationProviders.concat({
        provide: CONTEXT,
        useValue: context,
      }),
      singletonAppProxyInjector
    );

    // Track Providers with OnDestroy hooks
    registerProvidersToDestroy(operationAppInjector);

    return {
      onDestroy: once(() => {
        providersToDestroy.forEach(([injector, keyId]) => {
          // If provider was instantiated
          if (injector._isObjectDefinedByKeyId(keyId)) {
            // call its OnDestroy hook
            injector._getObjByKeyId(keyId).onDestroy();
          }
        });
        contextCache = {};
      }),
      context: {
        // We want to pass the received context
        ...(context || {}),
        // Here's something very crutial
        // It's a function that is used in module's context creation
        ɵgetModuleContext(moduleId, ctx) {
          // Reuse a context or create if not available
          if (!contextCache[moduleId]) {
            // We're interested in operation-scoped providers only
            const providers = moduleMap.get(moduleId)?.operationProviders!;
            // Module-level Singleton Injector
            const singletonModuleInjector = moduleMap.get(moduleId)!.injector;

            (singletonModuleInjector as any)._parent = singletonAppProxyInjector;

            // It's very important to recreate a Singleton Injector
            // and add an execution context getter function
            // We do this so Singleton provider can access the ExecutionContext via Proxy
            const singletonModuleProxyInjector = ReflectiveInjector.createWithExecutionContext(
              singletonModuleInjector,
              () => contextCache[moduleId]
            );

            // Create module-level Operation-scoped Injector
            const operationModuleInjector = ReflectiveInjector.create(
              `Module "${moduleId}" (Operation Scope)`,
              providers.concat([
                {
                  provide: CONTEXT,
                  useValue: context,
                },
              ]),
              // This injector has a priority
              singletonModuleProxyInjector,
              // over this one
              operationAppInjector
            );

            // Same as on application level, we need to collect providers with OnDestroy hooks
            registerProvidersToDestroy(operationModuleInjector);

            contextCache[moduleId] = {
              ...ctx,
              injector: operationModuleInjector,
              moduleId,
            };
          }

          return contextCache[moduleId];
        },
      },
    };
  };

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
      const { context, onDestroy } = contextBuilder(
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
            return tapAsyncIterator(sub, onDestroy);
          }
          return sub;
        })
        .finally(() => {
          if (!isIterable) {
            onDestroy();
          }
        });
    };
  };

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
      const { context, onDestroy } = contextBuilder(
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
        .finally(onDestroy);
    };
  };

  return {
    typeDefs,
    resolvers,
    schema,
    createSubscription,
    createExecution,
    createSchemaForApollo() {
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
    },
  };
}

function createModuleMap(modules: ResolvedModule[]): ModulesMap {
  const moduleMap = new Map<string, ResolvedModule>();

  for (const module of modules) {
    if (moduleMap.has(module.id)) {
      const location = module.metadata.dirname;
      const existingLocation = moduleMap.get(module.id)?.metadata.dirname;

      const info = [];

      if (existingLocation) {
        info.push(`Already registered module located at: ${existingLocation}`);
      }

      if (location) {
        info.push(`Duplicated module located at: ${location}`);
      }

      throw new ModuleDuplicatedError(
        `Module "${module.id}" already exists`,
        ...info
      );
    }

    moduleMap.set(module.id, module);
  }

  return moduleMap;
}

function isNotSchema<T>(obj: any): obj is T {
  return obj instanceof GraphQLSchema === false;
}
