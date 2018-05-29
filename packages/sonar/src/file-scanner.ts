import { sync } from 'glob';
import { extname } from 'path';
import { readFileSync } from 'fs';
import { logger } from '@graphql-modules/logger';
import { DocumentNode, print } from 'graphql';

const DEFAULT_SCHEMA_EXTENSIONS = ['gql', 'graphql', 'graphqls', 'ts', 'js'];
const DEFAULT_RESOLVERS_EXTENSIONS = ['ts', 'js'];

function scanForFiles(globStr: string): string[] {
  return sync(globStr, { absolute: true });
}

function buildGlob(basePath: string, extensions: string[]): string {
  return `${basePath}/**/*.${extensions.length === 1 ? extensions[0] : '{' + extensions.join(',') + '}'}`;
}

function extractExports(fileExport: any): any | null {
  if (!fileExport) {
    return null;
  }

  if (fileExport.default) {
    if (fileExport.default.resolver || fileExport.default.resolvers || fileExport.default.schema) {
      return fileExport.default.resolver || fileExport.default.resolvers || fileExport.default.schema;
    }

    return fileExport.default;
  }

  if (fileExport.resolver) {
    return fileExport.resolver;
  }

  if (fileExport.resolvers) {
    return fileExport.resolvers;
  }

  if (fileExport.schema) {
    return fileExport.schema;
  }

  return fileExport;
}

export function loadSchemaFiles(basePath: string, extensions: string[] = DEFAULT_SCHEMA_EXTENSIONS): string[] {
  const relevantPaths = scanForFiles(buildGlob(basePath, extensions));

  return relevantPaths.map(path => {
    const extension = extname(path);

    if (extension === '.js' || extension === '.ts') {
      const fileExports = require(path);

      const extractedExport = extractExports(fileExports);

      if (extractedExport && extractedExport.kind === 'Document') {
        return print(extractedExport);
      }

      return extractedExport;
    } else {
      return readFileSync(path, {encoding: 'utf-8'});
    }
  });
}

export function loadResolversFiles(basePath: string, extensions: string[] = DEFAULT_RESOLVERS_EXTENSIONS): any[] {
  const relevantPaths = scanForFiles(buildGlob(basePath, extensions));

  return relevantPaths.map(path => {
    try {
      const fileExports = require(path);

      return extractExports(fileExports);
    } catch (e) {
      logger.error(`Unable to load resolver file: ${path}`, e);

      return null;
    }
  }).filter(t => t);
}
