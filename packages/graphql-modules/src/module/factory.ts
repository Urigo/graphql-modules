import { Module, ModuleConfig, Resolvers } from './types';
import { metadataFactory } from './metadata';
import { createResolvers } from './resolvers';
import { createTypeDefs } from './type-defs';
import { MODULE_ID } from './tokens';
import {
  ReflectiveInjector,
  onlySingletonProviders,
  onlyOperationProviders,
} from '../di';
import { ResolvedProvider, resolveProviders } from './../di/resolution';
import { MiddlewareMap } from '../shared/middleware';
import { Single } from '../shared/types';

export type ResolvedModule = {
  injector: ReflectiveInjector;
  singletonProviders: Array<ResolvedProvider>;
  operationProviders: Array<ResolvedProvider>;
  resolvers?: Single<Resolvers>;
} & Omit<Module, 'factory'>;

export type ModuleFactory = (app: {
  injector: ReflectiveInjector;
  middlewares: MiddlewareMap;
}) => ResolvedModule;

function lazy<T>(getter: () => T) {
  let called = false;
  let computedValue: T;

  return {
    get value() {
      if (!called) {
        called = true;
        computedValue = getter();
      }

      return computedValue;
    },
  };
}

export function moduleFactory(config: ModuleConfig): Module {
  const typeDefs = createTypeDefs(config);
  const metadata = metadataFactory(typeDefs, config);
  const providers = lazy(() =>
    typeof config.providers === 'function'
      ? config.providers()
      : config.providers
  );

  // Filter providers and keep them this way
  // so we don't do this filtering multiple times.
  // Providers don't change over time, so it's safe to do it.
  const operationProviders = lazy(() =>
    ReflectiveInjector.resolve(onlyOperationProviders(providers.value))
  );
  const singletonProviders = lazy(() =>
    ReflectiveInjector.resolve(onlySingletonProviders(providers.value))
  );

  const mod: Module = {
    id: config.id,
    config,
    metadata,
    typeDefs,
    // Factory is called once on application creation,
    // before we even handle GraphQL Operation
    factory(app) {
      const resolvedModule: Partial<ResolvedModule> = mod;
      resolvedModule.singletonProviders = singletonProviders.value;
      resolvedModule.operationProviders = operationProviders.value;

      // Create a  module-level Singleton injector
      const injector = ReflectiveInjector.createFromResolved({
        name: `Module "${config.id}" (Singleton Scope)`,
        providers: resolvedModule.singletonProviders.concat(
          resolveProviders([
            {
              // with module's id, useful in Logging and stuff
              provide: MODULE_ID,
              useValue: config.id,
            },
          ])
        ),
        parent: app.injector,
      });

      // We attach injector property to existing `mod` object
      // because we want to keep references
      // that are later on used in testing utils
      resolvedModule.injector = injector;

      // Create resolvers object based on module's config
      // It involves wrapping a resolver with middlewares
      // and other things like validation
      resolvedModule.resolvers = createResolvers(config, metadata, {
        middlewareMap: app.middlewares,
      });

      return resolvedModule as ResolvedModule;
    },
  };

  return mod;
}
