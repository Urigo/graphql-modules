import { IResolvers } from 'graphql-tools';
import * as deepMerge from 'deepmerge';

export function mergeResolvers(resolvers: | Array<IResolvers<any, any>>): IResolvers<any, any> {
  if (!resolvers || resolvers.length === 0) {
    return {};
  }

  if (resolvers.length === 1) {
    return resolvers[0];
  }
  // @ts-ignore
  return deepMerge.all(resolvers);
}
