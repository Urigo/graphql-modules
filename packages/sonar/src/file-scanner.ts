import {sync} from 'glob';
import {readFileSync} from 'fs';
import {logger} from '@graphql-modules/logger';

const DEFAULT_SCHEMA_EXTENSIONS = ['gql', 'graphql', 'graphqls'];
const DEFAULT_RESOLVERS_EXTENSIONS = ['ts', 'js'];

function scanForFiles(globStr: string): string[] {
  return sync(globStr, {absolute: true});
}

function buildGlob(basePath: string, extensions: string[]): string {
  return `${basePath}/**/*.${extensions.length === 1 ? extensions[0] : '{' + extensions.join(',') + '}'}`;
}

function extractExports(fileExport: any): any | null {
  if (!fileExport) {
    return null;
  }

  if (fileExport.default) {
    if (fileExport.default.resolver || fileExport.default.resolvers) {
      return fileExport.default.resolver || fileExport.default.resolvers;
    }

    return fileExport.default;
  }

  if (fileExport.resolver) {
    return fileExport.resolver;
  }

  if (fileExport.resolvers) {
    return fileExport.resolvers;
  }

  return fileExport;
}

export function loadSchemaFiles(basePath: string, extensions: string[] = DEFAULT_SCHEMA_EXTENSIONS): string[] {
  const relevantPaths = scanForFiles(buildGlob(basePath, extensions));

  return relevantPaths.map(path => readFileSync(path, {encoding: 'utf-8'}));
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
