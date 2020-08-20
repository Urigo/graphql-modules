import { Module, ModuleConfig, Resolvers } from './types';
import { metadataFactory } from './metadata';
import { createResolvers } from './resolvers';
import { createTypeDefs } from './type-defs';
import { MODULE_ID } from './tokens';
import {
  ReflectiveInjector,
  onlySingletonProviders,
  onlyOperationProviders,
  Provider,
} from '../di';
import { MiddlewareMap } from '../shared/middleware';
import { Single } from '../shared/types';

export type ResolvedModule = {
  injector: ReflectiveInjector;
  singletonProviders: Array<Provider<any>>;
  operationProviders: Array<Provider<any>>;
  resolvers?: Single<Resolvers>;
} & Omit<Module, 'factory'>;

export type ModuleFactory = (app: {
  injector: ReflectiveInjector;
  middlewares: MiddlewareMap;
}) => ResolvedModule;

export function moduleFactory(config: ModuleConfig): Module {
  const typeDefs = createTypeDefs(config);
  const metadata = metadataFactory(typeDefs, config);
  const providers =
    typeof config.providers === 'function'
      ? config.providers()
      : config.providers;

  const mod: Module = {
    id: config.id,
    metadata,
    typeDefs,
    providers,
    // Factory is called once on application creation,
    // before we even handle GraphQL Operation
    factory(app) {
      const resolvedModule: Partial<ResolvedModule> = mod;

      // Filter providers and keep them this way
      // so we don't do this filtering multiple times.
      // Providers don't change over time, so it's safe to do it.
      resolvedModule.operationProviders = onlyOperationProviders(providers);
      resolvedModule.singletonProviders = onlySingletonProviders(providers);

      // Create a  module-level Singleton injector
      const injector = ReflectiveInjector.create(
        `Module "${config.id}" (Singleton Scope)`,
        resolvedModule.singletonProviders.concat({
          // with module's id, useful in Logging and stuff
          provide: MODULE_ID,
          useValue: config.id,
        }),
        app.injector
      );

      // Instantiate all providers
      // Happens only once, on app / module creation
      injector.instantiateAll();

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
