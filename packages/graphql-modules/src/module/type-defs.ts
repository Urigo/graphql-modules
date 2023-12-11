import { DocumentNode, Kind } from 'graphql';
import { ModuleConfig } from './types.js';
import { NonDocumentNodeError, useLocation } from '../shared/errors.js';

/**
 * Create a list of DocumentNode objects based on Module's config.
 * Add a location, so we get richer errors.
 */
export function createTypeDefs(config: ModuleConfig): DocumentNode[] {
  const typeDefs = Array.isArray(config.typeDefs)
    ? config.typeDefs
    : [config.typeDefs];

  ensureDocumentNode(config, typeDefs);

  return typeDefs;
}

function ensureDocumentNode(config: ModuleConfig, typeDefs: any[]) {
  function ensureEach(doc: any, i: number) {
    if (doc?.kind !== Kind.DOCUMENT) {
      throw new NonDocumentNodeError(
        `Expected parsed document but received ${typeof doc} at index ${i} in typeDefs list`,
        useLocation(config)
      );
    }
  }

  typeDefs.forEach(ensureEach);
}
