import { CircularDependencyError } from './errors/circular-dependency-error';
import * as glob from 'glob';
import * as parser from '@babel/parser';
import * as fs from 'fs';
import traverse from '@babel/traverse';
import {
  isIdentifier,
  isObjectExpression,
  isStringLiteral,
  isObjectProperty,
  isNewExpression,
  isArrayExpression,
  isImportDeclaration,
  isDecorator,
  isCallExpression,
  isClassMethod,
  isTSParameterProperty,
  isTSTypeReference,
  isTSTypeAnnotation,
  isTSTypeParameterInstantiation
} from '@babel/types';
import { DepGraph } from 'dependency-graph';

export type Module = {
  path: string;
  identifier: string | null;
  name: string | null;
  providers: {
    name: string;
    importedFrom: string;
  }[];
};

export type Provider = {
  name: string;
  path: string;
  injectables: string[];
};

export type ScanResult = {
  modules: Module[];
  providers: Provider[];
};

export function extractFromFiles(files: { path: string; content: string }[]): ScanResult {
  const foundModules: Module[] = [];
  const foundProviders: Provider[] = [];

  for (const file of files) {
    const ast = parser.parse(file.content, {
      sourceType: 'module',
      plugins: ['decorators-legacy', 'classProperties', 'typescript']
    });

    traverse(ast as any, {
      ClassDeclaration: {
        enter(path) {
          if (
            isIdentifier(path.node.id) &&
            path.node.decorators &&
            path.node.decorators.length > 0 &&
            isDecorator(path.node.decorators[0]) &&
            isCallExpression(path.node.decorators[0].expression) &&
            isIdentifier(path.node.decorators[0].expression.callee) &&
            path.node.decorators[0].expression.callee.name === 'Injectable'
          ) {
            const injectables: string[] = [];

            if (path.node.body && path.node.body.body && path.node.body.body.length > 0) {
              for (const classItem of path.node.body.body) {
                if (
                  isClassMethod(classItem) &&
                  classItem.kind === 'constructor' &&
                  classItem.params &&
                  classItem.params.length > 0
                ) {
                  for (const ctorParam of classItem.params) {
                    if (
                      isTSParameterProperty(ctorParam) &&
                      isIdentifier(ctorParam.parameter) &&
                      isTSTypeAnnotation(ctorParam.parameter.typeAnnotation) &&
                      isTSTypeReference(ctorParam.parameter.typeAnnotation.typeAnnotation) &&
                      isIdentifier(ctorParam.parameter.typeAnnotation.typeAnnotation.typeName)
                    ) {
                      injectables.push(ctorParam.parameter.typeAnnotation.typeAnnotation.typeName.name);
                    }

                    if (
                      isIdentifier(ctorParam) &&
                      ctorParam.typeAnnotation &&
                      isTSTypeAnnotation(ctorParam.typeAnnotation) &&
                      ctorParam.typeAnnotation.typeAnnotation &&
                      isTSTypeReference(ctorParam.typeAnnotation.typeAnnotation) &&
                      ctorParam.typeAnnotation.typeAnnotation.typeName &&
                      isIdentifier(ctorParam.typeAnnotation.typeAnnotation.typeName)
                    ) {
                      injectables.push(ctorParam.typeAnnotation.typeAnnotation.typeName.name);
                    }
                  }
                }
              }
            }

            foundProviders.push({
              name: path.node.id.name,
              path: file.path,
              injectables
            });
          }
        }
      },
      VariableDeclarator: {
        enter(path) {
          if (
            path.node.id &&
            isNewExpression(path.node.init) &&
            isIdentifier(path.node.init.callee) &&
            path.node.init.callee.name === 'GraphQLModule'
          ) {
            if (path.node.init.typeParameters && isTSTypeParameterInstantiation(path.node.init.typeParameters)) {
              const param = path.node.init.typeParameters.params[0];

              if (isTSTypeReference(param) && isIdentifier(param.typeName)) {
                foundProviders.push({
                  name: param.typeName.name,
                  injectables: [],
                  path: file.path
                });
              }
            }

            let identifier = null;
            let name: string | null = null;
            const providers: Module['providers'] = [];

            if (isIdentifier(path.node.id) && path.node.id.name) {
              identifier = path.node.id.name;
            }

            if (path.node.init.arguments && path.node.init.arguments.length > 0) {
              const arg = path.node.init.arguments[0];

              if (isObjectExpression(arg)) {
                for (const prop of arg.properties) {
                  if (isObjectProperty(prop) && isIdentifier(prop.key)) {
                    if (prop.key.name === 'name' && isStringLiteral(prop.value)) {
                      name = prop.value.value;
                    } else if (prop.key.name === 'providers' && isArrayExpression(prop.value)) {
                      prop.value.elements.forEach(elem => {
                        if (isIdentifier(elem)) {
                          let importedFrom: string | null = null;
                          const binding = path.scope.getBinding(elem.name);

                          if (
                            binding &&
                            binding.path.parent &&
                            isImportDeclaration(binding.path.parent) &&
                            isStringLiteral(binding.path.parent.source)
                          ) {
                            importedFrom = binding.path.parent.source.value;
                          }

                          if (!importedFrom) {
                            throw new Error(`Unable to find the import for Provider ${elem.name} in module ${name}`);
                          }

                          providers.push({
                            name: elem.name,
                            importedFrom
                          });
                        }
                      });
                    }
                  }
                }
              }
            }

            foundModules.push({
              name,
              identifier,
              path: file.path,
              providers
            });
          }
        }
      }
    });
  }

  return {
    modules: foundModules,
    providers: foundProviders
  };
}

export function scanGlob(globPath: string, cwd: string = process.cwd()): string[] {
  const filePaths = glob.sync(globPath, { cwd, absolute: true });

  if (filePaths.length === 0) {
    throw new Error(`Unable to find any file matching ${globPath} under ${cwd}!`);
  }

  return filePaths;
}

export function scanForFiles(filePaths: string[]): ScanResult {
  const filesContent = filePaths.map((filePath: string) => {
    return {
      path: filePath,
      content: fs.readFileSync(filePath, 'utf-8')
    };
  });

  return extractFromFiles(filesContent);
}

export function buildGraph(modules: Module[], providers: Provider[]): DepGraph<Provider> {
  const graph = new DepGraph<Provider>();

  for (const provider of providers) {
    graph.addNode(provider.name, provider);
  }

  for (const provider of providers) {
    for (const injected of provider.injectables) {
      if (!graph.hasNode(injected)) {
        graph.addNode(injected);
      }

      graph.addDependency(provider.name, injected);
    }
  }

  return graph;
}

export function validateCircularDeps(graph: DepGraph<Provider>): void {
  try {
    graph.overallOrder();
  } catch (e) {
    if (e.cyclePath) {
      throw new CircularDependencyError(
        `Found a circular dependency between Providers!`,
        e.cyclePath.map((p: string) => ({ name: p, filePath: graph.getNodeData(p).path }))
      );
    }

    throw e;
  }
}
