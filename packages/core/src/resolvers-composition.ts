import { get, set } from 'lodash';

export interface IResolversComposerMapping {
  [resolverPath: string]: any | any[];
}

function resolveRelevantMappings(resolvers: any, path: string, allMappings: IResolversComposerMapping): string[] {
  const result: string[] = [];
  const splitted = path.split('.');

  if (splitted.length === 2) {
    const typeName = splitted[0];
    const fieldName = splitted[1];

    if (fieldName === '*') {
      return Object.keys(resolvers[typeName])
        .map(field => `${typeName}.${field}`)
        .filter(mapItem => !allMappings[mapItem]);
    } else {
      return [path];
    }
  }

  return result;
}

const asArray = (fns: any) => (Array.isArray(fns) ? fns : [fns]);

function chainFunctions(funcs: any[]) {
  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce((a, b) => (...args: any[]) => a(b(...args)));
}

export function composeResolvers(resolvers: any, mapping: IResolversComposerMapping = {}): any {
  Object.keys(mapping).map((resolverPath: string) => {
    const composeFns = mapping[resolverPath];
    const relevantFields = resolveRelevantMappings(resolvers, resolverPath, mapping);

    relevantFields.forEach((path: string) => {
      const fns = chainFunctions([...asArray(composeFns), () => get(resolvers, path)]);
      set(resolvers, path, fns());
    });
  });

  return resolvers;
}

export function allow(fn: any) {
  return fn;
}
