import { Type } from '@graphql-modules/di';
import { IResolverObject } from 'graphql-tools';
import { ModuleContext } from '@graphql-modules/core';

export function useClassProviderForTypeResolver<TClassProvider extends Type<any>, TSource, TContext extends ModuleContext>(clazz: TClassProvider): TClassProvider & IResolverObject<TSource, TContext> {
  if (typeof clazz !== 'function' && !('prototype' in clazz)) {
    throw new Error(`
        GraphQL-Modules Error: Provider# NAME_HERE cannot be used as type resolver.
        - If you want to use a provider as a type resolver, it must be a class provider.

        Possible solutions:
        - Use class provider instead of factory or value providers.
      `);
  }
  const typeResolver: IResolverObject<TSource, TContext> = {};
  // tslint:disable-next-line:forin
  for (const prop in clazz.prototype) {
    typeResolver[prop] = (root, args, context, info) => context.injector.get(clazz)[prop](root, args, context, info);
  }
  return typeResolver as InstanceType<TClassProvider>;

}
