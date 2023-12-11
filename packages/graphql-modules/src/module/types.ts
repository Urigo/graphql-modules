import { DocumentNode } from 'graphql';
import { ModuleFactory } from './factory.js';
import { ID, Plural } from '../shared/types.js';
import { ModuleMetadata } from './metadata.js';
import { Provider } from '../di/index.js';
import { MiddlewareMap } from '../shared/middleware.js';
import { ResolvedProvider } from '../di/resolution.js';

export type TypeDefs = Plural<DocumentNode>;
export type Resolvers = Plural<Record<string, any>>;

/**
 * @api
 * Module's configuration object. Represents the first argument of `createModule` function.
 */
export interface ModuleConfig {
  /**
   * Unique identifier of a module
   */
  id: ID;
  /**
   * Pass `__dirname` variable as a value to get better error messages.
   */
  dirname?: string;
  /**
   * An object or a list of GraphQL type definitions (SDL).
   */
  typeDefs: TypeDefs;
  /**
   * An object or a list of GraphQL resolve functions.
   */
  resolvers?: Resolvers;
  /**
   * A map of middlewares - read the ["Middlewares"](./advanced/middlewares) chapter.
   */
  middlewares?: MiddlewareMap;
  /**
   * A list of Providers - read the ["Providers and Tokens"](./di/providers) chapter.
   */
  providers?: Provider[] | (() => Provider[]);
}

export interface Module {
  id: ID;
  providers?: Provider[];
  typeDefs: DocumentNode[];
  metadata: ModuleMetadata;
  factory: ModuleFactory;
  operationProviders: ResolvedProvider[];
  singletonProviders: ResolvedProvider[];
  config: ModuleConfig;
}

export interface MockedModule extends Module {
  /**
   * @internal
   */
  ɵoriginalModule: Module;
}
