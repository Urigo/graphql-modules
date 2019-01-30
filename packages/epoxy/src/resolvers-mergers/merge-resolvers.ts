import { IResolvers } from 'graphql-tools';
import * as deepMerge from 'deepmerge';

export type ResolversFactory<TSource, TContext> = (...args: any[]) => IResolvers<TSource, TContext>;
export type ResolversDefinition<TSource, TContext> = IResolvers<TSource, TContext> | ResolversFactory<TSource, TContext>;

export function mergeResolvers<TSource, TContext, T extends ResolversDefinition<TSource, TContext>>(resolversDefinitions: T[]): T {
  if (!resolversDefinitions || resolversDefinitions.length === 0) {
    return {} as T;
  }

  if (resolversDefinitions.length === 1) {
    return resolversDefinitions[0];
  }

  const resolversFactories = new Array<ResolversFactory<TSource, TContext>>();
  const resolvers = new Array<IResolvers<TSource, TContext>>();

  for (const resolversDefinition of resolversDefinitions) {
    if (typeof resolversDefinition === 'function') {
      resolversFactories.push(resolversDefinition as ResolversFactory<TSource, TContext>);
    } else if (typeof resolversDefinition === 'object') {
      resolvers.push(resolversDefinition as IResolvers<TSource, TContext>);
    }
  }
  if (resolversFactories.length) {
    return ((...args: any[]) => {
      const resultsOfFactories = resolversFactories.map(factory => factory(...args));
      return deepMerge.all([...resolvers, ...resultsOfFactories]) as any;
    }) as any;
  } else {
    return deepMerge.all(resolvers) as IResolvers<TSource, TContext> as T;
  }
}
