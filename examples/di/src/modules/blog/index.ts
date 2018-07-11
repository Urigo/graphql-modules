import {GraphQLModule, Bind} from '@graphql-modules/core';
import {resolvers, types} from './schema';
import {Blog} from './implementations/blog';

export const blogModule = new GraphQLModule({
  name: 'blog',
  typeDefs: types,
  resolvers,
  implementation(bind: Bind) {
    bind(Blog).toSelf();
  },
});
