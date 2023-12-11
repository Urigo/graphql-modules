import { moduleFactory } from './factory.js';
import { ModuleConfig } from './types.js';

/**
 * @api
 * Creates a Module, an element used by Application. Accepts `ModuleConfig`.
 *
 * @example
 *
 * ```typescript
 * import { createModule, gql } from 'graphql-modules';
 *
 * export const usersModule = createModule({
 *   id: 'users',
 *   typeDefs: gql`
 *     // GraphQL SDL
 *   `,
 *   resolvers: {
 *     // ...
 *   }
 * });
 * ```
 */
export function createModule(config: ModuleConfig) {
  return moduleFactory(config);
}
