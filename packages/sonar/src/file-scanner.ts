import { IOptions, sync } from 'glob';
import { extname } from 'path';
import { readFileSync } from 'fs';
import { print } from 'graphql';

const DEFAULT_SCHEMA_EXTENSIONS = ['gql', 'graphql', 'graphqls', 'ts', 'js'];
const DEFAULT_IGNORED_RESOLVERS_EXTENSIONS = ['spec', 'test', 'd'];
const DEFAULT_RESOLVERS_EXTENSIONS = ['ts', 'js'];

function scanForFiles(globStr: string, globOptions: IOptions = {}): string[] {
  return sync(globStr, { absolute: true, ...globOptions });
}

function buildGlob(basePath: string, extensions: string[], ignoredExtensions: string[] = []): string {
  return `${basePath}/**/${ignoredExtensions.length > 0 ? `!(${ignoredExtensions.map(e => '*.' + e).join('|')})` : '*'}+(${extensions.map(e => '*.' + e).join('|')})`;
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

export interface LoadSchemaFilesOptions {
  extensions?: string[];
  useRequire?: boolean;
  requireMethod?: any;
  globOptions?: IOptions;
}

const LoadSchemaFilesDefaultOptions: LoadSchemaFilesOptions = {
  extensions: DEFAULT_SCHEMA_EXTENSIONS,
  useRequire: false,
  requireMethod: null,
  globOptions: {},
};

export function loadSchemaFiles(basePath: string, options: LoadSchemaFilesOptions = LoadSchemaFilesDefaultOptions): string[] {
  const execOptions = { ...LoadSchemaFilesDefaultOptions, ...options };
  const relevantPaths = scanForFiles(buildGlob(basePath, execOptions.extensions, []), options.globOptions);

  return relevantPaths.map(path => {
    const extension = extname(path);

    if (extension === '.js' || extension === '.ts' || execOptions.useRequire) {
      const fileExports = (execOptions.requireMethod ? execOptions.requireMethod : require)(path);
      const extractedExport = extractExports(fileExports);

      if (extractedExport && extractedExport.kind === 'Document') {
        return print(extractedExport);
      }

      return extractedExport;
    } else {
      return readFileSync(path, { encoding: 'utf-8' });
    }
  });
}

export interface LoadResolversFilesOptions {
  ignoredExtensions?: string[];
  extensions?: string[];
  requireMethod?: any;
  globOptions?: IOptions;
}

const LoadResolversFilesDefaultOptions: LoadResolversFilesOptions = {
  ignoredExtensions: DEFAULT_IGNORED_RESOLVERS_EXTENSIONS,
  extensions: DEFAULT_RESOLVERS_EXTENSIONS,
  requireMethod: null,
  globOptions: {},
};

export function loadResolversFiles(basePath: string, options: LoadResolversFilesOptions = LoadResolversFilesDefaultOptions): any[] {
  const execOptions = { ...LoadResolversFilesDefaultOptions, ...options };
  const relevantPaths = scanForFiles(buildGlob(basePath, execOptions.extensions, execOptions.ignoredExtensions), execOptions.globOptions);

  return relevantPaths.map(path => {
    try {
      const fileExports = (execOptions.requireMethod ? execOptions.requireMethod : require)(path);

      return extractExports(fileExports);
    } catch (e) {
      throw new Error(`Unable to load resolver file: ${path}, error: ${e}`);
      return null;
    }
  }).filter(t => t);
}
