import { sync } from 'glob';
import { readFileSync } from 'fs';

const DEFAULT_SCHEMA_EXTENSIONS = ['gql', 'graphql', 'graphqls'];
const DEFAULT_RESOLVERS_EXTENSIONS = ['ts', 'js'];

function scanForFiles(globStr: string): string[] {
  return sync(globStr);
}

function buildGlob(basePath: string, extensions: string[]): string {
  return `${basePath}/**/*.${extensions.length === 1 ? extensions[0] : '{' + extensions.join(',') + '}'}`;
}

export function loadSchemaFiles(basePath: string, extensions: string[] = DEFAULT_SCHEMA_EXTENSIONS): string[] {
  const relevantPaths = scanForFiles(buildGlob(basePath, extensions));

  return relevantPaths.map(path => readFileSync(path, { encoding: 'utf-8' }));
}

export function loadResolversFiles(basePath: string, extensions: string[] = DEFAULT_RESOLVERS_EXTENSIONS): string[] {
  return scanForFiles(buildGlob(basePath, extensions));
}
