import { IResolversComposerMapping } from './resolvers-composition';
import { IResolvers } from 'graphql-tools';
import { Injector } from '@graphql-modules/di';

export const asArray = <T>(fns: T | T[]) => (Array.isArray(fns) ? fns : [fns]);

export function chainFunctions(funcs: any[]) {
  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce((a, b) => (...args: any[]) => a(b(...args)));
}

export function addInjectorToResolversContext(resolvers: IResolvers, injector: Injector) {
    // tslint:disable-next-line:forin
    for ( const type in resolvers ) {
      const typeResolvers = resolvers[type];
      // tslint:disable-next-line:forin
      for (const prop in resolvers[type]) {
        const resolver = typeResolvers[prop];
        if (typeof resolver === 'function') {
          if (prop !== '__resolveType') {
            typeResolvers[prop] = (root: any, args: any, context: any, info: any) => {
              return resolver.call(typeResolvers, root, args, { injector, ...context }, info);
            };
          } else {
            typeResolvers[prop] = (root: any, context: any, info: any) => {
              return resolver.call(typeResolvers, root, { injector, ...context }, info);
            };
          }
        }
      }
    }
    return resolvers;
}

export function addInjectorToResolversCompositionContext(resolversComposition: IResolversComposerMapping, injector: Injector) {
  // tslint:disable-next-line:forin
  for (const path in resolversComposition) {
    const compositionArr = asArray(resolversComposition[path]);
    resolversComposition[path] = [
      (next: any) => (root: any, args: any, context: any, info: any) => next(root, args, {
        ...context,
        injector,
      }, info),
      ...compositionArr,
    ];
  }
  return resolversComposition;
}
